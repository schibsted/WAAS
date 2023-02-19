import logging
import os
import tempfile
import urllib.parse
from datetime import datetime
from typing import Any, Tuple, Union

import redis
import sentry_sdk
import whisper
from flask import Flask, Request, Response, render_template, request
from rq import Queue
from rq.exceptions import NoSuchJobError
from rq.job import Job
from sentry_sdk import set_user
from sentry_sdk.integrations.flask import FlaskIntegration
from sentry_sdk.integrations.rq import RqIntegration


from src import callbacks
from src.utils import (generate_jojo_doc, generate_srt, generate_text,
                       generate_vtt, get_total_time_transcribed,
                       sanitize_input)
from src.services.webhook_service import WebhookService

SENTRY_DSN = os.environ.get("SENTRY_DSN")
ENVIRONMENT = os.environ.get("ENVIRONMENT", "dev")

if SENTRY_DSN:
    print("Sentry detected, Using " + SENTRY_DSN)
    sentry_sdk.init(
        dsn=SENTRY_DSN,
        integrations=[
            FlaskIntegration(),
            RqIntegration()
        ],
        environment=ENVIRONMENT,

        # Set traces_sample_rate to 1.0 to capture 100%
        # of transactions for performance monitoring.
        # We recommend adjusting this value in production.
        traces_sample_rate=1.0,

        # By default the SDK will try to use the SENTRY_RELEASE
        # environment variable, or infer a git commit
        # SHA as release, however you may want to set
        # something more human-readable.
        # release="myapp@1.0.0",
    )


app = Flask(__name__)
redis_url = os.getenv('REDIS_URL', 'redis://redis:6379')
redis_connection = redis.from_url(redis_url)
rq_queue = Queue(connection=redis_connection)
allowed_webhooks_file = os.getenv('ALLOWED_WEBHOOKS_FILE', 'allowed_webhooks.json')
webhook_store = WebhookService(allowed_webhooks_file)

DEFAULT_MODEL = "tiny"
DEFAULT_TASK = "transcribe"
DEFAULT_OUTPUT = "srt"
DEFAULT_UPLOADED_FILENAME = "untitled-transcription"
DISCLAIMER = os.environ.get("DISCLAIMER", "")


def is_invalid_params(req: Request) -> Union[bool, Tuple[str, int]]:
    requestedModel = req.args.get("model", DEFAULT_MODEL)
    language = req.args.get("language")
    task = req.args.get("task", DEFAULT_TASK)
    email_callback = req.args.get("email_callback")
    webhook_id = req.args.get("webhook_id")

    # Check if model is available
    if requestedModel not in whisper.available_models():
        return "Model not available", 400

    # when language is set, check if it is in the whisper.tokenizer.LANGUAGES list
    if language is not None:
        if language not in whisper.tokenizer.LANGUAGES.values():
            return "Language not supported", 400

    # Check if task is either translate or transcribe
    if task not in ["translate", "transcribe"]:
        return "Task not supported", 400

    # Check if the body contains binary data
    if not req.data or not isinstance(req.data, bytes):
        return "No file uploaded", 400
    
    # Check if email_callback or webhook_callback_url is set
    if email_callback is None and webhook_id is None:
        return "No email_callback or webhook_callback_url set", 400

    return False


@app.route("/", methods=['GET'])
def index() -> str:
    return render_template("index.html", disclaimer=DISCLAIMER, sentry_dsn=SENTRY_DSN, environment=ENVIRONMENT)


@app.route("/v1/transcribe", methods=['POST', 'OPTIONS'])
def transcribe() -> Any:
    if request.method == 'OPTIONS':
        return {
            "queryParams": {
                "model": {
                    "type": "enum",
                    "options": whisper.available_models(),
                    "optional": True,
                    "default": DEFAULT_MODEL,
                },
                "task": {
                    "type": "enum",
                    "options": ["translate", "transcribe"],
                    "optional": True,
                    "default": DEFAULT_TASK,
                },
                "languages": {
                    "type": "enum",
                    "options": list(whisper.tokenizer.LANGUAGES.values()),
                    "optional": True,
                },
                "email_callback": {
                    "type": "string",
                    "optional": True,
                },
                 "webhook_id": {
                    "type": "string",
                    "optional": True,
                },
                "filename": {
                    "type": "string",
                    "optional": True,
                    "default": DEFAULT_UPLOADED_FILENAME
                },
            }
        }
    else:
        tempFile = tempfile.NamedTemporaryFile(
            dir='./upload-shared-tmp', delete=False)

        # Get the file from the request body and save it to a temporary file
        file = request.data
        tempFile.write(file)

        try:
            request_is_invalid = is_invalid_params(request)
            if request_is_invalid:
                return request_is_invalid

            filename = tempFile.name
            requestedModel = request.args.get("model", DEFAULT_MODEL)
            task = request.args.get("task", DEFAULT_TASK)
            language = request.args.get("language")

            quoted_email = request.args.get("email_callback")
            quoted_webhook_id = request.args.get("webhook_id")
            
            if quoted_email is None or quoted_email is None:
                raise Exception("Missing email_callback or/and webhook_id param")
            
            if quoted_email:
                email = urllib.parse.unquote(quoted_email)
                set_user({"email": email})
            else:
                email = None

            
            if quoted_webhook_id:
                webhook_id = urllib.parse.unquote(quoted_webhook_id)
                is_valid_webhook = webhook_store.is_valid_webhook(webhook_id)
                if is_valid_webhook == False:
                    return {
                        "error": "Invalid webhook id"
                    }, 405
            else:
                webhook_id = None

            uploaded_filename = urllib.parse.unquote(
                request.args.get("filename", DEFAULT_UPLOADED_FILENAME))

            job = rq_queue.enqueue(
                'transcriber.transcribe',
                args=(filename, requestedModel, task, language, email, webhook_id),
                result_ttl=3600*24*7,
                job_timeout=3600*4,
                meta={
                    'email': email,
                    'webhook_id': webhook_id,
                    'uploaded_filename': uploaded_filename
                },
                on_success=callbacks.success,
                on_failure=callbacks.failure
            )

            return {
                "job_id": job.get_id()
            }, 201

        except Exception as e:
            logging.exception(e)
            return "Server error", 500
        finally:
            tempFile.close()


@app.route('/v1/jobs/<job_id>', methods=['GET'])
def jobs(job_id: str) -> Any:
    try:
        job = Job.fetch(job_id, connection=redis_connection)
    except NoSuchJobError:
        return "No such job",
    set_user({"email": job.meta.get('email')})

    delta = datetime.now() - datetime.now()

    if job.ended_at:
        if job.enqueued_at:
            delta = job.ended_at - job.enqueued_at

    else:
        if job.enqueued_at:
            delta = datetime.now() - job.enqueued_at

    if job.id in rq_queue.job_ids:
        position_in_queue = rq_queue.job_ids.index(job.id)
    else:
        position_in_queue = None

    return {
        "status": job.get_status(),
        "meta": job.get_meta(),
        "origin": job.origin,
        "func_name": job.func_name,
        "args": job.args,
        "result": job.result,
        "enqueued_at": job.enqueued_at,
        "started_at": job.started_at,
        "ended_at": job.ended_at,
        "exc_info": job.exc_info,
        "last_heartbeat": job.last_heartbeat,
        "worker_name": job.worker_name,
        "seconds_used": delta.total_seconds(),
        "position_in_queue": position_in_queue,
        "queue_size": len(rq_queue.jobs)
    }


@app.route('/v1/download/<job_id>', methods=['GET', 'OPTIONS'])
def download(job_id: str) -> Any:
    if request.method == 'OPTIONS':
        return {
            "queryParams": {
                "output": {
                    "type": "enum",
                    "options": ["srt", "vtt", "json", "txt", "timecode_txt", "jojo"],
                    "optional": True,
                    "default": DEFAULT_OUTPUT,
                },
            }
        }
    else:
        output = request.args.get("output", DEFAULT_OUTPUT)

        try:
            job = Job.fetch(job_id, connection=redis_connection)

        except NoSuchJobError:
            return "No such job", 404
        set_user({"email": job.meta.get('email')})
        if job.is_finished:
            filename = sanitize_input(job.meta.get("uploaded_filename") or '')

            if output == "txt":
                return Response(
                    generate_text(job.result["segments"]),
                    mimetype="text/plain",
                    headers={
                        'Content-disposition': f'attachment; filename="{filename}.txt"'
                    },
                    status=200
                )
            if output == "json":
                return job.result
            if output == "jojo":
                return Response(
                    generate_jojo_doc(filename, job.result["segments"]),
                    mimetype="application/json",
                    headers={
                        'Content-disposition': f'attachment; filename="{filename}.jojo"'
                    },
                    status=200
                )
            if output == "vtt":
                return Response(
                    generate_vtt(job.result["segments"]),
                    mimetype="text/vtt",
                    headers={
                        'Content-disposition': f'attachment; filename="{filename}.vtt"'
                    },
                    status=200
                )
            if output == "srt":
                return Response(
                    generate_srt(job.result["segments"]),
                    mimetype="text/plain",
                    headers={
                        'Content-disposition': f'attachment; filename="{filename}.srt"'
                    },
                    status=200
                )
            if output == "timecode_txt":
                return Response(
                    generate_srt(job.result["segments"]),
                    mimetype="text/plain",
                    headers={
                        'Content-disposition': f'attachment; filename="{filename}.txt"'
                    },
                    status=200
                )

            return "Output not supported", 400
        if job.is_failed:
            return "Job failed", 500
        if job.is_canceled:
            return "Job canceled", 400
        if job.is_stopped:
            return "Job stopped", 200
        else:
            return "Job not done yet", 425


@app.route('/v1/queue', methods=['GET'])
def queue() -> dict:
    return {
        "count": len(rq_queue.jobs)
    }


@app.route('/v1/stats', methods=['GET'])
def stats() -> dict:
    return {
        "total_time_transcribed": get_total_time_transcribed(conn=redis_connection)
    }


@app.route("/v1/detect", methods=['POST', 'OPTIONS'])
def detect() -> Any:
    if request.method == 'OPTIONS':
        return {
            "queryParams": {
                "model": {
                    "type": "enum",
                    "options": whisper.available_models(),
                    "optional": True,
                    "default": DEFAULT_MODEL,
                },
            }
        }
    else:
        tempFile = tempfile.NamedTemporaryFile()

        try:
            # get model query parameter
            requestedModel = request.args.get("model", DEFAULT_MODEL)

            request_is_invalid = is_invalid_params(request)
            if request_is_invalid:
                return request_is_invalid

            # Get the file from the request body and save it to a temporary file
            file = request.data
            tempFile.write(file)

            model = whisper.load_model(requestedModel)

            # load audio and pad/trim it to fit 30 seconds
            audio = whisper.load_audio(tempFile.name)
            audio = whisper.pad_or_trim(audio)

            # make log-Mel spectrogram and move to the same device as the model
            mel = whisper.log_mel_spectrogram(audio).to(model.device)

            # detect the spoken language
            _, probs = model.detect_language(mel)
            detected_lang = max(probs, key=probs.get)
            return {
                "detectedLanguage": whisper.tokenizer.LANGUAGES[detected_lang],
                "languageCode": detected_lang
            }
        except Exception as e:
            logging.exception(e)
            return 500
        finally:
            tempFile.close()


@app.route('/debug-sentry')
def trigger_error() -> Any:
    division_by_zero = 1 / 0
    return "Impossible"

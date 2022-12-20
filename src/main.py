import os
import sentry_sdk
import whisper
import logging
import tempfile
from datetime import datetime
import urllib.parse
from flask import Flask
from sentry_sdk.integrations.flask import FlaskIntegration
from sentry_sdk.integrations.rq import RqIntegration
from flask import request
from flask import render_template, Response
import redis
from rq import Queue
from rq.job import Job
from rq.exceptions import NoSuchJobError

from src.utils import generate_srt, generate_vtt, generate_text
from src import mailer

SENTRY_DSN = os.environ.get("SENTRY_DSN")

if SENTRY_DSN:
    print("Sentry detected, Using " + SENTRY_DSN)
    sentry_sdk.init(
    dsn=SENTRY_DSN,
    debug=True,
    integrations=[
        FlaskIntegration(),
        RqIntegration()
    ],

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
conn = redis.from_url(redis_url)
rq_queue = Queue(connection=conn)

DEFAULT_MODEL = "tiny"
DEFAULT_TASK = "transcribe"
DEFAULT_OUTPUT = "srt"
DEFAULT_UPLOADED_FILENAME = "untitled-transcription"
DISCLAIMER = os.environ.get("DISCLAIMER", "")


def is_invalid_params(req):
    requestedModel = req.args.get("model", DEFAULT_MODEL)
    language = req.args.get("language")
    task = req.args.get("task", DEFAULT_TASK)

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

    return False


@app.route("/", methods=['GET'])
def index():
    return render_template("index.html", disclaimer=DISCLAIMER)


@app.route("/v1/transcribe", methods=['POST', 'OPTIONS'])
def transcribe():
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
                    "optional": False,
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

            email = urllib.parse.unquote(request.args.get("email_callback"))
            uploaded_filename = urllib.parse.unquote(
                request.args.get("filename", DEFAULT_UPLOADED_FILENAME))

            job = rq_queue.enqueue(
                'transcriber.transcribe',
                args=(filename, requestedModel, task, language),
                result_ttl=3600*24*7,
                job_timeout=3600*4,
                meta={
                    'email': email,
                    'uploaded_filename': uploaded_filename
                },
                on_success=mailer.send_success_email,
                on_failure=mailer.send_failure_email
            )

            # Return the job id to the client with a 201 status code
            return {
                "job_id": job.get_id()
            }, 201

        except Exception as e:
            logging.exception(e)
            return 500
        finally:
            tempFile.close()


@app.route('/v1/jobs/<job_id>', methods=['GET'])
def jobs(job_id):
    try:
        job = Job.fetch(job_id, connection=conn)
    except NoSuchJobError:
        return "No such job",

    if (job.ended_at):
        delta = job.ended_at-job.enqueued_at
    else:
        delta = datetime.now()-job.enqueued_at

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
def download(job_id):
    if request.method == 'OPTIONS':
        return {
            "queryParams": {
                "output": {
                    "type": "enum",
                    "options": ["srt", "vtt", "json", "txt", "timecode_txt"],
                    "optional": True,
                    "default": DEFAULT_OUTPUT,
                },
            }
        }
    else:
        output = request.args.get("output", DEFAULT_OUTPUT)

        try:
            job = Job.fetch(job_id, connection=conn)

        except NoSuchJobError:
            return "No such job", 404

        if job.is_finished:
            if output == "txt":
                return Response(
                    generate_text(job.result["segments"]),
                    mimetype="text/plain",
                    headers={
                        'Content-disposition': f'attachment; filename="{job.meta.get("uploaded_filename")}.txt"'
                    },
                    status=200
                )
            if output == "json":
                return job.result
            if output == "vtt":
                return Response(
                    generate_vtt(job.result["segments"]),
                    mimetype="text/vtt",
                    headers={
                        'Content-disposition': f'attachment; filename="{job.meta.get("uploaded_filename")}.vtt"'
                    },
                    status=200
                )
            if output == "srt":
                return Response(
                    generate_srt(job.result["segments"]),
                    mimetype="text/plain",
                    headers={
                        'Content-disposition': f'attachment; filename="{job.meta.get("uploaded_filename")}.srt"'
                    },
                    status=200
                )
            if output == "timecode_txt":
                return Response(
                    generate_srt(job.result["segments"]),
                    mimetype="text/plain",
                    headers={
                        'Content-disposition': f'attachment; filename="{job.meta.get("uploaded_filename")}.txt"'
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
def queue():
    return {
        "count": len(rq_queue.jobs)
    }


@app.route("/v1/detect", methods=['POST', 'OPTIONS'])
def detect():
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
def trigger_error():
    division_by_zero = 1 / 0
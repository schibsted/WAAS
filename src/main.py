import whisper
import logging
import tempfile
from datetime import datetime
import urllib.parse
from flask import Flask
from flask import request
from flask import render_template
from distutils.log import error
from werkzeug.datastructures import FileStorage
from rq import Queue
from rq.job import Job
from rq.exceptions import NoSuchJobError

from src import transcriber
from src.utils import generate_srt, generate_vtt
from src.worker import conn
from src import mailer

app = Flask(__name__)
rq_queue = Queue(connection=conn)

DEFAULT_MODEL = "tiny"
DEFAULT_TASK = "transcribe"
DEFAULT_OUTPUT = "srt"


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
    return render_template("index.html")


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
            }
        }
    else:
        print("smile")
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

            job = rq_queue.enqueue(
                'transcriber.transcribe',
                args=(filename, requestedModel, task, language),
                result_ttl=3600*24*7,
                job_timeout=3600*4,
                meta={
                    'email': email
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
        "seconds_used": delta.total_seconds()
    }


@app.route('/v1/download/<job_id>', methods=['GET'])
def download(job_id):
    output = request.args.get("output", DEFAULT_OUTPUT)

    try:
        job = Job.fetch(job_id, connection=conn)
    except NoSuchJobError:
        return "No such job", 404

    if job.is_finished:
        if output == "txt":
            return job.result["text"]
        if output == "json":
            return job.result
        if output == "vtt":
            return generate_vtt(job.result["segments"]), 200, {'Content-Type': 'text/vtt', 'Content-Disposition': 'attachment; filename=transcription.vtt'}
        if output == "srt":
            return generate_srt(job.result["segments"]), 200, {'Content-Type': 'text/plain', 'Content-Disposition': 'attachment; filename=transcription.srt'}

        return "Output not supported", 400
    else:
        return "Job not done yet", 425


@app.route('/v1/queue', methods=['GET'])
def queue():
    return {
        'length': len(rq_queue)
    }, 200


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
            return {
                "detectedLanguage": max(probs, key=probs.get)
            }
        except Exception as e:
            logging.exception(e)
            return 500
        finally:
            tempFile.close()

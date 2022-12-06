import whisper
import logging
import tempfile
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

app = Flask(__name__)
queue = Queue(connection=conn)

DEFAULT_MODEL = "tiny"
DEFAULT_TASK = "transcribe"
DEFAULT_OUTPUT = "srt"

def is_invalid_params (req):
    requestedModel = req.args.get("model", DEFAULT_MODEL)
    language = req.args.get("language")
    task = req.args.get("task", DEFAULT_TASK)

    # Check if model is available
    if requestedModel not in whisper.available_models():
        return "Model not available", 400
    
    # when language is set, check if it is in the whisper.tokenizer.LANGUAGES list
    if language is not None:
        if language not in whisper.tokenizer.LANGUAGES:
            return "Language not supported", 400

    # Check if task is either translate or transcribe
    if task not in ["translate", "transcribe"]:
        return "Task not supported", 400
    
    # Check if the body contains binary data
    if not req.data or not isinstance(req.data, bytes):
        return "No file uploaded", 400

    
    return False

@app.route("/",methods=['GET'])
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
                "output": {
                    "type": "enum",
                    "options": ["srt", "vtt", "json", "txt"],
                    "optional": True,
                    "default": DEFAULT_OUTPUT,
                },
            }
        }
    else:
        tempFile = tempfile.NamedTemporaryFile()

        # Get the file from the request body and save it to a temporary file
        file = request.data
        tempFile.write(file)

        try:
            request_is_invalid = is_invalid_params(request)
            if request_is_invalid:
                return request_is_invalid

            filename = tempFile.name,
            requestedModel = request.args.get("model", DEFAULT_MODEL)
            task = request.args.get("task", DEFAULT_TASK)
            output = request.args.get("output", DEFAULT_OUTPUT)
            language = request.args.get("language")

            job = queue.enqueue_call(
                func='transcriber.transcribe',
                args=(filename,requestedModel,task,output,language),
                result_ttl=3600*24*7
            )

            return 201
        except Exception as e:
            logging.exception(e)
            return 500
        finally:
            tempFile.close()

@app.route('/v1/download/<job_id>', methods=['GET'])
def download(job_id):
    output = request.args.get("output", DEFAULT_OUTPUT)

    try:
        job = Job.fetch(job_id, connection=conn)
    except NoSuchJobError:
        return "No such job", 404
    
    if job.is_finished:
        if output == "txt":
            return result["text"]
        if output == "json":
            return result        
        if output == "vtt":
            return generate_vtt(result["segments"]), 200, {'Content-Type': 'text/vtt', 'Content-Disposition': 'attachment; filename=transcription.vtt'}
        if output == "srt":
            return generate_srt(result["segments"]), 200, {'Content-Type': 'text/plain', 'Content-Disposition': 'attachment; filename=transcription.srt'}

        return "Output not supported", 400
    else:
        return "Job not done yet", 425

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

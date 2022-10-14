import whisper
from flask import Flask
from flask import request
import uuid 
import tempfile
import os

app = Flask(__name__)

@app.route("/", methods=['POST'])
def transcribe():
    tempFile = tempfile.NamedTemporaryFile()
    try:
        # Get variables from request
        requestedModel = request.args.get("model", "tiny")
        language = request.args.get("language")
        task = request.args.get("task", "transcribe")
        task = request.args.get("task", "transcribe")

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
        
        # Check if the request contains a file
        if "file" not in request.files:
            return "No file provided", 400
        
        file = request.files['file']

        # check if the file is a mp3
        if not file.filename.endswith(".mp3"):
            return "File is not a mp3", 400
            
        # Download the file
        file = request.files['file']
        tempFile.write(file.read())

        model = whisper.load_model(requestedModel)
        result = model.transcribe(tempFile.name, language=language, task=task)


            
        # print(result)
        if request.accept_mimetypes['text/plain']:
            return result["text"]
        if request.accept_mimetypes['application/json']:
            return result        
        if request.accept_mimetypes['text/vtt']:
            return "MUST IMPLEMENT VTT DOWNLOAD"

        return "MUST IMPLEMENT SRT DOWNLOAD", 200
    except Exception as e:
        return str(e), 500
    finally:
        tempFile.close()


@app.route("/detect", methods=['POST'])
def detect():
    tempFile = tempfile.NamedTemporaryFile()

    try:
        # get model query parameter
        requestedModel = request.args.get("model", "tiny")

        # Check if model is available
        if requestedModel not in whisper.available_models():
            return "Model not available", 400

        # Download the file
        file = request.files['file']
        tempFile.write(file.read())

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
        return str(e), 500
    finally:
        tempFile.close()


@app.route("/options", methods=['GET'])
def options():
    return {
        "models": whisper.available_models(),
        "languages": whisper.tokenizer.LANGUAGES,
        "tasks": ["translate", "transcribe"]
    }


def format_timestamp(seconds: float, always_include_hours: bool = False, decimal_marker: str = '.'):
    assert seconds >= 0, "non-negative timestamp expected"
    milliseconds = round(seconds * 1000.0)

    hours = milliseconds // 3_600_000
    milliseconds -= hours * 3_600_000

    minutes = milliseconds // 60_000
    milliseconds -= minutes * 60_000

    seconds = milliseconds // 1_000
    milliseconds -= seconds * 1_000

    hours_marker = f"{hours:02d}:" if always_include_hours or hours > 0 else ""
    return f"{hours_marker}{minutes:02d}:{seconds:02d}{decimal_marker}{milliseconds:03d}"
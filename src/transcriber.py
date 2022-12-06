import whisper
import os

def transcribe(file, requestedModel, task, output, language):
    model = whisper.load_model(requestedModel)

    return model.transcribe(filename, language=language, task=task)

import whisper
from sentry_sdk import set_user

def transcribe(filename, requestedModel, task, language,email):
    # Mail is not used here, but it makes it easier for the worker to log mail
    print("Executing transcribing of " + filename + " for "+ email + " using " + requestedModel + " model ")
    set_user({"email": email})
    model = whisper.load_model(requestedModel)
    return model.transcribe(filename, language=language, task=task)

from typing import Any

import whisper
from sentry_sdk import set_user

def transcribe(filename: str, requestedModel: str, task: str, language: str, email: str, webhook_id: str) -> dict[str, Any]:
    # Mail is not used here, but it makes it easier for the worker to log mail
    print("Executing transcribing of " + filename + " for "+(email or webhook_id) + " using " + requestedModel + " model ")
    set_user({"email": email})
    model = whisper.load_model(requestedModel)
    return model.transcribe(filename, language=language, task=task)

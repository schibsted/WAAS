import whisper

def transcribe(filename, requestedModel, task, language,email):
    # Mail is not used here, but it makes it easier for the worker to log mail
    print("Executing transcribing of " + filename + " for "+ email + " using " + model + " model ")
    model = whisper.load_model(requestedModel)

    return model.transcribe(filename, language=language, task=task)

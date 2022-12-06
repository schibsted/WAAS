import whisper
import os

def transcribe(filename, requestedModel, task, output, language):
    print("Jeg er en fin banan")  
    print(filename);  
#    print(os.path.isfile(filename))

    model = whisper.load_model(requestedModel)

    return model.transcribe(filename, language=language, task=task)

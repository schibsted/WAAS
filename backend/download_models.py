import whisper

print("Downloading models...")

# Get available models available_models
available_models = whisper.available_models()

print("Available models: " + str(available_models))

# For each model, download the model using load_model to cache it
for model in available_models:
    print("Downloading model: " + model)
    whisper.load_model(model)

print("Done!")
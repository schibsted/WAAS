# WaaS - Whisper as a Service

Backend flask application for the Speech To Text service.

This service is powered by [OpenAI Whisper](https://github.com/openai/whisper)

## API Documentation

### POST `/v1/transcribe`

Receive the detected text from the audio file.

Query parameters:

- OPTIONAL: language: string (default: automatic detection)
- OPTIONAL: model: string (default: `tiny`)
- OPTIONAL: task: string (default: `transcribe`)
  - `transcribe`: Transcribe audio to text
  - `translate`: Transcribe then translate audio to text
- OPTIONAL: `output`: string (default: `txt`)
  - `json`: JSON response of the model output
  - `txt`: Plain text response of the detected text
  - `vtt`: WebVTT file with the detected text
  - `srt`: WebVTT file with the detected text
- REQUIRED: form field `file`: mp3 audio file to transcribe

### OPTIONS `/v1/transcribe`

Get the available options for the transcribe route.

### POST `/v1/detect`

Detect the language of the audio file.

Query parameters:

- OPTIONAL: model: string (default: `tiny`)

### OPTIONS `/v1/detect`

Get the available options for the detect route.

## Contributing

### Running

```sh
python3 -mvenv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

### Running in dev

```sh
flask --app src/main run
```

### curl

To upload a file called audunspodssounds.mp3 in norwegian from your download directory

```sh
curl --location --request POST 'http://localhost:5000/v1/transcribe/?model=large' \
--form 'file=@"/Users/<user>/Downloads/audunspodssound.mp3"' -H "Accept: SRT file"
```

### Running tests

```bash
$ pytest
```

# WaaS - Whisper as a Service

Backend flask application for the Speech To Text service.

This service is powered by [OpenAI Whisper](https://github.com/openai/whisper)

## API Documentation

### POST `/`

Receive the detected text from the audio file.

Query parameters:

- OPTIONAL: language: string (default: automatic detection)
- OPTIONAL: model: string (default: `tiny`)
- OPTIONAL: task: string (default: `transcribe`)
  - `transcribe`: Transcribe audio to text
  - `translate`: Transcribe then translate audio to text
- REQUIRED: form field `file`: mp3 audio file to transcribe

Headers:

- OPTIONAL: `Accept`: string (default: `SRT file`)
  - `application/json`: JSON response of the model output
  - `text/plain`: Plain text response of the detected text
  - `application/vtt`: WebVTT file with the detected text
  - unset: SRT file with the detected text

### POST `/detect`

Detect the language of the audio file.

Query parameters:

- OPTIONAL: model: string (default: `tiny`)

### POST `/options`

Get the available options for the service.

Return a JSON object with the following keys:

- `languages`: list of available languages
- `models`: list of available models
- `tasks`: list of available tasks

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
curl --location --request POST 'http://localhost:5000/?model=large' \
--form 'file=@"/Users/<user>/Downloads/audunspodssound.mp3"' -H "Accept: SRT file"
```
### Running tests

```bash
$ pytest
```

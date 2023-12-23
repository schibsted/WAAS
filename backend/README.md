# WaaS - Backend

## API Documentation

### POST `/v1/transcribe`

Add a new transcribe job to the queue. The job will be processed by the worker asynchroniously.

The response will be a JSON object with `job_id` that can be used to check the status of the job.

Query parameters:

- REQUIRED: `email_callback`: string or `webhook_id`: string
- OPTIONAL: `language`: string (default: automatic detection)
- OPTIONAL: `model`: string (default: `tiny`)
- OPTIONAL: `task`: string (default: `transcribe`)
  - `transcribe`: Transcribe audio to text
  - `translate`: Transcribe then translate audio to text
- OPTIONAL: `filename`: string (default: `untitled-transcription`)

Body:

- REQUIRED: `binary data`: Raw data with the audio content to transcribe

### OPTIONS `/v1/transcribe`

Get the available options for the transcribe route.

### POST `/v1/detect`

Detect the language of the audio file.

Query parameters:

- OPTIONAL: `model`: string (default: `tiny`)

Body:

- REQUIRED: `binary data`: Raw data with the audio content to detect the language for

### OPTIONS `/v1/detect`

Get the available options for the detect route.

### GET `/v1/download/<job_id>`

Receive the finished job result as the requested output format.

Query parameters:

- OPTIONAL: `output`: string (default: `srt`)
  - `json`: JSON response of the model output
  - `timecode_txt`: Plain text file with timecodes(srt)
  - `txt`: Plain text file of the detected text
  - `vtt`: WebVTT file with the detected text
  - `srt`: WebVTT file with the detected text

### OPTIONS `/v1/download/<job_id>`

Get the available options for the download route.

### GET `/v1/jobs/<job_id>`

Get the status and metadata of the provided job.

### GET `/v1/queue`

Get the available length of the queue as JSON object with the key `length`.

### Webhook response

If using `webhook_id` in the request parameters you will get a `POST` to the webhook url of your choice.

The request will contain a `X-WAAS-Signature` header with a hash that can be used to verify the content.
Check `tests/test_webhook.py` for an example on how to verify this signature using Python on the receiving end.

The post payload will be a json with this content

On success:

```
{
  "source": "waas",
  "job_id": "09d2832d-cf3e-4719-aea7-1319000ef372",
  "success": true,
  "url": "https://example.com/v1/download/09d2832d-cf3e-4719-aea7-1319000ef372",
  "filename": "untitled-transcription"
}
```

On failure:

```
{
  "source": "waas",
  "job_id": "09d2832d-cf3e-4719-aea7-1319000ef372",
  "success": false
}
```

## Example with curl

To upload a file called audunspodssounds.mp3 in Norwegian from your download directory

With email callback:

```sh
curl --location --request POST 'localhost:3000/v1/transcribe?output=vtt&email_callback=test@example.com&language=norwegian&model=large' \
  --header 'Content-Type: audio/mpeg' \
  --data-binary '@/Users/<user>/Downloads/audunspodssounds.mp3'
```

With webhook callback:

```sh
curl --location --request POST 'localhost:3000/v1/transcribe?output=vtt&language=norwegian&model=large&webhook_id=77c500b2-0e0f-4785-afc7-f94ed529c897' \
  --header 'Content-Type: audio/mpeg' \
  --data-binary '@/Users/<user>/Downloads/audunspodssounds.mp3'
```

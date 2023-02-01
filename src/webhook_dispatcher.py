import requests

def post_to_webhook(webhook_url, job_id, filename, url, success=False):
    payload = {
        "source": "waas",
        "job_id": job_id,
        "success": success
    }
    if success:
        payload["url"] = url
        payload["filename"] = filename

    req = requests.post(webhook_url, json=payload)
    req.raise_for_status()
    return True


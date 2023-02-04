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
    try:
        req = requests.post(webhook_url, json=payload, allow_redirects=False, timeout=3)
        req.raise_for_status()
    except requests.exceptions.Timeout as e:
        print(f'Webhook request to {webhook_url} timed out')
        raise
    except requests.exceptions.RequestException as e:
        print(f'Webhook request to {webhook_url} failed: {e}')
        raise



import hashlib
import json
import os

import requests

# Create a class with functions for getting a webhook url, token and id from a json file containing an array with webhook objects

class InvalidWebhookIdException(Exception):
    pass

class WebhookService:

    def __init__(self, webhook_file):
        if not os.path.exists(webhook_file):
            raise FileNotFoundError("Allowed webhooks file not found")
        self.webhook_file = webhook_file

    def get_webhook_by_id(self, webhook_id):
        webhooks = self.get_webhooks()
        for webhook in webhooks:
            if webhook['id'] == webhook_id:
                return webhook
        return None

    def create_payload_hash(self, payload, token):
        x_payload_signature = hashlib.sha256(token.encode('utf-8'))
        x_payload_signature.update(json.dumps(payload).encode('utf-8'))
        return x_payload_signature.hexdigest()
    
    def create_webhook_payload(self, job_id, filename, url, success):
        payload = {
            "source": "waas",
            "job_id": job_id,
            "success": success
        }
        if success:
            payload["url"] = url
            payload["filename"] = filename
        return payload
    
    def post_to_webhook(self, webhook_id, job_id, filename, url, success=False):
        webhook = self.get_webhook_by_id(webhook_id) # This will return none if the webhook id is not found/not valid
        if webhook:

            payload = self.create_webhook_payload(job_id, filename, url, success)
            payload_hash = self.create_payload_hash(payload, webhook['token'])
            webhook_url = webhook['url']
           
            try:
                req = requests.post(webhook_url, json=payload, allow_redirects=False, timeout=3, headers={'X-WAAS-Signature': payload_hash})
                req.raise_for_status()
            except requests.exceptions.Timeout as e:
                print(f'Webhook request to {webhook_url} timed out')
                raise
            except requests.exceptions.RequestException as e:
                print(f'Webhook request to {webhook_url} failed: {e}')
                raise
            return True
        else:
            raise InvalidWebhookIdException(f"Webhook with id {webhook_id} not found")

    def get_webhooks(self):
        try:
            with open(self.webhook_file) as json_file:
                webhooks = json.load(json_file)
                return webhooks
        except FileNotFoundError:
            print(f'Allowed webhooks file not found. ALLOWED_WEBHOOKS_FILE environment variable is {self.webhook_file}')
            raise FileNotFoundError("Webhook file not found")
        

    def is_valid_webhook(self, webhook_id):
        return self.get_webhook_by_id(webhook_id) is not None
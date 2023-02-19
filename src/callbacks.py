import os
from typing import Any

from rq.job import Job

from src import mailer
from src.utils import increment_total_time_transcribed
from src.services.webhook_service import WebhookService

allowed_webhooks_file = os.getenv('ALLOWED_WEBHOOKS_FILE', 'allowed_webhooks.json')
webhook_store = WebhookService(allowed_webhooks_file)
ENVIRONMENT = os.environ.get("ENVIRONMENT", "dev")

class JobCallbackException(Exception):
    pass

def success(job: Job, connection: Any, result: Any, *args, **kwargs):
    email = job.meta.get("email")
    webhook_id = job.meta.get("webhook_id")
    if email is None:
        print("Missing email address, not sending email")
        return

    filename = job.meta.get("uploaded_filename")
    if filename is None:
        raise JobCallbackException('Missing filename in job meta')

    url = (os.environ.get("BASE_URL") or '') + "/v1/download/" + job.id

    duration = result['segments'][-1]['end']

    increment_total_time_transcribed(duration, conn=connection)

    if email:
        try:
            mailer.send_success_email(email, filename=filename, url=url)
        except:
            print("Unable to send email in successful job")
            if (ENVIRONMENT != 'dev'):
                raise JobCallbackException("Unable to send email in successful job")

    if webhook_id:
        webhook_store.post_to_webhook(webhook_id, job.id, filename, url, success=True)           


def failure(job: Job, connection, type, value, traceback):
    email = job.meta.get("email")
    webhook_id = job.meta.get("webhook_id")
    filename = job.meta.get("uploaded_filename")
    if filename is None:
        raise JobCallbackException('Missing filename in job meta')
    
    if email is None:
        print("Missing email address, not sending email")
        return

    if email:
        try:
            mailer.send_failure_email(email)
        except:
            print("Unable to send email in failed job")
            if (ENVIRONMENT != 'dev'):
                raise JobCallbackException("Unable to send email in failed job")
    
    if webhook_id:
        webhook_store.post_to_webhook(webhook_id, job.id, filename, None, success=False)       

import os

from src import mailer
from src.utils import increment_total_time_transcribed
from src.services.webhook_service import WebhookService

allowed_webhooks_file = os.getenv('ALLOWED_WEBHOOKS_FILE', 'allowed_webhooks.json')
webhook_store = WebhookService(allowed_webhooks_file)
ENVIRONMENT = os.environ.get("ENVIRONMENT", "dev")

def success(job, connection, result, *args, **kwargs):
    email = job.meta.get("email")
    filename = job.meta.get("uploaded_filename")
    webhook_id = job.meta.get("webhook_id")

    url = os.environ.get("BASE_URL") + "/v1/download/" + job.id

    duration = result['segments'][-1]['end']

    increment_total_time_transcribed(duration, conn=connection)

    if email:
        try:
            mailer.send_success_email(email, filename=filename, url=url)
        except:
            print("Unable to send email in successful job")
            if (ENVIRONMENT != 'dev'):
                raise Exception("Unable to send email in successful job")

    if webhook_id:
        webhook_store.post_to_webhook(webhook_id, job.id, filename, url, success=True)           

def failure(job, connection, type, value, traceback):
    email = job.meta.get("email")
    webhook_id = job.meta.get("webhook_id")
    filename = job.meta.get("uploaded_filename")

    if email:
        try:
            mailer.send_failure_email(email)
        except:
            print("Unable to send email in failed job")
            if (ENVIRONMENT != 'dev'):
                raise Exception("Unable to send email in failed job")
    
    if webhook_id:
        webhook_store.post_to_webhook(webhook_id, job.id, filename, None, success=False)       

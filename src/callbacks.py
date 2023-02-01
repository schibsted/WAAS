import os

from src import mailer
from src.utils import increment_total_time_transcribed
from src.webhook_dispatcher import post_to_webhook

ENVIRONMENT = os.environ.get("ENVIRONMENT", "dev")

def success(job, connection, result, *args, **kwargs):
    print(job.meta)
    email = job.meta.get("email")
    filename = job.meta.get("uploaded_filename")
    webhook_url = job.meta.get("webhook_url")

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

    if webhook_url:
        print(f'Sending webhook to {webhook_url} with success message')
        try:
            post_to_webhook(webhook_url, job.id, filename, url, success=True)
        except:
            print("Unable to post to webhook in successful job")
            if (ENVIRONMENT != 'dev'):
                raise Exception("Unable to post to webhook in successful job")

def failure(job, connection, type, value, traceback):
    email = job.meta.get("email")
    webhook_url = job.meta.get("webhook_url")
    filename = job.meta.get("uploaded_filename")

    if email:
        try:
            mailer.send_failure_email(email)
        except:
            print("Unable to send email in failed job")
            if (ENVIRONMENT != 'dev'):
                raise Exception("Unable to send email in failed job")
    
    if webhook_url:
        print(f'Sending webhook to {webhook_url} with failure message')
        try:
            post_to_webhook(webhook_url, job.id, filename, None, success=False)
        except Exception as e:
            print("Unable to post to webhook in failed job")
            if (ENVIRONMENT != 'dev'):
                raise Exception("Unable to post to webhook in failed job" + e.message)

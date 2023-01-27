import os

from src import mailer
from src.utils import increment_total_time_transcribed

ENVIRONMENT = os.environ.get("ENVIRONMENT", "dev")

def success(job, connection, result, *args, **kwargs):
    email = job.meta.get("email")
    filename = job.meta.get("uploaded_filename")
    url = os.environ.get("BASE_URL") + "/v1/download/" + job.id

    duration = result['segments'][-1]['end']

    increment_total_time_transcribed(duration, conn=connection)

    try:
        mailer.send_success_email(email, filename=filename, url=url)
    except:
        print("Unable to send email in successful job")
        if (ENVIRONMENT != 'dev'):
            raise Exception("Unable to send email in successful job")

def failure(job, connection, type, value, traceback):
    email = job.meta.get("email")

    try:
        mailer.send_failure_email(email)
    except:
        print("Unable to send email in failed job")
        if (ENVIRONMENT != 'dev'):
            raise Exception("Unable to send email in failed job")

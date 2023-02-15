import os
from typing import Any

from rq.job import Job

from src import mailer
from src.utils import increment_total_time_transcribed

ENVIRONMENT = os.environ.get("ENVIRONMENT", "dev")


def success(job: Job, connection: Any, result: Any, *args, **kwargs):
    email = job.meta.get("email")
    if email is None:
        print("Missing email address, not sending email")
        return

    filename = job.meta.get("uploaded_filename")
    if filename is None:
        print("Missing filename, not sending email")
        return

    url = (os.environ.get("BASE_URL") or '') + "/v1/download/" + job.id

    duration = result['segments'][-1]['end']

    increment_total_time_transcribed(duration, conn=connection)

    try:
        mailer.send_success_email(email, filename=filename, url=url)
    except:
        print("Unable to send email in successful job")
        if (ENVIRONMENT != 'dev'):
            raise Exception("Unable to send email in successful job")


def failure(job: Job, connection, type, value, traceback):
    email = job.meta.get("email")
    if email is None:
        print("Missing email address, not sending email")
        return

    try:
        mailer.send_failure_email(email)
    except:
        print("Unable to send email in failed job")
        if (ENVIRONMENT != 'dev'):
            raise Exception("Unable to send email in failed job")

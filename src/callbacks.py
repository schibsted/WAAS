import os

from src import mailer
from src.utils import increment_total_time_transcribed


def success(job, connection, result, *args, **kwargs):
    email = job.meta.get("email")
    filename = job.meta.get("uploaded_filename")
    url = os.environ.get("BASE_URL") + "/v1/download/" + job.id

    duration = result['segments'][-1]['end']

    increment_total_time_transcribed(duration, conn=connection)

    mailer.send_success_email(email, filename=filename, url=url)


def failure(job, connection, type, value, traceback):
    email = job.meta.get("email")

    mailer.send_failure_email(email)

import smtplib
import os
from email.message import EmailMessage


def send_mail(recipient, subject, body):
    # Sender email and password
    email_sender_address = os.environ.get('EMAIL_SENDER_ADDRESS')
    email_sender_password = os.environ.get('EMAIL_SENDER_PASSWORD')

    # Connect to the Gmail SMTP server
    email_sender_host = os.environ.get('EMAIL_SENDER_HOST')
    if (email_sender_password):
        smtp_server = smtplib.SMTP_SSL(email_sender_host, 465)
    else:
        smtp_server = smtplib.SMTP(email_sender_host, 25)

    # Login to the Gmail server
    if (email_sender_password):
        smtp_server.login(email_sender_address, email_sender_password)

    # Construct the email message
    msg = EmailMessage()
    msg.set_content(body)
    msg['To'] = recipient
    msg['From'] = f'JoJo Transcribe <{email_sender_address}>'
    msg['Subject'] = subject

    # Send the email
    smtp_server.send_message(msg)

    # Disconnect from the server
    smtp_server.quit()


def send_success_email(job, connection, result, *args, **kwargs):
    email = job.meta.get('email')
    uploaded_filename = job.meta.get('uploaded_filename')
    base_url = os.environ.get('BASE_URL')

    download_url = base_url + "/v1/download/" + job.id

    subject = uploaded_filename + " is finished transcribing!"
    body = f'Your file is ready. You can download the text output her: \n\nFile with timecodes {download_url + "?output=timecode_txt"} \nFile without timecodes: {download_url + "?output=txt"} \n\n\nCaptions file for use in software: \n\n Jojo-document (mac-app) {download_url + "?output=jojo"} \n SRT file {download_url + "?output=srt"} \n VTT file {download_url + "?output=vtt"}'

    send_mail(email, subject, body)


def send_failure_email(job, connection, type, value, traceback):
    email = job.meta.get('email')
    subject = 'The transcription failed'

    body = "We're sorry, but we were unable to transcribe the file you uploaded. Please try again or contact the team for assistance."

    send_mail(email, subject, body)

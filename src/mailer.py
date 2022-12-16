import smtplib
import os


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
    message = f'Subject: {subject}\n\n{body}'

    # Send the email
    smtp_server.sendmail(email_sender_address, recipient, message)

    # Disconnect from the server
    smtp_server.quit()


def send_success_email(job, connection, result, *args, **kwargs):
    email = job.meta.get('email')
    uploaded_filename = job.meta.get('uploaded_filename')
    base_url = os.environ.get('BASE_URL')

    download_url = base_url + "/v1/download/" + job.id

    subject = uploaded_filename + " is finished transcribing!"
    body = f'Your file is ready. Download it here:\n Textfile without timecodes: {download_url + "?output=txt"} \n Captions file with timecodes(SRT) {download_url + "?output=srt"}'

    send_mail(email, subject, body)


def send_failure_email(job, connection, type, value, traceback):
    email = job.meta.get('email')
    subject = 'The transcription failed'

    body = "We're sorry, but we were unable to transcribe the file you uploaded. Please try again or contact the team for assistance."

    send_mail(email, subject, body)

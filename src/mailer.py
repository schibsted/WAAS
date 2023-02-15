import os
import smtplib
from email.message import EmailMessage


def send_mail(recipient: str, subject: str, body: str) -> None:
    # Sender email and password
    email_sender_address = os.environ.get('EMAIL_SENDER_ADDRESS')
    email_sender_password = os.environ.get('EMAIL_SENDER_PASSWORD')

    if email_sender_address is None:
        print("No email sender address set, set EMAIL_SENDER_ADDRESS to mail")
        return
    
    # Connect to the Gmail SMTP server
    email_sender_host = os.environ.get('EMAIL_SENDER_HOST')
    
    if email_sender_host is None:
        print("No email sender host set, set EMAIL_SENDER_HOST to mail")
        return

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


def send_success_email(email: str, filename: str, url: str) -> None:
    subject = filename + " is finished transcribing!"
    body = f'Your file is ready. You can download the text output here: \n\nFile with timecodes {url + "?output=timecode_txt"} \nFile without timecodes: {url + "?output=txt"} \n\n\nCaptions file for use in software: \n\n Jojo-document (mac-app) {url + "?output=jojo"} \n SRT file {url + "?output=srt"} \n VTT file {url + "?output=vtt"}'

    send_mail(email, subject, body)


def send_failure_email(email: str) -> None:
    subject = 'The transcription failed'
    body = "We're sorry, but we were unable to transcribe the file you uploaded. Please try again or contact the team for assistance."

    send_mail(email, subject, body)

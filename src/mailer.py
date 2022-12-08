import smtplib

def send_mail(recipient, subject, body):
  # Sender email and password
  user = 'jojo@vg.no'
  password = '1234'

  # Connect to the Gmail SMTP server
  smtp_server = smtplib.SMTP_SSL('smtp.gmail.com', 465)

  # Login to the Gmail server
  smtp_server.login(user, password)

  # Construct the email message
  message = f'Subject: {subject}\n\n{body}'

  # Send the email
  smtp_server.sendmail(user, recipient, message)

  # Disconnect from the server
  smtp_server.quit()

def send_success_email(job, connection, result, *args, **kwargs):
  email = job.meta.get('email')
  subject = 'Your file is ready'

  download_url = "http://127.0.0.1:3000/v1/download/" + job.id
  body = f'Your file is ready. Download it here: {download_url}'

  send_mail(email, subject, body)

def send_failure_email(job, connection, type, value, traceback):
  email = job.meta.get('email')
  subject = 'The transcription failed'

  body = 'Your file failed, were sorry, please try again :D'

  send_mail(email, subject, body)
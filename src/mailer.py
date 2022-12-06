import smtplib, ssl

def send_success_email(job, connection, result, *args, **kwargs):
    ssl_context = ssl.create_default_context()

    with smtplib.SMTP_SSL('smtp.gmail.com', port, context=context) as server:
        server.login('my@gmail.com', 'password')
        server.sendmail('jojo@vg.no', email, 'Hello here is your transcript!')

def send_failure_email(job, connection, type, value, traceback):
    pass

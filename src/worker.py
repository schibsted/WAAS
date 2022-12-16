# import os
# import sys
# import sentry_sdk
# from sentry_sdk.integrations.rq import RqIntegration
# from sentry_sdk.integrations.flask import FlaskIntegration



# from dotenv import load_dotenv
# sys.path.append('./')
# load_dotenv()

# SENTRY_DSN= os.getenv('SENTRY_DSN')

# if SENTRY_DSN:
#     print("Using SENTRY DSN:" + SENTRY_DSN)
#     sentry_sdk.init(
#         dsn=SENTRY_DSN,
#         integrations=[
#             RqIntegration(),
#             FlaskIntegration(),
#         ],

#         # Set traces_sample_rate to 1.0 to capture 100%
#         # of transactions for performance monitoring.
#         # We recommend adjusting this value in production,
#         traces_sample_rate=1.0,
#     )



# import redis
# from rq import Worker, Queue, Connection

# listen = ['default']

# redis_url = os.getenv('REDIS_URL', 'redis://redis:6379')

# conn = redis.from_url(redis_url)

# if __name__ == '__main__':
#     with Connection(conn):
#         worker = Worker(list(map(Queue, listen)))
#         worker.work()

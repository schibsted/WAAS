import os
import sys
import sentry_sdk
from sentry_sdk.integrations.rq import RqIntegration



from dotenv import load_dotenv
sys.path.append('./')
load_dotenv()


import redis
from rq import Worker, Queue, Connection

listen = ['default']

redis_url = os.getenv('REDIS_URL', 'redis://redis:6379')

conn = redis.from_url(redis_url)

if __name__ == '__main__':
    with Connection(conn):
        worker = Worker(list(map(Queue, listen)))
        worker.work()

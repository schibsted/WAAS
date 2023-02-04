import requests
import requests_mock
import pytest
from src.callbacks import success, failure
from src.webhook_dispatcher import post_to_webhook
import redis
import os

def match_success_payload(request):
    data = request.json()
    return data['success'] == True

def match_failure_payload(request):
    data = request.json()
    return data['success'] == False

# Mocking environment variables for testing
@pytest.fixture
def mock_env(monkeypatch):
    monkeypatch.setenv("BASE_URL", "https://test")
    monkeypatch.setenv("ENVIRONMENT", "test")

@pytest.fixture
def redis_conn(mock_env):
    redis_url = os.getenv('REDIS_URL', 'redis://redis:6379')
    return redis.from_url(redis_url)

# Mocking job object
@pytest.fixture
def job():
   
  class Job:
    def __init__(self, id, meta):
        self.id = id
        self.meta = meta

  return Job('1234-abcd',{
          "email": None,
          "uploaded_filename": "test.wav",
          "webhook_url": 'https://myniceserver.com/mywebhook'
      })

@pytest.fixture
def result():
    return {
        'segments': [
            {
                'end': 10
            }
        ]
    }

def test_success_callback_with_webhook(requests_mock, job, result, mock_env, redis_conn):
    requests_mock.register_uri('POST', 'https://myniceserver.com/mywebhook', additional_matcher=match_success_payload, text='resp')
    success(job, redis_conn, result)
    assert True

def test_failure_callback_with_webhook(requests_mock, job, result, mock_env, redis_conn):
    requests_mock.register_uri('POST', 'https://myniceserver.com/mywebhook', additional_matcher=match_failure_payload, text='resp')
    
    transcribe_test_error = Exception('test')
    failure(job, redis_conn, result, transcribe_test_error, None)
    assert True

def test_http_error_from_webhook_destination(requests_mock, job, result, mock_env):
    requests_mock.register_uri('POST', 'https://myniceserver.com/mywebhook', status_code=500)
    with pytest.raises( requests.exceptions.HTTPError, match=r'.*500 Server Error.*'):
        post_to_webhook(job.meta['webhook_url'], job.id, filename=job.meta['uploaded_filename'], url=None, success=True)
      
def test_timeout_from_webhook_destination(requests_mock, job, result, mock_env):
    requests_mock.register_uri('POST', 'https://myniceserver.com/mywebhook', exc=requests.exceptions.ConnectTimeout)
    with pytest.raises( requests.exceptions.Timeout):
        post_to_webhook(job.meta['webhook_url'], job.id, filename=job.meta['uploaded_filename'], url=None, success=True)
      
      
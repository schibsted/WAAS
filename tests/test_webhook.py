import requests
import requests_mock
import pytest
from importlib import reload
from src import callbacks
from src.services.webhook_service import WebhookService, InvalidWebhookIdException
import redis
import os

def match_success_payload(request):
    data = request.json()
    return data['success'] == True and 'X-WAAS-Signature' in request.headers

def match_failure_payload(request):
    data = request.json()
    return data['success'] == False and 'X-WAAS-Signature' in request.headers

# Mocking environment variables for testing
@pytest.fixture
def mock_env(monkeypatch):
    monkeypatch.setenv("BASE_URL", "https://test")
    monkeypatch.setenv("ENVIRONMENT", "test")
    monkeypatch.setenv("ALLOWED_WEBHOOKS_FILE", "tests/fixtures/allowed_webhooks.json")
    reload(callbacks)

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
          "external_ref": '1234-abcd',
          "webhook_id": "77c500b2-0e0f-4785-afc7-f94ed529c897"
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

def test_setup_webhook_store(mock_env):
    file_path = os.getenv('ALLOWED_WEBHOOKS_FILE')
    webhook_store = WebhookService(file_path)
    assert webhook_store is not None

def test_get_webhook_by_id(mock_env):
    file_path = os.getenv('ALLOWED_WEBHOOKS_FILE')
    webhook_store = WebhookService(file_path)
    webhook = webhook_store.get_webhook_by_id('77c500b2-0e0f-4785-afc7-f94ed529c897')
    assert webhook['url'] == "https://myniceserver.com/mywebhook"

def test_not_valid_webhook_id(mock_env):
    file_path = os.getenv('ALLOWED_WEBHOOKS_FILE')
    webhook_store = WebhookService(file_path)
    webhook = webhook_store.is_valid_webhook('not-valid-id')
    assert webhook is False

def test_success_callback_with_webhook(requests_mock, job, result, mock_env, redis_conn):
    requests_mock.register_uri('POST', 'https://myniceserver.com/mywebhook', additional_matcher=match_success_payload, text='resp')
    callbacks.success(job, redis_conn, result)
    assert True

def test_success_callback_with_invalid_webhook(requests_mock, job, result, mock_env, redis_conn):
    requests_mock.register_uri('POST', 'https://myniceserver.com/mywebhook', additional_matcher=match_success_payload, text='resp')
    job.meta['webhook_id'] = 'not-valid-id'
    with pytest.raises(InvalidWebhookIdException):
        callbacks.success(job, redis_conn, result)
    
def test_failure_callback_with_webhook(requests_mock, job, result, mock_env, redis_conn):
    requests_mock.register_uri('POST', 'https://myniceserver.com/mywebhook', additional_matcher=match_failure_payload, text='resp')
    
    transcribe_test_error = Exception('test')
    callbacks.failure(job, redis_conn, result, transcribe_test_error, None)
    assert True

def test_timeout_from_webhook_destination(requests_mock, job, result, mock_env):
    requests_mock.register_uri('POST', 'https://myniceserver.com/mywebhook', exc=requests.exceptions.ConnectTimeout)
    file_path = os.getenv('ALLOWED_WEBHOOKS_FILE')
    webhook_store = WebhookService(file_path)
    with pytest.raises( requests.exceptions.Timeout):
        webhook_store.post_to_webhook(job.meta['webhook_id'], job.id, job.meta['uploaded_filename'], url=None, success=True)
      
      
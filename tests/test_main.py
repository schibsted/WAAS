import pytest
import whisper

from src import app

@pytest.fixture
def client():
    app.config['TESTING'] = True

    return app.test_client()

def test_options(client):
    response = client.get('/options')

    assert response.status_code == 200
    assert response.get_json() == {
        "models": whisper.available_models(),
        "languages": whisper.tokenizer.LANGUAGES,
        "tasks": ["translate", "transcribe"]
    }

import pytest
import whisper

from src import app

@pytest.fixture
def client():
    app.config['TESTING'] = True

    return app.test_client()

def test_detect_options(client):
    response = client.options('/v1/detect')

    assert response.status_code == 200
    assert response.get_json() == {
        "queryParams": {
            "model": {
                "type": "enum",
                "options": whisper.available_models(),
                "optional": True,
                "default": "tiny",
            },
        }
    }

def test_transcribe_options(client):
    response = client.options('/v1/transcribe')

    assert response.status_code == 200
    assert response.get_json() == {
        "queryParams": {
            "model": {
                "type": "enum",
                "options": whisper.available_models(),
                "optional": True,
                "default": "tiny",
            },
            "task": {
                "type": "enum",
                "options": ["translate", "transcribe"],
                "optional": True,
                "default": "transcribe",
            },                
            "languages": {
                "type": "enum",
                "options": list(whisper.tokenizer.LANGUAGES.values()),
                "optional": True,
            },
            "output": {
                "type": "enum",
                "options": ["srt", "vtt", "json", "txt"],
                "optional": True,
                "default": "srt",
            },
        }
    }

def test_download_not_found(client):
    response = client.get('/v1/download/1')

    assert response.status_code == 404

def test_queue(client):
    response = client.get('/v1/queue')

    assert response.status_code == 200
    assert response.get_json() == {
        'length': 0,
    }

import pytest
import whisper

from frontend import app

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
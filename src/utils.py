from uuid import uuid4
from math import floor
from json import dumps
from re import sub
from unidecode import unidecode
from urllib.parse import quote_plus

def sanitize_input(text):
    return sub("[^A-Za-z0-9A+]", "_", unidecode(str(text.encode("latin-1", errors="ignore").decode("latin-1"))))

def get_total_time_transcribed(conn):
    total_time_transcribed = conn.get("waas:total_time_transcribed")

    if total_time_transcribed is None:
        total_time_transcribed = 0

    return float(total_time_transcribed)

def set_total_time_transcribed(value, conn):
    conn.set("waas:total_time_transcribed", value)

def increment_total_time_transcribed(audio_duration, conn):
    total_time_transcribed = get_total_time_transcribed(conn)
    new_total_time_transcribed = total_time_transcribed + float(audio_duration)

    set_total_time_transcribed(new_total_time_transcribed, conn=conn)

    return new_total_time_transcribed

def format_timestamp(seconds: float, always_include_hours: bool = False, decimal_marker: str = '.'):
    assert seconds >= 0, "non-negative timestamp expected"
    milliseconds = round(seconds * 1000.0)

    hours = milliseconds // 3_600_000
    milliseconds -= hours * 3_600_000

    minutes = milliseconds // 60_000
    milliseconds -= minutes * 60_000

    seconds = milliseconds // 1_000
    milliseconds -= seconds * 1_000

    hours_marker = f"{hours:02d}:" if always_include_hours or hours > 0 else ""
    return f"{hours_marker}{minutes:02d}:{seconds:02d}{decimal_marker}{milliseconds:03d}"


def generate_srt(result):
    srt = []
    for i, segment in enumerate(result, start=1):
        srt.append(f"{i}")
        srt.append(
            f"{format_timestamp(segment['start'], always_include_hours=True, decimal_marker=',')} --> {format_timestamp(segment['end'], always_include_hours=True, decimal_marker=',')}")
        srt.append(f"{segment['text'].strip().replace('-->', '->')}\n")

    return "\n".join(srt)


def generate_vtt(result):
    srt = ["WEBVTT"]
    for _, segment in enumerate(result, start=1):
        srt.append(
            f"{format_timestamp(segment['start'])} --> {format_timestamp(segment['end'])}")
        srt.append(f"{segment['text'].strip().replace('-->', '->')}\n")

    return "\n".join(srt)


def generate_text(result):
    text = [""]
    for _, segment in enumerate(result, start=1):
        text.append(f"{segment['text'].strip().replace('-->', '->')}")

    return "\n".join(text)

def get_time_as_hundreds(sec):
    return int(floor(sec * 10))

def get_uuid():
    return str(uuid4())

def generate_jojo_doc(filename, result):
    output = {
        "docVersion": "1.0",
        "id": get_uuid(),
        "audiofile": {
            "id": get_uuid(),
            "url": "file://web/" + quote_plus(filename)
        },
        "segments": []
    }
    for _, segment in enumerate(result, start=1):
        output['segments'].append({
            "id": get_uuid(),
            "timeStart": get_time_as_hundreds(segment['start']),
            "timeEnd": get_time_as_hundreds(segment['end']),
            "text": f"{segment['text'].strip().replace('-->', '->')}"
        })
    return dumps(output)

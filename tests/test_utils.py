import pytest
from src.utils import generate_jojo_doc, get_time_as_hundreds, sanitize_input
import json

def test_get_time_as_hundreds():
    hundred = get_time_as_hundreds(111.09)
    assert hundred == 1110

def test_generate_jojo_doc():
    filename = "test_with_norwegian_chars_ÆøÅæØå"
    result = [
        {
            "avg_logprob": -0.23971951974404826,
            "compression_ratio": 1.693498452012384,
            "end": 3.92,
            "id": 0,
            "no_speech_prob": 0.015559680759906769,
            "seek": 0,
            "start": 0.0,
            "temperature": 0.0,
            "text": " The Bay of Fundy in Eastern Canada has the highest tides in the world.",
            "tokens": [
                383,
                4696,
                286,
                7557,
                88,
                287,
                8345,
                3340,
                468,
                262,
                4511,
                46128,
                287,
                262,
                995,
                13
            ]
        },
        {
            "avg_logprob": -0.23971951974404826,
            "compression_ratio": 1.693498452012384,
            "end": 7.68,
            "id": 1,
            "no_speech_prob": 0.015559680759906769,
            "seek": 0,
            "start": 3.92,
            "temperature": 0.0,
            "text": " Anything up to 16 metres difference between low tide and high tide.",
            "tokens": [
                21035,
                510,
                284,
                1467,
                18985,
                3580,
                1022,
                1877,
                20013,
                290,
                1029,
                20013,
                13
            ]
        },
        {
            "avg_logprob": -0.23971951974404826,
            "compression_ratio": 1.693498452012384,
            "end": 10.88,
            "id": 2,
            "no_speech_prob": 0.015559680759906769,
            "seek": 0,
            "start": 7.68,
            "temperature": 0.0,
            "text": " And the effect in that show up in a few places around here, like whole rocks.",
            "tokens": [
                843,
                262,
                1245,
                287,
                326,
                905,
                510,
                287,
                257,
                1178,
                4113,
                1088,
                994,
                11,
                588,
                2187,
                12586,
                13
            ]
        },
        {
            "avg_logprob": -0.23971951974404826,
            "compression_ratio": 1.693498452012384,
            "end": 14.56,
            "id": 3,
            "no_speech_prob": 0.015559680759906769,
            "seek": 0,
            "start": 10.88,
            "temperature": 0.0,
            "text": " Where I'm not standing on a beach right now, I'm standing on the ocean floor.",
            "tokens": [
                6350,
                314,
                1101,
                407,
                5055,
                319,
                257,
                10481,
                826,
                783,
                11,
                314,
                1101,
                5055,
                319,
                262,
                9151,
                4314,
                13
            ]
        }
    ]
    output = json.loads(generate_jojo_doc(filename, result))
    assert "audiofile" in output
    assert "segments" in output
    assert "id" in output
    assert "docVersion" in output
    assert len(output["segments"]) == 4, "Should be 4 segments in output"


def test_sanitize_input():
    filenames = {
        "øæå": "øæå",
        "ÆÅØ": "ÆÅØ",
        "öäë": "öäë",
        "@!": "__",
        "filename with space": "filename_with_space",
        "filename%20with%20encode": "filename_20with_20encode",
        "filename with date in (2023-01-20)": "filename_with_date_in__2023_01_20_",
        "FiLeNaMe WiTh CaPsLoCk": "FiLeNaMe_WiTh_CaPsLoCk",
    }

    for fn in filenames:
        assert filenames[fn] == sanitize_input(fn)

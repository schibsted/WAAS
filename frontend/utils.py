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
        srt.append(f"{format_timestamp(segment['start'], always_include_hours=True, decimal_marker=',')} --> {format_timestamp(segment['end'], always_include_hours=True, decimal_marker=',')}")
        srt.append(f"{segment['text'].strip().replace('-->', '->')}\n")

    return "\n".join(srt)

def generate_vtt(result):
    srt = ["WEBVTT"]
    for _, segment in enumerate(result, start=1):
        srt.append(f"{format_timestamp(segment['start'])} --> {format_timestamp(segment['end'])}")
        srt.append(f"{segment['text'].strip().replace('-->', '->')}\n")

    return "\n".join(srt)
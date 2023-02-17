const AudioPlayer = ({ audio, cursor }) => {
  const { useState, useEffect } = preact;

  let audioCtx = new AudioContext();
  const offlineCtx = new OfflineAudioContext(2, 44100 * 40, 44100);
  const [blob, setBlob] = useState();
  let isPlaying = false;

  useEffect(() => {
    const audioElement = document.getElementById("audio-editor");

    if (!isPlaying && cursor.length > 0) {
      const clip = new AudioBufferSourceNode(audioCtx, {
        buffer: blob,
      });

      clip.connect(audioCtx.destination);
      clip.start(0, cursor.cursor, cursor.length);
      isPlaying = true;

      return () => {
        isPlaying = false;
        try {
          clip.stop();
        } catch (err) {}
      };
    }
  }, [blob, cursor]);

  useEffect(() => {
    const audioElement = document.getElementById("audio-editor");
    if (!blob) {
      window.pulse("track", "engagementEvent", {
        type: "Engagement",
        action: "Click",
        object: {
          type: "UIElement",
          "@id": `sdrn:jojo:page:editor:element:audioplayer`,
          name: "File uploaded",
        },
      });
      const b = new Blob([audio], { type: audio.type });
      audioElement.src = window.URL.createObjectURL(b);
      audioElement.controls = true;

      b.arrayBuffer()
        .then((buffer) => audioCtx.decodeAudioData(buffer))
        .then(setBlob);
    }
  }, [audio]);

  return html`<audio id="audio-editor"></audio>`;
};

export default AudioPlayer;

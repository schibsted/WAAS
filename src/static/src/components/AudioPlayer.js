const AudioPlayer = ({ audio, cursor }) => {
  const { useEffect } = preact;

  useEffect(() => {
    if (!cursor) return;
    const audioElement = document.getElementById("audio-editor");
    audioElement.currentTime = cursor;
    audioElement.play();
  }, [cursor]);

  useEffect(() => {
    const reader = new FileReader();
    const audioElement = document.getElementById("audio-editor");
    reader.addEventListener("load", (event) => {
      audioElement.src = event.target.result;
      audioElement.controls = true;
    });

    reader.readAsDataURL(audio);
    window.pulse("track", "engagementEvent", {
      type: "Engagement",
      action: "Click",
      object: {
        type: "UIElement",
        "@id": `sdrn:jojo:page:editor:element:audioplayer`,
        name: "File uploaded",
      },
    });
  }, [audio]);

  return html`<audio id="audio-editor"></audio>`;
};

export default AudioPlayer;

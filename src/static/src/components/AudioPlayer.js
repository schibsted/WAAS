const AudioPlayer = ({ fileStored, cursor }) => {
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

    reader.readAsDataURL(fileStored);
  }, [fileStored]);

  return html`<audio id="audio-editor"></audio>`;
};

export default AudioPlayer;

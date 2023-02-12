import Table from "./Table.js";
import AudioPlayer from "./AudioPlayer.js";

const Editor = ({
  fileStored,
  setUploadStatus,
  setErrorMessage,
  setJobId,
  onCancel,
}) => {
  const { useState, useEffect } = preact;
  const [cursor, setCursor] = useState();

  // console.log("render");
  return html`<main class="editor">
    <h1>Editing ${fileStored.name}</h1>
    ${AudioPlayer({ cursor, fileStored })}
    <br />
    ${Table({ setCursor })}
    <button onclick="javascript:setUploadStatus('pending')">Videre</button>
  </main>`;
};

export default Editor;

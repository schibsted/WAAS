import Table from "./Table.js";
import AudioPlayer from "./AudioPlayer.js";

const Editor = ({
  fileStored,
  setUploadStatus,
  setErrorMessage,
  setJobId,
  onCancel,
}) => {
  const { useState } = preact;
  const [cursor, setCursor] = useState();

  return html`<div>
    <main class="editor">
      <h1>Editor</h1>
      <br />
      <div class="file-info">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
        >
          <path
            stroke="#fff"
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="1.5"
            d="M12.75 4.75h-5a2 2 0 0 0-2 2v10.5c0 1.1.9 2 2 2h8.5a2 2 0 0 0 2-2v-7m-5.5-5.5v3.5c0 1.1.9 2 2 2h3.5m-5.5-5.5 5.5 5.5"
          ></path>
        </svg>
        <p>${fileStored.name}</p>
      </div>
      <br />
      ${AudioPlayer({ cursor, fileStored })}
      <br />
      <br />
      <button onclick=${() => setUploadStatus("pending")}>Videre</button>
    </main>
    <div class="table-container">${Table({ setCursor })}</div>
  </div>`;
};

export default Editor;

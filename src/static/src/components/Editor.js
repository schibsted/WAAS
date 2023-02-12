import Table from "./Table.js";
import AudioPlayer from "./AudioPlayer.js";
import { PlusIcon, UploadIcon } from "./icons/index.js";

const UploadForm = ({ onChange, accentColor }) => {
  return html`
    <form
      class="upload-file"
      onchange=${(event) => {
        const file = event.target.files[0];
        onChange(file);
      }}
    >
      <label class="dropzone">
        <${UploadIcon} />
      </label>

      <label
        for="file-upload"
        id="file-upload-button"
        style=${{ backgroundColor: accentColor }}
        class="file-upload-button"
      >
        <input
          id="file-upload"
          name="file-dropzone-upload"
          type="file"
          class="sr-only"
        />
        <${PlusIcon} />
        Choose audio file
      </label>
    </form>
  `;
};

const Editor = ({
  fileStored,
  jojoDoc,
  setUploadStatus,
  setErrorMessage,
  setJobId,
  onCancel,
}) => {
  const { useState } = preact;
  const [cursor, setCursor] = useState();
  const [audio, setAudio] = useState();

  return html`<div>
    <main class="editor">
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
        <p>${audio ? audio.name : "No audio file."}</p>
      </div>
      <br />
      <${audio && AudioPlayer} cursor=${cursor} audio=${audio} />
      <${!audio && UploadForm}
        onChange=${(file) => {
          setAudio(file);
        }}
      />
    </main>
    <div class="table-container">
      <${Table} jojoDoc=${jojoDoc} setCursor=${setCursor} />
    </div>
  </div>`;
};

export default Editor;

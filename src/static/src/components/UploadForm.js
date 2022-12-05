import { PlusIcon, UploadIcon } from "./icons/index.js";

const UploadForm = ({ uploadHandler, accentColor }) => {
  return html`
    <form
      class="upload-form"
      onchange=${(event) => {
        const file = event.target.files[0];
        uploadHandler(file);
      }}
    >
      <legend>
        <h1>JoJo transcribing</h1>
        <p>Start with doing this, then we transcribe. Then it will be nice.</p>
        <p>The file gets sendt to: ok@vg.no</p>
      </legend>
      <label for="file-upload" class="dropzone">
        <${UploadIcon} />
        <input
          id="file-upload"
          name="file-upload"
          type="file"
          accept=".mp3,audio/*"
          class="sr-only"
        />
      </label>

      <label
        for="file-upload"
        id="file-upload-button"
        style=${{ backgroundColor: accentColor }}
        class="file-upload-button"
      >
        <${PlusIcon} />
        Upload file
      </label>
    </form>
  `;
};

export default UploadForm;

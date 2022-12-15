import { PlusIcon, UploadIcon } from "./icons/index.js";

const UploadForm = ({ onChange, accentColor }) => {
  return html`
    <form
      class="upload-form"
      onchange=${(event) => {
        const file = event.target.files[0];
        onChange(file);
      }}
    >
      <legend>
        <h1>Let us transcribe</h1>
        <p>
          Upload your audio or video file and let us transcribe it.. Save
          countless hours with the JOJO™ transcribtion service, so that you can
          put your mind to more important things.
        </p>
      </legend>
      <label for="file-upload" class="dropzone">
        <${UploadIcon} />
        <input
          id="file-upload"
          name="file-dropzone-upload"
          type="file"
          accept="video/*,audio/*"
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

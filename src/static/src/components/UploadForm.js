import { Check, PlusIcon, Update, UploadIcon } from "./icons/index.js";

const UploadForm = ({ onChange, accentColor, uploadStatus }) => {
  const getFormTitle = () => {
    if (uploadStatus === "uploading") {
      return "Uploading file";
    }

    if (uploadStatus === "transcribing") {
      return "Transcribing file";
    }

    return "Let us transcribe";
  };

  const getFormDescription = () => {
    if (uploadStatus === "uploading") {
      return "When we are finished transcribing your file we’ll send you the trascript on email. This can take a few hours, depending on the length of the audio clip.";
    }

    if (uploadStatus === "transcribing") {
      return "When the file is finished transcribing you will receive an email with a download link. You can now safely close this page without interferring with the transcription. See you!";
    }

    return "Upload your audio or video file and let us transcribe it.. Save countless hours with the JOJO™ transcribtion service, so that you can put your mind to more important things.";
  };

  const getIcon = () => {
    if (uploadStatus === "uploading") {
      return html`<${Update} />`;
    }

    if (uploadStatus === "transcribing") {
      return html`<${Check} />`;
    }

    return html`<${UploadIcon} />`;
  };

  const getLabelColor = () => {
    if (uploadStatus === "uploading") {
      return "linear-gradient(294.47deg, #BD00FF 15.09%, rgba(187, 0, 255, 0.614583) 82.15%, #BB00FF 150.61%)";
    }

    if (uploadStatus === "transcribing") {
      return "linear-gradient(294.47deg, #33FF00 15.09%, rgba(51, 255, 0, 0.614583) 82.15%, rgba(51, 255, 0, 0) 150.61%)";
    }

    return undefined;
  };

  return html`
    <form
      class="upload-form"
      onchange=${(event) => {
        const file = event.target.files[0];
        onChange(file);
      }}
      disabled=${uploadStatus}
    >
      <legend>
        <h1>${getFormTitle()}</h1>
        <p>${getFormDescription()}</p>
      </legend>
      <label
        for="file-upload"
        class="dropzone"
        style=${{
          background: getLabelColor(),
        }}
      >
        ${getIcon()}
        <input
          disabled=${uploadStatus}
          id="file-upload"
          name="file-dropzone-upload"
          type="file"
          accept="video/*,audio/*"
          class="sr-only"
        />
      </label>

      ${!uploadStatus &&
      html`<label
        for="file-upload"
        id="file-upload-button"
        style=${{ backgroundColor: accentColor }}
        class="file-upload-button"
      >
        <${PlusIcon} />
        Upload file
      </label>`}
    </form>
  `;
};

export default UploadForm;

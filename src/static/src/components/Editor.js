import Table from "./Table.js";
import AudioPlayer from "./AudioPlayer.js";
import { PlusIcon } from "./icons/index.js";
import toTimeString from "../utils/toTimeString.js";
import { allowedFileTypes } from "../utils/constants.js";

const UploadForm = ({ onChange, accentColor }) => {
  return html`
    <form
      class="upload-file"
      onchange=${(event) => {
        const file = event.target.files[0];
        onChange(file);
      }}
    >
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

const AudioOrUpload = ({ audio, cursor, setAudio }) => {
  if (audio) {
    return html`<${AudioPlayer} cursor=${cursor} audio=${audio} /><br />`;
  }
  return html`<${UploadForm}
    onChange=${(file) => {
      if (allowedFileTypes.some((type) => file.type.includes(type))) {
        setAudio(file);
        return;
      }
      alert("Please choose a valid audio or video file");
    }}
  />`;
};

const Editor = ({
  fileStored,
  jojoDoc,
  setUploadStatus,
  setErrorMessage,
  setJobId,
  onCancel,
}) => {
  const { useState, useEffect } = preact;
  const [cursor, setCursor] = useState();
  const [audio, setAudio] = useState();

  useEffect(() => {
    window.pulse("trackPageView", {
      object: {
        id: "editor",
        type: "Page",
        name: "Editor",
      },
    });
  }, []);

  const download = async (type) => {
    const a = document.createElement("a");
    a.download = (audio ? audio.name : "Transcription") + "." + type;
    const data = async () => {
      switch (type) {
        case "jojo":
          return JSON.stringify(jojoDoc);
          break;

        case "srt":
          return jojoDoc.segments
            .map((segment, index) => {
              return [
                index + 1,
                toTimeString(segment.timeStart / 100) +
                  ",000 --> " +
                  toTimeString(segment.timeEnd / 100) +
                  ",000",
                segment.text.replace("-->", ""),
              ].join("\n");
            })
            .join("\n\n");
          break;

        case "txt":
          return jojoDoc.segments
            .map(
              (segment, index) =>
                `${toTimeString(segment.timeStart / 100)} | ${segment.text}`
            )
            .join("\n");
          break;

        case "csv":
          return [
            "Time;Transcription",
            ...jojoDoc.segments.map(
              (segment, index) =>
                `${toTimeString(
                  segment.timeStart / 100
                )};${segment.text.replace(";", "")}`
            ),
          ].join("\n");
          break;

        default:
          break;
      }
    };
    a.href =
      "data:application/octet-stream;charset=utf-8;base64," +
      btoa(await data());
    a.click();
  };

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
      <${AudioOrUpload} audio=${audio} cursor=${cursor} setAudio=${setAudio} />
      <br />
      <div id="save">
        <button onclick=${() => download("jojo")}>Save (.jojo)</button>
        <div>
          <button onclick=${() => download("srt")}>.srt</button>
          <button onclick=${() => download("txt")}>.txt</button>
          <button onclick=${() => download("csv")}>.csv</button>
        </div>
      </div>
    </main>
    <div class="table-container">
      <${Table} jojoDoc=${jojoDoc} setCursor=${setCursor} />
    </div>
  </div>`;
};

export default Editor;

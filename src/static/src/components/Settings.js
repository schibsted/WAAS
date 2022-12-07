import uploadHandler from "../utils/uploadHandler.js";
import { Close, File } from "./icons/index.js";

const Settings = ({
  fileStored,
  setFileStored,
  setUploadStatus,
  setErrorMessage,
  onCancel,
}) => {
  const { useState, useEffect } = preact;

  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("detect-language");

  console.log(selectedLanguage);
  useEffect(() => {
    const fetchLanguages = async () => {
      const response = await fetch("/v1/transcribe", { method: "OPTIONS" });
      const data = await response.json();
      setLanguages(data.queryParams.languages.options);
    };
    fetchLanguages();
  }, []);

  return html`
    <main class="settings">
      <button
        class="button-cancel"
        aria-label="cancel"
        onclick=${() => onCancel()}
      >
        <${Close} />
      </button>
      <h1>Select language</h1>
      <p class="language-description">
        Chose main language that is spoken in the file, to help us get the best
        transcription
      </p>
      <div class="file-info">
        <${File} />
        <p>${fileStored.name}</p>
      </div>

      <select
        name="language"
        id="language"
        class="select-language"
        onchange=${(event) => setSelectedLanguage(event.target.value)}
      >
        <option value="detect-language">Detect language</option>
        ${languages.map(
          (language) =>
            html`
              <option
                selected=${language === selectedLanguage}
                value=${language}
              >
                ${language}
              </option>
            `
        )}
      </select>
      <button
        class="button-upload"
        onclick=${() =>
          uploadHandler({
            file: fileStored,
            setErrorMessage,
            setUploadStatus,
            selectedLanguage,
          })}
      >
        Lets go!
      </button>
    </main>
  `;
};
export default Settings;

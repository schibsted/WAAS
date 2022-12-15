import uploadHandler from "../utils/uploadHandler.js";
import { Close, File } from "./icons/index.js";

const Settings = ({
  fileStored,
  setJobId,
  setUploadStatus,
  setErrorMessage,
  onCancel,
}) => {
  const { useState, useEffect } = preact;

  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("detect-language");

  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("large");

  const [email, setEmail] = useState("");

  useEffect(() => {
    const fetchLanguages = async () => {
      const response = await fetch("/v1/transcribe", { method: "OPTIONS" });
      const data = await response.json();
      setLanguages(data.queryParams.languages.options);
      setModels(data.queryParams.model.options);
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
        class="select-dropdown"
        onchange=${(event) => setSelectedLanguage(event.target.value)}
      >
        <option value="detect-language">Detect language</option>
        ${languages.map(
          (language) =>
            html`
              <option
                class="language-option"
                selected=${language === selectedLanguage}
                value=${language}
              >
                ${language}
              </option>
            `
        )}
      </select>
      <h1>Enter your email *</h1>
      <p class="email-description">
        The provided email will be used to send you the transcription results
        when the process is complete.
      </p>
      <div class="email-input">
        <label for="email">Email</label>
        <input
          required
          type="email"
          name="email"
          id="email"
          placeholder="Enter your email"
          value=${email}
          oninput=${(event) => setEmail(event.target.value)}
        />
      </div>
      <button
        class="button-upload"
        disabled=${!email}
        onclick=${() =>
          uploadHandler({
            file: fileStored,
            setErrorMessage,
            setUploadStatus,
            selectedLanguage,
            setJobId,
            selectedModel,
            email,
          })}
      >
        Lets go!
      </button>
      <details class="advanced-settings">
        <summary>Advanced settings</summary>
        <div class="advanced-settings-content">
          <h2>Model</h2>
          <p class="model-description">
            Select the model that you want to use for transcription. The large
            model is more accurate but slower.
          </p>
          <select
            name="model"
            id="model"
            class="select-dropdown"
            onchange=${(event) => setSelectedModel(event.target.value)}
          >
            ${models.map(
              (model) =>
                html`
                  <option selected=${model === selectedModel} value=${model}>
                    ${model}
                  </option>
                `
            )}
          </select>
        </div>
      </details>
    </main>
  `;
};
export default Settings;

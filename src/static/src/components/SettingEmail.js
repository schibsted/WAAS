import uploadHandler from "../utils/uploadHandler.js";
import { Close, File } from "./icons/index.js";

const SettingsEmail = ({
  onCancel,
  fileStored,
  email,
  setEmail,
  selectedLanguage,
  setJobId,
  setUploadStatus,
  setErrorMessage,
  selectedModel,
  setSelectedModel,
  models,
}) => {
  return html`
    <main class="settings">
      <form
        onsubmit=${(evt) => {
          evt.preventDefault();

          localStorage.setItem("email", email);

          pulse((sdk) => {
            sdk.track("Engagement", {
              type: "Engagement",
              action: "Click",
              object: { id: "transcribe-button" },
            });
          });

          uploadHandler({
            file: fileStored,
            setJobId,
            email,
            setUploadStatus,
            selectedLanguage,
            selectedModel,
            setErrorMessage,
          });
        }}
      >
        <button
          class="button-cancel"
          aria-label="cancel"
          type="button"
          onclick=${() => onCancel()}
        >
          <${Close} />
        </button>
        <h1>Select e-mail</h1>
        <p class="language-description">
          Choose what email address you want to receive the finished transcript.
        </p>
        <div class="file-info">
          <${File} />
          <p>${fileStored.name}</p>
        </div>
        <div class="email-input">
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
        <button class="button-upload" disabled=${!email} type="submit">
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
      </form>
    </main>
  `;
};
export default SettingsEmail;

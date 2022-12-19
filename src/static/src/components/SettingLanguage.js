import { Close, File } from "./icons/index.js";

const SettingsLanguage = ({
  onCancel,
  fileStored,
  languages,
  selectedLanguage,
  setSelectedLanguage,
  setSettingTab,
}) => {
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
                selected=${language === selectedLanguage}
                value=${language}
              >
                ${language}
              </option>
            `
        )}
      </select>
      <button class="button-upload" onclick=${() => setSettingTab(1)}>
        Next
      </button>
    </main>
  `;
};
export default SettingsLanguage;

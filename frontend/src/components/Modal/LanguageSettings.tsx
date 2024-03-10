import { useStore } from "@nanostores/react";
import { $modelSettings, cancelUpload, setSelectedLanguage } from "../../stores/FileStore";

const LanguageSettings = ({
  languages,
  setSettingTab,
  files,
}: {
    languages: string[];
    setSettingTab: (tab: number) => void;
    files: { files: File[] };
    
}) => {
    const modelSettings = useStore($modelSettings);

    const { selectedLanguage } = modelSettings;

  return (
    <main className="settings">
      <button
        className="button-cancel"
        aria-label="cancel"
        onClick={() => cancelUpload()}
      >
        {/* <Close /> */}
      </button>
      <h1>Select language</h1>
      <p className="language-description">
        Choose the main language that is spoken in the file, to help us get the best
        transcription.
      </p>
      <div className="file-info">
        <p>{files.files.map(file => file.name).join(', ')}</p>
      </div>
      <select
        name="language"
        id="language"
        className="select-dropdown"
        onChange={(event) => setSelectedLanguage(event.target.value)}
      >
        <option value="detect-language">Detect language</option>
        {languages.map((language) => (
          <option
            key={language}
            selected={language === selectedLanguage}
            value={language}
          >
            {language}
          </option>
        ))}
      </select>
      <button className="button-upload" onClick={() => setSettingTab(1)}>
        Next
      </button>
    </main>
  );
};

export default LanguageSettings;

import SettingsEmail from "./SettingEmail.js";
import SettingsLanguage from "./SettingLanguage.js";

const Settings = ({
  fileStored,
  setUploadStatus,
  setErrorMessage,
  setJobId,
  onCancel,
}) => {
  const { useState, useEffect } = preact;

  const [settingTab, setSettingTab] = useState(0);

  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState("");

  useEffect(() => {
    const savedLanguage = localStorage.getItem("selectedLanguage");
    if (savedLanguage) {
      setSelectedLanguage(savedLanguage);
    } else {
      setSelectedLanguage("detect-language");
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedLanguage", selectedLanguage);
  }, [selectedLanguage]);

  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState("large");

  const [email, setEmail] = useState(localStorage.getItem("email"));

  useEffect(() => {
    const fetchLanguages = async () => {
      const response = await fetch("/v1/transcribe", { method: "OPTIONS" });
      const data = await response.json();
      const { queryParams } = data;
      const { languages, model } = queryParams;

      const topLanguages = ["norwegian", "swedish", "english"];
      const otherLanguages = languages.options.filter(
        (language) => !topLanguages.includes(language)
      );

      languages.options = [...topLanguages, ...otherLanguages.sort()];

      setLanguages(languages.options);
      setModels(model.options);
    };
    fetchLanguages();
  }, []);

  if (settingTab === 0) {
    return html`<${SettingsLanguage}
      onCancel=${onCancel}
      fileStored=${fileStored}
      languages=${languages}
      selectedLanguage=${selectedLanguage}
      setSelectedLanguage=${setSelectedLanguage}
      setSettingTab=${setSettingTab}
    />`;
  }

  if (settingTab === 1) {
    return html`<${SettingsEmail}
      onCancel=${onCancel}
      fileStored=${fileStored}
      email=${email}
      setEmail=${setEmail}
      selectedLanguage=${selectedLanguage}
      setJobId=${setJobId}
      setUploadStatus=${setUploadStatus}
      setErrorMessage=${setErrorMessage}
      selectedModel=${selectedModel}
      setSelectedModel=${setSelectedModel}
      models=${models}
    />`;
  }
};

export default Settings;

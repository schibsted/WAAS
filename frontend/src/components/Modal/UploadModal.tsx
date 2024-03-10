import { useStore } from "@nanostores/react";
import { $fileStore } from "../../stores/FileStore";
import { useState } from "react";
import LanguageSettings from "./LanguageSettings";
import './styles.css';

const UploadModal = ({ languages, model }: {languages: string[], model: string}) => {
  const [step, setStep] = useState(0);

  const files = useStore($fileStore);

  if(!files.files){
    return null;
  }

  if (files.files && files.files.length > 0 && step === 0) {
    return (
      <LanguageSettings
        languages={languages}
        setSettingTab={setStep}
        files={files}
      />
    );
  }



  return <div>hei</div>;
};

export default UploadModal;

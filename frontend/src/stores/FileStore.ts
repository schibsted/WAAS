import { atom } from "nanostores";

interface FileState {
  files: File[] | null;
  error: string | null;
}

const initialFileState: FileState = {
  files: null,
  error: null,
};

export const $fileStore = atom<FileState>(initialFileState);

export const setFiles = (files: File[]) => {
  $fileStore.set({...$fileStore.get(), files})
}

export const setError = (error: string) => {
  $fileStore.set({...$fileStore.get(), error})
};

export const cancelUpload = () => {
  $fileStore.set(initialFileState);
}


interface ModelSettings {
  selectedLanguage: string;
  selectedModel: string;
}

const initialModelSettings: ModelSettings = {
    selectedLanguage: "",
    selectedModel: "large"
}

export const $modelSettings = atom<ModelSettings>(initialModelSettings)

export const setSelectedLanguage = (language: string) => {
  $modelSettings.set({...$modelSettings.get(), selectedLanguage: language})
}

export const setSelectedModel = (model: string) => {
  $modelSettings.set({...$modelSettings.get(), selectedModel: model})
}
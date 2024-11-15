import { map } from 'nanostores';

export enum Step {
  SelectFile = 'selectFile',
  ChooseLanguage = 'chooseLanguage',
  ChooseEmail = 'chooseEmail',
  AdvancedOptions = 'advancedOptions',
  Uploading = 'uploading',
  Error = 'error',
  Done = 'done',
}

export interface UploadState {
  selectFileError: string | null;
  currentStep: Step;
  file: File | null;
  fileLanguage: string | null;
  whisperModel: string | null;
  uploadError: string | null;
  transcriptionId: string | null;
}

export const $uploadStore = map<UploadState>({
  selectFileError: null,
  currentStep: Step.SelectFile,
  fileLanguage: null,
  whisperModel: null,
  uploadError: null,
  transcriptionId: null,
  file: null,
});

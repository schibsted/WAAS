import { map } from 'nanostores';
import { defaultModel, type models } from '../utils/constants';

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
  whisperModel: (typeof models)[number];
  uploadError: string | null;
  transcriptionId: string | null;
}

export const $uploadStore = map<UploadState>({
  selectFileError: null,
  currentStep: Step.SelectFile,
  fileLanguage: null,
  whisperModel: defaultModel,
  uploadError: null,
  transcriptionId: null,
  file: null,
});

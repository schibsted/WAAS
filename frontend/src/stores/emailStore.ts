import { persistentAtom } from '@nanostores/persistent';

export type Email = string | null;

export const $emailStore = persistentAtom<Email>('jojo-email', null, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

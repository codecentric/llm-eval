import { atom, WritableAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

import type { SyncStorage } from "jotai/vanilla/utils/atomWithStorage";

export const atomWithToggleAndStorage = (
  key: string,
  initialValue?: boolean,
  storage?: SyncStorage<boolean | undefined>,
): WritableAtom<boolean, [boolean?], void> => {
  const anAtom = atomWithStorage(key, initialValue, storage);
  anAtom.debugLabel = `${key}_toggleStorageAtom`;
  const derivedAtom = atom(
    (get) => get(anAtom),
    (get, set, nextValue?: boolean) => {
      const update = nextValue ?? !get(anAtom);
      void set(anAtom, update);
    },
  );

  return derivedAtom as WritableAtom<boolean, [boolean?], void>;
};

import { atomWithToggleAndStorage } from "@/app/utils/jotai";

export const showContextHelpAtom = atomWithToggleAndStorage(
  "showContextHelp",
  false,
);
showContextHelpAtom.debugLabel = "showContextHelpAtom";

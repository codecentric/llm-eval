import { TranslationValues } from "use-intl";

import { Translations } from "@/app/types/translations";

export type TranslationString = [string] | [string, TranslationValues] | string;

export const translate = (
  t: Translations,
  translationString: TranslationString | undefined,
) => {
  if (translationString === undefined) {
    return "";
  }

  if (typeof translationString === "string") {
    return t(translationString);
  }

  if (translationString.length === 1) {
    return t(translationString[0]);
  }

  return t(translationString[0], translationString[1]);
};

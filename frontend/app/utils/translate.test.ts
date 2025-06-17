import { mockTranslations } from "@/app/test-utils/mock-translate";
import { translate, TranslationString } from "@/app/utils/translate";

describe("translate", () => {
  it.each<[TranslationString | undefined, string]>([
    [undefined, ""],
    ["test", "test"],
    [["test"], "test"],
    [["test", { abc: 123 }], `test - {"abc":123}`],
  ])(
    "when called with %o should return %s",
    (translationString, translatedString) => {
      expect(translate(mockTranslations, translationString)).toEqual(
        translatedString,
      );

      if (translationString === undefined) {
        expect(mockTranslations).not.toHaveBeenCalled();
      } else if (typeof translationString === "string") {
        expect(mockTranslations).toHaveBeenCalledWith(translationString);
      } else if (translationString.length === 1) {
        expect(mockTranslations).toHaveBeenCalledWith(translationString[0]);
      } else {
        expect(mockTranslations).toHaveBeenCalledWith(
          translationString[0],
          translationString[1],
        );
      }
    },
  );
});

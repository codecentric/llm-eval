import { useTranslations } from "next-intl";
import { useCallback } from "react";
import { FieldError } from "react-hook-form";

export const useFormFieldErrorMessageBuilder = () => {
  const t = useTranslations();

  return useCallback(
    (
      error: FieldError | FieldError[] | undefined,
      position: number | undefined = undefined,
    ): string | undefined => {
      if (!error) {
        return undefined;
      }

      let err: FieldError | undefined | null;

      if (Array.isArray(error)) {
        if (position === undefined) {
          return undefined;
        }

        err = error[position];
      } else {
        err = error;
      }

      if (!err?.message) {
        return undefined;
      }

      const message = err.message;

      let splitter = message.indexOf("|");
      if (splitter === -1) {
        splitter = message.length;
      }
      const key = message.substring(0, splitter);
      const params = message.substring(splitter + 1);

      return t(key, params && JSON.parse(params));
    },
    [t],
  );
};

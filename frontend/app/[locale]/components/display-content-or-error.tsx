import { useTranslations } from "next-intl";
import React, { PropsWithChildren } from "react";

import {
  ErrorDisplay,
  WrappedError,
} from "@/app/[locale]/components/error-display";

export type ContentOrError = {
  error: WrappedError;
  errorMessage: string;
  content: React.ReactNode;
};

export type SingleErorrProps = PropsWithChildren<{
  error: unknown;
  errorMessage?: string;
}>;

export type MultiErrorProps = {
  data: ContentOrError[];
  multiErrorMessage?: string;
};

export type DisplayContentOrErrorProps = SingleErorrProps | MultiErrorProps;

const isSingleErrorProps = (
  props: DisplayContentOrErrorProps,
): props is SingleErorrProps => {
  return !("data" in props);
};

export const DisplayContentOrError = (props: DisplayContentOrErrorProps) => {
  const t = useTranslations();

  if (isSingleErrorProps(props)) {
    const { error, children, errorMessage } = props;

    return error ? (
      <ErrorDisplay
        message={errorMessage ?? t("page.genericDataLoadError")}
        error={error}
      />
    ) : (
      children
    );
  } else {
    const { data, multiErrorMessage } = props;

    const errors = data.filter((item) => item.error.error);
    const contents = data.filter((item) => !item.error.error);

    return (
      <>
        {errors.length === 1 && (
          <ErrorDisplay
            message={errors[0].errorMessage}
            error={[errors[0].error]}
          />
        )}
        {errors.length > 1 && (
          <ErrorDisplay
            message={multiErrorMessage ?? t("page.genericDataLoadError")}
            error={errors.map((item) => item.error)}
          />
        )}

        {contents.map((item) => item.content)}
      </>
    );
  }
};

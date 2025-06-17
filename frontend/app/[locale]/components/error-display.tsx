import {
  Accordion,
  AccordionItem,
  Button,
  Code,
  Tab,
  Tabs,
} from "@heroui/react";
import { cx } from "classix";
import { getReasonPhrase, StatusCodes } from "http-status-codes";
import { useTranslations } from "next-intl";
import React, { useCallback, useState } from "react";
import { MdOutlineErrorOutline, MdWrapText } from "react-icons/md";

import {
  isResponseError,
  ResponseError,
} from "@/app/utils/backend-client/exception-handler";

export type ErrorType = unknown;

export type WrappedError = {
  title: string;
  error: ErrorType;
};

type ClassNames = {
  codeBlock?: string;
};

const ErrorCodeBlock: React.FC<{ text: string; className?: string }> = ({
  text,
  className,
}) => {
  const [wrapText, setWrapText] = useState(false);

  const toggleWrapText = useCallback(() => setWrapText(!wrapText), [wrapText]);

  return (
    <div className="relative">
      <Button
        className="absolute top-0 right-0 w-7 h-7 min-w-7"
        variant="light"
        isIconOnly
        onPress={toggleWrapText}
      >
        <MdWrapText size={16} />
      </Button>
      <Code
        className={cx(
          "whitespace-pre w-full h-full align-top",
          wrapText ? "text-wrap" : "overflow-x-auto",
          className,
        )}
        data-testid="error-details"
      >
        {text}
      </Code>
    </div>
  );
};

const useResponseErrorDisplayData = (error: ResponseError) => {
  const t = useTranslations();

  if (error.status === StatusCodes.UNPROCESSABLE_ENTITY) {
    return {
      title: t("ErrorDisplay.validationError"),
      text: JSON.stringify(error.error.detail, null, 2),
    };
  } else if (error.status === StatusCodes.INTERNAL_SERVER_ERROR) {
    return {
      title: t("ErrorDisplay.internalServerError"),
      text: error.error,
    };
  } else {
    return {
      title: error.error.detail,
      text: `${t("ErrorDisplay.statusCode")}: ${error.status}\n${t("ErrorDisplay.reason")}: ${getReasonPhrase(error.status)}`,
    };
  }
};

const ResponseErrorDisplay: React.FC<{
  error: ResponseError;
  classNames?: ClassNames;
}> = ({ error, classNames }) => {
  const { title, text } = useResponseErrorDisplayData(error);

  return (
    <Accordion variant="light">
      <AccordionItem
        key="1"
        title={title}
        classNames={{
          indicator: "text-foreground",
          content: "p-0",
        }}
      >
        <ErrorCodeBlock text={text} className={classNames?.codeBlock} />
      </AccordionItem>
    </Accordion>
  );
};

const SingleError: React.FC<{
  error: ErrorType;
  classNames?: ClassNames;
}> = ({ error, classNames }) => {
  return typeof error === "string" ? (
    <ErrorCodeBlock text={error} className={classNames?.codeBlock} />
  ) : isResponseError(error) ? (
    <ResponseErrorDisplay error={error} classNames={classNames} />
  ) : (
    <ErrorCodeBlock
      text={JSON.stringify(error, null, 2)}
      className={classNames?.codeBlock}
    />
  );
};

const ErrorPanel: React.FC<{
  error: ErrorType | WrappedError[];
  classNames?: ClassNames;
}> = ({ error, classNames }) => {
  const t = useTranslations();

  return Array.isArray(error) ? (
    error.length === 0 ? null : error.length === 1 ? (
      <SingleError error={error[0].error} classNames={classNames} />
    ) : (
      <Tabs
        aria-label={t("ErrorPanel.tabs.ariaLabel")}
        size="sm"
        variant="underlined"
        classNames={{ panel: "p-0" }}
      >
        {error.map((e, index) => (
          <Tab key={index} title={e.title}>
            <SingleError error={e.error} classNames={classNames} />
          </Tab>
        ))}
      </Tabs>
    )
  ) : (
    <SingleError error={error} classNames={classNames} />
  );
};

export type ErrorDisplayProps = {
  message: string;
  error?: ErrorType | WrappedError[];
  className?: string;
  classNames?: ClassNames;
};

export const ErrorDisplay = ({
  message,
  error,
  className,
  classNames,
}: ErrorDisplayProps) => {
  return (
    <div
      className={cx(
        "rounded-large border-2 border-danger p-2 bg-danger/10 grid grid-cols-1 grid-rows-[auto_minmax(0,1fr)]",
        className,
      )}
      data-testid="error-display"
    >
      <div className="flex gap-2 items-center text-danger text-md">
        <MdOutlineErrorOutline />
        {message}
      </div>
      {error ? (
        <div>
          <ErrorPanel error={error} classNames={classNames} />
        </div>
      ) : null}
    </div>
  );
};

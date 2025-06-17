import {
  NextIntlClientProvider,
  useFormatter,
  useTranslations,
} from "next-intl";
import { getTranslations } from "next-intl/server";
import { PropsWithChildren } from "react";

vi.mock("next-intl", async (importOriginal) => {
  return {
    ...(await importOriginal<typeof import("next-intl")>()),
    useTranslations: vi.fn(),
    useFormatter: vi.fn(),
  };
});

vi.mock("next-intl/server", async (importOriginal) => {
  return {
    ...(await importOriginal<typeof import("next-intl/server")>()),
    getTranslations: vi.fn(),
  };
});

const mockedUseTranslations = vi.mocked(useTranslations);
const mockedGetTranslations = vi.mocked(getTranslations);

const translate = (namespace: Parameters<typeof useTranslations>[0]) =>
  Object.assign(
    vi.fn((key, values) =>
      values
        ? `${namespace}${key} - ${JSON.stringify(values)}`
        : `${namespace}${key}`,
    ),
    {
      rich: vi.fn(),
      markup: vi.fn(),
      raw: vi.fn(),
      has: vi.fn(),
    },
  ) satisfies ReturnType<typeof useTranslations>;

// Need to cache translate function, so that it does not constantly trigger effects where it is a dependency
const translateFunctionCache: Record<
  Parameters<typeof useTranslations>[0],
  ReturnType<typeof useTranslations>
> = {};

const getTranslateFunction = (
  namespace: Parameters<typeof useTranslations>[0],
) => {
  if (translateFunctionCache[namespace]) {
    return translateFunctionCache[namespace];
  }

  const translateFunction = translate(namespace ? `${namespace}.` : "");
  translateFunctionCache[namespace] = translateFunction;
  return translateFunction;
};

mockedUseTranslations.mockImplementation((namespace) =>
  getTranslateFunction(namespace),
);
mockedGetTranslations.mockImplementation((namespace) =>
  Promise.resolve(getTranslateFunction(namespace)),
);

const mockedUseFormatter = vi.mocked(useFormatter);

const formatter = {
  dateTime: vi.fn((date: Date | number) =>
    typeof date === "number" ? date.toString() : date.toISOString(),
  ),
  list: vi.fn(),
  number: vi.fn((num: number | bigint) => num.toString()),
  dateTimeRange: vi.fn(),
  relativeTime: vi.fn(),
} satisfies ReturnType<typeof useFormatter>;

mockedUseFormatter.mockReturnValue(formatter);

const IntlWrapper = ({ children }: PropsWithChildren) => (
  <NextIntlClientProvider messages={{}} locale="en">
    {children}
  </NextIntlClientProvider>
);

declare global {
  /* eslint-disable-next-line no-var */ // noinspection ES6ConvertVarToLetConst
  var mockFormatter: typeof formatter;
  /* eslint-disable-next-line no-var */ // noinspection ES6ConvertVarToLetConst
  var MockIntlWrapper: typeof IntlWrapper;
}

global.mockFormatter = formatter;
global.MockIntlWrapper = IntlWrapper;

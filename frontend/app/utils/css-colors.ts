import convert from "color-convert";

export const ERROR_FALLBACK_COLOR = "fuchsia";

export const cssVar = (name: string) => {
  return getComputedStyle(document.documentElement).getPropertyValue(name);
};

const hslExpression = /(\d+(\.\d+)?) (\d+(\.\d+)?)% (\d+(\.\d+)?)%/;

export const hexColor = (name: string) => {
  const hsl = cssVar(name);

  const parsed = hslExpression.exec(hsl);

  return parsed
    ? `#${convert.hsl.hex(
        parseFloat(parsed[1]),
        parseFloat(parsed[3]),
        parseFloat(parsed[5]),
      )}`
    : "pink";
};

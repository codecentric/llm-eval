import { Slider } from "@heroui/react";
import { cx } from "classix";
import { useTranslations } from "next-intl";
import React from "react";

export type IntervalSliderProps = {
  isDisabled?: boolean;
  value: number;
  onChange?: (value: number) => void;
  dense?: boolean;
  className?: string;
};

export const IntervalSlider: React.FC<IntervalSliderProps> = ({
  value,
  isDisabled,
  onChange,
  dense,
  className,
}) => {
  const t = useTranslations();

  return (
    <div
      className={cx(
        "w-96 self-center p-4 border-1 rounded-medium border-divider",
        className,
      )}
    >
      <Slider
        aria-label={t("ScoreDistributionPanel.distribution.interval")}
        isDisabled={isDisabled}
        label={
          dense ? undefined : t("ScoreDistributionPanel.distribution.interval")
        }
        size="sm"
        value={value}
        maxValue={0.5}
        minValue={0.05}
        step={0.01}
        onChange={(value) =>
          !Array.isArray(value) ? onChange?.(value) : undefined
        }
        marks={[
          {
            value: 0.05,
            label: "0.05",
          },
          {
            value: 0.1,
            label: "0.1",
          },
          {
            value: 0.2,
            label: "0.2",
          },
          {
            value: 0.3,
            label: "0.3",
          },
          {
            value: 0.4,
            label: "0.4",
          },
          {
            value: 0.5,
            label: "0.5",
          },
        ]}
      />
    </div>
  );
};

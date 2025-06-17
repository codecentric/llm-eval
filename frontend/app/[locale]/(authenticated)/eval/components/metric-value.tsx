import { useFormatter } from "next-intl";

export type MetricValueProps = {
  value: number;
  className?: string;
};

export const MetricValue = ({ value, className }: MetricValueProps) => {
  const formatter = useFormatter();

  return (
    <span className={className}>
      {formatter.number(value, {
        maximumFractionDigits: 3,
        minimumFractionDigits: 3,
      })}
    </span>
  );
};

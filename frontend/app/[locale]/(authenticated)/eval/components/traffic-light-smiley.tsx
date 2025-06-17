import { cx } from "classix";
import { PiSmiley, PiSmileyMeh, PiSmileySad } from "react-icons/pi";

export const enum TrafficLightSmileyStatus {
  GREEN = "GREEN",
  YELLOW = "YELLOW",
  RED = "RED",
}

export type StatusSmileyProps = {
  status: TrafficLightSmileyStatus;
  size?: number;
  className?: string;
};

export const TrafficLightSmiley = ({
  status,
  size,
  className,
}: StatusSmileyProps) => {
  if (status === TrafficLightSmileyStatus.GREEN) {
    return <PiSmiley size={size} className={cx("text-success", className)} />;
  } else if (status === TrafficLightSmileyStatus.YELLOW) {
    return (
      <PiSmileyMeh size={size} className={cx("text-warning", className)} />
    );
  } else if (status === TrafficLightSmileyStatus.RED) {
    return <PiSmileySad size={size} className={cx("text-danger", className)} />;
  }
};

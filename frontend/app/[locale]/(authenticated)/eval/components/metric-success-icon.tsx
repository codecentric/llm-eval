import { MdCheck, MdClear } from "react-icons/md";

import type { IconType } from "react-icons";

export type MetricSuccessIconProps = {
  success?: boolean | null;
  className?: string;
  size?: string | number;
  nullIcon?: IconType;
};

export const MetricSuccessIcon = ({
  success,
  className,
  size = 20,
  nullIcon: NullIcon,
}: MetricSuccessIconProps) => {
  return success == undefined ? (
    NullIcon ? (
      <div className={className} data-testid="null-icon">
        <NullIcon size={size} />
      </div>
    ) : null
  ) : (
    <div
      className={className}
      data-testid={success ? "success-icon" : "failure-icon"}
    >
      {success ? (
        <MdCheck size={size} className="text-success" />
      ) : (
        <MdClear size={size} className="text-danger" />
      )}
    </div>
  );
};

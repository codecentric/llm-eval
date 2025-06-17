import { MdCheckCircleOutline, MdOutlineCancel } from "react-icons/md";

export type SuccessStatusIconProps = {
  success?: boolean;
};

export const SuccessStatusIcon = ({ success }: SuccessStatusIconProps) => {
  return success ? (
    <MdCheckCircleOutline className="w-4 h-4 text-success" />
  ) : (
    <MdOutlineCancel className="w-4 h-4 text-danger" />
  );
};

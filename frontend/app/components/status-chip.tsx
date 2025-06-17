import { Chip, ChipProps, Spinner } from "@heroui/react";
import { PropsWithChildren } from "react";

export type StatusChipProps = PropsWithChildren<
  Pick<ChipProps, "color" | "size" | "endContent"> & { showSpinner?: boolean }
>;

export const StatusChip = ({
  children,
  color,
  size = "sm",
  showSpinner,
  endContent,
}: StatusChipProps) => {
  const sizeClass =
    size === "sm" ? "!size-4" : size === "lg" ? "!size-6" : "!size-5";

  return (
    <Chip
      color={color}
      size={size}
      variant="bordered"
      startContent={
        showSpinner ? (
          <Spinner
            className="mr-1"
            classNames={{ wrapper: sizeClass }}
            color="secondary"
            data-testid="spinner"
          />
        ) : null
      }
      endContent={endContent}
      data-testid="status-chip"
    >
      {children}
    </Chip>
  );
};

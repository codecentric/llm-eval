import { Spinner } from "@heroui/react";
import { Ref } from "react";

export type TableLoadMoreSpinnerProps = {
  loaderRef: Ref<HTMLElement>;
  show?: boolean;
};

export const TableLoadMoreSpinner = ({
  show,
  loaderRef,
}: TableLoadMoreSpinnerProps) => {
  return show ? (
    <div className="flex w-full justify-center" data-testid="spinner">
      <Spinner ref={loaderRef} color="secondary" />
    </div>
  ) : null;
};

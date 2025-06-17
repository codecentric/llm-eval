import { useTranslations } from "next-intl";

import { TestCaseStatus } from "@/app/client";
import { StatusChip, StatusChipProps } from "@/app/components/status-chip";

export type TestCaseStatusChipProps = { status: TestCaseStatus } & Pick<
  StatusChipProps,
  "size"
>;

export const TestCaseStatusChip = ({
  size,
  status,
}: TestCaseStatusChipProps) => {
  const t = useTranslations();

  const statusProps: StatusChipProps = {
    size,
  };

  switch (status) {
    case TestCaseStatus.PENDING:
      statusProps.color = "secondary";
      break;
    case TestCaseStatus.RETRIEVING_ANSWER:
    case TestCaseStatus.EVALUATING:
      statusProps.color = "secondary";
      statusProps.showSpinner = true;
      break;
    case TestCaseStatus.SUCCESS:
      statusProps.color = "success";
      break;
    case TestCaseStatus.FAILURE:
      statusProps.color = "danger";
      break;
  }

  return (
    <StatusChip {...statusProps}>{t(`testCaseStatus.${status}`)}</StatusChip>
  );
};

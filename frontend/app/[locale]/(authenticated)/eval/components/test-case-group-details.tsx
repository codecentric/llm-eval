import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableProps,
  TableRow,
} from "@heroui/react";
import { useTranslations } from "next-intl";
import React, { useMemo } from "react";
import { MdRemoveRedEye } from "react-icons/md";

import { TableRowActions } from "@/app/[locale]/(authenticated)/components/table-row-actions";
import { TestCaseStatusChip } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/results/[evaluationResultId]/components/test-case-status-chip";
import { executionEvaluationResultPage } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/results/[evaluationResultId]/page-info";
import {
  GroupedEvaluationTestCase,
  GroupedEvaluationTestCaseResult,
} from "@/app/client";
import { NavigationLink } from "@/app/components/navigation-link";

import { MetricSuccessIcon } from "./metric-success-icon";
import { MetricValue } from "./metric-value";

const MetricCell: React.FC<{ result?: GroupedEvaluationTestCaseResult }> = ({
  result,
}) => {
  return result ? (
    <div className="flex items-center gap-2">
      <MetricSuccessIcon success={result.success} />
      {result.score != null ? (
        <div className="flex items-center gap-1">
          <MetricValue value={result.score} />
          {result.threashold ? `(${result.threashold})` : null}
        </div>
      ) : null}
    </div>
  ) : null;
};

export type TestCaseGroupDetailsProps = {
  evaluationId: string;
  testCases: GroupedEvaluationTestCase[];
  metrics: { id: string; name: string }[];
};

export const TestCaseGroupDetails: React.FC<TestCaseGroupDetailsProps> = ({
  evaluationId,
  testCases,
  metrics,
}) => {
  const t = useTranslations();

  const classNames = useMemo<TableProps["classNames"]>(
    () => ({
      wrapper: [
        "border",
        "border-divider",
        "rounded-medium",
        "shadow-none",
        "p-0",
      ],
      th: ["bg-transparent", "border-b", "border-divider"],
    }),
    [],
  );

  return (
    <Table
      aria-label={t("TestCaseGroupDetails.table.label")}
      classNames={classNames}
    >
      <TableHeader>
        {[
          <TableColumn key="index" className="w-8">
            #
          </TableColumn>,
          <TableColumn key="status" className="w-8">
            Status
          </TableColumn>,
          ...metrics.map((metric) => (
            <TableColumn key={metric.id} className="w-0 lg:w-72">
              {metric.name}
            </TableColumn>
          )),
          <TableColumn key="actions"> </TableColumn>,
        ]}
      </TableHeader>
      <TableBody>
        {testCases.map((testCase) => (
          <TableRow key={testCase.id} className="content-table-row">
            {[
              <TableCell key="index">
                <NavigationLink
                  href={
                    executionEvaluationResultPage(evaluationId, testCase.id)
                      .href
                  }
                >
                  {testCase.index + 1}
                </NavigationLink>
              </TableCell>,
              <TableCell key="status">
                <TestCaseStatusChip status={testCase.testCaseStatus} />
              </TableCell>,
              ...metrics.map((metric) => (
                <TableCell key={metric.id}>
                  <MetricCell
                    result={testCase.results.find(
                      (result) => result.metricId === metric.id,
                    )}
                  />
                </TableCell>
              )),
              <TableCell key="actions">
                <TableRowActions
                  actions={[
                    {
                      icon: MdRemoveRedEye,
                      href: executionEvaluationResultPage(
                        evaluationId,
                        testCase.id,
                      ).href,
                      tooltip: t("TestCaseGroupDetails.actions.view"),
                    },
                  ]}
                />
              </TableCell>,
            ]}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

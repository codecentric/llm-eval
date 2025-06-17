import "@/app/test-utils/mock-toast";

import { addToast } from "@heroui/react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Metric, metricsDelete, metricsGetAll } from "@/app/client";
import { createPageWrapper } from "@/app/test-utils/page-wrapper";
import { successfulServiceResponse } from "@/app/test-utils/service-call";
import { EditOrigin } from "@/app/types/edit-origin";

import { metricEditPage } from "./[metricId]/edit/page-info";
import { metricDetailsPage } from "./[metricId]/page-info";
import { newMetricPage } from "./new/page-info";
import Page from "./page";

vi.mock("@/app/client");
const mockedMetricsGetAll = vi.mocked(metricsGetAll);
const mockedMetricsDelete = vi.mocked(metricsDelete);

describe("Metrics Page", () => {
  const metrics: Metric[] = [
    {
      id: "1",
      createdAt: "2021-01-01T00:00:00Z",
      updatedAt: "2021-01-01T00:00:00Z",
      version: 1,
      configuration: {
        type: "FAITHFULNESS",
        name: "Faithfulness",
        chatModelId: "1",
        threshold: 0.5,
        includeReason: true,
        strictMode: true,
      },
    },
    {
      id: "2",
      createdAt: "2021-01-01T00:00:00Z",
      updatedAt: "2021-01-01T00:00:00Z",
      version: 1,
      configuration: {
        type: "ANSWER_RELEVANCY",
        name: "Answer Relevancy",
        chatModelId: "1",
        threshold: 0.5,
        includeReason: true,
        strictMode: true,
      },
    },
  ];

  it("should render metrics", async () => {
    mockedMetricsGetAll.mockResolvedValue(successfulServiceResponse(metrics));

    const page = await Page();

    render(page, { wrapper: createPageWrapper() });

    const table = await screen.findByRole("grid");

    expect(table).toBeInTheDocument();

    const rows = screen.getAllByRole("row");

    expect(rows).toHaveLength(3);

    metrics.forEach((metric, index) => {
      const withinRow = within(rows[index + 1]);

      expect(
        withinRow.getByText(metric.configuration.name),
      ).toBeInTheDocument();
      expect(
        withinRow.getByRole("menuitem", {
          name: "EvaluationMetricsTable.actions.view",
        }),
      ).toHaveAttribute("href", metricDetailsPage(metric.id).href);
      expect(
        withinRow.getByRole("menuitem", {
          name: "EvaluationMetricsTable.actions.edit",
        }),
      ).toHaveAttribute(
        "href",
        metricEditPage({ metricId: metric.id, origin: EditOrigin.LIST }).href,
      );
      expect(
        withinRow.getByRole("menuitem", {
          name: "EvaluationMetricsTable.actions.delete",
        }),
      ).toBeInTheDocument();
    });
  });

  it("shound have create new metric button", async () => {
    mockedMetricsGetAll.mockResolvedValue(successfulServiceResponse([]));

    const page = await Page();

    render(page, { wrapper: createPageWrapper() });

    expect(
      screen.getByRole("button", { name: "MetricsPage.new" }),
    ).toHaveAttribute("href", newMetricPage.href);
  });

  it("should delete a metric", async () => {
    const user = userEvent.setup();

    mockedMetricsGetAll.mockResolvedValue(successfulServiceResponse(metrics));
    mockedMetricsDelete.mockResolvedValue(successfulServiceResponse(undefined));

    const page = await Page();

    render(page, { wrapper: createPageWrapper() });

    const deleteButton = (
      await screen.findAllByRole("menuitem", {
        name: "EvaluationMetricsTable.actions.delete",
      })
    )[0];

    await user.click(deleteButton);

    const confirmDeleteButton = await screen.findByRole("button", {
      name: "useMetricDelete.deleteDialog.okButton",
    });

    await user.click(confirmDeleteButton);

    await waitFor(() => {
      expect(metricsDelete).toHaveBeenCalledWith(
        expect.objectContaining({
          body: { version: metrics[0].version },
          path: {
            metric_id: metrics[0].id,
          },
        }),
      );
    });

    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith({
        title: "useMetricDelete.delete.success",
        color: "success",
      });
    });
  });
});

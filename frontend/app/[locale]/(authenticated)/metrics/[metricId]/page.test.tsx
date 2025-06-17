import "@/app/test-utils/mock-router";
import "@/app/test-utils/mock-toast";

import { addToast } from "@heroui/react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { llmEndpointDetailsPage } from "@/app/[locale]/(authenticated)/llm-endpoints/[endpointId]/page-info";
import { metricsPage } from "@/app/[locale]/(authenticated)/metrics/page-info";
import {
  LlmEndpoint,
  llmEndpointsGet,
  Metric,
  metricsDelete,
  metricsGet,
} from "@/app/client";
import { expectValue } from "@/app/test-utils/details-page";
import { createPageWrapper } from "@/app/test-utils/page-wrapper";
import { successfulServiceResponse } from "@/app/test-utils/service-call";

import { metricEditPage } from "./edit/page-info";
import Page from "./page";

vi.mock("@/app/client");
const mockedMetricsGet = vi.mocked(metricsGet);
const mockedLlmEndpointsGet = vi.mocked(llmEndpointsGet);
const mockedMetricsDelete = vi.mocked(metricsDelete);

describe("Metric Details Page", () => {
  const metric: Metric = {
    id: "1",
    createdAt: "2021-01-01T00:00:00Z",
    updatedAt: "2021-01-01T01:00:00Z",
    version: 1,
    configuration: {
      type: "FAITHFULNESS",
      name: "Faithfulness",
      chatModelId: "1",
      threshold: 0.5,
      includeReason: true,
      strictMode: true,
    },
  };

  const endpoint: LlmEndpoint = {
    id: "1",
    createdAt: "2021-01-01T00:00:00Z",
    updatedAt: "2021-01-01T00:00:00Z",
    version: 1,
    name: "My Endpoint",
    supportedFeatures: [],
    metrics: [],
    configuration: { type: "OPENAI" },
  } as unknown as LlmEndpoint;

  it("should render metric details", async () => {
    mockedMetricsGet.mockResolvedValue(successfulServiceResponse(metric));
    mockedLlmEndpointsGet.mockResolvedValue(
      successfulServiceResponse(endpoint),
    );

    const page = await Page({
      params: Promise.resolve({ metricId: metric.id }),
    });

    render(page, { wrapper: createPageWrapper() });

    await expectValue(
      "MetricDetails.labels.type",
      `metricType.${metric.configuration.type}`,
    );
    await expectValue("MetricDetails.labels.createdAt", metric.createdAt);
    await expectValue("MetricDetails.labels.updatedAt", metric.updatedAt);
    await expectValue(
      "MetricDetails.labels.threshold",
      metric.configuration.threshold.toString(),
    );
    await expectValue("MetricDetails.labels.strictMode", "YesNo.yes");
    await expectValue("MetricDetails.labels.includeReason", "YesNo.yes");
    await expectValue("MetricDetails.labels.chatModel", endpoint.name);

    const llmLink = screen.getByRole("link", { name: endpoint.name });
    expect(llmLink).toHaveAttribute(
      "href",
      llmEndpointDetailsPage(endpoint.id).href,
    );

    expect(metricsGet).toHaveBeenCalledWith(
      expect.objectContaining({ path: { metric_id: metric.id } }),
    );
  });

  it("should delete the metric", async () => {
    const user = userEvent.setup();

    mockedMetricsGet.mockResolvedValue(successfulServiceResponse(metric));
    mockedMetricsDelete.mockResolvedValue(successfulServiceResponse(undefined));

    const page = await Page({
      params: Promise.resolve({ metricId: metric.id }),
    });

    render(page, { wrapper: createPageWrapper() });

    // wait for data to be loaded and rendered
    await screen.findByText("MetricDetails.labels.type");

    const deleteButton = await screen.findByRole("button", {
      name: "DetailsPage.delete",
    });

    await user.click(deleteButton);

    const confirmDeleteButton = await screen.findByRole("button", {
      name: "useMetricDelete.deleteDialog.okButton",
    });

    await user.click(confirmDeleteButton);

    await waitFor(() =>
      expect(metricsDelete).toHaveBeenCalledWith(
        expect.objectContaining({
          body: { version: metric.version },
          path: {
            metric_id: metric.id,
          },
        }),
      ),
    );

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({
        title: "useMetricDelete.delete.success",
        color: "success",
      }),
    );

    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith(metricsPage.href),
    );
  });

  it("should go to edit page on button click", async () => {
    mockedMetricsGet.mockResolvedValue(successfulServiceResponse(metric));

    const page = await Page({
      params: Promise.resolve({ metricId: metric.id }),
    });

    render(page, { wrapper: createPageWrapper() });

    // wait for data to be loaded and rendered
    await screen.findByText("MetricDetails.labels.type");

    const editButton = await screen.findByRole("button", {
      name: "DetailsPage.edit",
    });

    expect(editButton).toHaveAttribute(
      "href",
      metricEditPage({ metricId: metric.id }).href,
    );
  });
});

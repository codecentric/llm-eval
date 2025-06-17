import "@/app/test-utils/mock-intl";
import "@/app/test-utils/mock-router";
import "@/app/test-utils/mock-toast";

import { addToast } from "@heroui/react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { llmEndpointsPage } from "@/app/[locale]/(authenticated)/llm-endpoints/page-info";
import {
  Language,
  LlmEndpoint,
  LlmEndpointConfigurationRead,
  llmEndpointsDelete,
  llmEndpointsGet,
  PluginFeature,
} from "@/app/client";
import { expectValue } from "@/app/test-utils/details-page";
import { createPageWrapper } from "@/app/test-utils/page-wrapper";
import { successfulServiceResponse } from "@/app/test-utils/service-call";

import { llmEndpointEditPage } from "./edit/page-info";
import Page from "./page";

vi.mock("@/app/client");
const mockedLlmEndpointsGet = vi.mocked(llmEndpointsGet);
const mockedLlmEndpointsDelete = vi.mocked(llmEndpointsDelete);

type TestCase = {
  endpoint: LlmEndpoint;
  expectConfiguration: () => Promise<void>;
};

describe("LLM Endpoint Details Page", () => {
  const createEndpoint = (
    name: string,
    supportedFeatures: PluginFeature[],
    configuration: LlmEndpointConfigurationRead,
  ): LlmEndpoint => ({
    id: "1",
    createdAt: "2021-01-01T00:00:00Z",
    updatedAt: "2021-01-02T00:00:00Z",
    version: 1,
    name,
    supportedFeatures,
    configuration,
  });

  const testEndpoint = createEndpoint("EP", [], {
    type: "C4",
    endpoint: "https://example.com",
    maxRetries: 3,
    parallelQueries: 5,
    requestTimeout: 1000,
    configurationId: 123,
  });

  const testCases: TestCase[] = [
    {
      endpoint: createEndpoint("C4", Object.values(PluginFeature), {
        type: "C4",
        endpoint: "https://example.com",
        maxRetries: 3,
        parallelQueries: 5,
        requestTimeout: 1000,
        configurationId: 123,
      }),
      expectConfiguration: async () => {
        await expectValue(
          "LlmEndpointDetails.labels.url",
          "https://example.com",
        );
        await expectValue("LlmEndpointDetails.labels.configurationId", "123");
      },
    },
    {
      endpoint: createEndpoint("OPENAI", Object.values(PluginFeature), {
        type: "OPENAI",
        baseUrl: "https://example.com",
        maxRetries: 3,
        parallelQueries: 5,
        requestTimeout: 1000,
        model: "model",
        language: Language.ENGLISH,
        temperature: 0.7,
      }),
      expectConfiguration: async () => {
        await expectValue(
          "LlmEndpointDetails.labels.baseUrl",
          "https://example.com",
        );
        await expectValue("LlmEndpointDetails.labels.model", "model");
        await expectValue("LlmEndpointDetails.labels.temperature", "0.7");
        await expectValue(
          "LlmEndpointDetails.labels.language",
          `EndpointConfigurationForm.field.language.values.${Language.ENGLISH}`,
        );
      },
    },
    {
      endpoint: createEndpoint("AZURE", Object.values(PluginFeature), {
        type: "AZURE_OPENAI",
        endpoint: "https://example.com",
        maxRetries: 3,
        parallelQueries: 5,
        requestTimeout: 1000,
        apiVersion: "apiVersion",
        deployment: "deployment",
        language: Language.ENGLISH,
      }),
      expectConfiguration: async () => {
        await expectValue(
          "LlmEndpointDetails.labels.url",
          "https://example.com",
        );
        await expectValue("LlmEndpointDetails.labels.deployment", "deployment");
        await expectValue("LlmEndpointDetails.labels.apiVersion", "apiVersion");
        await expectValue(
          "LlmEndpointDetails.labels.language",
          `EndpointConfigurationForm.field.language.values.${Language.ENGLISH}`,
        );
      },
    },
  ];

  it.each(testCases)(
    "should render endpoint details for type $endpoint.configuration.type",
    async ({ endpoint, expectConfiguration }) => {
      mockedLlmEndpointsGet.mockResolvedValue(
        successfulServiceResponse(endpoint),
      );

      const page = await createPage(endpoint.id);

      render(page, { wrapper: createPageWrapper() });

      await expectValue(
        "LlmEndpointDetails.labels.type",
        `llmEndpointType.${endpoint.configuration.type}`,
      );
      await expectValue(
        "LlmEndpointDetails.labels.createdAt",
        endpoint.createdAt,
      );
      await expectValue(
        "LlmEndpointDetails.labels.updatedAt",
        endpoint.updatedAt,
      );

      for (const feature of endpoint.supportedFeatures) {
        await expectValue(
          "LlmEndpointDetails.labels.features",
          `llmEndpointFeature.${feature}`,
        );
      }

      await expectValue(
        "LlmEndpointDetails.labels.parallelQueries",
        endpoint.configuration.parallelQueries.toString(),
      );
      await expectValue(
        "LlmEndpointDetails.labels.maxRetries",
        endpoint.configuration.maxRetries.toString(),
      );
      await expectValue(
        "LlmEndpointDetails.labels.requestTimeout",
        `duration.seconds - {"value":${endpoint.configuration.requestTimeout}}`,
      );

      await expectConfiguration();
    },
  );

  it("should delete the endpoint", async () => {
    const user = userEvent.setup();

    mockedLlmEndpointsGet.mockResolvedValue(
      successfulServiceResponse(testEndpoint),
    );
    mockedLlmEndpointsDelete.mockResolvedValue(
      successfulServiceResponse(undefined),
    );

    const page = await createPage(testEndpoint.id);

    render(page, { wrapper: createPageWrapper() });

    // wait for data to be loaded and rendered
    await screen.findByText("LlmEndpointDetails.labels.type");

    const deleteButton = await screen.findByRole("button", {
      name: "DetailsPage.delete",
    });

    await user.click(deleteButton);

    const confirmDeleteButton = await screen.findByRole("button", {
      name: "useEndpointDelete.deleteDialog.okButton",
    });

    await user.click(confirmDeleteButton);

    await waitFor(() =>
      expect(llmEndpointsDelete).toHaveBeenCalledWith(
        expect.objectContaining({
          body: { version: testEndpoint.version },
          path: {
            llm_endpoint_id: testEndpoint.id,
          },
        }),
      ),
    );

    await waitFor(() =>
      expect(addToast).toHaveBeenCalledWith({
        title: "useEndpointDelete.delete.success",
        color: "success",
      }),
    );

    await waitFor(() =>
      expect(mockRouter.replace).toHaveBeenCalledWith(llmEndpointsPage.href),
    );
  });

  it("should go to edit page on button click", async () => {
    mockedLlmEndpointsGet.mockResolvedValue(
      successfulServiceResponse(testEndpoint),
    );

    const page = await createPage(testEndpoint.id);

    render(page, { wrapper: createPageWrapper() });

    // wait for data to be loaded and rendered
    await screen.findByText("LlmEndpointDetails.labels.type");

    const editButton = await screen.findByRole("button", {
      name: "DetailsPage.edit",
    });

    expect(editButton).toHaveAttribute(
      "href",
      llmEndpointEditPage({ endpointId: testEndpoint.id }).href,
    );
  });

  const createPage = (endpointId: string) =>
    Page({
      params: Promise.resolve({ endpointId: endpointId }),
    });
});

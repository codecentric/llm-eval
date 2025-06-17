import "@/app/test-utils/mock-intl";
import "@/app/test-utils/mock-router";
import "@/app/test-utils/mock-toast";

import { addToast } from "@heroui/react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";

import { llmEndpointDetailsPage } from "@/app/[locale]/(authenticated)/llm-endpoints/[endpointId]/page-info";
import { UNCHANGED_API_KEY } from "@/app/[locale]/(authenticated)/llm-endpoints/components/llm-endpoint-form-wizard";
import { llmEndpointsPage } from "@/app/[locale]/(authenticated)/llm-endpoints/page-info";
import {
  Language,
  LlmEndpoint,
  LlmEndpointConfigurationRead,
  LlmEndpointConfigurationUpdate,
  llmEndpointsGet,
  llmEndpointsGetTypes,
  llmEndpointsPatch,
  PluginFeature,
} from "@/app/client";
import {
  expectDropDownError,
  expectDropDownValue,
  expectInputError,
  expectInputValue,
  formWizardClickBack,
  formWizardClickCancel,
  formWizardClickNext,
  getDropDownBase,
  getInputBase,
  selectFromDropDown,
  setInputValue,
} from "@/app/test-utils/forms";
import { createPageWrapper } from "@/app/test-utils/page-wrapper";
import { successfulServiceResponse } from "@/app/test-utils/service-call";
import { waitForPageRender } from "@/app/test-utils/wait-for-page";
import { EditOrigin } from "@/app/types/edit-origin";

import Page from "./page";
import { llmEndpointEditPage } from "./page-info";

vi.mock("@/app/client");

type EndpointData<Config> = {
  name: string;
  configuration: Config;
};

type TestCase = {
  existingData: EndpointData<LlmEndpointConfigurationRead>;
  updateData: EndpointData<LlmEndpointConfigurationUpdate>;
  updatedData: EndpointData<LlmEndpointConfigurationRead>;
  expectConfiguration: () => Promise<void>;
  fillConfiguration: (user: UserEvent) => Promise<void>;
  clearConfiguration?: (user: UserEvent) => Promise<void>;
  expectErrors?: () => Promise<void>;
};

describe("Edit LLM Endpoint Page", () => {
  const endpointId = "1";

  const testData: EndpointData<LlmEndpointConfigurationRead> = {
    name: "Test",
    configuration: {
      type: "C4",
      endpoint: "https://example.com",
      maxRetries: 3,
      requestTimeout: 100,
      parallelQueries: 5,
      configurationId: 123,
    },
  };

  const createEndpoint = (
    data: EndpointData<LlmEndpointConfigurationRead>,
  ): LlmEndpoint => ({
    id: endpointId,
    createdAt: "2021-01-01T00:00:00Z",
    updatedAt: "2021-01-01T00:00:00Z",
    version: 1,
    name: data.name,
    configuration: data.configuration,
    supportedFeatures: Object.values(PluginFeature),
  });

  const testCases: TestCase[] = [
    {
      existingData: {
        name: "C4",
        configuration: {
          type: "C4",
          endpoint: "https://example.com",
          maxRetries: 3,
          requestTimeout: 100,
          parallelQueries: 5,
          configurationId: 123,
        },
      },
      updateData: {
        name: "C4 updated",
        configuration: {
          type: "C4",
          endpoint: "https://example.com/123",
          maxRetries: 30,
          requestTimeout: 1000,
          parallelQueries: 50,
          configurationId: 1230,
          apiKey: "newApiKey",
        },
      },
      updatedData: {
        name: "C4 updated",
        configuration: {
          type: "C4",
          endpoint: "https://example.com/123",
          maxRetries: 30,
          requestTimeout: 1000,
          parallelQueries: 50,
          configurationId: 1230,
        },
      },
      expectConfiguration: async () => {
        await expectInputValue(
          "EndpointConfigurationForm.field.name.label",
          "C4",
        );
        await expectInputValue(
          "EndpointConfigurationForm.field.parallelQueries.label",
          "5",
        );
        await expectInputValue(
          "EndpointConfigurationForm.field.maxRetries.label",
          "3",
        );
        await expectInputValue(
          "EndpointConfigurationForm.field.requestTimeout.label",
          "100",
        );

        await expectInputValue(
          "EndpointConfigurationForm.field.endpoint.label",
          "https://example.com",
        );
        await expectInputValue(
          "EndpointConfigurationForm.field.apiKey.label",
          UNCHANGED_API_KEY,
        );
        await expectInputValue(
          "EndpointConfigurationForm.field.configurationId.label",
          "123",
        );
      },
      fillConfiguration: async (user: UserEvent) => {
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.name.label",
          "C4 updated",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.parallelQueries.label",
          "50",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.maxRetries.label",
          "30",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.requestTimeout.label",
          "1000",
        );

        await setInputValue(
          user,
          "EndpointConfigurationForm.field.endpoint.label",
          "https://example.com/123",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.apiKey.label",
          "newApiKey",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.configurationId.label",
          "1230",
        );
      },
      clearConfiguration: async (user: UserEvent) => {
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.name.label",
          "",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.parallelQueries.label",
          "",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.maxRetries.label",
          "",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.requestTimeout.label",
          "",
        );

        await setInputValue(
          user,
          "EndpointConfigurationForm.field.endpoint.label",
          "",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.apiKey.label",
          "",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.configurationId.label",
          "",
        );
      },
      expectErrors: async () => {
        await expectInputError(
          "EndpointConfigurationForm.field.name.label",
          "formError.required",
        );
        await expectInputError(
          "EndpointConfigurationForm.field.parallelQueries.label",
          "formError.required",
        );
        await expectInputError(
          "EndpointConfigurationForm.field.maxRetries.label",
          "formError.required",
        );
        await expectInputError(
          "EndpointConfigurationForm.field.requestTimeout.label",
          "formError.required",
        );

        await expectInputError(
          "EndpointConfigurationForm.field.endpoint.label",
          "formError.required",
        );
        await expectInputError(
          "EndpointConfigurationForm.field.apiKey.label",
          "formError.required",
        );
        await expectInputError(
          "EndpointConfigurationForm.field.configurationId.label",
          "formError.required",
        );
      },
    },
    {
      existingData: {
        name: "OPENAI",
        configuration: {
          type: "OPENAI",
          baseUrl: "https://example.com",
          model: "model",
          language: Language.ENGLISH,
          temperature: 0.7,
          maxRetries: 3,
          requestTimeout: 100,
          parallelQueries: 5,
        },
      },
      updateData: {
        name: "OPENAI updated",
        configuration: {
          type: "OPENAI",
          baseUrl: "https://example.com/123",
          model: "newModel",
          language: Language.GERMAN,
          temperature: 0.5,
          maxRetries: 30,
          requestTimeout: 1000,
          parallelQueries: 50,
          apiKey: "newApiKey",
        },
      },
      updatedData: {
        name: "OPENAI updated",
        configuration: {
          type: "OPENAI",
          baseUrl: "https://example.com/123",
          model: "newModel",
          language: Language.GERMAN,
          temperature: 0.5,
          maxRetries: 30,
          requestTimeout: 1000,
          parallelQueries: 50,
        },
      },
      expectConfiguration: async () => {
        await expectInputValue(
          "EndpointConfigurationForm.field.name.label",
          "OPENAI",
        );
        await expectInputValue(
          "EndpointConfigurationForm.field.parallelQueries.label",
          "5",
        );
        await expectInputValue(
          "EndpointConfigurationForm.field.maxRetries.label",
          "3",
        );
        await expectInputValue(
          "EndpointConfigurationForm.field.requestTimeout.label",
          "100",
        );

        await expectInputValue(
          "OpenAiConfigurationForm.field.baseUrl.label",
          "https://example.com",
        );
        await expectInputValue(
          "OpenAiConfigurationForm.field.apiKey.label",
          UNCHANGED_API_KEY,
        );
        await expectInputValue(
          "OpenAiConfigurationForm.field.model.label",
          "model",
        );
        await expectInputValue(
          "OpenAiConfigurationForm.field.temperature.label",
          "0.7",
        );

        await expectDropDownValue(
          "EndpointConfigurationForm.field.language.label",
          `EndpointConfigurationForm.field.language.values.${Language.ENGLISH}`,
        );
      },
      fillConfiguration: async (user: UserEvent) => {
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.name.label",
          "OPENAI updated",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.parallelQueries.label",
          "50",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.maxRetries.label",
          "30",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.requestTimeout.label",
          "1000",
        );

        await setInputValue(
          user,
          "OpenAiConfigurationForm.field.baseUrl.label",
          "https://example.com/123",
        );
        await setInputValue(
          user,
          "OpenAiConfigurationForm.field.apiKey.label",
          "newApiKey",
        );
        await setInputValue(
          user,
          "OpenAiConfigurationForm.field.model.label",
          "newModel",
        );
        await setInputValue(
          user,
          "OpenAiConfigurationForm.field.temperature.label",
          "0.5",
        );

        await selectFromDropDown(
          user,
          "EndpointConfigurationForm.field.language.label",
          `EndpointConfigurationForm.field.language.values.${Language.GERMAN}`,
        );
      },
      clearConfiguration: async (user: UserEvent) => {
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.name.label",
          "",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.parallelQueries.label",
          "",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.maxRetries.label",
          "",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.requestTimeout.label",
          "",
        );

        await setInputValue(
          user,
          "OpenAiConfigurationForm.field.baseUrl.label",
          "",
        );
        await setInputValue(
          user,
          "OpenAiConfigurationForm.field.apiKey.label",
          "",
        );
        await setInputValue(
          user,
          "OpenAiConfigurationForm.field.model.label",
          "",
        );
        await setInputValue(
          user,
          "OpenAiConfigurationForm.field.temperature.label",
          "",
        );

        await selectFromDropDown(
          user,
          "EndpointConfigurationForm.field.language.label",
          `EndpointConfigurationForm.field.language.values.${Language.ENGLISH}`,
        );
      },
      expectErrors: async () => {
        await expectInputError(
          "EndpointConfigurationForm.field.name.label",
          "formError.required",
        );
        await expectInputError(
          "EndpointConfigurationForm.field.parallelQueries.label",
          "formError.required",
        );
        await expectInputError(
          "EndpointConfigurationForm.field.maxRetries.label",
          "formError.required",
        );
        await expectInputError(
          "EndpointConfigurationForm.field.requestTimeout.label",
          "formError.required",
        );

        await expectInputError(
          "OpenAiConfigurationForm.field.apiKey.label",
          "formError.required",
        );
        await expectInputError(
          "OpenAiConfigurationForm.field.model.label",
          "formError.required",
        );
      },
    },
    {
      existingData: {
        name: "AZURE_OPENAI",
        configuration: {
          type: "AZURE_OPENAI",
          endpoint: "https://example.com",
          apiVersion: "apiVersion",
          deployment: "deployment",
          language: Language.ENGLISH,
          maxRetries: 3,
          requestTimeout: 100,
          parallelQueries: 5,
        },
      },
      updateData: {
        name: "AZURE_OPENAI updated",
        configuration: {
          type: "AZURE_OPENAI",
          endpoint: "https://example.com/123",
          apiVersion: "newApiVersion",
          deployment: "newDeployment",
          language: Language.GERMAN,
          maxRetries: 30,
          requestTimeout: 1000,
          parallelQueries: 50,
          apiKey: "newApiKey",
        },
      },
      updatedData: {
        name: "AZURE_OPENAI updated",
        configuration: {
          type: "AZURE_OPENAI",
          endpoint: "https://example.com/123",
          apiVersion: "newApiVersion",
          deployment: "newDeployment",
          language: Language.GERMAN,
          maxRetries: 30,
          requestTimeout: 1000,
          parallelQueries: 50,
        },
      },
      expectConfiguration: async () => {
        await expectInputValue(
          "EndpointConfigurationForm.field.name.label",
          "AZURE_OPENAI",
        );
        await expectInputValue(
          "EndpointConfigurationForm.field.parallelQueries.label",
          "5",
        );
        await expectInputValue(
          "EndpointConfigurationForm.field.maxRetries.label",
          "3",
        );
        await expectInputValue(
          "EndpointConfigurationForm.field.requestTimeout.label",
          "100",
        );

        await expectInputValue(
          "EndpointConfigurationForm.field.endpoint.label",
          "https://example.com",
        );
        await expectInputValue(
          "EndpointConfigurationForm.field.apiKey.label",
          UNCHANGED_API_KEY,
        );
        await expectInputValue(
          "EndpointConfigurationForm.field.apiVersion.label",
          "apiVersion",
        );
        await expectInputValue(
          "EndpointConfigurationForm.field.deployment.label",
          "deployment",
        );

        await expectDropDownValue(
          "EndpointConfigurationForm.field.language.label",
          `EndpointConfigurationForm.field.language.values.${Language.ENGLISH}`,
        );
      },
      fillConfiguration: async (user: UserEvent) => {
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.name.label",
          "AZURE_OPENAI updated",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.parallelQueries.label",
          "50",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.maxRetries.label",
          "30",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.requestTimeout.label",
          "1000",
        );

        await setInputValue(
          user,
          "EndpointConfigurationForm.field.endpoint.label",
          "https://example.com/123",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.apiKey.label",
          "newApiKey",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.apiVersion.label",
          "newApiVersion",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.deployment.label",
          "newDeployment",
        );

        await selectFromDropDown(
          user,
          "EndpointConfigurationForm.field.language.label",
          `EndpointConfigurationForm.field.language.values.${Language.GERMAN}`,
        );
      },
      clearConfiguration: async (user: UserEvent) => {
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.name.label",
          "",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.parallelQueries.label",
          "",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.maxRetries.label",
          "",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.requestTimeout.label",
          "",
        );

        await setInputValue(
          user,
          "EndpointConfigurationForm.field.endpoint.label",
          "",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.apiKey.label",
          "",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.apiVersion.label",
          "",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.deployment.label",
          "",
        );

        await selectFromDropDown(
          user,
          "EndpointConfigurationForm.field.language.label",
          `EndpointConfigurationForm.field.language.values.${Language.ENGLISH}`,
        );
      },
      expectErrors: async () => {
        await expectInputError(
          "EndpointConfigurationForm.field.name.label",
          "formError.required",
        );
        await expectInputError(
          "EndpointConfigurationForm.field.parallelQueries.label",
          "formError.required",
        );
        await expectInputError(
          "EndpointConfigurationForm.field.maxRetries.label",
          "formError.required",
        );
        await expectInputError(
          "EndpointConfigurationForm.field.requestTimeout.label",
          "formError.required",
        );

        await expectInputError(
          "EndpointConfigurationForm.field.endpoint.label",
          "formError.required",
        );
        await expectInputError(
          "EndpointConfigurationForm.field.apiKey.label",
          "formError.required",
        );
        await expectInputError(
          "EndpointConfigurationForm.field.apiVersion.label",
          "formError.required",
        );
        await expectInputError(
          "EndpointConfigurationForm.field.deployment.label",
          "formError.required",
        );
      },
    },
  ];

  beforeEach(() => {
    vi.mocked(llmEndpointsPatch).mockReset();
    vi.mocked(llmEndpointsGet).mockReset();
  });

  it.each(testCases)(
    "should save updated endpoint for type $configuration.type",
    async ({
      existingData,
      updateData,
      updatedData,
      expectConfiguration,
      fillConfiguration,
    }) => {
      const user = userEvent.setup();

      mockTypes();
      mockEndpointGet(existingData);
      mockEndpointUpdate(updatedData);

      const page = await createPage();

      render(page, { wrapper: createPageWrapper() });

      const dropDownButton = within(
        await getDropDownBase("EndpointTypeSelectionForm.select.label"),
      ).getByRole("button");

      expect(dropDownButton).toHaveTextContent(
        `llmEndpointType.${updateData.configuration.type}`,
      );

      await formWizardClickNext(user);

      await expectConfiguration();

      await fillConfiguration(user);

      await clickSubmitButton(user);

      await waitFor(() =>
        expect(llmEndpointsPatch).toHaveBeenCalledWith(
          expect.objectContaining({
            body: { ...updateData, version: 1 },
            path: { llm_endpoint_id: endpointId },
          }),
        ),
      );

      expect(addToast).toHaveBeenCalledWith({
        title: `LlmEndpointFormWizard.update.success - {"name":"${updateData.name}"}`,
        color: "success",
      });
      expect(mockRouter.push).toHaveBeenCalledWith(
        llmEndpointDetailsPage(endpointId).href,
      );
    },
  );

  it.each(testCases)(
    "should show configuration validation errors for type $configuration.type",
    async ({ existingData, clearConfiguration, expectErrors }) => {
      const user = userEvent.setup();

      mockTypes();
      mockEndpointGet(existingData);

      const page = await createPage();

      render(page, { wrapper: createPageWrapper() });

      await formWizardClickNext(user);

      if (clearConfiguration && expectErrors) {
        await clearConfiguration(user);

        await clickSubmitButton(user);

        await expectErrors();
      }
    },
  );

  it.each([
    { origin: EditOrigin.LIST, pageInfo: llmEndpointsPage },
    {
      origin: EditOrigin.DETAILS,
      pageInfo: llmEndpointDetailsPage(endpointId),
    },
  ])(
    "should return to $pageInfo.key on cancel click if origin is $origin",
    async ({ origin, pageInfo }) => {
      const user = userEvent.setup();

      mockTypes();
      mockEndpointGet(testData);

      const page = await createPage(origin);

      render(page, { wrapper: createPageWrapper() });

      await formWizardClickCancel(user);

      expect(mockRouter.push).toHaveBeenCalledWith(pageInfo.href);
    },
  );

  it("should show validation error when no type is selected", async () => {
    const user = userEvent.setup();

    mockTypes();
    mockEndpointGet(testData);

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await waitForPageRender(llmEndpointEditPage({ endpointId }));

    await selectFromDropDown(
      user,
      "EndpointTypeSelectionForm.select.label",
      `llmEndpointType.${testData.configuration.type}`,
    );

    await formWizardClickNext(user);

    await expectDropDownError(
      "EndpointTypeSelectionForm.select.label",
      "formError.required",
    );
  });

  it("should be able to go back from configuration page", async () => {
    const user = userEvent.setup();

    mockTypes();
    mockEndpointGet(testData);

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await formWizardClickNext(user);

    await formWizardClickBack(user);

    expect(
      await getDropDownBase("EndpointTypeSelectionForm.select.label"),
    ).toBeInTheDocument();
  });

  it("should go back after discarding changes", async () => {
    const user = userEvent.setup();

    mockTypes();
    mockEndpointGet(testData);

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await formWizardClickNext(user);

    await setInputValue(user, "EndpointConfigurationForm.field.name.label", "");

    await formWizardClickBack(user);

    await user.click(
      await screen.findByRole("button", {
        name: "FormWizard.discardDialog.discardButton",
      }),
    );

    expect(
      await getDropDownBase("EndpointTypeSelectionForm.select.label"),
    ).toBeInTheDocument();
  });

  it("should not go back after cancelling discard of changes", async () => {
    const user = userEvent.setup();

    mockTypes();
    mockEndpointGet(testData);

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await formWizardClickNext(user);

    await setInputValue(user, "EndpointConfigurationForm.field.name.label", "");

    await formWizardClickBack(user);

    await user.click(
      await screen.findByRole("button", { name: "ConfirmDialog.cancelButton" }),
    );

    expect(
      await getInputBase("EndpointConfigurationForm.field.name.label"),
    ).toBeInTheDocument();
  });

  it("should update without changing configuration", async () => {
    const user = userEvent.setup();

    mockTypes();
    mockEndpointGet(testData);
    mockEndpointUpdate(testData);

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await clickSubmitButton(user);

    await waitFor(() =>
      expect(llmEndpointsPatch).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            name: testData.name,
            configuration: {
              type: "C4",
              apiKey: null,
              configurationId: null,
              endpoint: null,
              maxRetries: null,
              parallelQueries: null,
              requestTimeout: null,
            },
            version: 1,
          },
          path: { llm_endpoint_id: endpointId },
        }),
      ),
    );

    expect(addToast).toHaveBeenCalledWith({
      title: `LlmEndpointFormWizard.update.success - {"name":"${testData.name}"}`,
      color: "success",
    });
    expect(mockRouter.push).toHaveBeenCalledWith(
      llmEndpointDetailsPage(endpointId).href,
    );
  });

  const mockTypes = () => {
    vi.mocked(llmEndpointsGetTypes).mockResolvedValue(
      successfulServiceResponse({
        types: ["C4", "AZURE_OPENAI", "OPENAI"].map((type) => ({
          name: type,
          supportedFeatures: Object.values(PluginFeature),
        })),
      }),
    );
  };

  const mockEndpointGet = (
    data: EndpointData<LlmEndpointConfigurationRead>,
  ) => {
    vi.mocked(llmEndpointsGet).mockResolvedValue(
      successfulServiceResponse(createEndpoint(data)),
    );
  };

  const mockEndpointUpdate = (
    data: EndpointData<LlmEndpointConfigurationRead>,
  ) => {
    vi.mocked(llmEndpointsPatch).mockResolvedValue(
      successfulServiceResponse(createEndpoint(data)),
    );
  };

  const clickSubmitButton = async (user: UserEvent) => {
    await user.click(
      await screen.findByRole("button", {
        name: "LLMEndpointForm.submitLabel.update",
      }),
    );
  };

  const createPage = async (origin = EditOrigin.LIST) =>
    Page({
      params: Promise.resolve({ endpointId, locale: "en" }),
      searchParams: Promise.resolve({ origin }),
    });
});

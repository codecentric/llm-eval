import "@/app/test-utils/mock-router";
import "@/app/test-utils/mock-toast";

import { addToast } from "@heroui/react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";

import { llmEndpointDetailsPage } from "@/app/[locale]/(authenticated)/llm-endpoints/[endpointId]/page-info";
import { llmEndpointsPage } from "@/app/[locale]/(authenticated)/llm-endpoints/page-info";
import {
  Language,
  LlmEndpointConfigurationCreate,
  llmEndpointsGetTypes,
  llmEndpointsPost,
  PluginFeature,
} from "@/app/client";
import {
  expectDropDownError,
  expectInputError,
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

import Page from "./page";

vi.mock("@/app/client");

type TestCase = {
  name: string;
  configuration: LlmEndpointConfigurationCreate;
  fillConfiguration: (user: UserEvent) => Promise<void>;
  clearConfiguration?: (user: UserEvent) => Promise<void>;
  expectErrors?: () => Promise<void>;
};

describe("New LLM Endpoint page", () => {
  const testCases: TestCase[] = [
    {
      name: "OpenAI Test",
      configuration: {
        type: "OPENAI",
        apiKey: "apiKey",
        model: "model",
        baseUrl: "https://example.com",
        language: Language.ENGLISH,
        maxRetries: 10,
        parallelQueries: 3,
        requestTimeout: 500,
        temperature: 0.8,
      },
      fillConfiguration: async (user: UserEvent) => {
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.name.label",
          "OpenAI Test",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.parallelQueries.label",
          "3",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.maxRetries.label",
          "10",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.requestTimeout.label",
          "500",
        );

        await setInputValue(
          user,
          "OpenAiConfigurationForm.field.baseUrl.label",
          "https://example.com",
        );
        await setInputValue(
          user,
          "OpenAiConfigurationForm.field.apiKey.label",
          "apiKey",
        );
        await setInputValue(
          user,
          "OpenAiConfigurationForm.field.model.label",
          "model",
        );
        await setInputValue(
          user,
          "OpenAiConfigurationForm.field.temperature.label",
          "0.8",
        );

        await selectFromDropDown(
          user,
          "EndpointConfigurationForm.field.language.label",
          `EndpointConfigurationForm.field.language.values.${Language.ENGLISH}`,
        );
      },
      clearConfiguration: async (user: UserEvent) => {
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
      name: "Azure OpenAI Test",
      configuration: {
        type: "AZURE_OPENAI",
        apiKey: "apiKey",
        apiVersion: "apiVersion",
        deployment: "deployment",
        endpoint: "https://example.com",
        language: Language.ENGLISH,
        maxRetries: 10,
        parallelQueries: 3,
        requestTimeout: 500,
      },
      fillConfiguration: async (user: UserEvent) => {
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.name.label",
          "Azure OpenAI Test",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.parallelQueries.label",
          "3",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.maxRetries.label",
          "10",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.requestTimeout.label",
          "500",
        );

        await setInputValue(
          user,
          "EndpointConfigurationForm.field.endpoint.label",
          "https://example.com",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.apiKey.label",
          "apiKey",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.apiVersion.label",
          "apiVersion",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.deployment.label",
          "deployment",
        );

        await selectFromDropDown(
          user,
          "EndpointConfigurationForm.field.language.label",
          `EndpointConfigurationForm.field.language.values.${Language.ENGLISH}`,
        );
      },
      clearConfiguration: async (user: UserEvent) => {
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
    {
      name: "C4 Test",
      configuration: {
        type: "C4",
        apiKey: "apiKey",
        endpoint: "https://example.com",
        configurationId: 123,
        maxRetries: 10,
        parallelQueries: 3,
        requestTimeout: 500,
      },
      fillConfiguration: async (user: UserEvent) => {
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.name.label",
          "C4 Test",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.parallelQueries.label",
          "3",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.maxRetries.label",
          "10",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.requestTimeout.label",
          "500",
        );

        await setInputValue(
          user,
          "EndpointConfigurationForm.field.endpoint.label",
          "https://example.com",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.apiKey.label",
          "apiKey",
        );
        await setInputValue(
          user,
          "EndpointConfigurationForm.field.configurationId.label",
          "123",
        );
      },
      clearConfiguration: async (user: UserEvent) => {
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
  ];

  beforeEach(() => {
    vi.mocked(llmEndpointsPost).mockReset();
  });

  it.each(testCases)(
    "should create endpoint for type $configuration.type",
    async ({ configuration, fillConfiguration, name }) => {
      const user = userEvent.setup();

      mockTypes();
      mockEndpointCreate(name, configuration);

      const page = await createPage();

      render(page, { wrapper: createPageWrapper() });

      await selectFromDropDown(
        user,
        "EndpointTypeSelectionForm.select.label",
        `llmEndpointType.${configuration.type}`,
      );

      await formWizardClickNext(user);

      await fillConfiguration(user);

      await clickSubmitButton(user);

      await waitFor(() =>
        expect(llmEndpointsPost).toHaveBeenCalledWith(
          expect.objectContaining({
            body: {
              name,
              configuration,
            },
          }),
        ),
      );

      expect(addToast).toHaveBeenCalledWith({
        title: `LlmEndpointFormWizard.create.success - {"name":"${name}"}`,
        color: "success",
      });
      expect(mockRouter.push).toHaveBeenCalledWith(
        llmEndpointDetailsPage("1").href,
      );
    },
  );

  it.each(testCases)(
    "should show configuration validation errors for type $configuration.type",
    async ({ configuration, clearConfiguration, expectErrors }) => {
      const user = userEvent.setup();

      mockTypes();

      const page = await createPage();

      render(page, { wrapper: createPageWrapper() });

      await selectFromDropDown(
        user,
        "EndpointTypeSelectionForm.select.label",
        `llmEndpointType.${configuration.type}`,
      );

      await formWizardClickNext(user);

      if (clearConfiguration && expectErrors) {
        await clearConfiguration(user);

        await clickSubmitButton(user);

        await expectErrors();
      }
    },
  );

  it("should return to list on cancel click", async () => {
    const user = userEvent.setup();

    mockTypes();

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await formWizardClickCancel(user);

    expect(mockRouter.push).toHaveBeenCalledWith(llmEndpointsPage.href);
  });

  it("should show validation error when no type is selected", async () => {
    const user = userEvent.setup();

    mockTypes();

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await screen.findAllByText("EndpointTypeSelectionForm.select.label");

    await formWizardClickNext(user);

    await expectDropDownError(
      "EndpointTypeSelectionForm.select.label",
      "formError.required",
    );
  });

  it("should be able to go back from configuration page", async () => {
    const user = userEvent.setup();

    mockTypes();

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await selectFromDropDown(
      user,
      "EndpointTypeSelectionForm.select.label",
      "llmEndpointType.C4",
    );

    await formWizardClickNext(user);

    await formWizardClickBack(user);

    expect(
      await getDropDownBase("EndpointTypeSelectionForm.select.label"),
    ).toBeInTheDocument();
  });

  it("should go back after discarding changes", async () => {
    const user = userEvent.setup();

    mockTypes();

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await selectFromDropDown(
      user,
      "EndpointTypeSelectionForm.select.label",
      "llmEndpointType.C4",
    );

    await formWizardClickNext(user);

    await setInputValue(
      user,
      "EndpointConfigurationForm.field.name.label",
      "abc",
    );

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

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await selectFromDropDown(
      user,
      "EndpointTypeSelectionForm.select.label",
      "llmEndpointType.C4",
    );

    await formWizardClickNext(user);

    await setInputValue(
      user,
      "EndpointConfigurationForm.field.name.label",
      "abc",
    );

    await formWizardClickBack(user);

    await user.click(
      await screen.findByRole("button", { name: "ConfirmDialog.cancelButton" }),
    );

    expect(
      await getInputBase("EndpointConfigurationForm.field.name.label"),
    ).toBeInTheDocument();
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

  const mockEndpointCreate = (
    name: string,
    configuration: LlmEndpointConfigurationCreate,
  ) => {
    vi.mocked(llmEndpointsPost).mockResolvedValue(
      successfulServiceResponse({
        id: "1",
        createdAt: "2021-01-01T00:00:00Z",
        updatedAt: "2021-01-01T00:00:00Z",
        version: 1,
        name,
        configuration,
        supportedFeatures: [],
      }),
    );
  };

  const clickSubmitButton = async (user: UserEvent) => {
    await user.click(
      await screen.findByRole("button", {
        name: "LLMEndpointForm.submitLabel.create",
      }),
    );
  };

  const createPage = () => Page({ params: Promise.resolve({ locale: "en" }) });
});

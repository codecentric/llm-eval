import "@/app/test-utils/mock-router";
import "@/app/test-utils/mock-toast";

import { addToast } from "@heroui/react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";

import { metricDetailsPage } from "@/app/[locale]/(authenticated)/metrics/[metricId]/page-info";
import { metricsPage } from "@/app/[locale]/(authenticated)/metrics/page-info";
import {
  LlmEndpoint,
  llmEndpointsGet,
  llmEndpointsGetAll,
  LlmTestCaseParams,
  MetricConfigurationCreate,
  metricsGetTypes,
  metricsPost,
  PluginFeature,
} from "@/app/client";
import {
  expectComboBoxError,
  expectDropDownError,
  expectInputError,
  expectStringArrayError,
  formStringArrayAddItem,
  formStringArrayRemoveItem,
  formWizardClickBack,
  formWizardClickCancel,
  formWizardClickNext,
  getDropDownBase,
  getInputBase,
  selectFromComboBox,
  selectFromDropDown,
  selectFromMultiSelectDropDown,
  setInputValue,
  toggleSwitch,
} from "@/app/test-utils/forms";
import { createPageWrapper } from "@/app/test-utils/page-wrapper";
import { successfulServiceResponse } from "@/app/test-utils/service-call";

import Page from "./page";

vi.mock("@/app/client");

type TestCase = {
  configuration: MetricConfigurationCreate;
  fillConfiguration: (user: UserEvent) => Promise<void>;
  clearConfiguration?: (user: UserEvent) => Promise<void>;
  expectErrors?: () => Promise<void>;
};

describe("New Metric Page", () => {
  const testCases: TestCase[] = [
    {
      configuration: {
        type: "FAITHFULNESS",
        name: "Test Faithfulness",
        chatModelId: "1",
        threshold: 0.5,
        includeReason: true,
        strictMode: true,
      },
      fillConfiguration: async (user: UserEvent) => {
        await setInputValue(
          user,
          "MetricConfigurationForm.field.name.label",
          "Test Faithfulness",
        );

        await setInputValue(
          user,
          "MetricConfigurationForm.field.threshold.label",
          "0.5",
        );

        await toggleSwitch(
          user,
          "MetricConfigurationForm.field.strictMode.label",
        );

        await selectFromComboBox(
          user,
          "MetricConfigurationForm.field.chatModelId.label",
          "Endpoint 1",
        );
      },
      clearConfiguration: async (user: UserEvent) => {
        await setInputValue(
          user,
          "MetricConfigurationForm.field.name.label",
          "",
        );

        await setInputValue(
          user,
          "MetricConfigurationForm.field.threshold.label",
          "",
        );
      },
      expectErrors: async () => {
        await expectInputError(
          "MetricConfigurationForm.field.name.label",
          "formError.required",
        );
        await expectInputError(
          "MetricConfigurationForm.field.threshold.label",
          "formError.required",
        );

        await expectComboBoxError(
          "MetricConfigurationForm.field.chatModelId.label",
          "formError.required",
        );
      },
    },
    {
      configuration: {
        type: "ANSWER_RELEVANCY",
        name: "Test Answer Relevancy",
        chatModelId: "2",
        threshold: 0.6,
        includeReason: false,
        strictMode: false,
      },
      fillConfiguration: async (user: UserEvent) => {
        await setInputValue(
          user,
          "MetricConfigurationForm.field.name.label",
          "Test Answer Relevancy",
        );

        await setInputValue(
          user,
          "MetricConfigurationForm.field.threshold.label",
          "0.6",
        );

        await toggleSwitch(
          user,
          "MetricConfigurationForm.field.includeReason.label",
        );

        await selectFromComboBox(
          user,
          "MetricConfigurationForm.field.chatModelId.label",
          "Endpoint 2",
        );
      },
      clearConfiguration: async (user: UserEvent) => {
        await setInputValue(
          user,
          "MetricConfigurationForm.field.name.label",
          "",
        );

        await setInputValue(
          user,
          "MetricConfigurationForm.field.threshold.label",
          "",
        );
      },
      expectErrors: async () => {
        await expectInputError(
          "MetricConfigurationForm.field.name.label",
          "formError.required",
        );
        await expectInputError(
          "MetricConfigurationForm.field.threshold.label",
          "formError.required",
        );

        await expectComboBoxError(
          "MetricConfigurationForm.field.chatModelId.label",
          "formError.required",
        );
      },
    },
    {
      configuration: {
        type: "HALLUCINATION",
        name: "Test Hallucination",
        chatModelId: "2",
        threshold: 0.6,
        includeReason: false,
        strictMode: true,
      },
      fillConfiguration: async (user: UserEvent) => {
        await setInputValue(
          user,
          "MetricConfigurationForm.field.name.label",
          "Test Hallucination",
        );

        await setInputValue(
          user,
          "MetricConfigurationForm.field.threshold.label",
          "0.6",
        );

        await toggleSwitch(
          user,
          "MetricConfigurationForm.field.strictMode.label",
        );

        await toggleSwitch(
          user,
          "MetricConfigurationForm.field.includeReason.label",
        );

        await selectFromComboBox(
          user,
          "MetricConfigurationForm.field.chatModelId.label",
          "Endpoint 2",
        );
      },
      clearConfiguration: async (user: UserEvent) => {
        await setInputValue(
          user,
          "MetricConfigurationForm.field.name.label",
          "",
        );

        await setInputValue(
          user,
          "MetricConfigurationForm.field.threshold.label",
          "",
        );
      },
      expectErrors: async () => {
        await expectInputError(
          "MetricConfigurationForm.field.name.label",
          "formError.required",
        );
        await expectInputError(
          "MetricConfigurationForm.field.threshold.label",
          "formError.required",
        );

        await expectComboBoxError(
          "MetricConfigurationForm.field.chatModelId.label",
          "formError.required",
        );
      },
    },
    {
      configuration: {
        type: "G_EVAL",
        name: "Test GEval",
        chatModelId: "1",
        threshold: 0.8,
        strictMode: true,
        evaluationParams: [
          LlmTestCaseParams.INPUT,
          LlmTestCaseParams.EXPECTED_TOOLS,
        ],
        evaluationSteps: ["step1", "step2"],
      },
      fillConfiguration: async (user: UserEvent) => {
        await setInputValue(
          user,
          "MetricConfigurationForm.field.name.label",
          "Test GEval",
        );

        await setInputValue(
          user,
          "MetricConfigurationForm.field.threshold.label",
          "0.8",
        );

        await toggleSwitch(
          user,
          "MetricConfigurationForm.field.strictMode.label",
        );

        await formStringArrayRemoveItem(
          user,
          "MetricConfigurationForm.field.evaluationSteps.label",
          0,
          3,
        );

        await formStringArrayAddItem(
          user,
          "MetricConfigurationForm.field.evaluationSteps.label",
          "step1",
          "step2",
        );

        await selectFromMultiSelectDropDown(
          user,
          "MetricConfigurationForm.field.evaluationParams.label",
          `evaluationParam.${LlmTestCaseParams.ACTUAL_OUTPUT}`,
          `evaluationParam.${LlmTestCaseParams.EXPECTED_OUTPUT}`,
          `evaluationParam.${LlmTestCaseParams.CONTEXT}`,
          `evaluationParam.${LlmTestCaseParams.RETRIEVAL_CONTEXT}`,
          `evaluationParam.${LlmTestCaseParams.EXPECTED_TOOLS}`,
        );

        await selectFromComboBox(
          user,
          "MetricConfigurationForm.field.chatModelId.label",
          "Endpoint 1",
        );
      },
      clearConfiguration: async (user: UserEvent) => {
        await setInputValue(
          user,
          "MetricConfigurationForm.field.name.label",
          "",
        );

        await setInputValue(
          user,
          "MetricConfigurationForm.field.threshold.label",
          "",
        );

        await formStringArrayRemoveItem(
          user,
          "MetricConfigurationForm.field.evaluationSteps.label",
          0,
          3,
        );

        await selectFromMultiSelectDropDown(
          user,
          "MetricConfigurationForm.field.evaluationParams.label",
          `evaluationParam.${LlmTestCaseParams.INPUT}`,
          `evaluationParam.${LlmTestCaseParams.ACTUAL_OUTPUT}`,
          `evaluationParam.${LlmTestCaseParams.EXPECTED_OUTPUT}`,
          `evaluationParam.${LlmTestCaseParams.CONTEXT}`,
          `evaluationParam.${LlmTestCaseParams.RETRIEVAL_CONTEXT}`,
        );
      },
      expectErrors: async () => {
        await expectStringArrayError(
          "MetricConfigurationForm.field.evaluationSteps.label",
          'formError.arrayMin - {"min":1}',
        );

        await expectDropDownError(
          "MetricConfigurationForm.field.evaluationParams.label",
          'formError.arrayMin - {"min":1}',
        );

        await expectInputError(
          "MetricConfigurationForm.field.name.label",
          "formError.required",
        );
        await expectInputError(
          "MetricConfigurationForm.field.threshold.label",
          "formError.required",
        );

        await expectComboBoxError(
          "MetricConfigurationForm.field.chatModelId.label",
          "formError.required",
        );
      },
    },
  ];

  beforeEach(() => {
    vi.mocked(metricsPost).mockReset();
  });

  it.each(testCases)(
    "should create metric for type $configuration.type",
    async ({ configuration, fillConfiguration }) => {
      const user = userEvent.setup();

      mockTypes();
      mockEndpoints();
      mockMetricCreate(configuration);

      const page = await createPage();

      render(page, { wrapper: createPageWrapper() });

      await selectFromDropDown(
        user,
        "MetricTypeSelectionForm.select.label",
        `metricType.${configuration.type}`,
      );

      await formWizardClickNext(user);

      await fillConfiguration(user);

      await clickSubmitButton(user);

      await waitFor(() =>
        expect(metricsPost).toHaveBeenCalledWith(
          expect.objectContaining({
            body: { configuration },
          }),
        ),
      );

      expect(addToast).toHaveBeenCalledWith({
        title: `MetricFormWizard.create.success - {"name":"${configuration.name}"}`,
        color: "success",
      });
      expect(mockRouter.push).toHaveBeenCalledWith(metricDetailsPage("1").href);
    },
  );

  it.each(testCases)(
    "should show configuration validation errors for type $configuration.type",
    async ({ configuration, clearConfiguration, expectErrors }) => {
      const user = userEvent.setup();

      mockTypes();
      mockEndpoints();

      const page = await createPage();

      render(page, { wrapper: createPageWrapper() });

      await selectFromDropDown(
        user,
        "MetricTypeSelectionForm.select.label",
        `metricType.${configuration.type}`,
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
    mockEndpoints();

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await formWizardClickCancel(user);

    expect(mockRouter.push).toHaveBeenCalledWith(metricsPage.href);
  });

  it("should show validation error when no type is selected", async () => {
    const user = userEvent.setup();

    mockTypes();
    mockEndpoints();

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await screen.findAllByText("MetricTypeSelectionForm.select.label");

    await formWizardClickNext(user);

    await expectDropDownError(
      "MetricTypeSelectionForm.select.label",
      "formError.required",
    );
  });

  it("should be able to go back from configuration page", async () => {
    const user = userEvent.setup();

    mockTypes();
    mockEndpoints();

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await selectFromDropDown(
      user,
      "MetricTypeSelectionForm.select.label",
      "metricType.FAITHFULNESS",
    );

    await formWizardClickNext(user);

    await formWizardClickBack(user);

    expect(
      await getDropDownBase("MetricTypeSelectionForm.select.label"),
    ).toBeInTheDocument();
  });

  it("should go back after discarding changes", async () => {
    const user = userEvent.setup();

    mockTypes();
    mockEndpoints();

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await selectFromDropDown(
      user,
      "MetricTypeSelectionForm.select.label",
      "metricType.FAITHFULNESS",
    );

    await formWizardClickNext(user);

    await setInputValue(user, "MetricConfigurationForm.field.name.label", "");

    await formWizardClickBack(user);

    await user.click(
      await screen.findByRole("button", {
        name: "FormWizard.discardDialog.discardButton",
      }),
    );

    expect(
      await getDropDownBase("MetricTypeSelectionForm.select.label"),
    ).toBeInTheDocument();
  });

  it("should not go back after cancelling discard of changes", async () => {
    const user = userEvent.setup();

    mockTypes();
    mockEndpoints();

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await selectFromDropDown(
      user,
      "MetricTypeSelectionForm.select.label",
      "metricType.FAITHFULNESS",
    );

    await formWizardClickNext(user);

    await setInputValue(user, "MetricConfigurationForm.field.name.label", "");

    await formWizardClickBack(user);

    await user.click(
      await screen.findByRole("button", { name: "ConfirmDialog.cancelButton" }),
    );

    expect(
      await getInputBase("MetricConfigurationForm.field.name.label"),
    ).toBeInTheDocument();
  });

  const mockTypes = () => {
    vi.mocked(metricsGetTypes).mockResolvedValue(
      successfulServiceResponse({
        types: testCases.map((tc) => tc.configuration.type),
      }),
    );
  };

  const mockEndpoints = () => {
    vi.mocked(llmEndpointsGetAll).mockResolvedValue(
      successfulServiceResponse([
        {
          id: "1",
          name: `Endpoint 1`,
          createdAt: "2021-01-01T00:00:00Z",
          updatedAt: "2021-01-01T00:00:00Z",
          supportedFeatures: [PluginFeature.LLM_QUERY],
          metrics: [],
          version: 0,
        } as unknown as LlmEndpoint,
        {
          id: "2",
          name: `Endpoint 2`,
          createdAt: "2021-01-01T00:00:00Z",
          updatedAt: "2021-01-01T00:00:00Z",
          supportedFeatures: [PluginFeature.LLM_QUERY],
          metrics: [],
          version: 0,
        } as unknown as LlmEndpoint,
      ]),
    );
    vi.mocked(llmEndpointsGet).mockImplementation(
      async ({ path: { llm_endpoint_id: id } }) =>
        successfulServiceResponse({
          id,
          name: `Endpoint ${id}`,
          createdAt: "2021-01-01T00:00:00Z",
          updatedAt: "2021-01-01T00:00:00Z",
          supportedFeatures: [PluginFeature.LLM_QUERY],
          metrics: [],
          version: 0,
        } as unknown as LlmEndpoint),
    );
  };

  const mockMetricCreate = (configuration: MetricConfigurationCreate) => {
    vi.mocked(metricsPost).mockResolvedValue(
      successfulServiceResponse({
        id: "1",
        createdAt: "2021-01-01T00:00:00Z",
        updatedAt: "2021-01-01T00:00:00Z",
        version: 1,
        configuration,
      }),
    );
  };

  const clickSubmitButton = async (user: UserEvent) => {
    await user.click(
      await screen.findByRole("button", {
        name: "MetricFormWizard.submitLabel.create",
      }),
    );
  };

  const createPage = () => Page({ params: Promise.resolve({ locale: "en" }) });
});

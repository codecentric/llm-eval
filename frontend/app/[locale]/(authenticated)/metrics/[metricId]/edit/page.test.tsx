import "@/app/test-utils/mock-intl";
import "@/app/test-utils/mock-router";
import "@/app/test-utils/mock-toast";

import { addToast } from "@heroui/react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";

import { metricDetailsPage } from "@/app/[locale]/(authenticated)/metrics/[metricId]/page-info";
import { metricsPage } from "@/app/[locale]/(authenticated)/metrics/page-info";
import {
  LlmEndpoint,
  llmEndpointsGet,
  llmEndpointsGetAll,
  LlmTestCaseParams,
  Metric,
  MetricConfigurationRead,
  MetricConfigurationUpdate,
  metricsGet,
  metricsGetTypes,
  metricsPatch,
  PluginFeature,
} from "@/app/client";
import {
  clearComboBox,
  expectCheckboxValue,
  expectComboBoxValue,
  expectDropDownValue,
  expectInputError,
  expectInputValue,
  expectStringArrayValue,
  formStringArrayAddItem,
  formStringArrayRemoveItem,
  formWizardClickBack,
  formWizardClickNext,
  getComboBoxBase,
  getDropDownBase,
  getInputBase,
  getStringArrayBase,
  selectFromComboBox,
  selectFromDropDown,
  selectFromMultiSelectDropDown,
  setInputValue,
  toggleSwitch,
} from "@/app/test-utils/forms";
import { createPageWrapper } from "@/app/test-utils/page-wrapper";
import { successfulServiceResponse } from "@/app/test-utils/service-call";
import { EditOrigin } from "@/app/types/edit-origin";

import Page from "./page";

vi.mock("@/app/client");

type TestCase = {
  existingConfiguration: MetricConfigurationRead;
  configuration: MetricConfigurationUpdate;
  updatedConfiguration: MetricConfigurationRead;
  expectConfiguration: () => Promise<void>;
  fillConfiguration: (user: UserEvent) => Promise<void>;
  clearConfiguration?: (user: UserEvent) => Promise<void>;
  expectErrors?: () => Promise<void>;
};

describe("Edit Metric Page", () => {
  const metricId = "1";

  const createMetric = (configuration: MetricConfigurationRead): Metric => ({
    id: metricId,
    createdAt: "2021-01-01T00:00:00Z",
    updatedAt: "2021-01-01T00:00:00Z",
    version: 1,
    configuration,
  });

  const testConfiguration: MetricConfigurationRead = {
    type: "FAITHFULNESS",
    name: "Test Faithfulness",
    chatModelId: "1",
    threshold: 0.5,
    includeReason: true,
    strictMode: true,
  };

  const testCases: TestCase[] = [
    createSimpleMetricTestCase("FAITHFULNESS"),
    createSimpleMetricTestCase("ANSWER_RELEVANCY"),
    createSimpleMetricTestCase("HALLUCINATION"),
    gEvalMetricTestCase,
  ];

  beforeEach(() => {
    vi.mocked(metricsPatch).mockReset();
    vi.mocked(metricsGet).mockReset();
  });

  it.each(testCases)(
    "should save updated metric for type $configuration.type",
    async ({
      existingConfiguration,
      configuration,
      updatedConfiguration,
      expectConfiguration,
      fillConfiguration,
    }) => {
      const user = userEvent.setup();

      mockTypes();
      mockEndpoints();
      mockMetricGet(existingConfiguration);
      mockMetricUpdate(updatedConfiguration);

      const page = await createPage();

      render(page, { wrapper: createPageWrapper() });

      await expectDropDownValue(
        "MetricTypeSelectionForm.select.label",
        `metricType.${existingConfiguration.type}`,
      );

      await formWizardClickNext(user);

      await expectConfiguration();

      await fillConfiguration(user);

      await clickSubmitButton(user);

      await waitFor(() =>
        expect(metricsPatch).toHaveBeenCalledWith(
          expect.objectContaining({
            body: { configuration, version: 1 },
            path: { metric_id: metricId },
          }),
        ),
      );

      expect(addToast).toHaveBeenCalledWith({
        title: `MetricFormWizard.update.success - {"name":"${configuration.name}"}`,
        color: "success",
      });
      expect(mockRouter.push).toHaveBeenCalledWith(metricDetailsPage("1").href);
    },
  );

  it.each(testCases)(
    "should show configuration validation errors for type $configuration.type",
    async ({ existingConfiguration, clearConfiguration, expectErrors }) => {
      const user = userEvent.setup();

      mockTypes();
      mockEndpoints();
      mockMetricGet(existingConfiguration);

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
    { origin: EditOrigin.LIST, pageInfo: metricsPage },
    { origin: EditOrigin.DETAILS, pageInfo: metricDetailsPage(metricId) },
  ])(
    "should return to $pageInfo.key on cancel click if origin is $origin",
    async ({ origin, pageInfo }) => {
      const user = userEvent.setup();

      mockTypes();
      mockEndpoints();
      mockMetricGet(testConfiguration);

      const page = await createPage(origin);

      render(page, { wrapper: createPageWrapper() });

      const cancelButton = await screen.findByText(
        "FormWizardPage.button.cancel",
      );

      await user.click(cancelButton);

      expect(mockRouter.push).toHaveBeenCalledWith(pageInfo.href);
    },
  );

  it("should show validation error when no type is selected", async () => {
    const user = userEvent.setup();

    mockTypes();
    mockEndpoints();
    mockMetricGet(testConfiguration);

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await selectFromDropDown(
      user,
      "MetricTypeSelectionForm.select.label",
      `metricType.${testConfiguration.type}`,
    );

    await formWizardClickNext(user);

    expect(
      await within(
        await getDropDownBase("MetricTypeSelectionForm.select.label"),
      ).findByText("formError.required"),
    ).toBeInTheDocument();
  });

  it("should be able to go back from configuration page", async () => {
    const user = userEvent.setup();

    mockTypes();
    mockEndpoints();
    mockMetricGet(testConfiguration);

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

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
    mockMetricGet(testConfiguration);

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

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
    mockMetricGet(testConfiguration);

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

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

  it("should update without changing configuration", async () => {
    mockTypes();
    mockEndpoints();
    mockMetricGet(testConfiguration);
    mockMetricUpdate(testConfiguration);

    const page = await createPage();

    const user = userEvent.setup();

    render(page, { wrapper: createPageWrapper() });

    await clickSubmitButton(user);

    await waitFor(() =>
      expect(metricsPatch).toHaveBeenCalledWith(
        expect.objectContaining({
          body: { configuration: testConfiguration, version: 1 },
          path: { metric_id: metricId },
        }),
      ),
    );

    expect(addToast).toHaveBeenCalledWith({
      title: `MetricFormWizard.update.success - {"name":"${testConfiguration.name}"}`,
      color: "success",
    });
    expect(mockRouter.push).toHaveBeenCalledWith(metricDetailsPage("1").href);
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

  const mockMetricGet = (configuration: MetricConfigurationRead) => {
    vi.mocked(metricsGet).mockResolvedValue(
      successfulServiceResponse(createMetric(configuration)),
    );
  };

  const mockMetricUpdate = (configuration: MetricConfigurationRead) => {
    vi.mocked(metricsPatch).mockResolvedValue(
      successfulServiceResponse(createMetric(configuration)),
    );
  };

  const clickSubmitButton = async (user: UserEvent) => {
    await user.click(
      await screen.findByRole("button", {
        name: "MetricFormWizard.submitLabel.update",
      }),
    );
  };

  const createPage = (origin: EditOrigin = EditOrigin.LIST) =>
    Page({
      params: Promise.resolve({ metricId, locale: "en" }),
      searchParams: Promise.resolve({ origin }),
    });
});

const createSimpleMetricTestCase = (
  type: Extract<
    MetricConfigurationRead["type"],
    "FAITHFULNESS" | "ANSWER_RELEVANCY" | "HALLUCINATION"
  >,
): TestCase => ({
  existingConfiguration: {
    type,
    name: `Test ${type}`,
    chatModelId: "1",
    threshold: 0.5,
    includeReason: true,
    strictMode: true,
  },
  configuration: {
    type,
    name: `Test ${type} (updated)`,
    chatModelId: "2",
    threshold: 0.6,
    includeReason: false,
    strictMode: false,
  },
  updatedConfiguration: {
    type,
    name: `Test ${type} (updated)`,
    chatModelId: "2",
    threshold: 0.6,
    includeReason: false,
    strictMode: false,
  },
  expectConfiguration: async () => {
    await expectInputValue(
      "MetricConfigurationForm.field.name.label",
      `Test ${type}`,
    );
    await expectInputValue(
      "MetricConfigurationForm.field.threshold.label",
      "0.5",
    );
    await expectCheckboxValue(
      "MetricConfigurationForm.field.includeReason.label",
      true,
    );
    await expectCheckboxValue(
      "MetricConfigurationForm.field.strictMode.label",
      true,
    );

    await expectComboBoxValue(
      "MetricConfigurationForm.field.chatModelId.label",
      "Endpoint 1",
    );
  },
  fillConfiguration: async (user) => {
    await setInputValue(
      user,
      "MetricConfigurationForm.field.name.label",
      `Test ${type} (updated)`,
    );

    await setInputValue(
      user,
      "MetricConfigurationForm.field.threshold.label",
      "0.6",
    );

    await toggleSwitch(user, "MetricConfigurationForm.field.strictMode.label");

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
  clearConfiguration: async (user) => {
    await setInputValue(user, "MetricConfigurationForm.field.name.label", "");

    await setInputValue(
      user,
      "MetricConfigurationForm.field.threshold.label",
      "",
    );

    await clearComboBox(
      user,
      "MetricConfigurationForm.field.chatModelId.label",
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

    expect(
      await within(
        await getComboBoxBase(
          "MetricConfigurationForm.field.chatModelId.label",
        ),
      ).findByText("formError.required"),
    ).toBeInTheDocument();
  },
});

const gEvalMetricTestCase: TestCase = {
  existingConfiguration: {
    type: "G_EVAL",
    name: "Test GEval",
    chatModelId: "2",
    threshold: 0.2,
    strictMode: false,
    evaluationParams: [LlmTestCaseParams.INPUT],
    evaluationSteps: ["step1"],
  },
  configuration: {
    type: "G_EVAL",
    name: "Test GEval (updated)",
    chatModelId: "1",
    threshold: 0.8,
    strictMode: true,
    evaluationParams: [
      LlmTestCaseParams.INPUT,
      LlmTestCaseParams.EXPECTED_TOOLS,
    ],
    evaluationSteps: ["step1", "step2"],
  },
  updatedConfiguration: {
    type: "G_EVAL",
    name: "Test GEval (updated)",
    chatModelId: "1",
    threshold: 0.8,
    strictMode: true,
    evaluationParams: [
      LlmTestCaseParams.INPUT,
      LlmTestCaseParams.EXPECTED_TOOLS,
    ],
    evaluationSteps: ["step1", "step2"],
  },
  expectConfiguration: async () => {
    await expectInputValue(
      "MetricConfigurationForm.field.name.label",
      "Test GEval",
    );
    await expectInputValue(
      "MetricConfigurationForm.field.threshold.label",
      "0.2",
    );
    await expectCheckboxValue(
      "MetricConfigurationForm.field.strictMode.label",
      false,
    );

    await expectStringArrayValue(
      "MetricConfigurationForm.field.evaluationSteps.label",
      "step1",
    );

    await expectDropDownValue(
      "MetricConfigurationForm.field.evaluationParams.label",
      "evaluationParam.input",
    );

    await expectComboBoxValue(
      "MetricConfigurationForm.field.chatModelId.label",
      "Endpoint 2",
    );
  },
  fillConfiguration: async (user) => {
    await setInputValue(
      user,
      "MetricConfigurationForm.field.name.label",
      "Test GEval (updated)",
    );

    await setInputValue(
      user,
      "MetricConfigurationForm.field.threshold.label",
      "0.8",
    );

    await toggleSwitch(user, "MetricConfigurationForm.field.strictMode.label");

    await formStringArrayAddItem(
      user,
      "MetricConfigurationForm.field.evaluationSteps.label",
      "step2",
    );

    await selectFromMultiSelectDropDown(
      user,
      "MetricConfigurationForm.field.evaluationParams.label",
      `evaluationParam.${LlmTestCaseParams.EXPECTED_TOOLS}`,
    );

    await selectFromComboBox(
      user,
      "MetricConfigurationForm.field.chatModelId.label",
      "Endpoint 1",
    );
  },
  clearConfiguration: async (user) => {
    await setInputValue(user, "MetricConfigurationForm.field.name.label", "");

    await setInputValue(
      user,
      "MetricConfigurationForm.field.threshold.label",
      "",
    );

    await formStringArrayRemoveItem(
      user,
      "MetricConfigurationForm.field.evaluationSteps.label",
      0,
    );

    await selectFromMultiSelectDropDown(
      user,
      "MetricConfigurationForm.field.evaluationParams.label",
      `evaluationParam.${LlmTestCaseParams.INPUT}`,
    );

    await clearComboBox(
      user,
      "MetricConfigurationForm.field.chatModelId.label",
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

    expect(
      await within(
        await getStringArrayBase(
          "MetricConfigurationForm.field.evaluationSteps.label",
        ),
      ).findByText('formError.arrayMin - {"min":1}'),
    ).toBeInTheDocument();

    expect(
      await within(
        await getDropDownBase(
          "MetricConfigurationForm.field.evaluationParams.label",
        ),
      ).findByText('formError.arrayMin - {"min":1}'),
    ).toBeInTheDocument();

    expect(
      await within(
        await getComboBoxBase(
          "MetricConfigurationForm.field.chatModelId.label",
        ),
      ).findByText("formError.required"),
    ).toBeInTheDocument();
  },
};

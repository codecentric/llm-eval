import "@/app/test-utils/mock-intl";
import "@/app/test-utils/mock-router";
import "@/app/test-utils/mock-toast";

import { addToast } from "@heroui/react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";

import { qaCatalogDetailPage } from "@/app/[locale]/(authenticated)/qa-catalogs/[catalogId]/page-info";
import Page from "@/app/[locale]/(authenticated)/qa-catalogs/generate/page";
import { qaCatalogsPage } from "@/app/[locale]/(authenticated)/qa-catalogs/page-info";
import {
  Language,
  LlmEndpoint,
  llmEndpointsGetAll,
  qaCatalogCreateDataSourceConfig,
  qaCatalogGenerate,
  QaCatalogGenerationConfig,
  QaCatalogGenerationModelConfigurationSchema,
  qaCatalogGetGeneratorTypes,
  RagasQaCatalogQuerySynthesizer,
} from "@/app/client";
import {
  clearComboBox,
  createFiles,
  createMockFileList,
  expectComboBoxError,
  expectDropDownError,
  expectInputError,
  formWizardClickBack,
  formWizardClickCancel,
  formWizardClickNext,
  getDropDownBase,
  getInputBase,
  selectFromComboBox,
  selectFromDropDown,
  setInputValue,
  uploadFiles,
} from "@/app/test-utils/forms";
import { createPageWrapper } from "@/app/test-utils/page-wrapper";
import { successfulServiceResponse } from "@/app/test-utils/service-call";

vi.mock("@/app/client");

type TestCase = {
  type: string;
  name: string;
  catalogId: string;
  configuration: QaCatalogGenerationConfig;
  modelConfigSchema: QaCatalogGenerationModelConfigurationSchema;
  dataSourceConfigId: string;
  files: File[];
  clearConfigurations?: () => Promise<void>;
  expectErrors?: () => Promise<void>;
};

describe("Synthetic QA Catalog Generation Page", () => {
  const baseLabel = (path: string) =>
    `QACatalogGeneratorForm.field.${path}.label`;
  const ragasLabel = (path: string) =>
    `RagasQACatalogGeneratorConfigurationForm.field.${path}.label`;

  const fillConfigurations = async (testCase: TestCase, user: UserEvent) => {
    await setInputValue(user, baseLabel("name"), testCase.name);

    await uploadFiles(baseLabel("files"), createMockFileList(testCase.files));

    if (
      testCase.configuration.type == "RAGAS" &&
      testCase.modelConfigSchema.type == "RAGAS"
    ) {
      await setInputValue(
        user,
        ragasLabel("sampleCount"),
        testCase.configuration.sampleCount.toString(),
      );

      await selectFromComboBox(
        user,
        ragasLabel("llmEndpointId"),
        testCase.modelConfigSchema.llmEndpoint,
      );

      await inputPersonasForRagas(testCase.configuration, user);

      await inputDistributionsForRagas(testCase.configuration);
    }
  };

  const clearConfigurations = async (testCase: TestCase, user: UserEvent) => {
    await setInputValue(user, baseLabel("name"), "");

    await uploadFiles(baseLabel("files"), null);

    if (
      testCase.configuration.type == "RAGAS" &&
      testCase.modelConfigSchema.type == "RAGAS"
    ) {
      await setInputValue(user, ragasLabel("sampleCount"), "");

      await clearComboBox(user, ragasLabel("llmEndpointId"));

      await inputDistributionsForRagas(testCase.configuration);
    }
  };

  const expectErrors = async (testCase: TestCase) => {
    await expectInputError(baseLabel("name"), "formError.required");

    const fileInputContainer = await screen.findByTestId(
      "QACatalogGeneratorForm.field.files.container",
    );

    await waitFor(async () =>
      expect(
        await within(fileInputContainer).findByText("formError.required"),
      ).toBeInTheDocument(),
    );

    if (
      testCase.configuration.type == "RAGAS" &&
      testCase.modelConfigSchema.type == "RAGAS"
    ) {
      await expectInputError(ragasLabel("sampleCount"), "formError.required");

      await expectComboBoxError(
        ragasLabel("llmEndpointId"),
        "formError.required",
      );
    }
  };

  const testCases: TestCase[] = [
    {
      name: "catalog-1",
      catalogId: "catalog-1",
      type: "RAGAS",
      configuration: {
        type: "RAGAS",
        personas: [],
        queryDistribution: [
          RagasQaCatalogQuerySynthesizer.MULTI_HOP_SPECIFIC,
          RagasQaCatalogQuerySynthesizer.SINGLE_HOP_SPECIFIC,
        ],
        sampleCount: 5,
        knowledgeGraphLocation: null,
        useExistingKnowledgeGraph: true,
      },
      modelConfigSchema: {
        type: "RAGAS",
        llmEndpoint: "llm-1",
      },
      dataSourceConfigId: "data-source-config-1",
      files: createFiles(["file-1", "file-2"]),
    },
    {
      name: "catalog-2",
      catalogId: "catalog-2",
      type: "RAGAS",
      configuration: {
        type: "RAGAS",
        personas: [
          { name: "p-1", description: "description-1" },
          { name: "p-2", description: "description-2" },
        ],
        queryDistribution: [
          RagasQaCatalogQuerySynthesizer.MULTI_HOP_ABSTRACT,
          RagasQaCatalogQuerySynthesizer.MULTI_HOP_SPECIFIC,
          RagasQaCatalogQuerySynthesizer.SINGLE_HOP_SPECIFIC,
        ],
        sampleCount: 5,
        knowledgeGraphLocation: null,
        useExistingKnowledgeGraph: true,
      },
      modelConfigSchema: {
        type: "RAGAS",
        llmEndpoint: "llm-1",
      },
      dataSourceConfigId: "data-source-config-2",
      files: createFiles(["file-3", "file-4"]),
    },
  ];

  beforeEach(() => {
    vi.mocked(qaCatalogCreateDataSourceConfig).mockReset();
    vi.mocked(qaCatalogGenerate).mockReset();
    vi.mocked(llmEndpointsGetAll).mockReset();
    vi.mocked(qaCatalogGetGeneratorTypes).mockReset();
  });

  it.each(testCases)(
    "should generate qa catalog $name with $type",
    async (testCase) => {
      const user = userEvent.setup();

      const {
        dataSourceConfigId,
        modelConfigSchema,
        configuration,
        catalogId,
        files,
        type,
        name,
      } = testCase;

      mockTypes();
      mockCreateDataSourceConfig(dataSourceConfigId);
      mockStartGeneration(catalogId);
      mockAvaliableLlmEndpoints(modelConfigSchema.llmEndpoint);

      const page = await createPage();

      render(page, { wrapper: createPageWrapper() });

      await selectFromDropDown(
        user,
        "QACatalogGeneratorTypeSelectionForm.select.label",
        `catalogGeneratorType.${type}`,
      );

      await formWizardClickNext(user);

      await fillConfigurations(testCase, user);

      await clickSubmitButton(user);

      await waitFor(() =>
        expect(qaCatalogCreateDataSourceConfig).toHaveBeenCalledWith(
          expect.objectContaining({
            body: {
              files: files,
              generator_type: type,
            },
          }),
        ),
      );

      expect(addToast).toHaveBeenCalledWith({
        title: "uploadFilesForCatalogGeneration.success",
        color: "success",
      });

      await waitFor(() =>
        expect(qaCatalogGenerate).toHaveBeenCalledWith(
          expect.objectContaining({
            body: {
              type,
              name: name,
              config: configuration,
              modelConfigSchema,
              dataSourceConfigId,
            },
          }),
        ),
      );

      expect(addToast).toHaveBeenCalledWith({
        title: "startQACatalogGeneration.success",
        color: "success",
      });

      expect(mockRouter.push).toHaveBeenCalledWith(
        qaCatalogDetailPage(catalogId).href,
      );
    },
  );

  it.each(testCases)(
    "shouldn't generate qa catalog $name with $type",
    async (testCase) => {
      const user = userEvent.setup();

      const { dataSourceConfigId, modelConfigSchema, catalogId, type } =
        testCase;
      mockTypes();
      mockCreateDataSourceConfig(dataSourceConfigId);
      mockStartGeneration(catalogId);
      mockAvaliableLlmEndpoints(modelConfigSchema.llmEndpoint);

      const page = await createPage();

      render(page, { wrapper: createPageWrapper() });

      await selectFromDropDown(
        user,
        "QACatalogGeneratorTypeSelectionForm.select.label",
        `catalogGeneratorType.${type}`,
      );

      await formWizardClickNext(user);

      await clearConfigurations(testCase, user);

      await clickSubmitButton(user);

      await expectErrors(testCase);
    },
  );

  it("should return to list on cancel click", async () => {
    const user = userEvent.setup();

    mockTypes();

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await formWizardClickCancel(user);

    expect(mockRouter.push).toHaveBeenCalledWith(qaCatalogsPage.href);
  });

  it("should show validation error when no name is provided", async () => {
    const user = userEvent.setup();

    mockTypes();

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await formWizardClickNext(user);

    await expectDropDownError(
      "QACatalogGeneratorTypeSelectionForm.select.label",
      "formError.required",
    );
  });

  it("should confirm discarding changes when clicking Back", async () => {
    const user = userEvent.setup();

    mockTypes();
    mockAvaliableLlmEndpoints(testCases[0].modelConfigSchema.llmEndpoint);

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await selectFromDropDown(
      user,
      "QACatalogGeneratorTypeSelectionForm.select.label",
      `catalogGeneratorType.${testCases[0].type}`,
    );

    await formWizardClickNext(user);

    await setInputValue(user, baseLabel("name"), testCases[0].name);

    await formWizardClickBack(user);

    await user.click(
      await screen.findByRole("button", {
        name: "FormWizard.discardDialog.discardButton",
      }),
    );

    expect(
      await getDropDownBase("QACatalogGeneratorTypeSelectionForm.select.label"),
    ).toBeInTheDocument();
  });

  it("should not go back after cancelling discard of changes", async () => {
    const user = userEvent.setup();

    mockTypes();
    mockAvaliableLlmEndpoints(testCases[0].modelConfigSchema.llmEndpoint);

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await selectFromDropDown(
      user,
      "QACatalogGeneratorTypeSelectionForm.select.label",
      `catalogGeneratorType.${testCases[0].type}`,
    );

    await formWizardClickNext(user);

    await setInputValue(user, baseLabel("name"), testCases[0].name);

    await formWizardClickBack(user);

    await user.click(
      await screen.findByRole("button", { name: "ConfirmDialog.cancelButton" }),
    );

    expect(await getInputBase(baseLabel("name"))).toBeInTheDocument();
  });

  const inputDistributionsForRagas = async (
    configuration: QaCatalogGenerationConfig,
  ) => {
    if (configuration.type == "RAGAS") {
      const selectedSynthesizers = configuration.queryDistribution;

      // First, uncheck all checkboxes to start from clean state
      const allSynthesizers = [
        RagasQaCatalogQuerySynthesizer.MULTI_HOP_ABSTRACT,
        RagasQaCatalogQuerySynthesizer.MULTI_HOP_SPECIFIC,
        RagasQaCatalogQuerySynthesizer.SINGLE_HOP_SPECIFIC,
      ];

      for (const synth of allSynthesizers) {
        const checkbox = screen.queryByTestId(
          `queryDistributionCheckbox-${synth}`,
        );
        if (checkbox) {
          // Check if checkbox is currently selected (either checked attribute or data-selected attribute)
          const isChecked =
            checkbox.getAttribute("checked") !== null ||
            checkbox.getAttribute("data-selected") === "true";

          if (isChecked) {
            fireEvent.click(checkbox);
            // Wait a bit for the state to update
            await new Promise((resolve) => setTimeout(resolve, 10));
          }
        }
      }

      // Then check the ones we want
      for (const synth of selectedSynthesizers) {
        const checkbox = screen.getByTestId(
          `queryDistributionCheckbox-${synth}`,
        );
        // Check if checkbox is currently unselected
        const isChecked =
          checkbox.getAttribute("checked") !== null ||
          checkbox.getAttribute("data-selected") === "true";

        if (!isChecked) {
          fireEvent.click(checkbox);
          // Wait a bit for the state to update
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
      }
    }
  };

  const inputPersonasForRagas = async (
    configuration: QaCatalogGenerationConfig,
    user: UserEvent,
  ) => {
    if (configuration.type == "RAGAS" && configuration.personas != null) {
      const headerText = await screen.findByText(
        "RagasQACatalogGeneratorConfigurationForm.field.personas.header",
      );

      // eslint-disable-next-line testing-library/no-node-access
      const wrapper = headerText.parentElement!.parentElement!;

      const advancedConfigButton = (
        await screen.findAllByLabelText(
          "RagasQACatalogGeneratorConfigurationForm.toggleAdvancedConfiguration",
        )
      )[0];

      await user.click(advancedConfigButton);

      const addButton = within(wrapper).getByTestId("add-button");

      for (const persona of configuration.personas) {
        await user.click(addButton);

        const nameInputs = within(wrapper).getAllByLabelText(
          ragasLabel("personas.fields.persona.name"),
        );
        const descriptionInputs = within(wrapper).getAllByLabelText(
          ragasLabel("personas.fields.persona.description"),
        );

        const nameInput = nameInputs[nameInputs.length - 1];
        const descriptionInput =
          descriptionInputs[descriptionInputs.length - 1];

        fireEvent.change(nameInput, {
          target: { value: persona.name },
        });
        fireEvent.change(descriptionInput, {
          target: { value: persona.description },
        });
      }
    }
  };

  const mockTypes = () => {
    vi.mocked(qaCatalogGetGeneratorTypes).mockResolvedValue(
      successfulServiceResponse([{ type: "RAGAS" }]),
    );
  };

  const mockCreateDataSourceConfig = (configId: string) => {
    vi.mocked(qaCatalogCreateDataSourceConfig).mockResolvedValue(
      successfulServiceResponse(configId),
    );
  };

  const mockStartGeneration = (catalogId: string) => {
    vi.mocked(qaCatalogGenerate).mockResolvedValue(
      successfulServiceResponse({ catalogId }),
    );
  };

  const mockAvaliableLlmEndpoints = (llmEndpointId: string) => {
    const endpoint: LlmEndpoint = {
      id: llmEndpointId,
      name: llmEndpointId,
      supportedFeatures: [],
      createdAt: "2021-01-01T00:00:00Z",
      updatedAt: "2021-01-01T00:00:00Z",
      version: 1,
      configuration: {
        type: "OPENAI",
        model: "model",
        baseUrl: "https://example.com",
        language: Language.ENGLISH,
        maxRetries: 10,
        parallelQueries: 3,
        requestTimeout: 500,
        temperature: 0.8,
      },
    };
    vi.mocked(llmEndpointsGetAll).mockResolvedValue(
      successfulServiceResponse([endpoint]),
    );
  };

  const clickSubmitButton = async (user: UserEvent) => {
    await user.click(
      await screen.findByRole("button", {
        name: "QACatalogGeneratorForm.generate",
      }),
    );
  };

  const createPage = () => Page();
});

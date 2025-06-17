import "@/app/test-utils/mock-router";
import "@/app/test-utils/mock-toast";

import { addToast } from "@heroui/react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent, { UserEvent } from "@testing-library/user-event";

import { evaluationPage } from "@/app/[locale]/(authenticated)/eval/[evaluationId]/page-info";
import { evaluationsPage } from "@/app/[locale]/(authenticated)/eval/page-info";
import { StartEvalOrigin } from "@/app/[locale]/(authenticated)/eval/types/start-eval-origin";
import { qaCatalogDetailPage } from "@/app/[locale]/(authenticated)/qa-catalogs/[catalogId]/page-info";
import { qaCatalogsPage } from "@/app/[locale]/(authenticated)/qa-catalogs/page-info";
import {
  evaluationsPost,
  EvaluationStatus,
  LlmEndpoint,
  llmEndpointsGet,
  llmEndpointsGetAll,
  Metric,
  MetricConfigurationRead,
  metricsGetAll,
  PluginFeature,
  QaCatalog,
  qaCatalogGet,
  qaCatalogGetAll,
  QaCatalogPreview,
  QaCatalogStatus,
  RagEvalBackendEvalEvaluationsModelsEvaluationResult,
} from "@/app/client";
import {
  expectComboBoxError,
  expectComboBoxValue,
  expectInputError,
  formWizardClickCancel,
  getComboBoxBase,
  selectFromCheckboxGroup,
  selectFromComboBox,
  setInputValue,
} from "@/app/test-utils/forms";
import { createPageWrapper } from "@/app/test-utils/page-wrapper";
import { successfulServiceResponse } from "@/app/test-utils/service-call";

import Page from "./page";

vi.mock("@/app/client");

describe("New Evaluation Page", () => {
  const allMetrics: Metric[] = (
    [
      "G_EVAL",
      "FAITHFULLNESS",
      "ANSWER_RELEVANCY",
      "HALLUCINATION",
    ] as MetricConfigurationRead["type"][]
  ).map((type, index) => ({
    id: (index + 1).toString(),
    createdAt: "2021-09-01T00:00:00Z",
    updatedAt: "2021-09-01T00:00:00Z",
    version: 1,
    configuration: {
      type,
      name: `name_${type}`,
    } as unknown as MetricConfigurationRead,
  }));

  beforeEach(() => {
    vi.mocked(evaluationsPost).mockReset();
  });

  it("should submit the form with valid values", async () => {
    const user = userEvent.setup();

    mockAllMetrics();
    mockAllCatalogs(["1", "2", "3"]);
    mockCatalog("2");
    mockAllEndpoints(["1", "2", "3"]);
    mockEndpoint("3");

    const createdEvaluation = mockEvaluationCreate();

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await setInputValue(
      user,
      "NewEvaluationForm.field.executionName.label",
      "Test Execution",
    );

    await selectFromComboBox(
      user,
      "NewEvaluationForm.field.catalogId.label",
      "catalog_2",
    );
    await selectFromComboBox(
      user,
      "NewEvaluationForm.field.endpointId.label",
      "endpoint_3",
    );

    await selectFromCheckboxGroup(
      user,
      "NewEvaluationForm.field.metrics.label",
      "name_FAITHFULLNESS metricType.FAITHFULLNESS",
      "name_ANSWER_RELEVANCY metricType.ANSWER_RELEVANCY",
    );

    await clickSubmitButton(user);

    await waitFor(() =>
      expect(evaluationsPost).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            name: "Test Execution",
            catalogId: "2",
            llmEndpointId: "3",
            metrics: ["2", "3"],
            testCasesPerQaPair: 5,
          },
        }),
      ),
    );

    expect(addToast).toHaveBeenCalledWith({
      title: "NewEvaluationFormWizard.successMessage",
      color: "success",
    });
    expect(mockRouter.replace).toHaveBeenCalledWith(
      evaluationPage({ evaluationId: createdEvaluation.id }).href,
    );
  });

  it("should display error message if fields are invalid", async () => {
    const user = userEvent.setup();

    mockAllMetrics();
    mockAllCatalogs(["1", "2", "3"]);
    mockCatalog("2");
    mockAllEndpoints(["1", "2", "3"]);
    mockEndpoint("3");

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await setInputValue(
      user,
      "NewEvaluationForm.field.numberOfTestCases.label",
      "",
    );

    await clickSubmitButton(user);

    await expectInputError(
      "NewEvaluationForm.field.executionName.label",
      "formError.required",
    );

    await expectComboBoxError(
      "NewEvaluationForm.field.catalogId.label",
      "formError.required",
    );

    await expectComboBoxError(
      "NewEvaluationForm.field.endpointId.label",
      "formError.required",
    );

    await expectInputError(
      "NewEvaluationForm.field.numberOfTestCases.label",
      'formError.min - {"min":1}',
    );
  });

  it("should preselect catalog if provided and disable combobox", async () => {
    mockAllMetrics();
    mockAllCatalogs(["1", "2", "3"]);
    mockCatalog("2");
    mockAllEndpoints(["1", "2", "3"]);
    mockEndpoint("3");

    const page = await createPage({ catalog: "2" });

    render(page, { wrapper: createPageWrapper() });

    await waitFor(() =>
      expectComboBoxValue(
        "NewEvaluationForm.field.catalogId.label",
        "catalog_2",
      ),
    );

    expect(
      within(
        await getComboBoxBase("NewEvaluationForm.field.catalogId.label"),
      ).getByRole("combobox"),
    ).toBeDisabled();
  });

  it.each([
    {
      origin: StartEvalOrigin.CATALOG,
      catalog: "1",
      returnUrl: qaCatalogDetailPage("1").href,
    },
    {
      origin: StartEvalOrigin.CATALOGS,
      returnUrl: qaCatalogsPage.href,
    },
    {
      origin: StartEvalOrigin.EVALUATIONS,
      returnUrl: evaluationsPage.href,
    },
  ])(
    "should return to $origin on cancel click",
    async ({ origin, returnUrl, catalog }) => {
      const user = userEvent.setup();

      mockAllMetrics();
      mockAllCatalogs(["1", "2", "3"]);
      mockCatalog("2");
      mockAllEndpoints(["1", "2", "3"]);
      mockEndpoint("3");

      const page = await createPage({ origin, catalog });

      render(page, { wrapper: createPageWrapper() });

      await formWizardClickCancel(user);

      expect(mockRouter.push).toHaveBeenCalledWith(returnUrl);
    },
  );

  const createPage = (
    params: { catalog?: string; origin?: StartEvalOrigin } = {},
  ) => Page({ searchParams: Promise.resolve({ ...params }) });

  const mockAllMetrics = () => {
    vi.mocked(metricsGetAll).mockResolvedValue(
      successfulServiceResponse(allMetrics),
    );
  };

  const mockCatalog = (catalogId: string) => {
    vi.mocked(qaCatalogGet).mockResolvedValue(
      successfulServiceResponse(createCatalog(catalogId)),
    );
  };

  const mockAllCatalogs = (catalogIds: string[]) => {
    vi.mocked(qaCatalogGetAll).mockResolvedValue(
      successfulServiceResponse(
        catalogIds.map(createCatalog).map<QaCatalogPreview>((catalog) => ({
          id: catalog.id,
          name: catalog.name,
          createdAt: catalog.createdAt,
          updatedAt: catalog.updatedAt,
          status: catalog.status,
          length: 3,
          revision: 0,
        })),
      ),
    );
  };

  const mockEndpoint = (endpointId: string) => {
    vi.mocked(llmEndpointsGet).mockResolvedValue(
      successfulServiceResponse(createEndpoint(endpointId)),
    );
  };

  const mockAllEndpoints = (endpoitnIds: string[]) => {
    vi.mocked(llmEndpointsGetAll).mockResolvedValue(
      successfulServiceResponse(endpoitnIds.map(createEndpoint)),
    );
  };

  const mockEvaluationCreate = () => {
    const evaluation: RagEvalBackendEvalEvaluationsModelsEvaluationResult = {
      id: "1",
      name: "Test Execution",
      createdAt: "2021-09-01T00:00:00Z",
      status: EvaluationStatus.PENDING,
      version: 0,
    };

    vi.mocked(evaluationsPost).mockResolvedValue(
      successfulServiceResponse(evaluation),
    );

    return evaluation;
  };

  const createCatalog = (id: string): QaCatalog => ({
    id: id,
    name: `catalog_${id}`,
    createdAt: "2021-09-01T00:00:00Z",
    updatedAt: "2021-09-01T00:00:00Z",
    status: QaCatalogStatus.READY,
    revision: 0,
  });

  const createEndpoint = (id: string): LlmEndpoint => ({
    id,
    name: `endpoint_${id}`,
    createdAt: "2021-09-01T00:00:00Z",
    updatedAt: "2021-09-01T00:00:00Z",
    version: 1,
    supportedFeatures: Object.values(PluginFeature),
    configuration: {
      type: "C4",
      configurationId: 1,
      endpoint: "",
      maxRetries: 3,
      parallelQueries: 4,
      requestTimeout: 1000,
    },
  });

  const clickSubmitButton = async (user: UserEvent) => {
    await user.click(
      await screen.findByRole("button", {
        name: "NewEvaluationFormWizard.submitLabel",
      }),
    );
  };
});

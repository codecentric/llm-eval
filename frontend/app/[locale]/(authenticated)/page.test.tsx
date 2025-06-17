import "@/app/test-utils/mock-intl";
import "@/app/test-utils/mock-router";

import { render, screen, within } from "@testing-library/react";

import {
  DashboardData,
  dashboardGetData,
  DashboardStatistics,
} from "@/app/client";
import { createPageWrapper } from "@/app/test-utils/page-wrapper";
import { successfulServiceResponse } from "@/app/test-utils/service-call";
import { waitForPageRender } from "@/app/test-utils/wait-for-page";

import { evaluationPage } from "./eval/[evaluationId]/page-info";
import Page from "./page";
import { homePage } from "./page-info";
import { qaCatalogDetailPage } from "./qa-catalogs/[catalogId]/page-info";

vi.mock("@/app/client");

describe("Home Page", () => {
  const completeDashboardData: DashboardData = {
    statistics: {
      numberOfCatalogs: 5,
      numberOfEvaluations: 10,
    },
    lastEvaluation: {
      id: "eval10",
      name: "Last Evaluation Name",
      createdAt: "2021-01-01T00:00:00Z",
      metricResults: [
        {
          id: "metric1",
          name: "Metric 1",
          type: "G_EVAL",
          total: 10,
          errors: 2,
          failures: 3,
          successes: 5,
        },
      ],
      catalogHistory: {
        catalogId: "catalog1",
        catalogName: "Catalog 1",
        evaluationResults: [
          {
            id: "eval1",
            name: "Evaluation 1",
            createdAt: "2021-01-01T00:00:00Z",
            metricResults: [
              {
                id: "metric1",
                name: "Metric 1",
                type: "G_EVAL",
                total: 10,
                successes: 5,
                failures: 3,
                errors: 2,
              },
            ],
          },
        ],
      },
    },
  };

  it("should render last evaluation with catalog history", async () => {
    vi.mocked(dashboardGetData).mockResolvedValue(
      successfulServiceResponse(completeDashboardData),
    );

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await waitForPageRender(homePage);

    expectStatistics(completeDashboardData.statistics);

    const nameLink = withinLastEvaluationCard().getByRole("link", {
      name: completeDashboardData.lastEvaluation!.name,
    });

    expect(nameLink).toBeInTheDocument();
    expect(nameLink).toHaveAttribute(
      "href",
      evaluationPage({ evaluationId: completeDashboardData.lastEvaluation!.id })
        .href,
    );

    const catalogLink = withinLastEvaluationCard().getByRole("link", {
      name: completeDashboardData.lastEvaluation!.catalogHistory!.catalogName,
    });

    expect(catalogLink).toBeInTheDocument();
    expect(catalogLink).toHaveAttribute(
      "href",
      qaCatalogDetailPage(
        completeDashboardData.lastEvaluation!.catalogHistory!.catalogId,
      ).href,
    );

    expect(
      withinLastEvaluationCard().getByText(
        "DashboardLastEvaluationCard.category.catalogHistory",
      ),
    ).toBeInTheDocument();
  });

  it("should render last evaluation without catalog", async () => {
    vi.mocked(dashboardGetData).mockResolvedValue(
      successfulServiceResponse({
        ...completeDashboardData,
        lastEvaluation: {
          ...completeDashboardData.lastEvaluation!,
          catalogHistory: null,
        },
      }),
    );

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await waitForPageRender(homePage);

    expectStatistics(completeDashboardData.statistics);

    const nameLink = withinLastEvaluationCard().getByRole("link", {
      name: completeDashboardData.lastEvaluation!.name,
    });

    expect(nameLink).toBeInTheDocument();
    expect(nameLink).toHaveAttribute(
      "href",
      evaluationPage({ evaluationId: completeDashboardData.lastEvaluation!.id })
        .href,
    );

    const catalogLink = withinLastEvaluationCard().queryByRole("link", {
      name: completeDashboardData.lastEvaluation!.catalogHistory!.catalogName,
    });

    expect(catalogLink).not.toBeInTheDocument();

    expect(
      withinLastEvaluationCard().queryByText(
        "DashboardLastEvaluationCard.category.catalogHistory",
      ),
    ).not.toBeInTheDocument();
  });

  it("should render without last evaluation", async () => {
    vi.mocked(dashboardGetData).mockResolvedValue(
      successfulServiceResponse({
        ...completeDashboardData,
        lastEvaluation: null,
      }),
    );

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    await waitForPageRender(homePage);

    expectStatistics(completeDashboardData.statistics);

    expect(
      withinLastEvaluationCard().getByText(
        "DashboardLastEvaluationCard.noEvaluation",
      ),
    ).toBeInTheDocument();
  });

  const withinLastEvaluationCard = () => {
    const lastEvaluationCard = screen.getByRole("region", {
      name: "DashboardLastEvaluationCard.title",
    });

    expect(lastEvaluationCard).toBeInTheDocument();

    return within(lastEvaluationCard);
  };

  const expectStatistics = (statistics: DashboardStatistics) => {
    const statisticsCard = screen.getByRole("region", {
      name: "DashboardStatisticsCard.title",
    });

    expect(statisticsCard).toBeInTheDocument();

    expect(
      within(
        within(statisticsCard).getByRole("region", {
          name: "DashboardStatisticsCard.catalogs",
        }),
      ).getByText(statistics.numberOfCatalogs.toString()),
    ).toBeInTheDocument();

    expect(
      within(
        within(statisticsCard).getByRole("region", {
          name: "DashboardStatisticsCard.evaluations",
        }),
      ).getByText(statistics.numberOfEvaluations.toString()),
    ).toBeInTheDocument();
  };

  const createPage = () => Page({ params: Promise.resolve({ locale: "en" }) });
});

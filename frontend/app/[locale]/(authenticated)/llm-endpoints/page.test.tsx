import "@/app/test-utils/mock-toast";

import { addToast } from "@heroui/react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  LlmEndpoint,
  llmEndpointsDelete,
  llmEndpointsGetAll,
} from "@/app/client";
import { createPageWrapper } from "@/app/test-utils/page-wrapper";
import { successfulServiceResponse } from "@/app/test-utils/service-call";
import { EditOrigin } from "@/app/types/edit-origin";

import { llmEndpointEditPage } from "./[endpointId]/edit/page-info";
import { llmEndpointDetailsPage } from "./[endpointId]/page-info";
import { newLlmEndpointPage } from "./new/page-info";
import Page from "./page";

vi.mock("@/app/client");
const mockedLlmEndpointsGetAll = vi.mocked(llmEndpointsGetAll);
const mockedLlmEndpointsDelete = vi.mocked(llmEndpointsDelete);

describe("LLM Endpoints Page", () => {
  const endpoints: LlmEndpoint[] = [
    {
      id: "1",
      createdAt: "2021-01-01T00:00:00Z",
      updatedAt: "2021-01-01T00:00:00Z",
      version: 1,
      name: "Endpoint 1",
      configuration: {
        type: "AZURE_OPENAI",
        apiVersion: "1",
        deployment: "X",
        endpoint: "https://example.com",
        maxRetries: 10,
        parallelQueries: 5,
        requestTimeout: 1000,
        language: null,
      },
      supportedFeatures: [],
    },
    {
      id: "2",
      createdAt: "2021-01-01T00:00:00Z",
      updatedAt: "2021-01-01T00:00:00Z",
      version: 1,
      name: "Endpoint 2",
      configuration: {
        type: "OPENAI",
        baseUrl: "https://example.com",
        model: "model",
        temperature: 1,
        maxRetries: 10,
        parallelQueries: 5,
        requestTimeout: 1000,
        language: null,
      },
      supportedFeatures: [],
    },
  ];

  it("should render endpoints", async () => {
    mockedLlmEndpointsGetAll.mockResolvedValue(
      successfulServiceResponse(endpoints),
    );

    const page = await Page();

    render(page, { wrapper: createPageWrapper() });

    const table = await screen.findByRole("grid");

    expect(table).toBeInTheDocument();

    const rows = screen.getAllByRole("row");

    expect(rows).toHaveLength(3);

    endpoints.forEach((endpoint, index) => {
      const withinRow = within(rows[index + 1]);

      expect(withinRow.getByText(endpoint.name)).toBeInTheDocument();
      expect(
        withinRow.getByRole("menuitem", {
          name: "LLMEndpointsTable.actions.view",
        }),
      ).toHaveAttribute("href", llmEndpointDetailsPage(endpoint.id).href);
      expect(
        withinRow.getByRole("menuitem", {
          name: "LLMEndpointsTable.actions.edit",
        }),
      ).toHaveAttribute(
        "href",
        llmEndpointEditPage({
          endpointId: endpoint.id,
          origin: EditOrigin.LIST,
        }).href,
      );
      expect(
        withinRow.getByRole("menuitem", {
          name: "LLMEndpointsTable.actions.delete",
        }),
      ).toBeInTheDocument();
    });
  });

  it("shound have create new endpoint button", async () => {
    mockedLlmEndpointsGetAll.mockResolvedValue(successfulServiceResponse([]));

    const page = await Page();

    render(page, { wrapper: createPageWrapper() });

    expect(
      screen.getByRole("button", { name: "LLMEndpointsPage.new" }),
    ).toHaveAttribute("href", newLlmEndpointPage.href);
  });

  it("should delete an endpoint", async () => {
    const user = userEvent.setup();

    mockedLlmEndpointsGetAll.mockResolvedValue(
      successfulServiceResponse(endpoints),
    );
    mockedLlmEndpointsDelete.mockResolvedValue(
      successfulServiceResponse(undefined),
    );

    const page = await Page();

    render(page, { wrapper: createPageWrapper() });

    const deleteButton = (
      await screen.findAllByRole("menuitem", {
        name: "LLMEndpointsTable.actions.delete",
      })
    )[0];

    await user.click(deleteButton);

    const confirmDeleteButton = await screen.findByRole("button", {
      name: "useEndpointDelete.deleteDialog.okButton",
    });

    await user.click(confirmDeleteButton);

    await waitFor(() => {
      expect(llmEndpointsDelete).toHaveBeenCalledWith(
        expect.objectContaining({
          body: { version: endpoints[0].version },
          path: {
            llm_endpoint_id: endpoints[0].id,
          },
        }),
      );
    });

    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith({
        title: "useEndpointDelete.delete.success",
        color: "success",
      });
    });
  });
});

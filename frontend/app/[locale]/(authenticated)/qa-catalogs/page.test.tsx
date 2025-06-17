import "@/app/test-utils/mock-router";
import "@/app/test-utils/mock-toast";
import "@/app/test-utils/mock-intl";

import { addToast } from "@heroui/react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import { newEvaluationPage } from "@/app/[locale]/(authenticated)/eval/new/page-info";
import { StartEvalOrigin } from "@/app/[locale]/(authenticated)/eval/types/start-eval-origin";
import { qaCatalogDetailPage } from "@/app/[locale]/(authenticated)/qa-catalogs/[catalogId]/page-info";
import { generateQACatalogPage } from "@/app/[locale]/(authenticated)/qa-catalogs/generate/page-info";
import Page from "@/app/[locale]/(authenticated)/qa-catalogs/page";
import {
  QaCatalog,
  qaCatalogDelete,
  qaCatalogGetAll,
  QaCatalogPreview,
  QaCatalogStatus,
  qaCatalogUpload,
} from "@/app/client";
import {
  createFiles,
  createMockFileList,
  setInputValue,
  uploadFiles,
} from "@/app/test-utils/forms";
import { createPageWrapper } from "@/app/test-utils/page-wrapper";
import { successfulServiceResponse } from "@/app/test-utils/service-call";

vi.mock("@/app/client");

describe("Catalog Page", () => {
  const catalogs: QaCatalogPreview[] = [
    {
      id: "cat-1",
      createdAt: "2021-01-01T00:00:00Z",
      updatedAt: "2021-01-01T00:00:00Z",
      name: "Catalog One",
      length: 10,
      status: QaCatalogStatus.READY,
      revision: 1,
    },
    {
      id: "cat-2",
      createdAt: "2021-02-01T00:00:00Z",
      updatedAt: "2021-02-01T00:00:00Z",
      name: "Catalog Two",
      length: 10,
      status: QaCatalogStatus.READY,
      revision: 1,
    },
  ];

  const newCatalog: QaCatalog = {
    id: "cat-3",
    status: QaCatalogStatus.READY,
    name: "Catalog Three",
    createdAt: "2021-03-01T00:00:00Z",
    updatedAt: "2021-03-01T00:00:00Z",
    revision: 1,
  };

  beforeEach(() => {
    vi.mocked(qaCatalogGetAll).mockReset();
  });

  it("should render catalogs", async () => {
    mockQaCatalogGetAll();

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    const table = await screen.findByRole("grid");

    expect(table).toBeInTheDocument();

    const rows = screen.getAllByRole("row");

    expect(rows).toHaveLength(catalogs.length + 1);

    catalogs.forEach((catalog, index) => {
      const withinRow = within(rows[index + 1]);

      expect(withinRow.getByText(catalog.name)).toBeInTheDocument();
      expect(
        withinRow.getByRole("menuitem", {
          name: "QACatalogPreviewTable.action.detail",
        }),
      ).toHaveAttribute("href", qaCatalogDetailPage(catalog.id).href);
      expect(
        withinRow.getByRole("menuitem", {
          name: "QACatalogPreviewTable.action.runExecution",
        }),
      ).toHaveAttribute(
        "href",
        newEvaluationPage({
          catalogId: catalog.id,
          origin: StartEvalOrigin.CATALOGS,
        }).href,
      );
      expect(
        withinRow.getByRole("menuitem", {
          name: "QACatalogPreviewTable.action.delete",
        }),
      ).toBeInTheDocument();
    });
  });

  it("should delete a catalog", async () => {
    const user = userEvent.setup();

    mockQaCatalogGetAll();

    vi.mocked(qaCatalogDelete).mockResolvedValue(
      successfulServiceResponse({ previousRevisionId: "1" }),
    );

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    const deleteButton = (
      await screen.findAllByRole("menuitem", {
        name: "QACatalogPreviewTable.action.delete",
      })
    )[0];

    await user.click(deleteButton);

    const confirmDeleteButton = await screen.findByRole("button", {
      name: "useQaCatalogDelete.deleteDialog.okButton",
    });

    await user.click(confirmDeleteButton);

    await waitFor(() => {
      expect(qaCatalogDelete).toHaveBeenCalledWith(
        expect.objectContaining({
          path: {
            catalog_id: catalogs[0].id,
          },
        }),
      );
    });

    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith({
        title: "useQaCatalogDelete.delete.success",
        color: "success",
      });
    });
  });

  it("should have navigate to generation action", async () => {
    mockQaCatalogGetAll();

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    expect(
      screen.getByRole("button", {
        name: "QACatalogPage.navigateToGeneration",
      }),
    ).toHaveAttribute("href", generateQACatalogPage.href);
  });

  it("should upload new catalog successfully", async () => {
    const user = userEvent.setup();

    mockQaCatalogGetAll();
    vi.mocked(qaCatalogUpload).mockResolvedValue(
      successfulServiceResponse(newCatalog),
    );

    const page = await createPage();

    render(page, { wrapper: createPageWrapper() });

    const uploadModalButton = screen.getByRole("button", {
      name: "UpdateUploadCatalogModal.pageActionButton.upload",
    });

    await user.click(uploadModalButton);

    expect(
      await screen.findByText("UpdateUploadCatalogModal.header"),
    ).toBeInTheDocument();

    const file = createFiles(["raw-catalog-1.csv"])[0];

    await uploadFiles(
      "UpdateUploadCatalogModal.chooseFile",
      createMockFileList([file]),
    );

    await setInputValue(
      user,
      "UpdateUploadCatalogModal.catalogName",
      newCatalog.name,
    );

    const submitButton = await screen.findByRole("button", {
      name: "UpdateUploadCatalogModal.uploadButton",
    });

    await user.click(submitButton);

    await waitFor(() => {
      expect(qaCatalogUpload).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            file: file,
            name: newCatalog.name,
          },
        }),
      );
    });

    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith({
        title:
          'UpdateUploadCatalogModal.catalogCreated - {"name":"Catalog Three"}',
        color: "success",
      });
    });
  });

  const createPage = () => Page({ params: Promise.resolve({ locale: "en" }) });

  const mockQaCatalogGetAll = () => {
    vi.mocked(qaCatalogGetAll).mockResolvedValue(
      successfulServiceResponse(catalogs),
    );
  };
});

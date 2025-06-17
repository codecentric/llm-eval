import "@/app/test-utils/mock-intl";
import "@/app/test-utils/mock-router";
import "@/app/test-utils/mock-toast";

import { addToast } from "@heroui/react";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";

import CatalogDetailPage from "@/app/[locale]/(authenticated)/qa-catalogs/[catalogId]/page";
import { qaCatalogDetailPage } from "@/app/[locale]/(authenticated)/qa-catalogs/[catalogId]/page-info";
import {
  QaCatalog,
  qaCatalogDownload,
  qaCatalogGet,
  qaCatalogGetCatalogQaPairs,
  qaCatalogGetHistory,
  qaCatalogGetPreview,
  QaCatalogStatus,
  qaCatalogUpdate,
  QaCatalogVersionHistory,
  QaCatalogVersionHistoryItem,
  QaPair,
} from "@/app/client";
import {
  createFiles,
  createMockFileList,
  selectFromDropDown,
  uploadFiles,
} from "@/app/test-utils/forms";
import { createPageWrapper } from "@/app/test-utils/page-wrapper";
import { successfulServiceResponse } from "@/app/test-utils/service-call";

vi.mock("@/app/client");

describe("Catalog Detail Page", () => {
  const catalog: QaCatalog = {
    id: "cat-1",
    name: "Catalog One",
    updatedAt: "2021-01-01T00:00:00Z",
    createdAt: "2021-01-01T00:00:00Z",
    status: QaCatalogStatus.READY,
    error: null,
    revision: 1,
  };

  const updatedCatalog: QaCatalog = {
    id: "cat-2",
    name: "Catalog One (Updated)",
    updatedAt: "2021-01-02T00:00:00Z",
    createdAt: "2021-01-01T00:00:00Z",
    status: QaCatalogStatus.READY,
    error: null,
    revision: 2,
  };

  const catalogHistory: QaCatalogVersionHistory = {
    versions: [catalog, updatedCatalog].map(
      (c): QaCatalogVersionHistoryItem => ({
        versionId: c.id,
        revision: c.revision,
        createdAt: c.createdAt,
      }),
    ),
  };

  const qaPairs: QaPair[] = [
    {
      id: "qa-1",
      question: "What is QA?",
      expectedOutput: "Quality Assurance",
      contexts: [],
      metaData: {},
    },
    {
      id: "qa-2",
      question: "What is test?",
      expectedOutput: "Verification",
      contexts: [],
      metaData: {},
    },
  ];

  // Helper functions
  const renderPage = async (catalog: QaCatalog) => {
    const page = await CatalogDetailPage({
      params: Promise.resolve({ locale: "en", catalogId: catalog.id }),
    });
    const utils = render(page, { wrapper: createPageWrapper() });

    // Wait for page to render completely
    await waitFor(async () => {
      const pageInfo = qaCatalogDetailPage(catalog.id, catalog.name);
      expect(
        screen.getByText(
          `${pageInfo.name} - ${JSON.stringify(pageInfo.nameArgs)}`,
        ),
      ).toBeInTheDocument();
    });

    return utils;
  };

  const expectRowHasStyle = (row: HTMLElement, styleClasses: string[]) => {
    styleClasses.forEach((styleClass) => {
      expect(row).toHaveClass(styleClass);
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(qaCatalogGetPreview).mockReset();
    vi.mocked(qaCatalogUpdate).mockReset();
    vi.mocked(qaCatalogDownload).mockReset();
    vi.mocked(qaCatalogGetCatalogQaPairs).mockReset();

    vi.mocked(qaCatalogGet).mockResolvedValue(
      successfulServiceResponse(catalog),
    );
    vi.mocked(qaCatalogGetCatalogQaPairs).mockResolvedValue(
      successfulServiceResponse(qaPairs),
    );
  });

  it("should render catalog name correctly", async () => {
    await renderPage(catalog);
  });

  it("should render qa pairs correctly", async () => {
    await renderPage(catalog);

    const table = screen.getByRole("grid");
    expect(table).toBeInTheDocument();

    const rows = screen.getAllByRole("row");
    expect(rows).toHaveLength(qaPairs.length + 1);

    qaPairs.forEach((pair, index) => {
      const withinRow = within(rows[index + 1]);
      expect(withinRow.getByText(pair.question)).toBeInTheDocument();
      expect(withinRow.getByText(pair.expectedOutput)).toBeInTheDocument();
    });
  });

  it("should update qa catalog correctly", async () => {
    const user = userEvent.setup();
    vi.mocked(qaCatalogUpdate).mockResolvedValue(
      successfulServiceResponse(updatedCatalog),
    );

    await renderPage(catalog);

    const updateButton = screen.getByRole("button", {
      name: "UpdateUploadCatalogModal.pageActionButton.update",
    });

    await user.click(updateButton);

    const file = createFiles(["raw-catalog-1-updated.csv"])[0];

    await uploadFiles(
      "UpdateUploadCatalogModal.chooseFile",
      createMockFileList([file]),
    );

    const submitButton = screen.getByRole("button", {
      name: "UpdateUploadCatalogModal.uploadButton",
    });

    await user.click(submitButton);

    await waitFor(() => {
      expect(qaCatalogUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          body: { file: file },
          path: { catalog_id: catalog.id },
        }),
      );
    });

    await waitFor(() => {
      expect(addToast).toHaveBeenCalledWith({
        title:
          'UpdateUploadCatalogModal.catalogUpdated - {"name":"Catalog One (Updated)"}',
        color: "success",
      });
    });

    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith(
        qaCatalogDetailPage(updatedCatalog.id).href,
      );
    });
  });

  it("should go to previous version correctly", async () => {
    vi.mocked(qaCatalogGetHistory).mockResolvedValue(
      successfulServiceResponse(catalogHistory),
    );

    vi.mocked(qaCatalogGet).mockResolvedValue(
      successfulServiceResponse(updatedCatalog),
    );

    await renderPage(updatedCatalog);

    const versionHistoryDropdownButton = screen.getByTestId(
      "history-dropdown-btn",
    );

    // Open dropdown before iterating
    const user = userEvent.setup();
    await user.click(versionHistoryDropdownButton);

    for (const version of catalogHistory.versions) {
      const item = await screen.findByRole("menuitemradio", {
        name: `${version.revision} - ${mockFormatter.dateTime(new Date(version.createdAt))}`,
      });

      expect(item).toHaveAttribute(
        "href",
        qaCatalogDetailPage(version.versionId).href,
      );
    }
  });

  it("should download catalog correctly", async () => {
    const user = userEvent.setup();

    vi.mocked(qaCatalogDownload).mockResolvedValue(
      successfulServiceResponse({
        downloadUrl: "data",
        filename: "catalog.csv",
      }),
    );

    await renderPage(catalog);

    const downloadButton = screen.getByRole("button", {
      name: "DownloadQACatalogModal.action.download",
    });

    await user.click(downloadButton);

    await selectFromDropDown(
      user,
      "DownloadQACatalogModal.form.fields.format.label",
      "csv",
    );

    await user.click(
      screen.getByLabelText("DownloadQACatalogModal.form.fields.includeAll"),
    );

    const submitDownloadButton = screen.getByRole("button", {
      name: "DownloadQACatalogModal.modal.buttons.submit",
    });

    await user.click(submitDownloadButton);

    await waitFor(() => {
      expect(qaCatalogDownload).toHaveBeenCalledWith(
        expect.objectContaining({
          body: {
            format: "csv",
            parentCatalogId: catalog.id,
            includeAll: true,
            versionIds: null,
          },
        }),
      );
    });
  });

  describe("Rendering", () => {
    it("renders catalog details correctly", async () => {
      await renderPage(catalog);

      const pageTitle = screen.getByRole("heading", { level: 1 });
      expect(pageTitle).toHaveTextContent(catalog.name);
      expect(pageTitle).toHaveTextContent(catalog.status);
    });

    it("renders QA pairs table with correct data", async () => {
      await renderPage(catalog);

      const table = screen.getByRole("grid");
      expect(table).toBeInTheDocument();

      const rows = screen.getAllByRole("row");
      expect(rows).toHaveLength(qaPairs.length + 1); // +1 for header row

      qaPairs.forEach((qaPair, index) => {
        const row = rows[index + 1];
        const withinRow = within(row);

        expect(withinRow.getByText(qaPair.question)).toBeInTheDocument();
        expect(withinRow.getByText(qaPair.expectedOutput)).toBeInTheDocument();

        // Check action buttons
        ["edit", "delete", "undo"].forEach((action) => {
          expect(
            withinRow.getByRole("menuitem", {
              name: `QaPairsTable.action.${action}`,
            }),
          ).toBeInTheDocument();
        });
      });
    });
  });

  describe("Row actions", () => {
    it("marks row as deleted when delete button is clicked", async () => {
      const user = userEvent.setup();
      await renderPage(catalog);

      const rows = screen.getAllByRole("row");
      const firstDataRow = rows[1];

      // Find and click delete button
      const deleteButton = within(firstDataRow).getByRole("menuitem", {
        name: "QaPairsTable.action.delete",
      });
      await user.click(deleteButton);

      // Check that the row is visually marked as deleted
      expectRowHasStyle(firstDataRow, ["line-through", "border-danger-500"]);

      // Verify that undo button is clickable
      const undoButton = within(firstDataRow).getByRole("menuitem", {
        name: "QaPairsTable.action.undo",
      });
      expect(undoButton).not.toHaveAttribute("data-disabled", "true");

      // Verify save button shows pending change count
      const saveButton = screen.getByRole("button", {
        name: /QACatalogPage\.saveAll/,
      });
      expect(saveButton).toHaveTextContent("(1)"); // One pending change
    });

    it("does not create pending changes when editing with no modifications", async () => {
      const user = userEvent.setup();
      await renderPage(catalog);

      const rows = screen.getAllByRole("row");
      const firstDataRow = rows[1];

      // Open edit modal
      const editButton = within(firstDataRow).getByRole("menuitem", {
        name: "QaPairsTable.action.edit",
      });
      await user.click(editButton);

      // Submit form without changes
      const saveButton = screen.getByRole("button", {
        name: "QaPairsTable.save",
      });
      await user.click(saveButton);

      // Verify no pending changes appear
      expect(firstDataRow).not.toHaveClass("border-primary-400");

      // Verify no pending change count on save button
      expect(
        screen.queryByText(/QACatalogPage\.saveAll \(\d+\)/),
      ).not.toBeInTheDocument();
    });

    it("marks row as edited after modifications in edit form", async () => {
      const user = userEvent.setup();
      await renderPage(catalog);

      const rows = screen.getAllByRole("row");
      const firstDataRow = rows[1];

      // Open edit modal
      const editButton = within(firstDataRow).getByRole("menuitem", {
        name: "QaPairsTable.action.edit",
      });
      await user.click(editButton);

      // Modify question field
      const questionInput = screen.getByLabelText("QaPairsTable.question");
      await user.clear(questionInput);
      await user.type(questionInput, "Updated Question");

      // Submit changes
      const saveButton = screen.getByRole("button", {
        name: "QaPairsTable.save",
      });
      await user.click(saveButton);

      // Verify row is marked as edited
      await waitFor(() => {
        expectRowHasStyle(firstDataRow, ["border-l-4", "border-primary-400"]);
      });

      // Verify undo button is enabled
      const undoButton = within(firstDataRow).getByRole("menuitem", {
        name: "QaPairsTable.action.undo",
      });
      expect(undoButton).not.toHaveAttribute("data-disabled", "true");

      // Verify pending change count
      const saveAllButton = screen.getByRole("button", {
        name: /QACatalogPage\.saveAll/,
      });
      expect(saveAllButton).toHaveTextContent("(1)");
    });
  });

  describe("Adding and editing rows", () => {
    it("maintains 'added' styling when editing a newly added row", async () => {
      const user = userEvent.setup();
      await renderPage(catalog);

      // Add new QA pair
      const addButton = screen.getByRole("button", {
        name: "QaPairsTable.addPair",
      });
      await user.click(addButton);

      // Fill out the add form
      const questionInput = screen.getByLabelText("QaPairsTable.question");
      const answerInput = screen.getByLabelText("QaPairsTable.expectedOutput");

      await user.type(questionInput, "New Test Question");
      await user.type(answerInput, "New Test Answer");

      // Submit the form
      const submitAddedButton = screen.getByRole("button", {
        name: "QaPairsTable.add",
      });
      await user.click(submitAddedButton);

      // Find the newly added row (at the top)
      const rows = screen.getAllByRole("row");
      const newRow = rows[1];

      // Check "added" styling
      await waitFor(() => {
        expectRowHasStyle(newRow, ["border-l-4", "border-success-500"]);
      });

      // Verify pending changes count is 1
      const saveAllButton = screen.getByRole("button", {
        name: /QACatalogPage\.saveAll/,
      });
      expect(saveAllButton).toHaveTextContent("(1)");

      // Edit the newly added row
      const editButton = within(newRow).getByRole("menuitem", {
        name: "QaPairsTable.action.edit",
      });
      await user.click(editButton);

      // Change the question
      const editQuestionInput = screen.getByLabelText("QaPairsTable.question");
      await user.clear(editQuestionInput);
      await user.type(editQuestionInput, "Updated New Question");

      // Submit the changes
      const editSaveButton = screen.getByRole("button", {
        name: "QaPairsTable.save",
      });
      await user.click(editSaveButton);

      // Verify the row still has "added" styling (not "edited")
      await waitFor(() => {
        expectRowHasStyle(newRow, ["border-l-4", "border-success-500"]);
        expect(newRow).not.toHaveClass("border-primary-400");
      });

      // Verify pending changes count is still 1
      expect(saveAllButton).toHaveTextContent("(1)");
    });
  });
});

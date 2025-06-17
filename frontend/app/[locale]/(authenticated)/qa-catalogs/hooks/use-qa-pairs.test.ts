import "@/app/test-utils/mock-router";
import "@/app/test-utils/mock-intl";
import "@/app/test-utils/mock-toast";

import { addToast } from "@heroui/react";
import { act, renderHook } from "@testing-library/react";

import {
  NewQaPair,
  qaCatalogEditQaCatalog,
  QaCatalogStatus,
  QaPair,
} from "@/app/client";
import { successfulServiceResponse } from "@/app/test-utils/service-call";

import { CatalogChanges, useQaPairs } from "./use-qa-pairs";

vi.mock("@/app/client");

vi.mock("@tanstack/react-query", () => ({
  useMutation: vi
    .fn()
    .mockImplementation(({ mutationFn, onSuccess, onError }) => ({
      mutateAsync: async (data: CatalogChanges) => {
        try {
          const result = await mutationFn(data);
          if (onSuccess) {
            onSuccess(result, data, undefined);
          }
          return result;
        } catch (error) {
          if (onError) {
            onError(error, data, undefined);
          }
          throw error;
        }
      },
    })),
  useQueryClient: vi.fn().mockReturnValue({
    invalidateQueries: vi.fn(),
  }),
}));

describe("useQaPairs", () => {
  const catalogId = "test-catalog-id";
  const editQaPair: QaPair = {
    question: "Test question",
    expectedOutput: "Test answer",
    contexts: ["context1", "context2"],
    id: "existing-id",
    metaData: {},
  };

  const newQaPair: NewQaPair = {
    question: "new question",
    expectedOutput: "new expected output",
    contexts: ["context1", "context2"],
  };

  const mockedEditQaCatalog = vi.mocked(qaCatalogEditQaCatalog);

  beforeEach(() => {
    vi.clearAllMocks();
    mockedEditQaCatalog.mockResolvedValue(
      successfulServiceResponse({
        id: catalogId,
        name: "Test Catalog",
        revision: 1,
        status: QaCatalogStatus.READY,
        createdAt: "2021-01-01T00:00:00Z",
        updatedAt: "2021-01-01T00:00:00Z",
      }),
    );
  });

  it("should start with empty pending changes", () => {
    const { result } = renderHook(() => useQaPairs(catalogId));

    expect(result.current.pendingChanges).toEqual({});
    expect(result.current.hasPendingChanges).toBe(false);
    expect(result.current.pendingChangesCount).toBe(0);
  });

  it("should add a new QA pair", () => {
    const { result } = renderHook(() => useQaPairs(catalogId));

    act(() => {
      result.current.handleAdd(newQaPair);
    });

    expect(result.current.pendingChangesCount).toBe(1);
    expect(result.current.hasPendingChanges).toBe(true);

    // The change should be of type "add"
    const changeId = Object.keys(result.current.pendingChanges)[0];
    expect(result.current.pendingChanges[changeId].type).toBe("add");
    expect(result.current.pendingChanges[changeId].data).toEqual(newQaPair);
  });

  it("should edit an existing QA pair", () => {
    const { result } = renderHook(() => useQaPairs(catalogId));
    const existingId = "existing-id";
    const updatedData = { ...editQaPair, question: "Updated question" };

    act(() => {
      result.current.handleEdit(editQaPair);
    });

    expect(result.current.pendingChanges[existingId].type).toBe("edit");

    act(() => {
      result.current.handleEdit(updatedData);
    });

    // Should still have one pending change but with updated data
    expect(result.current.pendingChangesCount).toBe(1);
    expect(result.current.pendingChanges[existingId].data).toEqual(updatedData);
  });

  it("should mark a QA pair as deleted", () => {
    const { result } = renderHook(() => useQaPairs(catalogId));
    const existingId = "existing-id";

    act(() => {
      result.current.handleDelete(existingId);
    });

    expect(result.current.pendingChanges[existingId].type).toBe("delete");
    expect(result.current.pendingChangesCount).toBe(1);
  });

  it("should remove a QA pair from pending changes when undo is called", () => {
    const { result } = renderHook(() => useQaPairs(catalogId));
    const existingId = "existing-id";

    act(() => {
      result.current.handleEdit(editQaPair);
    });

    expect(result.current.pendingChangesCount).toBe(1);

    act(() => {
      result.current.handleUndo(existingId);
    });

    expect(result.current.pendingChangesCount).toBe(0);
    expect(result.current.hasPendingChanges).toBe(false);
  });

  it("should remove a newly added QA pair when it's deleted", () => {
    const { result } = renderHook(() => useQaPairs(catalogId));

    act(() => {
      result.current.handleAdd(newQaPair);
    });

    const addedId = Object.keys(result.current.pendingChanges)[0];

    act(() => {
      result.current.handleDelete(addedId);
    });

    // Should remove completely instead of marking as deleted
    expect(result.current.pendingChangesCount).toBe(0);
    expect(result.current.pendingChanges[addedId]).toBeUndefined();
  });

  it("should cancel all pending changes", () => {
    const { result } = renderHook(() => useQaPairs(catalogId));

    act(() => {
      result.current.handleAdd(newQaPair);
      result.current.handleEdit(editQaPair);
      result.current.handleDelete("another-id");
    });

    expect(result.current.pendingChangesCount).toBe(3);
    expect(result.current.hasPendingChanges).toBe(true);

    act(() => {
      result.current.handleCancelAll();
    });

    expect(result.current.pendingChangesCount).toBe(0);
    expect(result.current.hasPendingChanges).toBe(false);
  });

  it("should save all pending changes", async () => {
    const { result } = renderHook(() => useQaPairs(catalogId));

    act(() => {
      result.current.handleAdd(newQaPair);
      result.current.handleEdit(editQaPair);
      result.current.handleDelete("another-id");
    });

    await act(async () => {
      await result.current.handleSaveAll();
    });

    // Check API was called with correct parameters
    expect(mockedEditQaCatalog).toHaveBeenCalledWith(
      expect.objectContaining({
        path: { catalog_id: catalogId },
        body: {
          updates: [editQaPair],
          additions: [newQaPair],
          deletions: ["another-id"],
        },
      }),
    );

    // Pending changes should be cleared after successful save
    expect(result.current.pendingChangesCount).toBe(0);

    // Should show success toast
    expect(addToast).toHaveBeenCalledWith({
      title: "QACatalogPage.changesSaved",
      color: "success",
    });
  });

  it("should handle API errors when saving changes", async () => {
    const { result } = renderHook(() => useQaPairs(catalogId));
    const error = new Error("API Error");

    mockedEditQaCatalog.mockRejectedValueOnce(error);

    act(() => {
      result.current.handleAdd(newQaPair);
    });

    await act(async () => {
      try {
        await result.current.handleSaveAll();
      } catch (e) {
        console.error(e);
      }
    });

    // Should show error toast
    expect(addToast).toHaveBeenCalledWith({
      title: "QACatalogPage.saveError",
      color: "danger",
    });

    // Pending changes should remain after failed save
    expect(result.current.pendingChangesCount).toBe(1);
  });
});

import { renderHook, waitFor } from "@testing-library/react";

import { useRecursiveTimeout } from "@/app/hooks/use-recursive-timeout";

describe("useRecursiveTimeout", () => {
  it("should trigger action after timeout", async () => {
    const action = vi.fn();

    renderHook(() => useRecursiveTimeout(100, action));

    await waitFor(() => expect(action).toHaveBeenCalled());
  });
});

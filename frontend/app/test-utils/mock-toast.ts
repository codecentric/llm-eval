vi.mock("@heroui/react", async (importOriginal) => {
  return {
    ...(await importOriginal<typeof import("@heroui/react")>()),
    addToast: vi.fn(),
  };
});

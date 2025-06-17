import { useRouter } from "@/i18n/routing";

vi.mock("@/i18n/routing", async (importOriginal) => {
  return {
    ...(await importOriginal<typeof import("@/i18n/routing")>()),
    useRouter: vi.fn(),
  };
});

const router = {
  replace: vi.fn(),
  push: vi.fn(),
} as unknown as ReturnType<typeof useRouter>;

vi.mocked(useRouter).mockReturnValue(router);

declare global {
  /* eslint-disable-next-line no-var */ // noinspection ES6ConvertVarToLetConst
  var mockRouter: typeof router;
}

global.mockRouter = router;

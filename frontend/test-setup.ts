import "@testing-library/jest-dom/vitest";
import "vitest-canvas-mock";
import { configure } from "@testing-library/react";
import createFetchMock from "vitest-fetch-mock";
import "@/app/test-utils/mock-echarts";

const fetchMocker = createFetchMock(vi);

// adds the 'fetchMock' global variable and rewires 'fetch' global to call 'fetchMock' instead of the real implementation
fetchMocker.enableMocks();

// changes default behavior of fetchMock to use the real 'fetch' implementation and not mock responses
fetchMocker.dontMock();

configure({ asyncUtilTimeout: 5000 });

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

beforeEach(() => {
  window.scrollTo = vi.fn();
});

afterEach(() => {
  vi.mocked(window.scrollTo).mockClear();
});

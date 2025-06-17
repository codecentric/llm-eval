import { NextRequest } from "next/server";

import { GET, POST } from "@/app/api/auth/[...nextauth]/route";
import { handlers } from "@/auth";

vi.mock("@/auth", () => ({
  handlers: {
    GET: vi.fn(),
    POST: vi.fn(),
  },
}));

describe("/auth/*", () => {
  describe.each([
    ["POST", POST, handlers.POST],
    ["GET", GET, handlers.GET],
  ])("testing %s", (_, call, handler) => {
    const mockResponse = new Response();

    it("should call auth handler with original request if AUTH_TRUST_HOST is false", async () => {
      process.env.AUTH_TRUST_HOST = "false";

      vi.mocked(handler).mockResolvedValue(mockResponse);

      const request = new NextRequest("http://url");

      const response = await call(request);

      expect(response).toBe(mockResponse);
      expect(handler).toHaveBeenCalledWith(request);
    });

    it("should call auth handler with original request if x-forwarded-proto header is missing", async () => {
      process.env.AUTH_TRUST_HOST = "true";

      vi.mocked(handler).mockResolvedValue(mockResponse);

      const request = new NextRequest("http://url", {
        headers: { "x-forwarded-host": "host" },
      });

      const response = await call(request);

      expect(response).toBe(mockResponse);
      expect(handler).toHaveBeenCalledWith(request);
    });

    it("should call auth handler with original request if x-forwarded-host header is missing", async () => {
      process.env.AUTH_TRUST_HOST = "true";

      vi.mocked(handler).mockResolvedValue(mockResponse);

      const request = new NextRequest("http://url", {
        headers: {
          "x-forwarded-proto": "https",
        },
      });

      const response = await call(request);

      expect(response).toBe(mockResponse);
      expect(handler).toHaveBeenCalledWith(request);
    });

    it("should call auth handler with forwarded url", async () => {
      process.env.AUTH_TRUST_HOST = "true";

      vi.mocked(handler).mockResolvedValue(mockResponse);

      const request = new NextRequest("http://url/xxx", {
        headers: {
          "x-forwarded-proto": "https",
          "x-forwarded-host": "host",
        },
      });

      const response = await call(request);

      expect(response).toBe(mockResponse);
      expect(handler).toHaveBeenCalledWith(
        expect.toSatisfy((req: NextRequest) => req.url === "https://host/xxx"),
      );
    });
  });
});

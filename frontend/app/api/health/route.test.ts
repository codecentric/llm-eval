import { GET } from "@/app/api/health/route";

describe("/health", () => {
  it("should return OK", async () => {
    const res = await GET();

    expect(res.status).toBe(200);
    expect(await res.text()).toEqual("OK");
  });
});

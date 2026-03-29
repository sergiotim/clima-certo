import { POST } from "@/app/api/unsubscribe/route";

function makeRequest(body: unknown, headers: HeadersInit = {}): Request {
  return new Request("http://localhost/api/unsubscribe", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/unsubscribe", () => {
  it("returns 403 when origin is not trusted", async () => {
    const request = makeRequest(
      { token: "abc.def" },
      {
        origin: "https://malicioso.com",
        host: "localhost",
      }
    );

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload.error).toMatch(/Origem/);
  });

  it("returns 400 when token is blank", async () => {
    const request = makeRequest(
      { token: "   " },
      {
        origin: "http://localhost",
        host: "localhost",
        "x-forwarded-proto": "http",
        "x-forwarded-for": "203.0.113.10",
      }
    );

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toMatch(/Token inv/);
  });

  it("returns 200 with safe message for unknown token", async () => {
    const request = makeRequest(
      { token: "invalid-token-without-dot" },
      {
        origin: "http://localhost",
        host: "localhost",
        "x-forwarded-proto": "http",
        "x-forwarded-for": "203.0.113.11",
      }
    );

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.success).toBe(true);
  });

  it("applies rate limit after repeated attempts from same IP", async () => {
    const headers = {
      origin: "http://localhost",
      host: "localhost",
      "x-forwarded-proto": "http",
      "x-forwarded-for": "203.0.113.12",
    };

    for (let i = 0; i < 10; i += 1) {
      const response = await POST(makeRequest({ token: "" }, headers));
      expect([400, 429]).toContain(response.status);
    }

    const eleventhResponse = await POST(makeRequest({ token: "" }, headers));
    expect(eleventhResponse.status).toBe(429);
    expect(eleventhResponse.headers.get("Retry-After")).toBeTruthy();
  });
});

import { POST } from "@/app/api/subscribe/route";

function makeRequest(body: unknown, headers: HeadersInit = {}): Request {
  return new Request("http://localhost/api/subscribe", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe("POST /api/subscribe", () => {
  it("returns 403 when origin is not trusted", async () => {
    const request = makeRequest(
      { email: "test@example.com", city: "Sao Paulo", country: "BR" },
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

  it("returns 400 when email and city are missing", async () => {
    const request = makeRequest(
      { email: "", city: "" },
      {
        origin: "http://localhost",
        host: "localhost",
        "x-forwarded-proto": "http",
        "x-forwarded-for": "198.51.100.10",
      }
    );

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toMatch(/obrigat/i);
  });

  it("returns 400 for malformed email", async () => {
    const request = makeRequest(
      { email: "email-invalido", city: "Sao Paulo", country: "BR" },
      {
        origin: "http://localhost",
        host: "localhost",
        "x-forwarded-proto": "http",
        "x-forwarded-for": "198.51.100.11",
      }
    );

    const response = await POST(request);
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toMatch(/email v/i);
  });

  it("applies rate limit after repeated attempts from same IP", async () => {
    const headers = {
      origin: "http://localhost",
      host: "localhost",
      "x-forwarded-proto": "http",
      "x-forwarded-for": "198.51.100.12",
    };

    for (let i = 0; i < 8; i += 1) {
      const response = await POST(makeRequest({ email: "", city: "" }, headers));
      expect([400, 429]).toContain(response.status);
    }

    const ninthResponse = await POST(makeRequest({ email: "", city: "" }, headers));
    expect(ninthResponse.status).toBe(429);
    expect(ninthResponse.headers.get("Retry-After")).toBeTruthy();
  });
});

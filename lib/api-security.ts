import { createHmac, timingSafeEqual } from "crypto";

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

function base64UrlEncode(value: string): string {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlDecode(value: string): string {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized + "=".repeat((4 - (normalized.length % 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf8");
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

export function isTrustedSameOriginRequest(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") || "https";

  // Non-browser callers (no Origin) are allowed, but browser calls are checked.
  if (!origin) {
    return true;
  }

  if (!host) {
    return false;
  }

  try {
    const originUrl = new URL(origin);
    return `${originUrl.protocol}//${originUrl.host}` === `${proto}://${host}`;
  } catch {
    return false;
  }
}

export function enforceRateLimit(params: {
  key: string;
  limit: number;
  windowMs: number;
}): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const current = buckets.get(params.key);

  if (!current || current.resetAt <= now) {
    buckets.set(params.key, { count: 1, resetAt: now + params.windowMs });
    return { allowed: true };
  }

  if (current.count >= params.limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((current.resetAt - now) / 1000)),
    };
  }

  current.count += 1;
  return { allowed: true };
}

function signRawPayload(payload: string, secret: string): string {
  return createHmac("sha256", secret)
    .update(payload)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function createUnsubscribeToken(params: {
  subscriberId: string;
  secret: string;
  expiresInSeconds: number;
}): string {
  const payload = JSON.stringify({
    sub: params.subscriberId,
    exp: Math.floor(Date.now() / 1000) + params.expiresInSeconds,
  });

  const encodedPayload = base64UrlEncode(payload);
  const signature = signRawPayload(encodedPayload, params.secret);
  return `${encodedPayload}.${signature}`;
}

export function verifyUnsubscribeToken(token: string, secret: string): {
  valid: boolean;
  subscriberId?: string;
} {
  const [encodedPayload, incomingSignature] = token.split(".");
  if (!encodedPayload || !incomingSignature) {
    return { valid: false };
  }

  const expectedSignature = signRawPayload(encodedPayload, secret);

  const expectedBuffer = Buffer.from(expectedSignature);
  const incomingBuffer = Buffer.from(incomingSignature);
  if (
    expectedBuffer.length !== incomingBuffer.length ||
    !timingSafeEqual(expectedBuffer, incomingBuffer)
  ) {
    return { valid: false };
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as {
      sub?: string;
      exp?: number;
    };

    if (!payload.sub || typeof payload.sub !== "string") {
      return { valid: false };
    }

    if (!payload.exp || typeof payload.exp !== "number") {
      return { valid: false };
    }

    if (payload.exp < Math.floor(Date.now() / 1000)) {
      return { valid: false };
    }

    return { valid: true, subscriberId: payload.sub };
  } catch {
    return { valid: false };
  }
}

import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import {
  enforceRateLimit,
  getClientIp,
  isTrustedSameOriginRequest,
  verifyUnsubscribeToken,
} from "@/lib/api-security";

const UUID_V4_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    if (!isTrustedSameOriginRequest(request)) {
      return NextResponse.json(
        { error: "Origem não permitida." },
        { status: 403 }
      );
    }

    const ip = getClientIp(request);
    const rateLimit = enforceRateLimit({
      key: `unsubscribe:${ip}`,
      limit: 10,
      windowMs: 60_000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Muitas tentativas. Tente novamente em instantes." },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateLimit.retryAfterSeconds ?? 60),
          },
        }
      );
    }

    const body = await request.json();
    const { token } = body;

    // Validate token
    if (!token || typeof token !== "string" || token.trim().length === 0) {
      return NextResponse.json(
        { error: "Token inválido." },
        { status: 400 }
      );
    }

    const rawToken = token.trim();
    const unsubscribeSecret = process.env.UNSUBSCRIBE_TOKEN_SECRET;

    let subscriberId: string | null = null;

    if (unsubscribeSecret && rawToken.includes(".")) {
      const verification = verifyUnsubscribeToken(rawToken, unsubscribeSecret);
      if (verification.valid && verification.subscriberId) {
        subscriberId = verification.subscriberId;
      }
    }

    // Backward compatibility with legacy links that still use the subscriber UUID directly.
    if (!subscriberId && UUID_V4_REGEX.test(rawToken)) {
      subscriberId = rawToken;
    }

    if (!subscriberId) {
      return NextResponse.json(
        { message: "Se o link for válido, a desinscrição foi processada.", success: true },
        { status: 200 }
      );
    }

    // Update subscriber to inactive.
    // Using count without select avoids needing an extra SELECT policy when RLS is enabled.
    const { error } = await supabaseAdmin
      .from("newsletter_subscribers")
      .update({ active: false })
      .eq("id", subscriberId)
      .eq("active", true);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Erro ao processar desinscrição." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Se o link for válido, a desinscrição foi processada.", success: true },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("Unsubscribe API error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

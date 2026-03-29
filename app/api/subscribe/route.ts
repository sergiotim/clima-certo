import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";
import {
  enforceRateLimit,
  getClientIp,
  isTrustedSameOriginRequest,
} from "@/lib/api-security";

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
      key: `subscribe:${ip}`,
      limit: 8,
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
    const { email, city, country } = body;

    // Robust validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";
    const normalizedCity = typeof city === "string" ? city.trim() : "";
    const normalizedCountry = typeof country === "string" ? country.trim().toUpperCase() : "BR";
    
    if (!normalizedEmail || !normalizedCity) {
      return NextResponse.json(
        { error: "Email e cidade são obrigatórios." },
        { status: 400 }
      );
    }

    if (!emailRegex.test(normalizedEmail) || normalizedEmail.length > 254) {
      return NextResponse.json(
        { error: "Por favor, insira um email válido." },
        { status: 400 }
      );
    }

    if (normalizedCity.length < 2 || normalizedCity.length > 100) {
      return NextResponse.json(
        { error: "Nome da cidade inválido." },
        { status: 400 }
      );
    }

    if (normalizedCountry.length > 5) {
      return NextResponse.json(
        { error: "País inválido." },
        { status: 400 }
      );
    }

    // Check for existing active subscriber
    const { data: existing } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("id, active")
      .eq("email", normalizedEmail)
      .single();

    if (existing) {
      if (existing.active) {
        return NextResponse.json(
          { error: "Este email já está inscrito." },
          { status: 409 }
        );
      }
      // Reactivate previously unsubscribed user
      const { error: updateError } = await supabaseAdmin
        .from("newsletter_subscribers")
        .update({ active: true, city: normalizedCity, country: normalizedCountry || "BR" })
        .eq("id", existing.id);

      if (updateError) throw updateError;

      return NextResponse.json(
        { message: "Inscrição reativada com sucesso!" },
        { status: 200 }
      );
    }

    // Insert new subscriber
    const { error: insertError } = await supabaseAdmin
      .from("newsletter_subscribers")
      .insert({
        email: normalizedEmail,
        city: normalizedCity,
        country: normalizedCountry || "BR",
        active: true,
      });

    if (insertError) throw insertError;

    return NextResponse.json(
      { message: "Inscrição realizada com sucesso!" },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Subscribe API error:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}

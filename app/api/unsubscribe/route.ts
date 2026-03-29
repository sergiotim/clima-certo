import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { token } = body;

    // Validate token
    if (!token || typeof token !== "string" || token.trim().length === 0) {
      return NextResponse.json(
        { error: "Token inválido." },
        { status: 400 }
      );
    }

    // Update subscriber to inactive.
    // Using count without select avoids needing an extra SELECT policy when RLS is enabled.
    const { error, count } = await supabaseAdmin
      .from("newsletter_subscribers")
      .update({ active: false }, { count: "exact" })
      .eq("id", token)
      .eq("active", true);

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Erro ao processar desinscrição." },
        { status: 500 }
      );
    }

    if (!count || count === 0) {
      // Token not found or already inactive
      return NextResponse.json(
        { error: "Token inválido ou já desinscrição já foi processada." },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "Desinscrição realizada com sucesso!", success: true },
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

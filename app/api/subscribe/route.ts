import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase-server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, city, country } = body;

    // Basic validation
    if (!email || !city) {
      return NextResponse.json(
        { error: "Email e cidade são obrigatórios." },
        { status: 400 }
      );
    }

    // Check for existing active subscriber
    const { data: existing } = await supabaseAdmin
      .from("newsletter_subscribers")
      .select("id, active")
      .eq("email", email)
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
        .update({ active: true, city, country: country || "BR" })
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
        email,
        city,
        country: country || "BR",
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

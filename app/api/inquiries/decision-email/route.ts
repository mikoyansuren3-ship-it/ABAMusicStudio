import { createClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  const { email, name, approved } = (await request.json()) as {
    email?: string
    name?: string
    approved?: boolean
  }

  if (!email || !name || typeof approved !== "boolean") {
    return NextResponse.json({ error: "Missing email, name, or decision" }, { status: 400 })
  }

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
  if (profile?.role !== "teacher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    console.info("RESEND_API_KEY is not configured; inquiry decision email skipped", { email, name, approved })
    return NextResponse.json({ success: true, skipped: true })
  }

  const subject = approved ? "Your enrollment has been approved!" : "Update on your inquiry"
  const html = approved
    ? `<p>Hi ${name}, congratulations! You've been approved. Please log in to book your first lesson.</p>`
    : `<p>Hi ${name}, thank you for your interest. Unfortunately we're unable to accommodate your request at this time.</p>`

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "ABA Music Academy <noreply@abamusic.com>",
      to: email,
      subject,
      html,
    }),
  })

  if (!response.ok) {
    return NextResponse.json({ error: "Email provider rejected the message" }, { status: 502 })
  }

  return NextResponse.json({ success: true })
}

import { NextResponse, type NextRequest } from "next/server"

import { stripe } from "@/lib/stripe"

function getSiteUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "")
}

export async function POST(request: NextRequest) {
  const body: unknown = await request.json()
  const customerId = typeof body === "object" && body !== null && "customerId" in body ? body.customerId : null

  if (typeof customerId !== "string" || !customerId.trim()) {
    return NextResponse.json({ error: "customerId is required" }, { status: 400 })
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${getSiteUrl()}/portal/payments`,
  })

  return NextResponse.json({ url: portalSession.url })
}


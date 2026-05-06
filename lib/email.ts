export async function sendInquiryDecision(email: string, name: string, approved: boolean) {
  const response = await fetch("/api/inquiries/decision-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name, approved }),
  })

  if (!response.ok) {
    throw new Error("Failed to send inquiry decision email")
  }
}
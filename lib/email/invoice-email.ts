import { formatCurrency, formatMediumDate } from "@/lib/portal/format"

export interface InvoiceEmailInput {
  guardianName: string | null
  studentName: string
  amountCents: number
  description: string | null
  dueDate: string | null
  /** Absolute link to the family's portal payments page; null for families without an account. */
  payUrl: string | null
}

/**
 * The invoice email sent to a family. Email-client-safe HTML: table layout,
 * inline styles only, brand colors hardcoded (the stage/parchment palette —
 * CSS variables don't exist in email clients).
 */
export function renderInvoiceEmail(input: InvoiceEmailInput): { subject: string; html: string; text: string } {
  const amount = formatCurrency(input.amountCents)
  const dueLabel = input.dueDate ? formatMediumDate(input.dueDate) : "upon receipt"
  const greetingName = input.guardianName || "there"
  const description = input.description || `Music lessons for ${input.studentName}`

  const subject = `Invoice from ABA Music Academy · ${amount} for ${input.studentName}`

  const text = [
    `Hi ${greetingName},`,
    ``,
    `Here is your invoice from ABA Music Academy.`,
    ``,
    `Student: ${input.studentName}`,
    `For: ${description}`,
    `Amount: ${amount}`,
    `Due: ${dueLabel}`,
    ``,
    input.payUrl
      ? `Pay online: ${input.payUrl}`
      : `You can pay by cash or check at the studio — we'll mark it paid right away.`,
    ``,
    `Thank you!`,
    `ABA Music Academy`,
  ].join("\n")

  const payBlock = input.payUrl
    ? `<tr>
        <td style="padding: 26px 0 4px;" align="center">
          <a href="${input.payUrl}"
             style="display: inline-block; background-color: #2a1810; color: #f5ebd9; text-decoration: none; font-weight: 600; font-size: 14px; padding: 12px 26px; border-radius: 8px;">
            Pay online
          </a>
        </td>
      </tr>
      <tr>
        <td style="padding: 6px 0 0; font-size: 12px; color: #6b5344;" align="center">
          Or pay by cash or check at the studio.
        </td>
      </tr>`
    : `<tr>
        <td style="padding: 22px 0 0; font-size: 13px; line-height: 20px; color: #3d2817;" align="center">
          You can pay by cash or check at the studio — we&rsquo;ll mark it paid right away.
        </td>
      </tr>`

  const html = `<!DOCTYPE html>
<html lang="en">
  <body style="margin: 0; padding: 0; background-color: #f5efe6; font-family: Georgia, 'Times New Roman', serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5efe6; padding: 28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="520" cellpadding="0" cellspacing="0" style="max-width: 520px; width: 100%;">
            <tr>
              <td style="background-color: #1e1008; border-radius: 12px 12px 0 0; padding: 22px 30px;" align="center">
                <div style="color: #f5ebd9; font-size: 18px; letter-spacing: 3px;">ABA MUSIC ACADEMY</div>
                <div style="color: #c9a96e; font-size: 11px; letter-spacing: 3px; font-family: Arial, Helvetica, sans-serif; padding-top: 5px;">INVOICE</div>
              </td>
            </tr>
            <tr>
              <td style="background-color: #fdfaf3; border: 1px solid #e0d4c4; border-top: 0; border-radius: 0 0 12px 12px; padding: 30px;">
                <p style="margin: 0 0 16px; font-size: 15px; line-height: 23px; color: #2b1b17; font-family: Arial, Helvetica, sans-serif;">
                  Hi ${escapeHtml(greetingName)},
                </p>
                <p style="margin: 0 0 22px; font-size: 15px; line-height: 23px; color: #2b1b17; font-family: Arial, Helvetica, sans-serif;">
                  Here is your invoice for <strong>${escapeHtml(input.studentName)}</strong>&rsquo;s lessons.
                </p>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e0d4c4; border-radius: 8px; background-color: #f5efe6;">
                  <tr>
                    <td style="padding: 18px 22px 6px; font-size: 11px; letter-spacing: 2px; color: #b0562b; font-family: Arial, Helvetica, sans-serif;">AMOUNT DUE</td>
                  </tr>
                  <tr>
                    <td style="padding: 0 22px; font-size: 34px; color: #2b1b17;">${amount}</td>
                  </tr>
                  <tr>
                    <td style="padding: 10px 22px 18px; font-size: 13px; line-height: 20px; color: #6b5344; font-family: Arial, Helvetica, sans-serif;">
                      ${escapeHtml(description)}<br />
                      Due ${escapeHtml(dueLabel)}
                    </td>
                  </tr>
                </table>
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                  ${payBlock}
                </table>
                <p style="margin: 26px 0 0; font-size: 13px; line-height: 20px; color: #6b5344; font-family: Arial, Helvetica, sans-serif;">
                  Questions about this invoice? Just reply to this email.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding: 16px 8px 0; font-size: 11px; color: #6b5344; font-family: Arial, Helvetica, sans-serif;" align="center">
                ABA Music Academy · Thank you for making music with us
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`

  return { subject, html, text }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

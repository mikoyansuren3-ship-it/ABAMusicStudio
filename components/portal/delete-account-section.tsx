"use client"

import { useState } from "react"
import { AlertTriangle, Loader2 } from "lucide-react"
import { PortalButton, PortalCard, SectionDivider } from "@/components/portal/studio/portal-ui"
import { deleteMyAccount, DELETE_CONFIRM_WORD } from "@/app/portal/profile/actions"

export function DeleteAccountSection() {
  const [open, setOpen] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canDelete = confirmText.trim() === DELETE_CONFIRM_WORD

  async function handleDelete() {
    if (!canDelete) return
    setIsDeleting(true)
    setError(null)

    // On success the server action signs out and redirects, so control never
    // returns here. Reaching this point means the deletion failed.
    const result = await deleteMyAccount(confirmText.trim())
    if (result?.error) {
      setError(result.error)
      setIsDeleting(false)
    }
  }

  function cancel() {
    setOpen(false)
    setConfirmText("")
    setError(null)
  }

  return (
    <>
      <SectionDivider label="Danger Zone" />
      <PortalCard className="mb-10 border-[rgba(180,70,70,0.25)] p-6">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#9A4040]" aria-hidden />
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-[#2b1b14]">Delete account</h3>
            <p className="mt-1 text-sm text-[#8B7355]">
              Permanently deletes your account and personal data — your profile, students, lessons, and invoices. This
              cannot be undone. Payment records held by our processor (Stripe) are retained under its own policy.
            </p>

            {open ? (
              <div className="mt-4 space-y-3">
                <label htmlFor="delete_confirm" className="block text-xs font-semibold text-[#8B7355]">
                  Type <span className="font-bold tracking-wide text-[#9A4040]">{DELETE_CONFIRM_WORD}</span> to confirm
                </label>
                <input
                  id="delete_confirm"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  autoComplete="off"
                  aria-invalid={error ? true : undefined}
                  className="w-full max-w-xs rounded-lg border-[1.5px] border-[rgba(180,70,70,0.25)] bg-white px-3.5 py-2.5 text-sm text-[#2b1b14] outline-none transition-colors focus:border-[#9A4040] focus-visible:ring-2 focus-visible:ring-[#9A4040]/40"
                />
                {error ? (
                  <p role="alert" aria-live="polite" className="text-sm text-destructive">
                    {error}
                  </p>
                ) : null}
                <div className="flex flex-wrap gap-3">
                  <PortalButton variant="danger" onClick={handleDelete} disabled={!canDelete || isDeleting}>
                    {isDeleting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      "Permanently delete account"
                    )}
                  </PortalButton>
                  <PortalButton variant="ghost" onClick={cancel} disabled={isDeleting}>
                    Cancel
                  </PortalButton>
                </div>
              </div>
            ) : (
              <div className="mt-4">
                <PortalButton variant="danger" onClick={() => setOpen(true)}>
                  Delete my account
                </PortalButton>
              </div>
            )}
          </div>
        </div>
      </PortalCard>
    </>
  )
}

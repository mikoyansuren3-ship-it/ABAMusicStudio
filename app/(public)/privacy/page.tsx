import type React from "react"
import Link from "next/link"
import { PageHeader } from "@/components/public/page-header"
import { FileWarning } from "lucide-react"

export const metadata = {
  title: "Privacy Policy | ABA Music Academy",
  description: "How ABA Music Academy collects, uses, shares, and protects personal information.",
  // DRAFT: keep this page out of search indexes until the policy is finalized
  // and counsel-approved. Remove `robots` once it is in effect.
  robots: { index: false, follow: false },
}

/** Effective date is set when the policy is published, after legal review. */
const LAST_UPDATED = "July 20, 2026"

/** Highlighted placeholder for values that must be supplied before publishing. */
function Fill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded bg-accent/15 px-1.5 py-0.5 font-medium text-accent">[{children}]</span>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="font-serif text-2xl font-bold text-foreground">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}

function ExtLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent underline underline-offset-2 hover:opacity-80"
    >
      {children}
    </a>
  )
}

const SUBPROCESSORS = [
  { name: "Supabase", purpose: "Database, authentication, file storage", href: "https://supabase.com/privacy" },
  { name: "Vercel", purpose: "Website & application hosting", href: "https://vercel.com/legal/privacy-policy" },
  { name: "Stripe", purpose: "Payment processing", href: "https://stripe.com/privacy" },
  { name: "Resend", purpose: "Transactional email delivery", href: "https://resend.com/legal/privacy-policy" },
  { name: "Google", purpose: "Optional “Sign in with Google”", href: "https://policies.google.com/privacy" },
  {
    name: "Plaid (planned)",
    purpose: "Bank-account connection for payments",
    href: "https://plaid.com/legal/#end-user-privacy-policy",
  },
] as const

export default function PrivacyPolicyPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <PageHeader
          eyebrow={`Last updated ${LAST_UPDATED}`}
          title="Privacy Policy"
          lede="How we collect, use, share, and protect the personal information you entrust to us."
        />

        <div className="mx-auto mt-12 max-w-3xl">
          {/* DRAFT banner — remove once the policy is finalized, counsel-approved, and in effect. */}
          <div className="flex items-start gap-3 rounded-xl border border-accent/40 bg-accent/10 p-5">
            <FileWarning className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden />
            <div className="text-sm leading-relaxed text-muted-foreground">
              <p className="font-semibold text-foreground">Draft — not yet in effect.</p>
              <p className="mt-1">
                This policy is pending legal review. Highlighted items in brackets must be completed, and the effective
                date set, before it is published.
              </p>
            </div>
          </div>

          <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
            ABA Music Academy (&ldquo;ABA Music Academy,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;),
            operated by <Fill>legal entity name</Fill>, provides piano instruction and related services and operates the
            website at{" "}
            <ExtLink href="https://abamusicacademy.org">abamusicacademy.org</ExtLink> (the &ldquo;Service&rdquo;). This
            Privacy Policy explains what personal information we collect, how we use and share it, and the choices and
            rights you have. If you have questions, contact us at{" "}
            <a href="mailto:arpine@abamusicacademy.org" className="text-accent underline underline-offset-2 hover:opacity-80">
              arpine@abamusicacademy.org
            </a>{" "}
            or 818-836-2322.
          </p>

          <Section title="1. Who this policy covers">
            <ul className="list-disc space-y-2 pl-5 marker:text-accent">
              <li>
                <strong className="text-foreground">Prospective families</strong> who submit an inquiry.
              </li>
              <li>
                <strong className="text-foreground">Parents and guardians</strong> who create an account and enroll a
                student.
              </li>
              <li>
                <strong className="text-foreground">Students</strong>, including minors, whose information is provided by
                their parent or guardian.
              </li>
            </ul>
          </Section>

          <Section title="2. Information we collect">
            <p className="font-semibold text-foreground">You provide to us:</p>
            <ul className="list-disc space-y-2 pl-5 marker:text-accent">
              <li>
                <strong className="text-foreground">Contact and account information:</strong> name, email address, phone
                number, time zone, and profile photo (optional).
              </li>
              <li>
                <strong className="text-foreground">Inquiry information:</strong> the prospective student&apos;s name and
                age, experience level, preferred lesson length, preferred days and times, and any message you send us.
              </li>
              <li>
                <strong className="text-foreground">Student information:</strong> student name, experience level,
                preferred lesson duration, and lesson notes, provided by the parent or guardian account holder.
              </li>
              <li>
                <strong className="text-foreground">Scheduling information:</strong> lessons booked, times, and related
                notes.
              </li>
              <li>
                <strong className="text-foreground">Payment information:</strong> invoice amounts and payment status,
                and, when you pay online, payment details you enter directly with our payment processor (see Section 4).
                We do <strong className="text-foreground">not</strong> store your full card number on our systems.
              </li>
              <li>
                <strong className="text-foreground">Bank-account connection (planned):</strong> if you choose to connect
                a bank account to pay tuition, you will do so through Plaid. Plaid collects your banking information
                directly and shares limited account and payment information with us as needed to process payments. We do
                not receive or store your online-banking password.
              </li>
            </ul>
            <p className="font-semibold text-foreground">Collected automatically:</p>
            <p>
              Basic technical data needed to operate and secure the Service (for example, authentication session data
              and standard server and log information from our hosting provider). We do not use advertising trackers.
            </p>
            <p className="font-semibold text-foreground">From third parties:</p>
            <p>
              If you sign in with Google, we receive basic profile information (name, email) from Google to create or
              access your account.
            </p>
          </Section>

          <Section title="3. How we use information">
            <p>We use personal information to:</p>
            <ul className="list-disc space-y-2 pl-5 marker:text-accent">
              <li>Respond to inquiries and evaluate enrollment.</li>
              <li>Create and manage accounts and student profiles.</li>
              <li>Schedule and manage lessons.</li>
              <li>Issue invoices and process tuition payments.</li>
              <li>
                Send service communications (for example, scheduling notices and account and payment notifications,
                including browser push notifications if you enable them).
              </li>
              <li>Secure the Service, prevent fraud and abuse, and comply with legal obligations.</li>
            </ul>
            <p>
              We do <strong className="text-foreground">not</strong> sell personal information, and we do not use it for
              third-party advertising.
            </p>
          </Section>

          <Section title="4. Payments">
            <p>
              Online card payments are processed by <strong className="text-foreground">Stripe</strong>. Bank-account
              connections (once available) are handled by <strong className="text-foreground">Plaid</strong>. When you
              make a payment, you provide your payment details directly to these processors, who handle that data under
              their own privacy policies:
            </p>
            <ul className="list-disc space-y-2 pl-5 marker:text-accent">
              <li>
                Stripe &mdash; <ExtLink href="https://stripe.com/privacy">stripe.com/privacy</ExtLink>
              </li>
              <li>
                Plaid &mdash;{" "}
                <ExtLink href="https://plaid.com/legal/#end-user-privacy-policy">plaid.com/legal</ExtLink>
              </li>
            </ul>
            <p>
              We receive confirmation of payment and limited, non-sensitive transaction details necessary to reconcile
              your account.
            </p>
          </Section>

          <Section title="5. Children's privacy">
            <p>
              Piano students may be minors. <strong className="text-foreground">Accounts are created and controlled by a
              parent or guardian</strong>, who provides any information about their child. We do not knowingly allow
              children to create their own accounts, and we collect a child&apos;s information only from the supervising
              parent or guardian for the purpose of providing lessons.
            </p>
            <p>
              We do not use children&apos;s information for advertising or sell it. A parent or guardian may review,
              update, or request deletion of their child&apos;s information at any time by contacting us. If you believe
              a child provided us information without parental involvement, contact us and we will delete it.
            </p>
            <p>
              <Fill>Confirm with counsel: obligations under COPPA (U.S., children under 13) and any state
              student-privacy laws that apply</Fill>
            </p>
          </Section>

          <Section title="6. How we share information">
            <p>We share personal information only as follows:</p>
            <ul className="list-disc space-y-2 pl-5 marker:text-accent">
              <li>
                <strong className="text-foreground">Service providers (sub-processors)</strong> who process data on our
                behalf, listed below.
              </li>
              <li>
                <strong className="text-foreground">Payment processors</strong> (Stripe; Plaid once integrated) to
                process payments.
              </li>
              <li>
                <strong className="text-foreground">Legal and safety</strong> reasons &mdash; to comply with law, enforce
                our terms, or protect the rights and safety of our students, staff, and others.
              </li>
              <li>
                <strong className="text-foreground">Business transfer</strong> &mdash; if the Studio is involved in a
                merger, acquisition, or sale of assets, information may be transferred as part of that transaction,
                subject to this policy.
              </li>
            </ul>
            <p>
              We do <strong className="text-foreground">not</strong> sell or rent personal information.
            </p>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[36rem] border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-2 pr-4 font-semibold text-foreground">Provider</th>
                    <th className="py-2 pr-4 font-semibold text-foreground">Purpose</th>
                    <th className="py-2 font-semibold text-foreground">Privacy policy</th>
                  </tr>
                </thead>
                <tbody>
                  {SUBPROCESSORS.map((sp) => (
                    <tr key={sp.name} className="border-b border-border/60">
                      <td className="py-2 pr-4 font-medium text-foreground">{sp.name}</td>
                      <td className="py-2 pr-4">{sp.purpose}</td>
                      <td className="py-2">
                        <ExtLink href={sp.href}>View policy</ExtLink>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          <Section title="7. Data retention">
            <p>
              We keep personal information only as long as needed for the purposes described here, or as required by law.
              In summary, we retain account and student records while the account is active and for a limited period
              afterward, and payment and invoice records for the period required for tax and accounting purposes. You may
              request deletion as described in Section 9.
            </p>
          </Section>

          <Section title="8. Security">
            <p>
              We protect personal information using encryption in transit (TLS 1.2+), encryption at rest, role-based
              access controls, and multi-factor authentication for administrative access. No method of transmission or
              storage is completely secure, but we work to protect your information and to respond promptly to any
              incident.
            </p>
          </Section>

          <Section title="9. Your rights and choices">
            <p>
              Depending on where you live, you may have the right to access, correct, delete, or receive a copy of your
              personal information, and to withdraw consent. To exercise any of these, contact us. We will verify your
              request and respond within the timeframe required by applicable law.
            </p>
            <p>
              <strong className="text-foreground">California residents:</strong>{" "}
              <Fill>Confirm with counsel: CCPA/CPRA rights and whether the CCPA applies based on your business size and
              revenue</Fill>
            </p>
            <p>You can also:</p>
            <ul className="list-disc space-y-2 pl-5 marker:text-accent">
              <li>Update your profile information in your account.</li>
              <li>Turn browser push notifications on or off in your browser or device settings.</li>
              <li>Disconnect a linked bank account (once the Plaid feature is available).</li>
            </ul>
          </Section>

          <Section title="10. International users">
            <p>
              We operate in the United States and store data with U.S.-based providers. If you access the Service from
              outside the United States, your information will be processed in the United States.
            </p>
          </Section>

          <Section title="11. Cookies">
            <p>
              We use only the cookies and similar technologies necessary to keep you signed in and to operate the
              Service. We do not use advertising or cross-site tracking cookies.
            </p>
          </Section>

          <Section title="12. Changes to this policy">
            <p>
              We may update this policy from time to time. We will post the updated version here and change the
              &ldquo;Last updated&rdquo; date. Material changes will be communicated as required by law.
            </p>
          </Section>

          <Section title="13. Contact us">
            <p>
              <strong className="text-foreground">ABA Music Academy</strong>
              <br />
              <Fill>legal entity name and mailing address</Fill>
            </p>
            <p>
              Email:{" "}
              <a
                href="mailto:arpine@abamusicacademy.org"
                className="text-accent underline underline-offset-2 hover:opacity-80"
              >
                arpine@abamusicacademy.org
              </a>
              <br />
              Phone: 818-836-2322
            </p>
            <p className="text-xs">
              For studio policies (cancellations, payments, scheduling), see our{" "}
              <Link href="/policies" className="text-accent underline underline-offset-2 hover:opacity-80">
                Studio Policies
              </Link>{" "}
              page.
            </p>
          </Section>
        </div>
      </div>
    </div>
  )
}

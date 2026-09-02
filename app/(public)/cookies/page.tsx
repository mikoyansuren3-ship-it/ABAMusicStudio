import type { Metadata } from "next"
import type React from "react"
import Link from "next/link"
import { PageHeader } from "@/components/public/page-header"
import { ManageCookiesButton } from "@/components/consent/manage-cookies-button"
import { CATEGORY_COPY, CONSENT_CATEGORIES, type ConsentCategory } from "@/lib/consent/config"

export const metadata: Metadata = {
  title: "Cookie Policy",
  alternates: { canonical: "/cookies" },
  description:
    "Every cookie ABA Music Academy sets, what it does, how long it lasts, and how to change your choices at any time.",
}

const LAST_UPDATED = "August 27, 2026"

type CookieRow = {
  name: string
  provider: string
  purpose: string
  duration: string
}

/**
 * The inventory below is the disclosure that makes the banner meaningful. When
 * a cookie is added or removed anywhere in the app, update this table and bump
 * CONSENT_VERSION in lib/consent/config.ts so visitors are asked again.
 */
const INVENTORY: Record<ConsentCategory, readonly CookieRow[]> = {
  necessary: [
    {
      name: "sb-…-auth-token",
      provider: "ABA Music Academy (via Supabase)",
      purpose:
        "Keeps you signed in to the student, teacher, or admin portal, and keeps you signed in between visits if you tick “Remember me”.",
      duration: "Until you sign out, or 12 months with “Remember me”",
    },
    {
      name: "aba_consent",
      provider: "ABA Music Academy",
      purpose: "Stores the cookie choices you make on this page or in the banner.",
      duration: "12 months",
    },
    {
      name: "__stripe_mid, __stripe_sid",
      provider: "Stripe",
      purpose: "Fraud prevention on the enrolment and payment pages. Set only when you reach a payment form.",
      duration: "12 months / 30 minutes",
    },
  ],
  functional: [
    {
      name: "aba_remember_email",
      provider: "ABA Music Academy",
      purpose:
        "Fills in your email on the login page so you only have to type your password. Set only if you tick “Remember me” and leave functional cookies on.",
      duration: "12 months",
    },
  ],
  analytics: [
    {
      name: "_ga, _ga_…",
      provider: "Google Analytics",
      purpose: "Counts visits and tells apart returning visitors so we can see which lesson pages are read.",
      duration: "24 months",
    },
    {
      name: "_gid",
      provider: "Google Analytics",
      purpose: "Groups a single day's page views into one visit.",
      duration: "24 hours",
    },
    {
      name: "No cookie (Vercel Analytics)",
      provider: "Vercel",
      purpose:
        "Aggregate page-view counts with no cookie and no cross-site identifier. We still stop it when you decline analytics.",
      duration: "—",
    },
  ],
  marketing: [
    {
      name: "_gcl_au",
      provider: "Google Ads",
      purpose: "Tells us which advert led to an enquiry.",
      duration: "90 days",
    },
    {
      name: "_fbp, _fbc",
      provider: "Meta (Facebook, Instagram)",
      purpose: "Measures our adverts and lets us show lessons to people with similar interests.",
      duration: "90 days",
    },
  ],
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="font-serif text-2xl font-bold text-foreground">{title}</h2>
      <div className="mt-4 space-y-4 text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  )
}

function CategoryBlock({ category }: { category: ConsentCategory }) {
  const copy = CATEGORY_COPY[category]
  const rows = INVENTORY[category]

  return (
    <div className="mt-10 first:mt-0">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h3 className="font-serif text-xl font-bold text-foreground">{copy.label}</h3>
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
          {copy.locked ? "Always on" : category === "marketing" ? "Off by default" : "You can switch this off"}
        </span>
      </div>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy.detail}</p>

      <div className="mt-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
          <thead>
            <tr className="bg-muted/60">
              <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                Cookie
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                Set by
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                What it does
              </th>
              <th scope="col" className="px-4 py-3 font-semibold text-foreground">
                Expires
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.name} className="border-t border-border align-top">
                <th scope="row" className="px-4 py-3 font-medium text-foreground">
                  {row.name}
                </th>
                <td className="px-4 py-3 text-muted-foreground">{row.provider}</td>
                <td className="px-4 py-3 leading-relaxed text-muted-foreground">{row.purpose}</td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">{row.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function CookiePolicyPage() {
  return (
    <div className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <PageHeader
          eyebrow={`Last updated ${LAST_UPDATED}`}
          title="Cookie Policy"
          lede="Exactly what we store on your device, why, and how to change your mind at any time."
        />

        <div className="mx-auto mt-12 max-w-3xl">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-sm font-semibold text-foreground">Change your choices</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Your preferences are saved for 12 months. You can reopen the chooser whenever you like — nothing here
              is a one-time decision.
            </p>
            <ManageCookiesButton className="mt-4 inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
              Open cookie preferences
            </ManageCookiesButton>
          </div>

          <Section title="What cookies are">
            <p>
              A cookie is a small text file a website asks your browser to keep. Some are essential — without one we
              could not tell that you are signed in, and the portal would log you out on every click. Others are
              optional, and those are the ones the banner asks you about.
            </p>
            <p>
              We use a small number of related technologies in the same way, such as browser storage for your
              display preferences. Everything below covers those too.
            </p>
          </Section>

          <Section title="The four categories">
            <p>
              Only the first category runs no matter what. Analytics is on unless you turn it off, which is what
              California law allows. Advertising is the strictest: it stays off until you actively switch it on.
            </p>
            <p>
              We teach children, and we would rather ask than assume, so we do not let advertising companies set
              anything on your device on the strength of a default.
            </p>
          </Section>

          <div className="mt-10">
            {CONSENT_CATEGORIES.map((category) => (
              <CategoryBlock key={category} category={category} />
            ))}
          </div>

          <Section title="Global Privacy Control">
            <p>
              If your browser or an extension sends a Global Privacy Control signal, we treat it as a request to opt
              out of sharing your information: advertising cookies stay off and the toggle is locked, without you
              needing to do anything else here.
            </p>
          </Section>

          <Section title="Do not sell or share my personal information">
            <p>
              We do not sell personal information for money. Using advertising cookies does count as “sharing” under
              California’s privacy law, so you have the right to opt out — and because those cookies are off by
              default, you already are unless you turned them on.
            </p>
            <p>
              To check or change it, use the{" "}
              <ManageCookiesButton className="text-accent underline underline-offset-2 hover:opacity-80">
                Do Not Sell or Share My Personal Information
              </ManageCookiesButton>{" "}
              link in the footer of every page.
            </p>
          </Section>

          <Section title="Managing cookies in your browser">
            <p>
              You can also block or delete cookies in your browser settings. Blocking the necessary ones will sign
              you out and stop the enrolment and payment pages from working, so we do not recommend it for the
              portal.
            </p>
          </Section>

          <Section title="Changes to this policy">
            <p>
              When we add or remove a cookie we update the tables above and change the date at the top. If the
              change affects an optional category, the banner returns and asks you again rather than carrying your
              old answer forward.
            </p>
          </Section>

          <Section title="Questions">
            <p>
              Email{" "}
              <a
                href="mailto:arpine@abamusicacademy.org"
                className="text-accent underline underline-offset-2 hover:opacity-80"
              >
                arpine@abamusicacademy.org
              </a>{" "}
              and we will answer. For the wider picture of what we collect and why, see our{" "}
              <Link href="/privacy" className="text-accent underline underline-offset-2 hover:opacity-80">
                Privacy Policy
              </Link>
              ; for tuition, scheduling, and cancellations, see our{" "}
              <Link href="/policies" className="text-accent underline underline-offset-2 hover:opacity-80">
                Studio Policies
              </Link>
              .
            </p>
          </Section>
        </div>
      </div>
    </div>
  )
}

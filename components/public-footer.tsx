import Image from "next/image"
import Link from "next/link"
import { PublicFooterCurves } from "@/components/public-footer-curves"
import styles from "@/components/public-footer.module.css"
import { SITE } from "@/lib/site"

const QUICK_LINKS = [
  { label: "About", href: "/about" },
  { label: "Piano Lessons", href: "/programs/piano-lessons" },
  { label: "Voice Lessons", href: "/programs/voice-lessons" },
  { label: "Violin Lessons", href: "/programs/violin-lessons" },
  { label: "Qanun Lessons", href: "/programs/qanun-lessons" },
  { label: "Our Teachers", href: "/faculty" },
  { label: "Awards", href: "/awards" },
  { label: "Lessons", href: "/lessons" },
  { label: "Services", href: "/services" },
  { label: "Employment", href: "/employment" },
  { label: "FAQ", href: "/faq" },
  { label: "Policies", href: "/policies" },
  { label: "Privacy Policy", href: "/privacy" },
] as const

const STUDENT_LINKS = [
  { label: "Inquire About Lessons", href: "/inquire" },
  { label: "Login", href: "/auth/login" },
  { label: "Contact Us", href: "/contact" },
] as const

const CONTACT = {
  email: SITE.email,
  phone: SITE.phone,
  phoneHref: `tel:${SITE.phoneE164}`,
} as const

const INSTAGRAM = {
  handle: SITE.instagram.handle,
  href: SITE.instagram.url,
} as const

export function PublicFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className={styles.footer}>
      <div className={styles.vignette} />
      <PublicFooterCurves intensity={80} />

      <div className={`${styles.inner} container mx-auto px-4`}>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Link href="/" className={styles.brandLink}>
              <Image
                src="/aba-logo-cropped.png"
                alt="ABA Music Academy"
                width={445}
                height={198}
                sizes="180px"
                className={styles.logo}
              />
            </Link>
            <p className={styles.tagline}>
              Professional piano, voice, violin, and qanun instruction for students of all ages and skill levels,
              serving the{" "}
              {SITE.location.areaLong}.
            </p>
          </div>

          <div>
            <h3 className={styles.heading}>Quick Links</h3>
            <nav className={styles.linkList} aria-label="Quick links">
              {QUICK_LINKS.map((item) => (
                <Link key={item.href} href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className={styles.heading}>Students</h3>
            <nav className={styles.linkList} aria-label="Student links">
              {STUDENT_LINKS.map((item) => (
                <Link key={item.href} href={item.href} className={styles.link}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          <div>
            <h3 className={styles.heading}>Contact</h3>
            <div className={styles.contactBlock}>
              <div>
                <span className={styles.contactLabel}>Email</span>
                <p>
                  <a href={`mailto:${CONTACT.email}`} className={styles.contactValue}>
                    {CONTACT.email}
                  </a>
                </p>
              </div>
              <div>
                <span className={styles.contactLabel}>Phone</span>
                <p>
                  <a href={CONTACT.phoneHref} className={styles.contactValue}>
                    {CONTACT.phone}
                  </a>
                </p>
              </div>
              <div>
                <span className={styles.contactLabel}>Follow</span>
                <p>
                  <a
                    href={INSTAGRAM.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.social}
                    aria-label={`ABA Music Academy on Instagram (${INSTAGRAM.handle})`}
                  >
                    <svg
                      className={styles.socialIcon}
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                      <circle cx="12" cy="12" r="4" />
                      <line x1="17.5" y1="6.5" x2="17.5" y2="6.5" />
                    </svg>
                    <span>{INSTAGRAM.handle}</span>
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.divider} />

        <div className={styles.bottom}>
          <p>&copy; {year} ABA Music Academy. All rights reserved.</p>
          <p className={styles.taglineBottom}>Where talent meets tradition</p>
        </div>
      </div>
    </footer>
  )
}

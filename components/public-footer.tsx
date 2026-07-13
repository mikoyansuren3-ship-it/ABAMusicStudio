import Image from "next/image"
import Link from "next/link"
import { PublicFooterCurves } from "@/components/public-footer-curves"
import styles from "@/components/public-footer.module.css"

const QUICK_LINKS = [
  { label: "About", href: "/about" },
  { label: "Faculty", href: "/faculty" },
  { label: "Lessons & Pricing", href: "/lessons" },
  { label: "Services", href: "/services" },
  { label: "Policies", href: "/policies" },
] as const

const STUDENT_LINKS = [
  { label: "Inquire About Lessons", href: "/inquire" },
  { label: "Login", href: "/auth/login" },
  { label: "Contact Us", href: "/contact" },
] as const

const CONTACT = {
  email: "arpine@abamusicacademy.org",
  phone: "818-836-2322",
  phoneHref: "tel:+18188362322",
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
                width={512}
                height={512}
                className={styles.logo}
              />
            </Link>
            <p className={styles.tagline}>
              Professional piano instruction for students of all ages and skill levels.
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

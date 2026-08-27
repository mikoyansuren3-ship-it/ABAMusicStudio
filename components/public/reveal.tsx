"use client"

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"

import styles from "./reveal.module.css"

type RevealTag = "div" | "section" | "li" | "figure" | "article" | "p" | "h2" | "h3" | "span"

/**
 * `up` / `left` / `right` translate and fade. `bow` and `wipe` keep the element
 * opaque and uncover it with a clip-path — a bow stroke across a heading, or a
 * bottom-to-top wipe. `focus` resolves out of a shallow blur.
 */
export type RevealFrom = "up" | "left" | "right" | "bow" | "wipe" | "focus"

const FROM_CLASS: Record<RevealFrom, string> = {
  up: styles.fromUp,
  left: styles.fromLeft,
  right: styles.fromRight,
  bow: styles.fromBow,
  wipe: styles.fromWipe,
  focus: styles.fromFocus,
}

/**
 * Reveals its children once, the first time they scroll into view. See
 * design-system MASTER.md §7 — the program pages run the longer "cinematic"
 * timing (760ms, 44px, clip-path and filter variants) that §7 permits.
 *
 * Server-safe by construction:
 *  - `children` arrives as a prop, so Server Components passed in from a server
 *    parent stay on the server; only this small wrapper ships to the browser.
 *  - The hidden state lives in CSS behind `(scripting: enabled)`, so with JS off
 *    the content renders plainly. Nothing depends on hydration to become
 *    readable, and crawlers reading raw HTML always get the full text.
 *  - `prefers-reduced-motion: reduce` disables the effect in CSS, not in JS.
 *
 * The observer disconnects on first intersection: the animation never replays
 * and no observers stay alive for the life of the page.
 */
export function Reveal({
  children,
  from = "up",
  delay = 0,
  as = "div",
  className = "",
  style,
  id,
}: {
  children: ReactNode
  /** Direction/technique. `left`/`right` collapse to `up` below 768px. */
  from?: RevealFrom
  /** Stagger in ms. Keep siblings 60–80ms apart (MASTER §7). */
  delay?: number
  as?: RevealTag
  className?: string
  style?: CSSProperties
  /** Forwarded so a revealed heading can still be an `aria-labelledby` target. */
  id?: string
}) {
  // Every allowed tag is an HTMLElement; the cast keeps the ref honest without
  // making this a fully polymorphic component.
  const Tag = as as "div"
  const ref = useRef<HTMLDivElement>(null)
  const [state, setState] = useState<"hidden" | "revealed" | "instant">("hidden")

  useEffect(() => {
    const node = ref.current
    if (!node) return

    // Already scrolled past — a restored scroll position, an in-page anchor, or
    // a fast flick that never gave the observer an intersecting frame. Without
    // this the block would sit permanently invisible above the viewport, which
    // was the single worst bug in the design prototype.
    if (node.getBoundingClientRect().bottom < 0) {
      setState("instant")
      return
    }

    // No IntersectionObserver guard needed: the hidden state in reveal.module.css
    // is gated on the `scripting` media feature, which shipped years after
    // IntersectionObserver in every engine (Chrome 120 vs 51, Safari 17 vs 12.1,
    // Firefox 113 vs 55). A browser old enough to lack IO therefore also drops
    // the `@media` block and renders this content plainly visible.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setState("revealed")
          observer.disconnect()
        }
      },
      // Fire slightly before the row is fully on screen so the motion reads as
      // "arriving" rather than "catching up".
      { threshold: 0.01, rootMargin: "0px 0px -10% 0px" },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const merged =
    delay > 0 ? ({ ...style, "--reveal-delay": `${delay}ms` } as CSSProperties) : style

  return (
    <Tag
      ref={ref}
      id={id}
      data-revealed={state === "hidden" ? "false" : "true"}
      data-instant={state === "instant" ? "true" : undefined}
      style={merged}
      className={`${styles.reveal} ${FROM_CLASS[from]} ${className}`.trim()}
    >
      {children}
    </Tag>
  )
}

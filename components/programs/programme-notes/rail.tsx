"use client"

import { useEffect, useRef, type CSSProperties } from "react"

import type { ProgramRail } from "@/lib/programs"

import styles from "./programme-notes.module.css"

/** Qanun string gauges, thickest to thinnest, and their x offsets on the board. */
const QANUN_STRINGS = [
  { w: 1.9, x: 6, lit: true },
  { w: 1.7, x: 14, lit: true },
  { w: 1.5, x: 22, lit: true },
  { w: 1.35, x: 30, lit: false },
  { w: 1.2, x: 38, lit: false },
  { w: 1.05, x: 46, lit: false },
  { w: 0.9, x: 53, lit: false },
  { w: 0.8, x: 60, lit: false },
]

/**
 * The scroll rail down the left of the body sections — an instrument drawn at
 * the column's full height, a gold line that draws itself as the reader
 * descends, and a travelling marker.
 *
 * Purely decorative: the whole column is `aria-hidden` and carries no text, so
 * a screen reader walks straight from one section to the next.
 *
 * Progress is written to a `--rp` custom property (0–1) rather than React
 * state — a scroll handler that re-rendered the page's whole section tree on
 * every tick would be unusable. The listener is passive and recomputes on
 * resize.
 */
export function Rail({ instrument }: { instrument: ProgramRail }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    let frame = 0

    const measure = () => {
      frame = 0
      const rect = node.getBoundingClientRect()
      if (rect.height === 0) return
      // The marker tracks the middle of the viewport, so the instrument reads
      // as "playing" the section the reader is actually looking at.
      const progress = (window.innerHeight * 0.5 - rect.top) / rect.height
      node.style.setProperty("--rp", String(Math.min(1, Math.max(0, progress))))
    }

    const schedule = () => {
      if (frame) return
      frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener("scroll", schedule, { passive: true })
    window.addEventListener("resize", schedule)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener("scroll", schedule)
      window.removeEventListener("resize", schedule)
    }
  }, [])

  return (
    <div ref={ref} className={styles.railColumn} aria-hidden>
      <div className={styles.railInner}>
        {instrument === "violin" ? <ViolinRail /> : null}
        {instrument === "piano" ? <PianoRail /> : null}
        {instrument === "voice" ? <VoiceRail /> : null}
        {instrument === "qanun" ? <QanunRail /> : null}
        <div className={styles.railMarker} />
      </div>
    </div>
  )
}

/**
 * The gold line every rail draws. `pathLength="1"` normalises the geometry so
 * the dash offset is just `1 - progress`, whatever the rail's real height is.
 */
function DrawLine({ x, stroke }: { x: number; stroke: string }) {
  return (
    <svg
      className={styles.drawLine}
      viewBox="0 0 100 1000"
      preserveAspectRatio="none"
      aria-hidden
      focusable="false"
    >
      <path
        d={`M ${x} 0 L ${x} 1000`}
        pathLength="1"
        fill="none"
        stroke={stroke}
        strokeWidth="2.2"
        strokeDasharray="1"
        style={{ strokeDashoffset: "calc(1 - var(--rp, 0))" } as CSSProperties}
      />
    </svg>
  )
}

function ViolinRail() {
  return (
    <div className="relative h-full w-10">
      <div className={styles.violinBoard} />
      <div className={`${styles.violinString} ${styles.stringG}`} />
      <div className={`${styles.violinString} ${styles.stringD}`} />
      <div className={`${styles.violinString} ${styles.stringA}`} />
      <div className={`${styles.violinString} ${styles.stringE}`} />
      <DrawLine x={35} stroke="var(--gold)" />
    </div>
  )
}

function PianoRail() {
  return (
    <div className="relative h-full w-[52px]">
      <div className={styles.pianoBoard}>
        <div className={styles.pianoBlackKeys} />
      </div>
      <DrawLine x={8} stroke="var(--gold)" />
    </div>
  )
}

function VoiceRail() {
  return (
    <div className="relative h-full w-[120px]">
      <svg
        className={styles.voiceStaff}
        viewBox="0 0 120 1000"
        preserveAspectRatio="none"
        aria-hidden
        focusable="false"
      >
        {[40, 50, 60, 70, 80].map((x) => (
          <line key={x} x1={x} y1="0" x2={x} y2="1000" stroke="#b9a98d" strokeWidth="1.4" />
        ))}
      </svg>
      <DrawLine x={60} stroke="var(--accent)" />
    </div>
  )
}

function QanunRail() {
  return (
    <div className="relative h-full w-[68px]">
      <div className={styles.qanunBoard} />
      {QANUN_STRINGS.map((string) => (
        <div
          key={string.x}
          className={styles.qanunString}
          style={{ "--w": `${string.w}px`, "--x": `${string.x}px` } as CSSProperties}
        />
      ))}
      {QANUN_STRINGS.filter((string) => string.lit).map((string) => (
        <div
          key={`lit-${string.x}`}
          className={styles.qanunHighlight}
          style={{ "--w": `${string.w}px`, "--x": `${string.x}px` } as CSSProperties}
        />
      ))}
      <DrawLine x={64} stroke="var(--gold)" />
    </div>
  )
}

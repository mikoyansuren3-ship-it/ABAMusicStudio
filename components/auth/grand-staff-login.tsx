"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

const CLEF_FONT =
  "var(--font-noto-music), 'Apple Symbols', 'Segoe UI Symbol', 'DejaVu Sans', serif"

function TrebleClefSymbol({ size, color }: { size: number; color: string }) {
  return (
    <span
      className="flex items-center justify-center select-none transition-colors duration-300"
      style={{ fontFamily: CLEF_FONT, fontSize: size, color, lineHeight: 0.9 }}
    >
      {"\u{1D11E}"}
    </span>
  )
}

function BassClefSymbol({ size, color }: { size: number; color: string }) {
  return (
    <span
      className="flex items-center justify-center select-none transition-colors duration-300"
      style={{ fontFamily: CLEF_FONT, fontSize: size, color, lineHeight: 0.9 }}
    >
      {"\u{1D122}"}
    </span>
  )
}

function StaffBrace({ height, color }: { height: number; color: string }) {
  const mid = height / 2
  return (
    <svg viewBox={`0 0 24 ${height}`} width={24} height={height} className="block">
      <path
        d={`M20 4 C10 4, 8 ${mid * 0.35}, 8 ${mid * 0.65} Q8 ${mid * 0.82}, 4 ${mid} Q8 ${mid * 1.18}, 8 ${mid * 1.35} C8 ${mid * 1.65}, 10 ${height - 4}, 20 ${height - 4}`}
        fill="none"
        style={{ stroke: color }}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="3" cy={mid} r="2" style={{ fill: color }} />
    </svg>
  )
}

interface StaffRowProps {
  clef: "treble" | "bass"
  title: string
  desc: string
  href: string
  isHovered: boolean
  onEnter: () => void
  onLeave: () => void
}

function StaffRow({ clef, title, desc, href, isHovered, onEnter, onLeave }: StaffRowProps) {
  const lineCount = 5
  const lineGap = 13
  const staffH = (lineCount - 1) * lineGap
  const padY = 34
  const totalH = staffH + padY * 2
  const clefWidth = 80

  const lineColor = isHovered
    ? "color-mix(in srgb, var(--gold) 45%, transparent)"
    : "color-mix(in srgb, var(--cream) 18%, transparent)"
  const clefColor = isHovered ? "var(--gold)" : "color-mix(in srgb, var(--cream) 65%, transparent)"
  const titleColor = isHovered ? "var(--cream)" : "color-mix(in srgb, var(--cream) 85%, transparent)"
  const descColor = isHovered
    ? "color-mix(in srgb, var(--cream) 90%, transparent)"
    : "color-mix(in srgb, var(--cream) 80%, transparent)"

  return (
    <Link
      href={href}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onFocus={onEnter}
      onBlur={onLeave}
      className={cn(
        "relative flex cursor-pointer items-center rounded-lg pr-6 transition-all duration-300",
        "focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold",
        isHovered ? "bg-gold/8" : "bg-transparent",
      )}
      style={{ height: totalH }}
    >
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: lineCount }, (_, i) => (
          <div
            key={i}
            className="absolute right-4 h-px transition-colors duration-300"
            style={{
              left: clefWidth - 4,
              top: padY + i * lineGap,
              background: lineColor,
            }}
          />
        ))}
        <div
          className="absolute w-[1.5px] transition-colors duration-300"
          style={{
            left: clefWidth - 4,
            top: padY,
            height: staffH,
            background: lineColor,
          }}
        />
      </div>

      <div
        className="relative z-1 flex shrink-0 items-center justify-center"
        style={{ width: clefWidth }}
      >
        {clef === "treble" ? (
          <TrebleClefSymbol size={totalH * 0.58} color={clefColor} />
        ) : (
          <BassClefSymbol size={totalH * 0.4} color={clefColor} />
        )}
      </div>

      <div className="relative z-1 flex flex-1 items-center justify-between px-2">
        <div>
          <div
            className="font-serif text-[21px] font-semibold transition-colors duration-300"
            style={{ color: titleColor }}
          >
            {title}
          </div>
          <div
            className="mt-1.25 text-[12.5px] tracking-[0.01em] transition-colors duration-300"
            style={{ color: descColor }}
          >
            {desc}
          </div>
        </div>
        <div
          className="ml-4 shrink-0 transition-all duration-300"
          style={{
            color: isHovered ? "var(--gold)" : "color-mix(in srgb, var(--cream) 25%, transparent)",
            transform: isHovered ? "translateX(4px)" : "translateX(0)",
          }}
        >
          <ArrowRight aria-hidden="true" className="size-4" />
        </div>
      </div>
    </Link>
  )
}

export function GrandStaffLogin() {
  const [hovered, setHovered] = useState<"student" | "teacher" | null>(null)

  const staffHeight = 120
  const gap = 20
  const braceHeight = staffHeight * 2 + gap
  const braceColor = hovered ? "var(--gold)" : "color-mix(in srgb, var(--cream) 35%, transparent)"

  return (
    <div className="flex w-full max-w-[560px] flex-col items-center">
      <div className="flex w-full items-stretch">
        <div className="flex shrink-0 items-center pr-0.5 transition-all duration-300">
          <StaffBrace height={braceHeight} color={braceColor} />
        </div>

        <div className="flex flex-1 flex-col" style={{ gap }}>
          <StaffRow
            clef="treble"
            title="Student Portal"
            desc="Access schedules, payments, and your profile"
            href="/auth/student/login"
            isHovered={hovered === "student"}
            onEnter={() => setHovered("student")}
            onLeave={() => setHovered(null)}
          />
          <StaffRow
            clef="bass"
            title="Teacher Portal"
            desc="Manage lessons, students, and your dashboard"
            href="/auth/teacher/login"
            isHovered={hovered === "teacher"}
            onEnter={() => setHovered("teacher")}
            onLeave={() => setHovered(null)}
          />
        </div>
      </div>

      <div className="mt-8 text-center">
        <Link
          href="/auth/admin/login"
          className="inline-flex items-center gap-1 rounded-sm text-xs tracking-[0.03em] text-gold-strong transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        >
          Administrator Access
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>

      <div className="mt-4.5 text-center">
        <Link
          href="/"
          prefetch={false}
          className="inline-flex items-center gap-1 rounded-sm border-b border-cream/15 pb-px text-xs text-cream/75 transition-colors hover:text-cream focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-gold"
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          Back to home
        </Link>
      </div>
    </div>
  )
}

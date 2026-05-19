"use client"

import Link from "next/link"
import { useState } from "react"
import { cn } from "@/lib/utils"

const CLEF_FONT =
  "var(--font-noto-music), 'Apple Symbols', 'Segoe UI Symbol', 'DejaVu Sans', serif"

function TrebleClefSymbol({ size, color }: { size: number; color: string }) {
  return (
    <span
      className="flex items-center justify-center select-none transition-colors duration-400"
      style={{ fontFamily: CLEF_FONT, fontSize: size, color, lineHeight: 0.9 }}
    >
      {"\u{1D11E}"}
    </span>
  )
}

function BassClefSymbol({ size, color }: { size: number; color: string }) {
  return (
    <span
      className="flex items-center justify-center select-none transition-colors duration-400"
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
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="3" cy={mid} r="2" fill={color} />
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

  const lineColor = isHovered ? "rgba(201,169,110,0.45)" : "rgba(245,235,217,0.18)"
  const clefColor = isHovered ? "#C9A96E" : "rgba(245,235,217,0.65)"
  const titleColor = isHovered ? "#F5EBD9" : "rgba(245,235,217,0.85)"
  const descColor = isHovered ? "rgba(245,235,217,0.75)" : "rgba(245,235,217,0.45)"

  return (
    <Link
      href={href}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      className={cn(
        "relative flex cursor-pointer items-center rounded-[10px] pr-6 transition-all duration-400",
        isHovered ? "bg-[rgba(201,169,110,0.08)]" : "bg-transparent",
      )}
      style={{ height: totalH }}
    >
      <div className="pointer-events-none absolute inset-0">
        {Array.from({ length: lineCount }, (_, i) => (
          <div
            key={i}
            className="absolute right-4 h-px transition-colors duration-400"
            style={{
              left: clefWidth - 4,
              top: padY + i * lineGap,
              background: lineColor,
            }}
          />
        ))}
        <div
          className="absolute w-[1.5px] transition-colors duration-400"
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
          className="ml-4 shrink-0 text-xl font-light transition-all duration-300"
          style={{
            color: isHovered ? "#C9A96E" : "rgba(245,235,217,0.25)",
            transform: isHovered ? "translateX(4px)" : "translateX(0)",
          }}
        >
          →
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
  const braceColor = hovered ? "#C9A96E" : "rgba(245,235,217,0.35)"

  return (
    <div className="flex w-full max-w-[560px] flex-col items-center">
      <div className="flex w-full items-stretch">
        <div className="flex shrink-0 items-center pr-0.5 transition-all duration-400">
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
          className="text-xs tracking-[0.03em] text-[rgba(201,169,110,0.55)] transition-colors hover:text-[rgba(201,169,110,0.85)]"
        >
          Administrator Access →
        </Link>
      </div>

      <div className="mt-4.5 text-center">
        <Link
          href="/"
          prefetch={false}
          className="border-b border-[rgba(245,235,217,0.15)] pb-px text-xs text-[rgba(245,235,217,0.35)] transition-colors hover:text-[rgba(245,235,217,0.6)]"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  )
}

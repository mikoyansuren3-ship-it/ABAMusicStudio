import styles from "./public-header.module.css"

const SHAPE_OPACITY = 0.14

const TEXT_SHAPES = [
  { ch: "♞", l: 2, t: 6, s: 78, r: -10, o: 1.0 },
  { ch: "♪", l: 17, t: 10, s: 65, r: 8, o: 0.9 },
  { ch: "π", l: 33, t: 5, s: 68, r: 12, o: 0.85 },
  { ch: "♫", l: 61, t: 8, s: 58, r: -7, o: 0.8 },
  { ch: "Σ", l: 76, t: 6, s: 66, r: 14, o: 0.9 },
  { ch: "♛", l: 91, t: 4, s: 62, r: -9, o: 0.85 },
  { ch: "∫", l: 3, t: 60, s: 64, r: 16, o: 0.85 },
  { ch: "♬", l: 19, t: 63, s: 50, r: -12, o: 0.8 },
  { ch: "♟", l: 35, t: 58, s: 52, r: 6, o: 0.75 },
  { ch: "♩", l: 59, t: 60, s: 50, r: -14, o: 0.8 },
  { ch: "∞", l: 74, t: 63, s: 48, r: 8, o: 0.7 },
  { ch: "♜", l: 90, t: 57, s: 56, r: -11, o: 0.85 },
  { ch: "√", l: 10, t: 40, s: 34, r: 20, o: 0.55 },
  { ch: "♪", l: 47, t: 36, s: 32, r: -16, o: 0.5 },
  { ch: "π", l: 83, t: 38, s: 36, r: 22, o: 0.55 },
] as const

function ViolinSilhouette({
  left,
  top,
  h,
  rotate,
  opacity,
}: {
  left: number
  top: number
  h: number
  rotate: number
  opacity: number
}) {
  const w = Math.round(h * (44 / 120))

  return (
    <svg
      className={styles.decoSvg}
      viewBox="0 0 44 120"
      aria-hidden
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: w,
        height: h,
        transform: `rotate(${rotate}deg)`,
        opacity,
      }}
    >
      <circle cx="22" cy="5" r="4.5" />
      <rect x="20" y="5" width="4" height="28" rx="2" />
      <rect x="14" y="11" width="16" height="2.2" rx="1" />
      <rect x="14" y="17" width="16" height="2.2" rx="1" />
      <ellipse cx="22" cy="46" rx="15" ry="11" />
      <rect x="12" y="54" width="20" height="14" rx="3" />
      <ellipse cx="22" cy="78" rx="19" ry="14" />
      <rect x="19" y="92" width="6" height="14" rx="2" />
      <circle cx="22" cy="110" r="3" />
    </svg>
  )
}

function PianoKeysSilhouette({
  left,
  top,
  w,
  rotate,
  opacity,
}: {
  left: number
  top: number
  w: number
  rotate: number
  opacity: number
}) {
  const h = Math.round(w * (50 / 105))

  return (
    <svg
      className={styles.decoSvg}
      viewBox="0 0 105 50"
      aria-hidden
      style={{
        left: `${left}%`,
        top: `${top}%`,
        width: w,
        height: h,
        transform: `rotate(${rotate}deg)`,
        opacity,
      }}
    >
      {[0, 15, 30, 45, 60, 75, 90].map((x, i) => (
        <rect key={i} x={x} y="0" width="13" height="48" rx="1.5" opacity="0.8" />
      ))}
      {[10, 25, 52, 67, 82].map((x, i) => (
        <rect key={`b${i}`} x={x} y="0" width="9" height="28" rx="1" opacity="0.45" />
      ))}
    </svg>
  )
}

export function PublicHeaderShapes() {
  const o = SHAPE_OPACITY

  return (
    <div className={styles.shapesLayer}>
      {TEXT_SHAPES.map((shape, index) => (
        <span
          key={index}
          className={styles.decoShape}
          style={{
            left: `${shape.l}%`,
            top: `${shape.t}%`,
            fontSize: shape.s,
            transform: `rotate(${shape.r}deg)`,
            opacity: o * shape.o,
          }}
        >
          {shape.ch}
        </span>
      ))}
      <ViolinSilhouette left={27} top={28} h={80} rotate={-18} opacity={o * 0.8} />
      <ViolinSilhouette left={69} top={30} h={65} rotate={15} opacity={o * 0.65} />
      <PianoKeysSilhouette left={50} top={72} w={85} rotate={-5} opacity={o * 0.7} />
    </div>
  )
}

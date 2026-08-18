/**
 * Renders schema.org JSON-LD. Server component — safe to use in layouts and
 * pages. Escapes `<` so a stray "</script>" inside content can't break out of
 * the tag.
 */
export function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const items = Array.isArray(data) ? data : [data]
  return (
    <>
      {items.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          // JSON.stringify output is safe to inline once "<" is escaped.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item).replace(/</g, "\\u003c") }}
        />
      ))}
    </>
  )
}

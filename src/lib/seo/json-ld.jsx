/**
 * Server-safe JSON-LD script tag.
 * @param {{ data: object | object[] }} props
 */
export function JsonLd({ data }) {
  const payload = Array.isArray(data) ? data : [data];
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(payload.length === 1 ? payload[0] : payload),
      }}
    />
  );
}

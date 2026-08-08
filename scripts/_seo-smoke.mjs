const urls = [
  "http://127.0.0.1:3000/robots.txt",
  "http://127.0.0.1:3000/sitemap.xml",
  "http://127.0.0.1:3000/vi",
  "http://127.0.0.1:3000/vi/gioi-thieu",
];

for (const url of urls) {
  const res = await fetch(url);
  const text = await res.text();
  console.log("===", url, res.status, "len", text.length);
  if (url.includes("robots") || url.includes("sitemap")) {
    console.log(text.slice(0, 900));
    continue;
  }
  const title = (text.match(/<title>([^<]*)<\/title>/) || [])[1];
  const canonical = (text.match(/rel="canonical" href="([^"]+)/) || [])[1];
  const hrefLangs = [...text.matchAll(/hreflang="([^"]+)" href="([^"]+)/g)].map(
    (m) => `${m[1]} -> ${m[2]}`,
  );
  const metas = [
    ...text.matchAll(
      /<meta[^>]+(?:property|name)="([^"]+)"[^>]+content="([^"]*)"/g,
    ),
  ].map((m) => `${m[1]}=${m[2].slice(0, 90)}`);
  console.log({
    title,
    canonical,
    hrefLangs: hrefLangs.slice(0, 5),
    og: metas.filter((s) => s.startsWith("og:") || s.startsWith("twitter:")).slice(0, 14),
    hasJsonLd: text.includes("application/ld+json"),
  });
}

import fs from "fs";
import path from "path";

const root = path.resolve(import.meta.dirname, "..");

function walk(dir, files = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (["node_modules", ".next"].includes(ent.name)) continue;
      walk(p, files);
    } else if (/\.(jsx?|tsx?)$/.test(ent.name)) files.push(p);
  }
  return files;
}

function flatten(obj, prefix = "", out = new Set()) {
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) flatten(v, key, out);
    else out.add(key);
  }
  return out;
}

function walkDecls(src) {
  const decls = [];
  const nsRe =
    /(?:const|let)\s+(?:\[)?(\w+)[^\n=]*=\s*(?:await\s+)?(?:useTranslations|getTranslations)\(\s*(?:['"]([^'"]+)['"]|\{[^}]*namespace:\s*['"]([^'"]+)['"])/g;
  let m;
  while ((m = nsRe.exec(src))) {
    decls.push({ index: m.index, varName: m[1], ns: m[2] || m[3] });
  }
  const promiseRe =
    /const\s+\[([^\]]+)\]\s*=\s*await\s+Promise\.all\(\[([\s\S]*?)\]\)/g;
  while ((m = promiseRe.exec(src))) {
    const vars = m[1].split(",").map((s) => s.trim());
    const gt = [
      ...m[2].matchAll(
        /(?:useTranslations|getTranslations)\(\s*(?:['"]([^'"]+)['"]|\{[^}]*namespace:\s*['"]([^'"]+)['"])/g,
      ),
    ];
    vars.forEach((varName, i) => {
      if (!gt[i]) return;
      decls.push({ index: m.index, varName, ns: gt[i][1] || gt[i][2] });
    });
  }
  return decls;
}

const vi = JSON.parse(
  fs.readFileSync(path.join(root, "src/messages/vi.json"), "utf8"),
);
const en = JSON.parse(
  fs.readFileSync(path.join(root, "src/messages/en.json"), "utf8"),
);
const viKeys = [...flatten(vi)];
const enKeys = flatten(en);
const viSet = new Set(viKeys);

const PROP_NS = [
  {
    ns: "client",
    files: [
      "src/components/client/about/about-cta-section.jsx",
      "src/components/client/about/about-destinations-section.jsx",
      "src/components/client/about/about-fleet-section.jsx",
      "src/components/client/about/about-hero-section.jsx",
      "src/components/client/about/about-popular-routes-section.jsx",
      "src/components/client/about/about-position-section.jsx",
      "src/components/client/about/about-stat-bar-section.jsx",
      "src/components/client/about/about-vision-section.jsx",
      "src/views/client/home-page.jsx",
      "src/views/client/routes-page.jsx",
    ],
  },
  {
    ns: "client.page_view",
    files: [
      "src/components/client/cms-page/cms-page-hero.jsx",
      "src/components/client/cms-page/cms-page-sidebar.jsx",
      "src/views/client/cms-page-by-slug-page.jsx",
    ],
  },
  {
    ns: "client.contact",
    files: [
      "src/components/client/contact/contact-cta-section.jsx",
      "src/components/client/contact/contact-faq-map-section.jsx",
      "src/components/client/contact/contact-hero-section.jsx",
      "src/components/client/contact/contact-support-section.jsx",
    ],
  },
  {
    ns: "client.route_show",
    files: ["src/views/client/route-by-slug-page.jsx"],
  },
];

// Files where `t` is resolved via a different namespace than PROP_NS — exclude
// metadata helpers that use client.about / client.page locally:
const IGNORE_KEYS_IN_FILE = {
  "src/views/client/cms-page-by-slug-page.jsx": new Set([
    // resolvePageMeta uses client.about / client.page, not page_view
    "meta.title",
    "meta.description",
    "policy.title",
    "policy.description",
  ]),
  "src/views/client/about-page.jsx": new Set(["meta.title", "meta.description"]),
};

const missing = [];

for (const file of walk(path.join(root, "src"))) {
  const src = fs.readFileSync(file, "utf8");
  const rel = path.relative(root, file).replace(/\\/g, "/");
  const decls = walkDecls(src);
  const callRe = /\b(\w+)(?:\.rich)?\(\s*['"]([a-zA-Z0-9_.]+)['"]/g;
  let m;
  while ((m = callRe.exec(src))) {
    const varName = m[1];
    const key = m[2];
    let best = null;
    for (const d of decls) {
      if (d.varName !== varName) continue;
      if (d.index > m.index) break;
      best = d;
    }
    if (!best) continue;
    const full = `${best.ns}.${key}`;
    if (viSet.has(full)) continue;
    const sameNs = viKeys.filter(
      (k) => k.startsWith(`${best.ns}.`) && k.endsWith(`.${key.split(".").pop()}`),
    );
    missing.push({
      rel,
      full,
      key,
      ns: best.ns,
      via: "direct",
      suggest: sameNs.slice(0, 8),
    });
  }
}

for (const group of PROP_NS) {
  for (const rel of group.files) {
    const fullPath = path.join(root, rel);
    if (!fs.existsSync(fullPath)) continue;
    const src = fs.readFileSync(fullPath, "utf8");
    const ignore = IGNORE_KEYS_IN_FILE[rel] || new Set();
    for (const m of src.matchAll(/\bt(?:\.rich)?\(\s*['"]([a-zA-Z0-9_.]+)['"]/g)) {
      const key = m[1];
      if (ignore.has(key)) continue;
      // Skip if file has local translator covering this — check decls
      const decls = walkDecls(src);
      // If there's a local `t` decl, prop-t might be shadowed; still check under group.ns
      // for components that only receive t as prop (no local decl of t)
      const hasLocalT = decls.some((d) => d.varName === "t");
      if (hasLocalT && !rel.includes("/components/")) {
        // page files with their own t — already covered by direct scan
        continue;
      }
      const full = `${group.ns}.${key}`;
      if (viSet.has(full)) continue;
      const sameNs = viKeys.filter(
        (k) =>
          k.startsWith(`${group.ns}.`) &&
          k.endsWith(`.${key.split(".").pop()}`),
      );
      missing.push({
        rel,
        full,
        key,
        ns: group.ns,
        via: "prop",
        suggest: sameNs.slice(0, 8),
      });
    }
  }
}

const uniq = [];
const seen = new Set();
for (const x of missing) {
  const id = `${x.full}@@${x.rel}`;
  if (seen.has(id)) continue;
  seen.add(id);
  uniq.push(x);
}

const onlyVi = viKeys.filter((k) => !enKeys.has(k));
const onlyEn = [...enKeys].filter((k) => !viSet.has(k));

console.log(`vi/en sync: onlyVi=${onlyVi.length} onlyEn=${onlyEn.length}`);
console.log(`Real missing/wrong-path: ${uniq.length}`);
for (const x of uniq.sort((a, b) => a.full.localeCompare(b.full))) {
  console.log(`\n${x.full}`);
  console.log(`  @ ${x.rel} (${x.via})`);
  if (x.suggest.length) console.log(`  suggest: ${x.suggest.join(" | ")}`);
  else console.log(`  suggest: (none in same ns)`);
}

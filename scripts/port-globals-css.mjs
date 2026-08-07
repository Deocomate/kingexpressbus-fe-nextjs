import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const feRoot = path.resolve(__dirname, "..");
const laravelCss = path.resolve(
  feRoot,
  "../../kingexpressbus-laravel/resources/css/app.css",
);
const outPath = path.join(feRoot, "src/app/globals.css");

const src = fs.readFileSync(laravelCss, "utf8");
let body = src
  .replace(/@import '@fortawesome[^']+';\s*/g, "")
  .replace(/@import 'flatpickr[^']+';\s*/g, "")
  .replace(/@import 'toastr[^']+';\s*/g, "")
  .replace(/@import '@fontsource[^']+';\s*/g, "")
  .replace(/@tailwind base;\s*@tailwind components;\s*@tailwind utilities;\s*/g, "")
  .replace(/theme\('colors\.brand\.(\d+)'\)/g, "var(--color-brand-$1)")
  .replace(/theme\('colors\.line\.strong'\)/g, "var(--color-line-strong)")
  .replace(/theme\('colors\.page'\)/g, "var(--color-page)")
  .replace(/theme\('colors\.pickup'\)/g, "var(--color-pickup)")
  .replace(/theme\('colors\.dropoff'\)/g, "var(--color-dropoff)")
  .replace(/theme\('colors\.slate\.(\d+)'\)/g, "var(--color-slate-$1)")
  .replace(/theme\('zIndex\.header-menu'\)/g, "var(--z-index-header-menu)")
  .replace(/theme\('zIndex\.(\w+)'\)/g, "var(--z-index-$1)")
  .replace(/@layer base \{\s*:root \{[\s\S]*?\}\s*/, "@layer base {\n")
  .replace(/duration-base/g, "duration-[250ms]")
  .replace(/duration-fast/g, "duration-[150ms]")
  .replace(/ease-out-soft/g, "ease-[cubic-bezier(0.2,0.8,0.2,1)]");

const header = `/* Client design tokens + kx-*/ksb-* components (ported from Laravel app.css for Tailwind v4). */
@import "@fontsource/be-vietnam-pro/400.css";
@import "@fontsource/be-vietnam-pro/500.css";
@import "@fontsource/be-vietnam-pro/600.css";
@import "@fontsource/be-vietnam-pro/700.css";
@import "@fontsource/be-vietnam-pro/800.css";
@import "@fontsource/manrope/500.css";
@import "@fontsource/manrope/600.css";
@import "@fontsource/manrope/700.css";
@import "@fontsource/manrope/800.css";
@import "tailwindcss";

@theme inline {
  --color-brand-50: #fff9e6;
  --color-brand-100: #ffefbf;
  --color-brand-200: #ffe08a;
  --color-brand-300: #ffd156;
  --color-brand-400: #ffc43a;
  --color-brand-500: #FFC900;
  --color-brand-600: #FF9B00;
  --color-brand-700: #d97d00;
  --color-brand-800: #a85f00;
  --color-brand-900: #744100;
  --color-primary-50: #fff9e6;
  --color-primary-100: #ffefbf;
  --color-primary-500: #FFC900;
  --color-primary-600: #FF9B00;
  --color-primary-700: #d97d00;
  --color-accent: #FFE100;
  --color-accent-50: #fffce5;
  --color-accent-100: #fff5b8;
  --color-accent-500: #FFE100;
  --color-accent-600: #FFC900;
  --color-accent-700: #b86100;
  --color-surface: #ffffff;
  --color-page: #FFFDF7;
  --color-panel: #F7F2E9;
  --color-line: #EDE4D3;
  --color-line-strong: #E2D6BF;
  --color-ink: #0F172A;
  --color-muted: #5B6472;
  --color-contrast-800: #071a2e;
  --color-contrast-900: #04111f;
  --color-pickup: #10B981;
  --color-dropoff: #EF4444;
  --color-info: #2563EB;
  --color-warn: #F59E0B;
  --color-navy-700: #0f2a44;
  --color-navy-800: #071a2e;
  --color-navy-900: #04111f;
  --font-sans: "Be Vietnam Pro", system-ui, sans-serif;
  --font-display: "Be Vietnam Pro", system-ui, sans-serif;
  --font-header: Manrope, "Be Vietnam Pro", system-ui, sans-serif;
  --radius-sm: 2px;
  --radius-DEFAULT: 2px;
  --radius-control: 2px;
  --radius-panel: 2px;
  --shadow-card: 0 8px 24px -12px rgba(4, 17, 31, 0.20);
  --shadow-soft: none;
  --z-index-elevated: 10;
  --z-index-search: 20;
  --z-index-header: 40;
  --z-index-header-menu: 45;
  --z-index-drawer: 60;
  --z-index-modal: 70;
  --z-index-alert: 80;
  --animate-reveal-up: reveal-up 200ms ease-out both;
}

@keyframes reveal-up {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}

`;

const bookingExtras = `
@layer components {
  .booking-hero {
    background: linear-gradient(135deg, var(--color-contrast-900), var(--color-navy-700));
  }
  .z-elevated { z-index: var(--z-index-elevated); }
  .kx-header--scrolled {
    box-shadow: 0 8px 24px -16px rgba(4, 17, 31, 0.35);
  }
}
`;

fs.writeFileSync(outPath, header + body + bookingExtras);
console.log("wrote", outPath, fs.statSync(outPath).size);

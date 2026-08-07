import { Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";

/**
 * Floating contact affordances (messenger / Zalo / hotline). Presentational only.
 */
export async function FloatingContact({ locale, webProfile }) {
  const t = await getTranslations({
    locale,
    namespace: "client.nav",
  });
  let messengerId = "";
  if (webProfile.facebook_url) {
    try {
      const path = new URL(webProfile.facebook_url).pathname;
      messengerId = path.split("/").filter(Boolean).pop() ?? "";
    } catch {
      messengerId = "";
    }
  }
  const hotlineTel = webProfile.hotline
    ? webProfile.hotline.replace(/[ .]/g, "")
    : "";
  return (
    <div className="kx-floating-contact fixed bottom-6 right-4 hidden flex-col gap-3 md:right-6 md:flex">
      {messengerId !== "" && (
        <a
          href={`https://m.me/${messengerId}`}
          target="_blank"
          rel="noopener noreferrer"
          className="kx-floating-btn"
          aria-label="Messenger"
        >
          <MessengerIcon className="h-5 w-5" />
        </a>
      )}
      {webProfile.zalo_url && (
        <a
          href={webProfile.zalo_url}
          target="_blank"
          rel="noopener noreferrer"
          className="kx-floating-btn"
          aria-label="Zalo"
        >
          <span className="text-xs font-extrabold tracking-tight">Za</span>
        </a>
      )}
      {webProfile.hotline && (
        <a
          href={`tel:${hotlineTel}`}
          className="kx-floating-btn kx-floating-btn--primary"
          aria-label={t("hotline")}
        >
          <Phone className="h-4 w-4" aria-hidden="true" />
        </a>
      )}
    </div>
  );
}
function MessengerIcon({ className }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2C6.477 2 2 6.145 2 11.24c0 2.9 1.454 5.49 3.727 7.18V22l3.405-1.87c.91.253 1.874.39 2.868.39 5.523 0 10-4.145 10-9.28C22 6.145 17.523 2 12 2Zm1.008 12.49-2.548-2.72-4.976 2.72 5.474-5.81 2.61 2.72 4.913-2.72-5.473 5.81Z" />
    </svg>
  );
}

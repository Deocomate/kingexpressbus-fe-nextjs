/**
 * Port of the page-scoped `@push('styles')` block in
 * `client/contact/index.blade.php` (hero background drift animation + the
 * map iframe wrapper). Kept local to this route rather than in the shared
 * `globals.css` — same rationale as `about-page-styles.jsx`.
 */
export function ContactPageStyles() {
  return (
    <style>{`
      @keyframes contact-hero-shift {
        0% {
          background-position: center top;
        }

        100% {
          background-position: center bottom;
        }
      }

      .contact-hero-bg {
        background-image:
          linear-gradient(180deg, rgba(4, 17, 31, 0.58), rgba(4, 17, 31, 0.78)),
          url('/assets/client/images/city_imgs/ha-noi.jpg');
        background-size: cover;
        background-position: center;
        animation: contact-hero-shift 17s ease-in-out infinite alternate;
      }

      .contact-map-wrap {
        position: relative;
        overflow: hidden;
        border-radius: 2px;
        min-height: 320px;
      }

      .contact-map-wrap iframe {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        border: 0;
      }

      @media (prefers-reduced-motion: reduce) {
        .contact-hero-bg {
          animation: none;
        }
      }
    `}</style>
  );
}

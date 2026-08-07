/**
 * CMS-page scoped styles (hero drift + prose heading/link tweaks).
 */
export function CmsPageStyles() {
  return (
    <style>{`
      @keyframes page-hero-drift {
        0% {
          background-position: center top;
        }

        100% {
          background-position: center bottom;
        }
      }

      .page-hero-bg {
        background-image:
          linear-gradient(180deg, rgba(4, 17, 31, 0.58), rgba(4, 17, 31, 0.78)),
          url('/assets/client/images/city_imgs/da-nang.jpg');
        background-size: cover;
        background-position: center;
        animation: page-hero-drift 18s ease-in-out infinite alternate;
      }

      @media (prefers-reduced-motion: reduce) {
        .page-hero-bg {
          animation: none;
        }
      }

      .page-content-prose :where(h2, h3, h4) {
        color: #0f172a;
        font-weight: 800;
        scroll-margin-top: 96px;
      }

      .page-content-prose a {
        color: #FF9B00;
        font-weight: 700;
        text-decoration: none;
      }

      .page-content-prose a:hover {
        color: #e68a00;
      }
    `}</style>
  );
}

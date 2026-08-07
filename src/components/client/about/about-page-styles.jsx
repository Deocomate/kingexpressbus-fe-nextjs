/**
 * Port of the page-scoped `@push('styles')` block in
 * `client/about/index.blade.php` (hero background/animation, image masks,
 * timeline rail, route-row/value-row borders, cta band background). These
 * classes are specific to this one route and were never part of the shared
 * `globals.css` design-token set ported in Phase 2/3, so they live here
 * instead of touching that shared file. Values copied verbatim from the
 * Blade `<style>` block.
 */
export function AboutPageStyles() {
  return (
    <style>{`
      .about-hero {
        position: relative;
        overflow: visible;
        min-height: clamp(660px, 78vh, 860px);
        background: #04111f;
      }

      .about-hero::before {
        content: "";
        position: absolute;
        inset: 0;
        background-image:
          linear-gradient(180deg, rgba(4, 17, 31, 0.58), rgba(4, 17, 31, 0.78)),
          url('/assets/client/images/kingexpressbus/cabin/2.jpg');
        background-size: cover;
        background-position: 58% center;
        transform: scale(1.015);
        animation: about-hero-drift 16s ease-in-out infinite alternate;
      }

      .about-proof-strip {
        border-block: 1px solid rgba(255, 255, 255, 0.14);
        background: rgba(255, 255, 255, 0.045);
        backdrop-filter: blur(10px);
      }

      .about-hero-shot,
      .about-image-mask,
      .about-destination-tile {
        overflow: hidden;
        border-radius: 2px;
        background: #e2e8f0;
      }

      .about-hero-shot {
        position: relative;
        border: 1px solid rgba(255, 255, 255, 0.16);
        background: rgba(255, 255, 255, 0.06);
      }

      .about-hero-shot span {
        position: absolute;
        inset: auto 0 0;
        padding: 0.85rem;
        background: linear-gradient(180deg, transparent, rgba(2, 9, 21, 0.84));
        color: #ffffff;
        font-size: 0.78rem;
        font-weight: 800;
      }

      .about-stat-bar {
        border-block: 1px solid rgba(148, 163, 184, 0.24);
        background: #f7f8fa;
      }

      .about-editorial-band {
        background: #f7f8fa;
      }

      .about-hero-shot img,
      .about-image-mask img,
      .about-route-row img,
      .about-destination-tile img {
        transition: transform 560ms cubic-bezier(0.2, 0.8, 0.2, 1);
      }

      .about-hero-shot:hover img,
      .about-image-mask:hover img,
      .about-route-row:hover img,
      .about-destination-tile:hover img {
        transform: scale(1.045);
      }

      .about-timeline {
        border-left: 1px solid rgba(15, 23, 42, 0.16);
      }

      .about-timeline-dot {
        box-shadow: 0 0 0 6px #f7f8fa;
      }

      .about-value-row + .about-value-row {
        border-top: 1px solid rgba(226, 232, 240, 0.9);
      }

      .about-route-row {
        border: 1px solid rgba(226, 232, 240, 0.95);
        border-radius: 2px;
        background: rgba(255, 255, 255, 0.92);
        transition: transform 220ms ease, border-color 220ms ease, box-shadow 220ms ease;
      }

      .about-route-row:hover {
        border-color: rgba(4, 17, 31, 0.22);
      }

      .about-cta-band {
        background: #04111f;
      }

      @keyframes about-hero-drift {
        from {
          background-position: 56% center;
          transform: scale(1.015);
        }

        to {
          background-position: 62% center;
          transform: scale(1.04);
        }
      }

      @media (max-width: 767px) {
        .about-hero {
          min-height: 0;
        }

        .about-hero::before {
          background-position: 64% center;
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .about-hero::before,
        .about-hero-shot img,
        .about-image-mask img,
        .about-route-row img,
        .about-destination-tile img {
          animation: none !important;
          transition: none !important;
          transform: none !important;
        }
      }
    `}</style>
  );
}

import { isMobileViewport } from "./perf";

/** Defer MP4 downloads until near viewport; autoplay once loaded. */
export function initLazyVideos() {
  loadDesktopHeroVideos();
  deferEagerVideosOnMobile();

  const videos = document.querySelectorAll<HTMLVideoElement>(
    "video[data-lazy-video]",
  );
  if (!videos.length) return;

  const loadVideo = (video: HTMLVideoElement) => {
    const source = video.querySelector<HTMLSourceElement>("source[data-src]");
    if (!source?.dataset.src || source.getAttribute("src")) return;

    source.src = source.dataset.src;
    source.removeAttribute("data-src");
    video.load();
    void video.play().catch(() => {});
  };

  if (!("IntersectionObserver" in window)) {
    videos.forEach(loadVideo);
    return;
  }

  const rootMargin = isMobileViewport() ? "80px 0px" : "250px 0px";

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        loadVideo(entry.target as HTMLVideoElement);
        observer.unobserve(entry.target);
      });
    },
    { rootMargin, threshold: 0.01 },
  );

  videos.forEach((video) => observer.observe(video));
}

function loadDesktopHeroVideos() {
  if (isMobileViewport()) return;
  document
    .querySelectorAll<HTMLVideoElement>("video[data-hero-video]")
    .forEach((video) => {
      const source = video.querySelector<HTMLSourceElement>("source[data-src]");
      if (!source?.dataset.src || source.getAttribute("src")) return;
      source.src = source.dataset.src;
      source.removeAttribute("data-src");
      video.load();
      void video.play().catch(() => {});
    });
}

/** Hero uses poster on mobile; convert any eager sources to lazy. */
function deferEagerVideosOnMobile() {
  if (!isMobileViewport()) return;

  document.querySelectorAll<HTMLVideoElement>("video").forEach((video) => {
    if (video.hasAttribute("data-lazy-video")) return;

    const source = video.querySelector<HTMLSourceElement>("source");
    if (!source?.src) return;

    video.preload = "none";
    source.dataset.src = source.src;
    source.removeAttribute("src");
    video.setAttribute("data-lazy-video", "");
  });
}

/** Narrow viewport or reduced motion — skip heavy animation work. */
export function isReducedExperience(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia(
    "(max-width: 767px), (prefers-reduced-motion: reduce)",
  ).matches;
}

export function isMobileViewport(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
}

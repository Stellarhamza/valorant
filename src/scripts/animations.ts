import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { initLazyVideos } from "./lazy-video";
import { isReducedExperience } from "./perf";
import { sporeCanvas } from "./particleCanvas.js";

(function () {
  "use strict";

  function heroVideo() {
    const mm = gsap.matchMedia();
    const gsapVideoShowcase = document.querySelectorAll(
      "[data-gsap-video-showcase]",
    );
    if (!gsapVideoShowcase.length) return;

    gsapVideoShowcase.forEach((el) => {
      mm.add("(min-width: 1280px)", () => {
        gsap.set(el, { scale: 0.8, rotationX: 10, top: -250 });
        gsap.to(el, {
          scrollTrigger: {
            trigger: el,
            start: "20% 95%",
            end: "0% 30%",
            scrub: true,
            markers: false,
          },
          scale: 1,
          rotationX: 0,
          top: 0,
          ease: "none",
        });
      });

      mm.add("(min-width: 768px) and (max-width: 1279px)", () => {
        gsap.set(el, { scale: 0.8, rotationX: 15 });
        gsap.to(el, {
          scrollTrigger: {
            trigger: el,
            start: "20% 95%",
            end: "0% 40%",
            scrub: true,
          },
          scale: 1,
          rotationX: 0,
          ease: "none",
        });
      });

      mm.add("(max-width: 767px)", () => {
        gsap.set(el, { scale: 1, rotationX: 0, top: 0, clearProps: "transform" });
      });
    });
  }

  function updateTrustedPartners() {
    const partners = document.querySelector("[data-trusted-brands-images]");
    if (!partners) return;

    const images = JSON.parse(partners.dataset.trustedBrandsImages);
    const MAX = 7;

    function getRandomImages(list: string[]) {
      return [...list].sort(() => 0.5 - Math.random()).slice(0, MAX);
    }

    function render(list: string[]) {
      partners.textContent = "";
      const frag = document.createDocumentFragment();
      list.forEach((src) => {
        const img = document.createElement("img");
        img.src = src;
        img.alt = "Trusted Brand";
        img.width = 140;
        img.height = 140;
        img.decoding = "async";
        img.loading = "lazy";
        img.draggable = false;
        frag.appendChild(img);
      });
      partners.appendChild(frag);
    }

    function animate() {
      const selected = getRandomImages(images);
      render(selected);
      const imgs = partners.children;

      gsap.fromTo(
        imgs,
        { opacity: 0, filter: "blur(10px)", y: -30 },
        { opacity: 1, filter: "blur(0px)", y: 0, duration: 0.9, stagger: 0.15 },
      );

      gsap.to(imgs, {
        opacity: 0,
        filter: "blur(10px)",
        y: 20,
        duration: 0.9,
        delay: 3,
        stagger: 0.15,
        onComplete: animate,
      });
    }

    animate();
  }

  function sporesEffect() {
    sporeCanvas(".heroSporeCanvas", 140, 0.2, 1.6, 0.0, 0.1, 800);
  }

  function pricingToggle() {
    const toggle = document.querySelector("[data-pricing-toggle]");
    const labels = document.querySelectorAll(".price-toggler-btn");
    if (!toggle) return;

    toggle.addEventListener("change", (e) => {
      const isYearly = (e.target as HTMLInputElement).checked;

      if (isYearly) {
        labels[0]?.classList.remove("active");
        labels[1]?.classList.add("active");
      } else {
        labels[0]?.classList.add("active");
        labels[1]?.classList.remove("active");
      }

      const monthlyElements = document.querySelectorAll(
        "[data-price-tag-monthly]",
      );
      const yearlyElements = document.querySelectorAll(
        "[data-price-tag-yearly]",
      );
      const elementsToHide = isYearly ? monthlyElements : yearlyElements;
      const elementsToShow = isYearly ? yearlyElements : monthlyElements;

      elementsToHide.forEach((el, index) => {
        setTimeout(() => {
          el.classList.remove("active");
          el.classList.add("inactive");
        }, index * 150);
      });

      elementsToShow.forEach((el, index) => {
        setTimeout(() => {
          el.classList.add("active");
          el.classList.remove("inactive");
        }, index * 150);
      });
    });
  }

  function initHeavyEffects() {
    gsap.registerPlugin(ScrollTrigger);
    new Lenis({ autoRaf: true });
    heroVideo();
    updateTrustedPartners();
    sporesEffect();
  }

  function init() {
    initLazyVideos();
    pricingToggle();

    if (isReducedExperience()) {
      document.querySelectorAll("[data-gsap-video-showcase]").forEach((el) => {
        (el as HTMLElement).style.transform = "none";
      });
      document.querySelectorAll(".heroSporeCanvas").forEach((canvas) => {
        canvas.remove();
      });
      return;
    }

    initHeavyEffects();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  let resizeTimer: ReturnType<typeof setTimeout>;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (!isReducedExperience() && typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.refresh();
      }
    }, 250);
  });
})();

"use client";

import { useEffect, useRef } from "react";

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  disabled?: boolean;
}

/**
 * Shared, highly performant IntersectionObserver hook for scroll reveals.
 * Content is 100% visible by default on load (opacity: 1), ensuring zero scroll-reveal content gating or blank frames.
 */
export function useScrollReveal<T extends HTMLElement = HTMLDivElement>(
  options: ScrollRevealOptions = {}
) {
  const elementRef = useRef<T>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element || options.disabled) return;

    // Respect prefers-reduced-motion: if enabled, ensure no transition delay
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      element.classList.add("reveal-visible");
      return;
    }

    // Shared single observer instance for memory efficiency
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("reveal-visible");
            // Unobserve after initial reveal to free main-thread resources
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || "0px 0px -50px 0px",
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options.threshold, options.rootMargin, options.disabled]);

  return elementRef;
}

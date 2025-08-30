import { useEffect, useRef } from 'react';

export const useAnimationOptimization = () => {
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Add performance optimizations
    element.style.willChange = 'transform';
    element.style.transform = 'translateZ(0)';
    element.style.backfaceVisibility = 'hidden';

    // Cleanup function
    return () => {
      if (element) {
        element.style.willChange = 'auto';
      }
    };
  }, []);

  return elementRef;
};

// Hook to detect if user prefers reduced motion
export const useReducedMotion = () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  return prefersReducedMotion;
};

// Hook to optimize scroll performance
export const useSmoothScroll = () => {
  useEffect(() => {
    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    };

    // Add smooth scroll to window object for global access
    (window as any).smoothScrollToTop = scrollToTop;

    return () => {
      delete (window as any).smoothScrollToTop;
    };
  }, []);
};

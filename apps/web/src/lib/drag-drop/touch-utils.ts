'use client';

/**
 * Touch gesture utilities for mobile drag and drop
 * Provides haptic feedback and gesture detection
 */

/**
 * Trigger haptic feedback on mobile devices
 * @param pattern - 'tap' for short feedback, 'long' for longer feedback
 */
export const triggerHaptic = (pattern: 'tap' | 'long' = 'tap') => {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    if (pattern === 'tap') {
      navigator.vibrate(10);
    } else if (pattern === 'long') {
      navigator.vibrate([10, 5, 10]);
    }
  }
};

/**
 * Detect if device supports touch events
 */
export const isTouchDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  return (
    ('ontouchstart' in window) ||
    (navigator.maxTouchPoints > 0) ||
    ((navigator as any).msMaxTouchPoints > 0)
  );
};

/**
 * Get viewport height considering mobile browser UI
 */
export const getViewportHeight = (): number => {
  if (typeof window === 'undefined') return 0;
  return Math.max(
    document.documentElement.clientHeight,
    window.innerHeight || 0
  );
};

/**
 * Prevent default scroll behavior on drag
 */
export const preventScrollDuringDrag = (element: HTMLElement | null) => {
  if (!element) return;

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault();
  };

  element.addEventListener('touchmove', handleTouchMove, { passive: false });

  return () => {
    element.removeEventListener('touchmove', handleTouchMove);
  };
};

/**
 * Detect long press gesture
 */
export const useDetectLongPress = (
  element: HTMLElement | null,
  onLongPress: () => void,
  duration: number = 500
): (() => void) => {
  if (!element) return () => {};

  let timeout: NodeJS.Timeout | null = null;

  const handleTouchStart = () => {
    timeout = setTimeout(() => {
      triggerHaptic('long');
      onLongPress();
    }, duration);
  };

  const handleTouchEnd = () => {
    if (timeout) {
      clearTimeout(timeout);
    }
  };

  element.addEventListener('touchstart', handleTouchStart);
  element.addEventListener('touchend', handleTouchEnd);
  element.addEventListener('touchcancel', handleTouchEnd);

  return () => {
    element.removeEventListener('touchstart', handleTouchStart);
    element.removeEventListener('touchend', handleTouchEnd);
    element.removeEventListener('touchcancel', handleTouchEnd);
  };
};

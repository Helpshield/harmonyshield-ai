import { useState, useEffect } from 'react';

type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpoints = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

export function useResponsive() {
  const [windowSize, setWindowSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
  });

  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint>('lg');

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setWindowSize({ width, height });

      // Determine current breakpoint
      let bp: Breakpoint = 'xs';
      for (const [breakpoint, minWidth] of Object.entries(breakpoints)) {
        if (width >= minWidth) {
          bp = breakpoint as Breakpoint;
        }
      }
      setCurrentBreakpoint(bp);
    };

    // Set initial values
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isBreakpoint = (bp: Breakpoint) => currentBreakpoint === bp;
  const isBreakpointUp = (bp: Breakpoint) => windowSize.width >= breakpoints[bp];
  const isBreakpointDown = (bp: Breakpoint) => windowSize.width < breakpoints[bp];
  
  const isMobile = isBreakpointDown('md');
  const isTablet = isBreakpointUp('md') && isBreakpointDown('lg');
  const isDesktop = isBreakpointUp('lg');
  const isLargeDesktop = isBreakpointUp('xl');

  return {
    windowSize,
    currentBreakpoint,
    isBreakpoint,
    isBreakpointUp,
    isBreakpointDown,
    isMobile,
    isTablet,
    isDesktop,
    isLargeDesktop,
    // Utility functions
    getColumnsForBreakpoint: (columns: Partial<Record<Breakpoint, number>>) => {
      const sortedBreakpoints = Object.entries(breakpoints)
        .sort(([, a], [, b]) => b - a) // Sort by width descending
        .map(([bp]) => bp as Breakpoint);

      for (const bp of sortedBreakpoints) {
        if (columns[bp] !== undefined && isBreakpointUp(bp)) {
          return columns[bp];
        }
      }
      return columns.xs || 1;
    },
    // Responsive values
    responsive: <T>(values: Partial<Record<Breakpoint, T>>): T | undefined => {
      const sortedBreakpoints = Object.entries(breakpoints)
        .sort(([, a], [, b]) => b - a) // Sort by width descending
        .map(([bp]) => bp as Breakpoint);

      for (const bp of sortedBreakpoints) {
        if (values[bp] !== undefined && isBreakpointUp(bp)) {
          return values[bp];
        }
      }
      return undefined;
    }
  };
}

// Custom hook for container queries (useful for component-level responsiveness)
export function useContainerSize(ref: React.RefObject<HTMLElement>) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!ref.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        setSize({ width, height });
      }
    });

    resizeObserver.observe(ref.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [ref]);

  return {
    ...size,
    isSmall: size.width < 400,
    isMedium: size.width >= 400 && size.width < 800,
    isLarge: size.width >= 800,
  };
}

// Hook for media queries
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    const updateMatches = () => setMatches(media.matches);
    updateMatches();
    
    // Use the newer addEventListener if available
    if (media.addEventListener) {
      media.addEventListener('change', updateMatches);
      return () => media.removeEventListener('change', updateMatches);
    } else {
      // Fall back to the deprecated addListener method
      media.addListener(updateMatches);
      return () => media.removeListener(updateMatches);
    }
  }, [query]);

  return matches;
}

// Predefined media query hooks
export const useIsMobile = () => useMediaQuery('(max-width: 767px)');
export const useIsTablet = () => useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)');
export const usePrefersDarkMode = () => useMediaQuery('(prefers-color-scheme: dark)');
export const usePrefersReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)');
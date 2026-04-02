import { ref, computed, onMounted, onUnmounted } from 'vue'

// Common breakpoint values (in pixels)
export const BREAKPOINTS = {
  xs: 480,
  sm: 576,
  md: 768,
  lg: 992,
  xl: 1200,
  xxl: 1600
} as const

export type BreakpointKey = keyof typeof BREAKPOINTS
export type BreakpointValue = (typeof BREAKPOINTS)[BreakpointKey]

// Screen size interface
export interface ScreenSize {
  width: number
  height: number
}

// Hook options interface
export interface UseResponsiveOptions {
  /** Debounce delay in milliseconds for resize events */
  debounceDelay?: number
  /** Whether to use passive event listeners for better performance */
  passive?: boolean
}

/**
 * Optimized responsive hook that detects screen size changes
 * @param breakpoint - The breakpoint to check against (can be a key or pixel value)
 * @param options - Configuration options for the hook
 * @returns Object containing responsive state and utilities
 */
export function useResponsive(
  breakpoint: BreakpointKey | BreakpointValue | number,
  options: UseResponsiveOptions = {}
) {
  const { debounceDelay = 100, passive = true } = options

  // Current screen dimensions
  const screenSize = ref<ScreenSize>({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0
  })

  // Debounce timer reference
  let debounceTimer: NodeJS.Timeout | null = null

  // Get the actual pixel value for the breakpoint
  const getBreakpointValue = (bp: BreakpointKey | BreakpointValue | number): number => {
    if (typeof bp === 'number') return bp
    if (typeof bp === 'string' && bp in BREAKPOINTS) return BREAKPOINTS[bp]
    return 0
  }

  const breakpointValue = getBreakpointValue(breakpoint)

  // Computed responsive states
  const isAbove = computed(() => screenSize.value.width >= breakpointValue)
  const isBelow = computed(() => screenSize.value.width < breakpointValue)
  const isExactly = computed(() => screenSize.value.width === breakpointValue)

  // Responsive range checks
  const isBetween = (min: BreakpointKey | BreakpointValue | number, max: BreakpointKey | BreakpointValue | number) => {
    const minValue = getBreakpointValue(min)
    const maxValue = getBreakpointValue(max)
    return screenSize.value.width >= minValue && screenSize.value.width < maxValue
  }

  // Update screen size with debouncing
  const updateScreenSize = () => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    debounceTimer = setTimeout(() => {
      screenSize.value = {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }, debounceDelay)
  }

  // Handle resize event
  const handleResize = () => {
    updateScreenSize()
  }

  // Initialize screen size
  const initScreenSize = () => {
    if (typeof window !== 'undefined') {
      screenSize.value = {
        width: window.innerWidth,
        height: window.innerHeight
      }
    }
  }

  // Setup event listeners
  const setupListeners = () => {
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize, { passive })
      // Also listen for orientation change on mobile devices
      window.addEventListener('orientationchange', handleResize, { passive })
    }
  }

  // Cleanup event listeners
  const cleanupListeners = () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }
  }

  // Lifecycle hooks
  onMounted(() => {
    initScreenSize()
    setupListeners()
  })

  onUnmounted(() => {
    cleanupListeners()
  })

  return {
    // Screen dimensions
    screenSize: computed(() => screenSize.value),
    width: computed(() => screenSize.value.width),
    height: computed(() => screenSize.value.height),

    // Responsive states
    isAbove,
    isBelow,
    isExactly,

    // Utility functions
    isBetween,
    getBreakpointValue,

    // Breakpoint constants
    BREAKPOINTS
  }
}

// Convenience hooks for common breakpoints
export const useIsMobile = () => useResponsive('md')
export const useIsTablet = () => useResponsive('lg')
export const useIsDesktop = () => useResponsive('xl')

// Hook for checking if screen is in a specific range
export const useScreenRange = (
  min: BreakpointKey | BreakpointValue | number,
  max: BreakpointKey | BreakpointValue | number
) => {
  const { screenSize, isBetween } = useResponsive(min)
  return {
    screenSize,
    isInRange: computed(() => isBetween(min, max))
  }
}

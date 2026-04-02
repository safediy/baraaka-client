import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  // presetWebFonts,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss'

export default defineConfig({
  // Borderlar va standart resetlar ishlashi uchun preflight: true bo'lishi shart
  presets: [
    presetUno({ preflight: true }),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true
    }),
    presetTypography()
    // presetWebFonts({
    //   fonts: {
    //     sans: 'Inter',
    //   },
    // }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  theme: {
    breakpoints: {
      xs: '320px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    },
    colors: {
      primary: '#044CA2',
      secondary: '#111827',
      error: '#d81b51',
      warning: '#ff9500',
      success: '#67c23a',
      gray: {
        50: '#f9fafb',
        100: '#f3f4f6',
        200: '#e5e7eb',
        300: '#d1d5db',
        400: '#9ca3af',
        500: '#6b7280',
        600: '#4b5563',
        700: '#374151',
        800: '#1f2937',
        900: '#111827'
      }
    }
  },
  shortcuts: {
    // Layout utilities
    'uno-wh-full': 'w-full h-full',
    'uno-flex-center': 'flex justify-center items-center',
    'uno-flex-x-center': 'flex justify-center',
    'uno-flex-y-center': 'flex items-center',
    'uno-flex-col': 'flex flex-col',
    'uno-pickupPoint-active': 'border-2! border-primary! bg-white',
    'uno-pickupPoint-inactive': 'border-1! border-gray-200! bg-white',

    // Text & Colors (!important qo'shilgan, Element Plus bilan to'qnashmasligi uchun)
    'uno-text-main': '!text-secondary',
    'uno-text-secondary': '!text-gray-500',
    'uno-text-primary': '!text-primary',
    'uno-text-error': '!text-error',

    // Buttons (Custom style)
    'uno-dark-btn':
      'w-full !h-12 bg-[#030712] !text-[15px] !text-white !font-medium rounded-[12px]! hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed! transition-all border-none',
    'uno-light-btn':
      'w-full !h-12 !bg-white !border !border-gray-200 !text-[15px] !text-secondary !font-medium !rounded-[12px] hover:!bg-gray-100 transition-all',
    'uno-primary-btn':
      'w-full !h-12 !bg-primary !text-[15px] !text-white !font-medium !rounded-[12px] hover:opacity-90 transition-all border-none',

    // Card Selection Style (Siz kutgan border effekti uchun)
    'uno-card-active': 'border-2! border-primary! bg-white',
    'uno-card-inactive': 'border-1! border-gray-200! bg-white',
    'uno-card-base': 'p-4 rounded-[16px] w-full relative cursor-pointer transition-all duration-200 border-solid',

    // Typography
    'uno-heading': 'text-[24px] font-bold text-secondary',
    'uno-body': 'text-[15px] font-medium text-secondary',
    'uno-caption': 'text-[13px] font-medium text-gray-500'
  },
  rules: [
    // Radial gradient qoidasi
    [/^bg-gradient-radial-\[(.+)\]$/, ([, d]) => ({ background: `radial-gradient(${d.replace(/_/g, ' ')})` })],
    // Safe area padding (Mobile uchun)
    [/^p-safe-(\d+)$/, ([, d]) => ({ padding: `max(${d}px, env(safe-area-inset-top))` })]
  ],
  safelist: ['uno-dark-btn', 'uno-light-btn', 'uno-primary-btn', 'uno-text-main', 'border-solid']
})

import mitt from 'mitt'

export const eventBus = mitt<{
  'track-added': void
}>()

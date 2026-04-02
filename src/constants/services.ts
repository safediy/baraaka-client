import UzpostLogo from '@/assets/svg/uzPost.svg'
import UzpostMapLogo from '@/assets/service-images/uzpostMap.svg'
import RelogLogo from '@/assets/relog.png'
import IpostLogo from '@/assets/service-images/ipost.svg?url'
import IpostMapLogo from '@/assets/service-images/ipostMap.svg?url'
import EmuLogo from '@/views/map/images/emu.svg?url'
import EmuMapLogo from '@/assets/svg/emu-icon.svg?url'
import StarexLogo from '@/assets/service-images/starex.svg?url'
import StarexMapLogo from '@/assets/service-images/starex-icon.svg?url'
import BtsLogo from '@/assets/service-images/bts.svg'
import BtsMapLogo from '@/assets/service-images/btsMap.svg'

export interface ServiceConfig {
  title: string
  color: string
  logo: string
  mapLogo: string
  size: number
}

export const SERVICES: Record<number, ServiceConfig> = {
  1: {
    title: 'UZPOST',
    color: '#F07824',
    logo: UzpostLogo,
    mapLogo: UzpostMapLogo,
    size: 55
  },
  2: {
    title: 'RELOG',
    color: '#4F2A7D',
    logo: RelogLogo,
    mapLogo: RelogLogo,
    size: 55
  },
  3: {
    title: 'IPOST',
    color: '#044CA2',
    logo: IpostLogo,
    mapLogo: IpostMapLogo,
    size: 75
  },
  4: {
    title: 'EMU',
    color: '#8E3A92',
    logo: EmuLogo,
    mapLogo: EmuMapLogo,
    size: 55
  },
  5: {
    title: 'STAREX',
    color: '#192088',
    logo: StarexLogo,
    mapLogo: StarexMapLogo,
    size: 55
  },
  6: {
    title: 'BTS',
    color: '#E9671E',
    logo: BtsLogo,
    mapLogo: BtsMapLogo,
    size: 55
  }
} as const

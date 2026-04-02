import { Nullable } from './common'

export type ChinaAddressResponse = {
  address: string
  postalCode: string
  source: Nullable<string>
}

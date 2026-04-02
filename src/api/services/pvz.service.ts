import { request } from '@/utils/service'
import { NewPvzCredential, PersonPvzDTO, PvzRatingCredential } from 'types/pvz'

export const personPvzService = {
  getPersonPvz: async ({ queryKey }: any) => {
    const [_key, params] = queryKey

    return request<PersonPvzDTO[]>({
      url: '/person-pvz',
      method: 'get',
      params: params
    })
  },

  addPersonPvz: async (data: NewPvzCredential) => {
    return request({
      url: '/person-pvz',
      method: 'post',
      data
    })
  },

  softDeletePersonPvz: async (id: number) => {
    return request({
      url: `/person-pvz/soft-delete/${id}`,
      method: 'delete'
    })
  },

  pvzRating: async (payload: PvzRatingCredential) => {
    return request({
      url: '/pvz-rating',
      method: 'post',
      data: payload
    })
  }
}

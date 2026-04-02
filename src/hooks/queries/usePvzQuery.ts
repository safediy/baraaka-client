import { personPvzService } from '@/api/services/pvz.service'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { useQuery } from '@tanstack/vue-query'

export const useGetPersonPvzQuery = (params: any = {}, options = {}) => {
  return useQuery({
    queryKey: [QUERY_KEYS.PERSON_PVZ_LIST, params],
    queryFn: personPvzService.getPersonPvz,
    ...options
  })
}

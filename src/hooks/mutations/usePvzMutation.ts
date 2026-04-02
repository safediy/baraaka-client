import { personPvzService } from '@/api/services/pvz.service'
import { QUERY_KEYS } from '@/constants/queryKeys'
import { useMutation, useQueryClient } from '@tanstack/vue-query'
import { NewPvzCredential, PvzRatingCredential } from 'types/pvz'

export const useAddPersonPvzMutation = (options = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['add-person-pvz'],
    mutationFn: (data: NewPvzCredential) => personPvzService.addPersonPvz(data),
    ...options,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PERSON_PVZ_LIST] })
    }
  })
}

export const useSoftDeletePersonPvzMutation = (options = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['delete-person-pvz'],
    mutationFn: (id: number) => personPvzService.softDeletePersonPvz(id),
    ...options,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PERSON_PVZ_LIST] })
    }
  })
}

export const usePvzRatingMutation = (options = {}) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationKey: ['pvz-rating'],
    mutationFn: (payload: PvzRatingCredential) => personPvzService.pvzRating(payload),
    ...options,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.PERSON_PVZ_LIST] })
    }
  })
}

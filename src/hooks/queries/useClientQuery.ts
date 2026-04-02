import { clientService } from '@/api/services/client.service'
import { useQuery } from '@tanstack/vue-query'

export const useGetChinaAddress = (options = {}) => {
  return useQuery({
    queryKey: ['chinaAddress'],
    queryFn: clientService.getChinaAddress,
    ...options
  })
}

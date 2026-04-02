import { useUserStoreHook } from '@/store/modules/user'
import constant from '@/utils/constant'

/** 全局权限判断函数，和权限指令 v-permission 功能类似 */
export const checkPermission = (permissionRoles: string[]): boolean => {
  if (Array.isArray(permissionRoles) && permissionRoles.length > 0) {
    const { role } = useUserStoreHook()
    return permissionRoles.includes(role)
  } else {
    return false
  }
}

export const isPlatformRole = (): boolean => {
  const { role } = useUserStoreHook()
  return constant.PLATFORM_ROLES.includes(role)
}

export function isCompanyRole(role: string): boolean {
  return constant.COMPANY_ROLES.includes(role)
}

export function getAllowRoles(): string[] {
  const { role } = useUserStoreHook()
  const roleLevels = constant.LEVEL_ROLES
  const index = roleLevels.findIndex((r) => r === role)
  if (index === -1) return []
  return roleLevels.slice(index + 1)
}
// export function isAllowRole(operatorRole: string, role: string): boolean {
//   const allowRoles = getAllowRoles(operatorRole);
//   return allowRoles.includes(role);
// }

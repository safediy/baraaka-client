import { ElMessageBox } from 'element-plus'

export const confirmBox = async (t: Function, message: string): Promise<boolean> => {
  try {
    await ElMessageBox.confirm(message, t('confirm'), {
      confirmButtonText: t('confirm'),
      cancelButtonText: t('cancel'),
      type: 'warning'
    })
    return true
  } catch (error) {
    return false
  }
}

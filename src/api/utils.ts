import { ElMessageBox, type MessageBoxInputData } from 'element-plus'

export async function confirmBox(message: string, title: string): Promise<MessageBoxInputData> {
  return await ElMessageBox.confirm(
    message,
    title,
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
}
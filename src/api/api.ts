import axios from 'axios'
import { ElMessage } from 'element-plus'
import { getAuth } from '@/api/auth'

// 后端api地址
export const baseUrl = import.meta.env.VITE_APP_BASE_URL

const uploadUrl = `${baseUrl}/api/file`
export const uploadFile = async (blob: Blob): Promise<string | null> => {
  const formData = new FormData()
  formData.append('file', blob)
  const resp = await axios.putForm<string>(uploadUrl, formData, {
    headers: { 'Authorization': getAuth().token }
  })
  if (resp.status !== 200) {
    ElMessage({
      type: 'warning',
      message: resp.data
    })
    return null
  }
  return resp.data
}
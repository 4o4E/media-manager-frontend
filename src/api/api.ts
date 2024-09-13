import axios from 'axios'
import { ElMessage } from 'element-plus'
import { auth } from '@/api/auth'

// 后端api地址
export const baseUrl = import.meta.env.VITE_APP_BASE_URL

/**
 * 配置好的axios实例
 */
export const client = axios.create({
  // baseURL: baseUrl,
  timeout: 1000,
  headers: { Authorization: auth.value?.token },
  validateStatus: status => status < 500,
})

export async function uploadFile(blob: Blob): Promise<string | null> {
  const formData = new FormData()
  formData.append('file', blob)
  const resp = await client.putForm<BaseResp<string>>('/api/file', formData).then(e => e.data)
  if (!resp.success) {
    ElMessage({
      type: 'warning',
      message: resp.message,
    })
    return null
  }
  return resp.data!
}

export interface BaseResp<R = void> {
  success: boolean
  message: string
  data?: R
}

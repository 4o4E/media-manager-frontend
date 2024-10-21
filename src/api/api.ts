import axios from 'axios'
import { ElMessage } from 'element-plus'
import { auth } from '@/api/auth'

/**
 * 配置好的axios实例
 */
export const client = (() => {
   const instance = axios.create({
    timeout: 1000,
    validateStatus: status => status < 500,
  })
  // 拦截器
  instance.interceptors.request.use(
    config => {
      // 动态获取 auth 值并设置 Authorization 头部
      const token = auth.value?.token
      if (token) config.headers.Authorization = token
      return config;
    },
    error => {
      return Promise.reject(error);
    }
  );
   return instance
})()

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

export interface PageResp<T> {
  total: number
  data: T[]
}

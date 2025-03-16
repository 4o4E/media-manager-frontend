import axios from 'axios'
import { ElMessage } from 'element-plus'
import { auth } from '@/api/auth'
import JSONbig from 'json-bigint'

export const jsonBig = JSONbig({ storeAsString: true })

/**
 * 配置好的axios实例
 */
export const client = (() => {
  function transformReq(data: any) {
    if (typeof data === 'bigint') {
      return data.toString()
    }
    if (typeof data !== 'object') {
      return data
    }
    const result: any = {}
    for (let dataKey in data) {
      const datum = data[dataKey]
      if (typeof datum === 'bigint') {
        result[dataKey] = datum.toString()
      } else if (Array.isArray(datum)) {
        result[dataKey] = (datum as any[]).map(item => transformReq(item))
      } else if (typeof datum === 'object') {
        result[dataKey] = transformReq(datum)
      } else {
        result[dataKey] = datum
      }
    }
    return result
  }
  const instance = axios.create({
    timeout: 15000,
    validateStatus: status => status < 500,
    transformResponse: data => {
      try {
        return parse(data)
      } catch (e) {
        return data
      }
    },
    transformRequest: (data, headers) => {
      headers['Content-Type'] = 'application/json'
      return JSON.stringify(transformReq(data))
    }
  })
  // 拦截器
  instance.interceptors.request.use(
    config => {
      // 动态获取 auth 值并设置 Authorization 头部
      const token = auth.value?.token
      if (token) config.headers.Authorization = token
      return config
    },
    error => {
      return Promise.reject(error)
    }
  )
  return instance
})()

export async function uploadFile(blob: Blob): Promise<string | null> {
  const formData = new FormData()
  formData.append('file', blob)
  const resp = await client.putForm<BaseResp<string>>('/api/file', formData).then(e => e.data)
  if (!resp.success) {
    ElMessage({
      type: 'warning',
      message: resp.message
    })
    return null
  }
  return resp.data!
}

export function stringify(data: any): string {
  return jsonBig.stringify(data)
}

export function parse<T>(data: string): T {
  return jsonBig.parse(data)
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

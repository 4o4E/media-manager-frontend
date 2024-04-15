import type { Login } from '@/api/type'
import router from '@/router'
import { ElMessage } from 'element-plus'
import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios'
import { nextTick } from 'vue'

export function setAuth(info: Login) {
  localStorage.setItem('TOKEN', JSON.stringify(info))
}

export function getAuthOrNull(): Login | null {
  const data = localStorage.getItem('TOKEN')
  if (!data) return null
  return JSON.parse(data)
}


let cache: Login | null = null
export function getAuth(): Login {
  if (cache !== null) return cache
  const data = localStorage.getItem('TOKEN')
  if (!data) {
    router.push('/login').then(() => {
      ElMessage({
        type: 'warning',
        message: '请先登录'
      })
    })
    throw Error('no auth')
  }
  const login = JSON.parse(data)
  cache = login
  return login
}

export function clearAuth() {
  localStorage.removeItem('TOKEN')
}

export function useToken<T, R = AxiosResponse<T>>(config: AxiosRequestConfig): Promise<R> {
  config.headers = { Authorization: getAuth().token, ...config.headers }
  return axios.request<T, R>(config)
}

export function requireAuth() {
  const auth = getAuthOrNull()
  if (auth === null) {
    ElMessage({
      type: 'warning',
      message: '请先登录'
    })
    nextTick(() => router.push('/login'))
  }
  return auth
}
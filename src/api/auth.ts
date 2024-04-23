import type { Login } from '@/api/type'
import router from '@/router'
import { ElMessage } from 'element-plus'
import { nextTick, ref, watch } from 'vue'

/**
 * 当前登录信息
 */
export const auth = ref<Login | null>((() => {
  // 初始化时从localStorage中读取
  const data = localStorage.getItem('TOKEN')
  if (!data) return null
  return JSON.parse(data)
})())

// 登录状态变更时
watch(auth, (n) => {
  if (n === null) {
    localStorage.removeItem('TOKEN')
  } else {
    localStorage.setItem('TOKEN', JSON.stringify(n))
  }
})

/**
 * 若没有登录则弹出提示并转到登录界面
 */
export function requireAuth() {
  if (auth.value === null) {
    ElMessage({
      type: 'warning',
      message: '请先登录'
    })
    nextTick(() => router.push('/login'))
  }
  return auth.value
}
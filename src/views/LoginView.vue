<template>
  <!-- 登录 -->
  <template v-if="type === 'login'">
    <el-form
      ref="loginFormRef"
      label-position="right"
      label-width="100px"
      :model="loginForm"
      :rules="loginRules"
      style="max-width: 460px; margin: auto"
      status-icon
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="loginForm.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input type="password" show-password v-model="loginForm.password" placeholder="请输入密码" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="login(loginFormRef)">登录</el-button>
        <el-button @click="() => type = 'register'">没账号, 注册!</el-button>
        <el-button @click="() => type = 'forget'">密码忘了, 呜呜!</el-button>
      </el-form-item>
    </el-form>
  </template>
  <!-- 忘记密码 -->
  <template v-else-if="type === 'forget'">
    <el-form
      ref="forgetFormRef"
      label-position="right"
      label-width="100px"
      :model="forgetForm"
      :rules="forgetRules"
      style="max-width: 460px; margin: auto"
      status-icon
    >
      <el-form-item label="找回方式" prop="type">
        <el-select v-model="forgetForm.type" placeholder="Activity zone">
          <el-option label="邮箱" value="email" />
          <el-option label="手机验证码" value="sms" />
        </el-select>
      </el-form-item>
      <el-form-item :label="forgetForm.type === 'email' ? '邮箱' : '手机号'" prop="value">
        <el-input
          v-model="forgetForm.value"
          :placeholder="`请输入${forgetForm.type === 'email' ? '邮箱' : '手机号'}`"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="forget(forgetFormRef)">找回</el-button>
        <el-button @click="() => type = 'login'">有账号, 登录!</el-button>
      </el-form-item>
    </el-form>
  </template>
  <!-- 注册 -->
  <template v-else>
    <el-form
      ref="registerFormRef"
      label-position="right"
      label-width="100px"
      :model="registerForm"
      :rules="registerRules"
      style="max-width: 460px; margin: auto"
      status-icon
    >
      <el-form-item label="用户名" prop="username">
        <el-input v-model="registerForm.username" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="密码" prop="password">
        <el-input type="password" show-password v-model="registerForm.password" placeholder="请输入密码" />
      </el-form-item>
      <el-form-item label="重复密码" prop="passwordConfirm">
        <el-input type="password" show-password v-model="registerForm.passwordConfirm" placeholder="请重复密码" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="register(registerFormRef)">注册</el-button>
        <el-button @click="() => type = 'login'">有账号, 登录!</el-button>
      </el-form-item>
    </el-form>
  </template>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { type BaseResp, client } from '@/api/api'
import type { Login } from '@/api/type'
import { auth } from '@/api/auth'
import router from '@/router'

// 控制界面类型
type PageType = 'login' | 'register' | 'forget'
const type = ref<PageType>('login')

/// 登录

// 表单数据模型
interface LoginForm {
  username: string | null
  password: string | null
}

// 表单实例
const loginFormRef = ref<FormInstance>()
// 表单数据
const loginForm = reactive<LoginForm>({ username: null, password: null })
// 校验规则
const loginRules = reactive<FormRules<LoginForm>>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
  ],
})

// 发送请求
async function login(form: FormInstance | undefined) {
  if (!form) return
  await form.validate(async (valid) => {
    if (!valid) return
    const resp = await client.post<BaseResp<Login>>('/api/auth/login', loginForm).then(e => e.data)
    if (!resp.success) {
      console.log(resp.data)
      ElMessage({
        type: 'warning',
        message: resp.message,
      })
      return
    }
    // 保存用户信息
    auth.value = resp.data!
    // 跳转主界面
    await router.push('/')
    ElMessage({
      type: 'success',
      message: '登录成功',
    })
  })
}

/// 忘记密码

// 表单数据模型
type ForgetType = 'email' | 'sms'

interface ForgetForm {
  type: ForgetType,
  value: string | null
}

// 表单实例
const forgetFormRef = ref<FormInstance>()
// 表单数据
const forgetForm = reactive<ForgetForm>({ type: 'email', value: null })
// 校验规则
const forgetRules = reactive<FormRules<ForgetForm>>({
  type: [
    { required: true, trigger: 'blur' },
  ],
  value: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
  ],
})

// 发送请求
async function forget(form: FormInstance | undefined) {
  if (!form) return
  // await form.validate((valid) => {
  //   if (valid) client.post('/api/auth/login', loginForm)
  // })
  ElMessage({
    type: 'warning',
    message: '还没做好咧',
  })
}

/// 注册

// 表单数据模型
interface RegisterForm {
  username: string | null
  password: string | null
  passwordConfirm: string | null
}

// 表单实例
const registerFormRef = ref<FormInstance>()
// 表单数据
const registerForm = reactive<RegisterForm>({
  username: '',
  password: '',
  passwordConfirm: '',
})
// 校验规则
const registerRules = reactive<FormRules<RegisterForm>>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 16, message: '用户名长度必须在3-16内', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
  ],
  passwordConfirm: [
    { required: true, message: '请重复密码', trigger: 'blur' },
  ],
})

// 发送请求
async function register(form: FormInstance | undefined) {
  if (!form) return
  await form.validate(async (valid) => {
    if (!valid) return
    const resp = await client.post<BaseResp<Login>>('/api/auth/login', loginForm).then(e => e.data)
    if (!resp.success) {
      console.log(resp.data)
      ElMessage({
        type: 'warning',
        message: resp.message,
      })
      return
    }
    // 保存用户信息
    auth.value = resp.data!
    // 跳转主界面
    await router.push('/')
    ElMessage({
      type: 'success',
      message: '登录成功',
    })
  })
}
</script>

<style scoped>
</style>
<template>
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
        <el-input v-model="loginForm.password" placeholder="请输入密码" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="login(loginFormRef)">登录</el-button>
        <el-button @click="() => type = 'register'">没账号, 注册!</el-button>
        <el-button @click="() => type = 'forget'">密码忘了, 呜呜!</el-button>
      </el-form-item>
    </el-form>
  </template>
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
        <el-input v-model="forgetForm.value" :placeholder="`请输入${forgetForm.type === 'email' ? '邮箱' : '手机号'}`" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="forget(forgetFormRef)">找回</el-button>
        <el-button @click="() => type = 'login'">有账号, 登录!</el-button>
      </el-form-item>
    </el-form>
  </template>
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
        <el-input v-model="registerForm.password" placeholder="请输入密码" />
      </el-form-item>
      <el-form-item label="重复密码" prop="passwordConfirm">
        <el-input v-model="registerForm.passwordConfirm" placeholder="请重复密码" />
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
import type { FormInstance, FormRules } from 'element-plus'
import type { ElForm, ElFormItem, ElInput, ElButton } from 'element-plus'
import axios from 'axios'
import { baseUrl } from '@/api/api'

type PageType = 'login' | 'register' | 'forget'
const type = ref<PageType>('login')

interface LoginForm {
  username: string | null,
  password: string | null
}

const loginFormRef = ref<FormInstance>()
const loginForm = reactive<LoginForm>({ username: null, password: null })
const loginRules = reactive<FormRules<LoginForm>>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
})
const login = async (form: FormInstance | undefined) => {
  if (!form) return
  await form.validate((valid) => {
    if (valid) axios({
      baseURL: baseUrl,
      method: 'post',
      url: '/api/auth/login',
      data: loginForm
    })
  })
}

type ForgetType = 'email' | 'sms'
interface ForgetForm {
  type: ForgetType,
  value: string | null
}

const forgetFormRef = ref<FormInstance>()
const forgetForm = reactive<ForgetForm>({ type: 'email', value: null })
const forgetRules = reactive<FormRules<ForgetForm>>({
  type: [
    { required: true, trigger: 'blur' }
  ],
  value: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ]
})
const forget = async (form: FormInstance | undefined) => {
  if (!form) return
  await form.validate((valid) => {
    if (valid) axios({
      baseURL: baseUrl,
      method: 'post',
      url: '/api/auth/login',
      data: loginForm
    })
  })
}

interface RegisterForm {
  username: string | null
  password: string | null
  passwordConfirm: string | null
}

const registerFormRef = ref<FormInstance>()
const registerForm = reactive<RegisterForm>({
  username: '',
  password: '',
  passwordConfirm: ''
})
const registerRules = reactive<FormRules<RegisterForm>>({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 16, message: '用户名长度必须在3-16内', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ],
  passwordConfirm: [
    { required: true, message: '请重复密码', trigger: 'blur' }
  ]
})
const register = async (form: FormInstance | undefined) => {
  if (!form) return
  await form.validate((valid) => {
    if (valid) axios({
      baseURL: baseUrl,
      method: 'post',
      url: '/api/auth/register',
      data: registerForm
    })
  })
}
</script>

<style scoped>
</style>
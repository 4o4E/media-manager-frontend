<template>
  <el-button type="primary" @click="clickAdd">新增用户</el-button>
  <el-button type="primary" @click="clickRefresh" :icon="Refresh">刷新</el-button>
  <el-divider />
  <el-table :data="users" style="width: 100%">
    <el-table-column prop="name" label="用户名" width="180" />
    <el-table-column prop="point" label="用户点数" width="180" />
    <el-table-column fixed="right" label="操作">
      <template #default="{ row }">
        <el-button size="small" type="primary" @click="onClick(row, 'info')">编辑信息</el-button>
        <el-button size="small" type="warning" @click="onClick(row, 'password')">编辑密码</el-button>
        <el-button size="small" type="info" @click="onClick(row, 'role')">分配角色</el-button>
        <el-button size="small" type="danger" @click="delUser(row)">删除用户</el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- 新增用户 -->
  <el-dialog draggable v-model="addUserFormVisible" title="新增用户" width="300">
    <el-form :model="addUserForm">
      <el-form-item required label="用户名" label-width="6em">
        <el-input v-model="addUserForm!.name" />
      </el-form-item>
      <el-form-item required label="默认密码" label-width="6em">
        <el-input v-model="addUserForm!.password" />
      </el-form-item>
      <el-form-item required label="用户点数" label-width="6em">
        <el-input type="number" v-model="addUserForm!.point" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="addUserFormVisible = false">取消</el-button>
        <el-button type="primary" @click="addUser()">提交</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 编辑信息 -->
  <el-dialog draggable v-model="updateUserFormVisible" title="编辑信息" width="300">
    <el-form :model="updateUserForm">
      <el-form-item required label="用户名">
        <el-input v-model="updateUserForm!.name" />
      </el-form-item>
      <el-form-item required label="用户点数">
        <el-input type="number" v-model="updateUserForm!.point" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="updateUserFormVisible = false">取消</el-button>
        <el-button type="primary" @click="updateUser()">提交</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 编辑密码 -->
  <el-dialog draggable v-model="updatePasswordFormVisible" title="编辑信息" width="300">
    <el-form :model="updatePasswordForm">
      <el-form-item label="新密码" required>
        <el-input placeholder="请输入新密码" v-model="updatePasswordForm!.password" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="updatePasswordFormVisible = false">取消</el-button>
        <el-button type="primary" @click="updatePassword()">提交</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 分配角色 -->
  <el-dialog draggable v-model="allocateRoleFormVisible" title="分配角色" width="50%">
    <el-table ref="multipleTableRef" :data="allRoleList" style="width: 100%" @select="allocateSelect">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="角色名" width="180" />
      <el-table-column prop="description" label="角色备注" />
    </el-table>
  </el-dialog>

  <!-- 页脚 -->
  <page-selector
    v-model:page="page"
    v-model:size="size"
    v-model:total="total"
    @refresh="refresh"
  />
</template>

<script setup lang="ts">
import { auth, requireAuth } from '@/api/auth'
import type { Role, User } from '@/api/type'
import { ref } from 'vue'
import { type BaseResp, client } from '@/api/api'
import { ElMessage, ElTable } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import PageSelector from '@/components/PageSelector.vue'

requireAuth()

type StatusType = 'info' | 'password' | 'role'

const users = ref<User[]>([])
const page = ref(1)
const size = ref(10)
const total = ref<number>(0)

async function refresh() {
  const resp = await client.get<BaseResp<{ total: number, data: User[] }>>('/api/admin/users', {
    params: { page: page.value, size: size.value },
  }).then(e => e.data)
  if (!resp.success) {
    users.value = []
    total.value = 0
    return resp.data as any as string
  }
  const data = resp.data!
  users.value = data.data
  total.value = data.total
  return null
}

refresh()

async function clickRefresh() {
  const success = await refresh()
  ElMessage(success
    ? { type: 'warning', message: success }
    : { type: 'success', message: '刷新完成' },
  )
}

async function onClick(row: User, type: StatusType) {
  switch (type) {
    case 'info': {
      updateUserForm.value = Object.assign({}, row)
      updateUserFormVisible.value = true
      break
    }
    case 'password': {
      updatePasswordForm.value = {
        id: row.id,
        password: '',
      }
      updatePasswordFormVisible.value = true
      break
    }
    case 'role': {
      if (row.id === auth!.value?.userId) {
        ElMessage({
          type: 'warning',
          message: '不可修改',
        })
        return
      }
      allocateRoleFormVisible.value = true
      // 更新所有角色列表
      await Promise.all([updateAllRoleList(), updateUserRoleList(row.id)])
      allocateUserId.value = row.id
      break
    }
  }
}

async function delUser(row: User) {
  if (row.id === 1) {
    ElMessage({
      type: 'warning',
      message: '不可删除',
    })
    return
  }
  const resp = await client.delete<BaseResp>(`/api/admin/users/${row.id}`).then(e => e.data)
  if (!resp.success) {
    ElMessage({
      type: 'warning',
      message: resp.message,
    })
    return
  }
  ElMessage({ type: 'success', message: '删除成功' })
  refresh()
}

interface AddUser {
  name: string
  point: number
  password: string
}

const addUserForm = ref<AddUser>()
const addUserFormVisible = ref(false)

async function clickAdd() {
  addUserForm.value = { name: '', password: '', point: 0 }
  addUserFormVisible.value = true
}

async function addUser() {
  const resp = await client.post<BaseResp>('/api/admin/users', addUserForm.value).then(e => e.data)
  addUserFormVisible.value = false
  if (!resp.success) {
    ElMessage({
      type: 'warning',
      message: resp.message,
    })
    return
  }
  ElMessage({
    type: 'success',
    message: '更新成功',
  })
  await refresh()
}

const updateUserForm = ref<User>()
const updateUserFormVisible = ref(false)

async function updateUser() {
  const resp = await client.patch<BaseResp>('/api/admin/users', updateUserForm.value).then(e => e.data)
  updateUserFormVisible.value = false
  if (!resp.success) {
    ElMessage({
      type: 'warning',
      message: resp.message,
    })
    return
  }
  ElMessage({
    type: 'success',
    message: '更新成功',
  })
  await refresh()
}

interface UpdatePasswordForm {
  id: number
  password: string
}

const updatePasswordForm = ref<UpdatePasswordForm>()
const updatePasswordFormVisible = ref(false)

async function updatePassword() {
  const resp = await client.post<BaseResp>('/api/admin/users/password', updatePasswordForm.value).then(e => e.data)
  updatePasswordFormVisible.value = false
  ElMessage(resp.success
    ? { type: 'success', message: '更新成功' }
    : { type: 'warning', message: resp.message },
  )
}

const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const allRoleList = ref<Role[]>([])

async function updateAllRoleList() {
  const resp = await client.get<BaseResp<Role[]>>('/api/admin/roles/all').then(e => e.data)
  if (!resp.success) {
    ElMessage({
      type: 'warning',
      message: '获取角色列表失败, 请重试',
    })
    return
  }
  allRoleList.value = resp.data!
}

async function updateUserRoleList(uid: number) {
  const resp = await client.get<BaseResp<Role[]>>(`/api/admin/users/${uid}/roles`).then(e => e.data)
  const ids = resp.data!.map(e => e.id)
  allRoleList.value.filter(role => ids.includes(role.id)).forEach(e => {
    multipleTableRef.value!.toggleRowSelection(e, true)
  })
}

const allocateUserId = ref<number>(0)
const allocateRoleFormVisible = ref(false)

async function allocateSelect(selection: Role[], row: Role) {
  if (selection.includes(row)) {
    // 勾选操作
    const resp = await client.post<BaseResp>(`/api/admin/users/${allocateUserId.value}/roles/${row.id}`).then(e => e.data)
    if (!resp.success) {
      ElMessage({
        type: 'warning',
        message: resp.message,
      })
      allocateRoleFormVisible.value = false
      return
    }
    ElMessage({
      type: 'success',
      message: '分配成功',
    })
    return
  }
  // 取消勾选
  const resp = await client.delete<BaseResp>(`/api/admin/users/${allocateUserId.value}/roles/${row.id}`).then(e => e.data)
  if (!resp.success) {
    ElMessage({
      type: 'warning',
      message: resp.message,
    })
    allocateRoleFormVisible.value = false
    return
  }
  ElMessage({
    type: 'success',
    message: '分配成功',
  })
}
</script>

<style scoped>

</style>
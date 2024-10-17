<template>
  <el-button type="primary" @click="clickAdd">新增角色</el-button>
  <el-button type="primary" @click="clickRefresh" :icon="Refresh">刷新</el-button>
  <el-divider />
  <el-table :data="roles" style="width: 100%" max-height="100em">
    <el-table-column prop="name" label="角色" width="180" />
    <el-table-column prop="description" label="角色描述" width="400" />
    <el-table-column fixed="right" label="操作">
      <template #default="{ row }">
        <el-button size="small" type="primary" @click="onClick(row, 'info')">编辑信息</el-button>
        <el-button size="small" type="info" @click="onClick(row, 'perm')">分配权限</el-button>
        <el-button v-if="row.id !== 1 && row.id !== 2" size="small" type="danger" @click="delRole(row)">删除角色
        </el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- 新增角色 -->
  <el-dialog draggable v-model="addRoleFormVisible" title="新增角色" width="300">
    <el-form :model="addRoleForm">
      <el-form-item required label="角色名" label-width="6em">
        <el-input v-model="addRoleForm!.name" />
      </el-form-item>
      <el-form-item required label="角色描述" label-width="6em">
        <el-input v-model="addRoleForm!.description" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="addRoleFormVisible = false">取消</el-button>
        <el-button type="primary" @click="addRole()">提交</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 编辑信息 -->
  <el-dialog draggable v-model="updateRoleFormVisible" title="编辑信息" width="300">
    <el-form :model="updateRoleForm">
      <el-form-item required label="角色名">
        <el-input v-model="updateRoleForm!.name" />
      </el-form-item>
      <el-form-item required label="角色描述">
        <el-input v-model="updateRoleForm!.description" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="updateRoleFormVisible = false">取消</el-button>
        <el-button type="primary" @click="updateRole()">提交</el-button>
      </div>
    </template>
  </el-dialog>

  <!-- 分配权限 -->
  <el-dialog draggable v-model="allocateRoleFormVisible" title="分配权限" width="70%" top="5vh">
    <el-table
      ref="multipleTableRef"
      :data="allPermList"
      style="width: 100%; height: 80vh"
      @select="allocateSelect"
      stripe
    >
      <el-table-column type="selection" width="55" />
      <el-table-column prop="perm" label="权限节点" />
      <el-table-column prop="desc" label="描述" />
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
import { requireAuth } from '@/api/auth'
import type { Role, User } from '@/api/type'
import { ref } from 'vue'
import { type BaseResp, client } from '@/api/api'
import { ElMessage, ElTable } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import PageSelector from '@/components/PageSelector.vue'

requireAuth()

type StatusType = 'info' | 'perm'

const roles = ref<Role[]>([])
const total = ref<number>(0)

const page = ref(1)
const size = ref(10)

async function refresh() {
  const resp = await client.get<BaseResp<{ total: number, data: Role[] }>>('/api/admin/roles', {
    params: { page: page.value, size: size.value },
  }).then(e => e.data)
  if (!resp.success) {
    roles.value = []
    total.value = 0
    return resp.message
  }
  const data = resp.data!
  roles.value = data.data
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

async function onClick(row: Role, type: StatusType) {
  switch (type) {
    case 'info': {
      updateRoleForm.value = Object.assign({}, row)
      updateRoleFormVisible.value = true
      break
    }
    case 'perm': {
      allocateRoleFormVisible.value = true
      // 更新所有权限列表
      await Promise.all([updateAllPermList(), updateCurrentRoleList(row.id)])
      allocateRoleId.value = row.id
      break
    }
  }
}

async function delRole(row: User) {
  if (row.id === 1) {
    ElMessage({
      type: 'warning',
      message: '不可删除',
    })
    return
  }
  const resp = await client.delete<BaseResp>(`/api/admin/roles/${row.id}`).then(e => e.data)
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

interface AddRole {
  name: string
  description: string
}

const addRoleForm = ref<AddRole>()
const addRoleFormVisible = ref(false)

async function clickAdd() {
  addRoleForm.value = { name: '', description: '' }
  addRoleFormVisible.value = true
}

async function addRole() {
  const resp = await client.post<BaseResp>('/api/admin/roles', addRoleForm.value).then(e => e.data)
  addRoleFormVisible.value = false
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

const updateRoleForm = ref<Role>()
const updateRoleFormVisible = ref(false)

async function updateRole() {
  const resp = await client.patch<BaseResp>('/api/admin/roles', updateRoleForm.value).then(e => e.data)
  updateRoleFormVisible.value = false
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

interface Perm {
  name: string
  desc: string
}

const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const allPermList = ref<Perm[]>([])

async function updateAllPermList() {
  const resp = await client.get<BaseResp<string[]>>('/api/admin/roles/allPerm').then(e => e.data)
  if (!resp.success) {
    ElMessage({
      type: 'warning',
      message: '获取权限节点列表失败, 请重试',
    })
    return
  }
  allPermList.value = resp.data!
}

async function updateCurrentRoleList(roleId: number) {
  const resp = await client.get<BaseResp<string[]>>(`/api/admin/roles/${roleId}/perms`).then(e => e.data)
  const perms = resp.data!
  allPermList.value.filter(perm => perms.includes(perm.perm)).forEach(e => {
    multipleTableRef.value!.toggleRowSelection(e, true)
  })
}

const allocateRoleId = ref<number>(0)
const allocateRoleFormVisible = ref(false)

async function allocateSelect(selection: Perm[], row: Perm) {
  if (selection.includes(row)) {
    // 勾选操作
    const resp = await client.post<BaseResp>(`/api/admin/roles/${allocateRoleId.value}/perms/${row.perm}`).then(e => e.data)
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
  const resp = await client.delete<BaseResp>(`/api/admin/roles/${allocateRoleId.value}/perms/${row.perm}`).then(e => e.data)
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
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
        <el-button size="small" type="danger" @click="delRole(row)">删除角色</el-button>
      </template>
    </el-table-column>
  </el-table>

  <!-- 新增角色 -->
  <el-dialog v-model="addRoleFormVisible" title="新增角色" width="300">
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
  <el-dialog v-model="updateRoleFormVisible" title="编辑信息" width="300">
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
  <el-dialog v-model="allocateRoleFormVisible" title="分配权限" width="50%">
    <el-table ref="multipleTableRef" :data="allPermList" style="width: 100%" @select="allocateSelect">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="权限节点" />
    </el-table>
  </el-dialog>

  <!-- 页脚 -->
  <div class="flex gap-2" style="padding: 0.5rem">
    <el-space wrap direction="horizontal" :size="8">
      <!-- page -->
      <el-button v-if="hasPrev()" size="small" @click="prevPage">&lt;</el-button>
      <template v-for="(p, i) in pages" :key="i">
        <el-button
          v-if="p !== null"
          :type="page === p ? 'primary' : undefined"
          size="small"
          @click="page = p!;refresh()"
        >{{ p }}</el-button>
        <el-tag v-else>...</el-tag>
      </template>
      <el-button v-if="hasNext()" size="small" @click="nextPage">&gt;</el-button>
      <!-- size -->
      <el-select size="small" style="width: 4em" v-model="size">
        <template v-for="(item) in [10, 20, 50, 100]" :key="`page-${item}`">
          <el-option :value="item" :label="item" @click="page = 1" />
        </template>
      </el-select>
    </el-space>
  </div>
</template>

<script setup lang="ts">
import { requireAuth } from '@/api/auth'
import { type Role, type User } from '@/api/type'
import { computed, ref, watch } from 'vue'
import { client } from '@/api/api'
import { ElMessage, ElTable } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'

requireAuth()

type StatusType = 'info' | 'perm'

const roles = ref<Role[]>([])
const total = ref<number>(0)

const page = ref(1)
const size = ref(10)
const pages = computed<(number | null)[]>(() => {
  const before = page.value <= 4
    ? [1, 2, 3, 4].filter(e => e < page.value)
    : [1, null, page.value - 2, page.value - 1];
  const totalPage = Math.ceil(total.value / size.value)
  const afterPages = totalPage - page.value
  const after = afterPages <= 4
    ? [1, 2, 3, 4].map(e => page.value + e).filter(e => e <= totalPage)
    : [page.value + 1, page.value + 2, null, totalPage]

  return [...before, page.value, ...after]
})

watch(size, () => refresh())

const hasNext = () => page.value * size.value < total.value
const hasPrev = () => page.value > 1
const nextPage = async () => {
  if (!hasNext()) {
    ElMessage({
      type: 'warning',
      message: '已是最后一页'
    })
    return
  }
  page.value++
  await refresh()
}
const prevPage = async () => {
  if (!hasPrev()) {
    ElMessage({
      type: 'warning',
      message: '已是第一页'
    })
    return
  }
  page.value--
  await refresh()
}
const refresh = async () => {
  const resp = await client.get<{ total: number, data: Role[] }>('/api/admin/roles', {
    params: { page: page.value, size: size.value }
  })
  if (resp.status !== 200) {
    roles.value = []
    total.value = 0
    return resp.data as any as string
  }
  roles.value = resp.data.data
  total.value = resp.data.total
  return null
}

refresh()

const clickRefresh = async () => {
  const success = await refresh()
  ElMessage(success ? {
    type: 'warning',
    message: success
  } : {
    type: 'success',
    message: '刷新完成'
  })
}

const onClick = async (row: Role, type: StatusType) => {
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

const delRole = async (row: User) => {
  if (row.id === 1) {
    ElMessage({
      type: 'warning',
      message: '不可删除'
    })
    return
  }
  const resp = await client.delete(`/api/admin/roles/${row.id}`)
  if (resp.status !== 200) {
    ElMessage({
      type: 'warning',
      message: resp.data as string
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

const clickAdd = async () => {
  addRoleForm.value = { name: '', description: '' }
  addRoleFormVisible.value = true
}
const addRoleForm = ref<AddRole>()
const addRoleFormVisible = ref(false)
const addRole = async () => {
  const resp = await client.post('/api/admin/roles', addRoleForm.value)
  addRoleFormVisible.value = false
  if (resp.status !== 200) {
    ElMessage({
      type: 'warning',
      message: resp.data as string
    })
    return
  }
  ElMessage({
    type: 'success',
    message: '更新成功'
  })
  await refresh()
}

const updateRoleForm = ref<Role>()
const updateRoleFormVisible = ref(false)
const updateRole = async () => {
  const resp = await client.patch('/api/admin/roles', updateRoleForm.value)
  updateRoleFormVisible.value = false
  if (resp.status !== 200) {
    ElMessage({
      type: 'warning',
      message: resp.data as string
    })
    return
  }
  ElMessage({
    type: 'success',
    message: '更新成功'
  })
  await refresh()
}


interface Perm {
  name: string
}

const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const allPermList = ref<Perm[]>([])
const updateAllPermList = async () => {
  const resp = await client.get<string[]>('/api/admin/roles/allPerm')
  if (resp.status !== 200) {
    ElMessage({
      type: 'warning',
      message: '获取权限节点列表失败, 请重试'
    })
    return
  }
  allPermList.value = resp.data.map(e => ({ name: e }))
}
const updateCurrentRoleList = async (roleId: number) => {
  const resp = await client.get<string[]>(`/api/admin/roles/${roleId}/perms`)
  const perms = resp.data
  allPermList.value.filter(perm => perms.includes(perm.name)).forEach(e => {
    multipleTableRef.value!.toggleRowSelection(e, true)
  })
}

const allocateRoleId = ref<number>(0)
const allocateRoleFormVisible = ref(false)
const allocateSelect = async (selection: Perm[], row: Perm) => {
  if (selection.includes(row)) {
    // 勾选操作
    const resp = await client.post(`/api/admin/roles/${allocateRoleId.value}/perms/${row.name}`)
    if (resp.status !== 200) {
      ElMessage({
        type: 'warning',
        message: resp.data as string
      })
      allocateRoleFormVisible.value = false
      return
    }
    ElMessage({
      type: 'success',
      message: '分配成功'
    })
    return
  }
  // 取消勾选
  const resp = await client.delete(`/api/admin/roles/${allocateRoleId.value}/perms/${row.name}`)
  if (resp.status !== 200) {
    ElMessage({
      type: 'warning',
      message: resp.data as string
    })
    allocateRoleFormVisible.value = false
    return
  }
  ElMessage({
    type: 'success',
    message: '分配成功'
  })
}
</script>

<style scoped>
.flex {
  display: flex;
}

.gap-2 {
  grid-gap: 0.5rem;
  gap: 0.5rem;
}

.el-tag {
  padding: 5px 11px;
}
</style>
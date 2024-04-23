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
  <el-dialog v-model="addUserFormVisible" title="新增用户" width="300">
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
  <el-dialog v-model="updateUserFormVisible" title="编辑信息" width="300">
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
  <el-dialog v-model="updatePasswordFormVisible" title="编辑信息" width="300">
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
  <el-dialog v-model="allocateRoleFormVisible" title="分配角色" width="50%">
    <el-table ref="multipleTableRef" :data="allRoleList" style="width: 100%" @select="allocateSelect">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="name" label="角色名" width="180" />
      <el-table-column prop="description" label="角色备注" />
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
        <template v-for="(item, i) in [10, 20, 50, 100]" :key="i">
          <el-option :value="item" :label="item" @click="page = 1" />
        </template>
      </el-select>
    </el-space>
  </div>
</template>

<script setup lang="ts">
import { auth, requireAuth } from '@/api/auth'
import { type Role, type User } from '@/api/type'
import { computed, ref, watch } from 'vue'
import { client } from '@/api/api'
import { ElMessage, ElTable } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'

requireAuth()

type StatusType = 'info' | 'password' | 'role'

const users = ref<User[]>([])
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
  const resp = await client.get<{ total: number, data: User[] }>("/api/admin/users", {
    params: { page: page.value, size: size.value }
  })
  if (resp.status !== 200) {
    users.value = []
    total.value = 0
    return resp.data as any as string
  }
  users.value = resp.data.data
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
    message: "刷新完成"
  })
}

const onClick = async (row: User, type: StatusType) => {
  switch (type) {
    case 'info': {
      updateUserForm.value = Object.assign({}, row)
      updateUserFormVisible.value = true
      break
    }
    case 'password': {
      updatePasswordForm.value = {
        id: row.id,
        password: ''
      }
      updatePasswordFormVisible.value = true
      break
    }
    case 'role': {
      if (row.id === auth!.value?.userId) {
        ElMessage({
          type: "warning",
          message: "不可修改"
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

const delUser = async (row: User) => {
  if (row.id === 1) {
    ElMessage({
      type: 'warning',
      message: '不可删除'
    })
    return
  }
  const resp = await client.delete(`/api/admin/users/${row.id}`)
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

interface AddUser {
  name: string
  point: number
  password: string
}
const clickAdd = async () => {
  addUserForm.value = { name: '', password: '', point: 0 }
  addUserFormVisible.value = true
}
const addUserForm = ref<AddUser>()
const addUserFormVisible = ref(false)
const addUser = async () => {
  const resp = await client.post("/api/admin/users", addUserForm.value)
  addUserFormVisible.value = false
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

const updateUserForm = ref<User>()
const updateUserFormVisible = ref(false)
const updateUser = async () => {
  const resp = await client.patch("/api/admin/users", updateUserForm.value)
  updateUserFormVisible.value = false
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

interface UpdatePasswordForm {
  id: number
  password: string
}

const updatePasswordForm = ref<UpdatePasswordForm>()
const updatePasswordFormVisible = ref(false)
const updatePassword = async () => {
  const resp = await client.post("/api/admin/users/password", updatePasswordForm.value)
  updatePasswordFormVisible.value = false
  ElMessage(resp.status !== 200 ? {
    type: 'warning',
    message: resp.data as string
  } : {
    type: 'success',
    message: '更新成功'
  })
}

const multipleTableRef = ref<InstanceType<typeof ElTable>>()
const allRoleList = ref<Role[]>([])
const updateAllRoleList = async () => {
  const resp = await client.get<Role[]>("/api/admin/roles/all")
  if (resp.status !== 200) {
    ElMessage({
      type: 'warning',
      message: '获取角色列表失败, 请重试'
    })
    return
  }
  allRoleList.value = resp.data
}
const updateUserRoleList = async (uid: number) => {
  const resp = await client.get<Role[]>(`/api/admin/users/${uid}/roles`)
  const ids = resp.data.map(e => e.id)
  allRoleList.value.filter(role => ids.includes(role.id)).forEach(e => {
    multipleTableRef.value!.toggleRowSelection(e, true)
  })
}

const allocateUserId = ref<number>(0)
const allocateRoleFormVisible = ref(false)
const allocateSelect = async (selection: Role[], row: Role) => {
  if (selection.includes(row)) {
    // 勾选操作
    const resp = await client.post(`/api/admin/users/${allocateUserId.value}/roles/${row.id}`)
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
      message: "分配成功"
    })
    return
  }
  // 取消勾选
  const resp = await client.delete(`/api/admin/users/${allocateUserId.value}/roles/${row.id}`)
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
    message: "分配成功"
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
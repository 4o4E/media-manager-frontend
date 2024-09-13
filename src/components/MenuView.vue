<template>
  <el-menu
    :default-active="router.currentRoute.value.fullPath"
    class="el-menu-demo"
    mode="horizontal"
    :ellipsis="false"
    :router="true"
  >
    <el-image src="favicon.ico" style="height: 3em; margin-right: 1em" />
    <el-menu-item index="/">主页</el-menu-item>
    <el-menu-item index="/random">浏览</el-menu-item>
    <el-menu-item index="/browser">搜索</el-menu-item>
    <el-menu-item index="/upload">上传</el-menu-item>
    <el-menu-item v-if="auth?.perms?.includes('user:view')" index="/users">用户管理</el-menu-item>
    <el-menu-item v-if="auth?.perms?.includes('role:view')" index="/roles">角色管理</el-menu-item>
    <el-menu-item v-if="auth?.perms?.includes('tag:edit')" index="/tags">Tag管理</el-menu-item>

    <div class="flex-grow" />

    <!-- 判断是否登录 -->
    <el-menu-item v-if="auth == null" index="/login">登录/注册</el-menu-item>
    <el-menu-item v-else index="/logout">登出</el-menu-item>

    <!-- 切换深色样式 -->
    <el-switch
      inline-prompt
      active-text="深色"
      inactive-text="浅色"
      v-model="isDark"
      style="display: inline-flex; margin: 10px 10px"
    />
  </el-menu>
</template>

<script setup lang="ts">
import { useDark } from '@vueuse/core'
import { auth } from '@/api/auth'
import router from '@/router'

const isDark = useDark()
</script>

<style scoped>
.flex-grow {
  flex-grow: 1;
}
</style>
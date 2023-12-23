<template>
  <el-menu
    :default-active="activeIndex"
    class="el-menu-demo"
    mode="horizontal"
    :ellipsis="false"
    :router="true"
  >
    <el-image src="favicon.ico" style="height: 3em; margin-right: 1em" />
    <el-menu-item index="/">主页</el-menu-item>
    <el-menu-item index="/upload">上传</el-menu-item>
    <el-menu-item index="/upload">测试 PR</el-menu-item>
    <div class="flex-grow" />
    <el-menu-item index="/login">登录/注册</el-menu-item>
    <!--<el-menu-item index="/signin">登录</el-menu-item>-->
    <!--<el-menu-item index="/signup">注册</el-menu-item>-->
    <!--<el-menu-item index="/logout">登出</el-menu-item>-->
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
import { ref } from 'vue'

const isDark = useDark()
const activeIndex = ref(window.location.pathname)


</script>

<style scoped>
.flex-grow {
  flex-grow: 1;
}

.container {
  max-width: 800px;
}
</style>
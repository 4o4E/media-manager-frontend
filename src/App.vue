<template>
  <el-container>
    <!-- 菜单栏 -->
    <div class="header-bg" />
    <el-header class="header">
      <menu-view />
    </el-header>
    <!-- 网页内容 -->
    <el-container style="margin: var(--el-menu-horizontal-height) 0 0 0">
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
  <!-- 回到顶部 -->
  <el-backtop :right="20" :bottom="20" />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import MenuView from '@/components/MenuView.vue'
</script>

<style scoped>
.header {
  position: fixed;
  width: 100vw;
  height: 60px;
  padding: 5px 20px 5px 5px;
}

.header-bg {
  position: fixed;
  width: 100vw;
  height: 65px;
  background: var(--el-bg-color);
}
</style>

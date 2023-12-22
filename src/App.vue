<template>
  <div class="common-layout limit">
    <el-container>
      <el-header>
        <menu-view />
      </el-header>
      <el-main>
        <RouterView />
      </el-main>
    </el-container>
    <el-backtop :right="5" :bottom="20" />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import MenuView from '@/components/MenuView.vue'
import { ElContainer, ElHeader, ElMain, ElBacktop } from 'element-plus'
</script>

<style scoped>
body {
  transition: color 0.5s, background-color 0.5s;
}
</style>

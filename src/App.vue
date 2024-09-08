<template>
  <div class="limit">
    <el-container>
      <!-- 菜单栏 -->
      <el-header style="position: relative; height: 60px; padding: 0;">
        <menu-view />
      </el-header>
      <!-- 网页内容 -->
      <el-container style="height: calc(98vh - 61px); margin: 0">
        <el-main>
          <router-view />
        </el-main>
      </el-container>
    </el-container>
    <!-- 回到顶部 -->
    <el-backtop :right="5" :bottom="20" />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import MenuView from '@/components/MenuView.vue'
</script>

<style scoped>
/* 最小宽度在800px内的时候引用 */
@media (min-width: 800px) {
  .limit {
    margin: auto;
    max-width: 80%;
  }
}
</style>

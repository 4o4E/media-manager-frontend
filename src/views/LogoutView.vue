<template>
  <div style="display: flex; height: 600px">
    <div style="margin: auto">
      <div style="margin: 20px">
        <el-text size="large">是否确认登出</el-text>
      </div>
      <el-button type="warning" @click="() => {
        clearAuth()
        router.push('/')
      }">确认
      </el-button>
      <el-button type="primary" @click="router.back">取消
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import router from '@/router'
import { clearAuth } from '@/api/auth'
</script>

<style scoped>

</style>
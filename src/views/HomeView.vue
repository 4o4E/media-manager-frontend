<template>
  <div style="text-align: center;">
    <el-button @click="router.push('/random')">随便看看</el-button>
    <el-button @click="router.push('/browser')">搜索</el-button>
    <el-button @click="router.push('/upload')">上传</el-button>
  </div>
</template>

<script setup lang="ts">
import router from '@/router'
</script>

<style scoped>
</style>
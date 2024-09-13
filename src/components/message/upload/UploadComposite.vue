<template>
  <el-form>
    <message-builder />
  </el-form>
</template>

<script setup lang="ts">
import { requireAuth } from '@/api/auth'
import MessageBuilder from '@/components/message/MessageBuilder.vue'

requireAuth()
</script>

<style scoped>
</style>
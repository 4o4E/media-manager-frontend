<template>
  <message-builder :on-upload="handleUpload" btn="上传" />
</template>

<script setup lang="ts">
import { requireAuth } from '@/api/auth'
import MessageBuilder from '@/components/message/MessageBuilder.vue'
import { type BaseResp, client } from '@/api/api'

requireAuth()

async function handleUpload(data): BaseResp {
  return await client.post<BaseResp>('/api/message', data).then(e => e.data)
}
</script>

<style scoped>
</style>
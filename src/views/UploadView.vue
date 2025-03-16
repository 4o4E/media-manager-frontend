<template>
  <message-builder :on-upload="handleUpload" btn="上传" />
</template>

<script setup lang="ts">
import { requireAuth } from '@/api/auth'
import MessageBuilder from '@/components/message/MessageBuilder.vue'
import { type BaseResp, client } from '@/api/api'
import type { MediaContentDto } from '@/api/types/media'

requireAuth()

async function handleUpload(data: MediaContentDto): Promise<BaseResp> {
  return await client.post<BaseResp>('/api/media', data).then(e => e.data)
}
</script>

<style scoped>
</style>
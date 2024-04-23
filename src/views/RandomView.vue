<template>
  <template v-for="(item, i) in messages" :key="i">
    <image-message-view
      :message="item"
      :width="'100px'"
      :height="'100px'"
    />
    <el-divider v-if="messages.length != i" />
  </template>
  <InfiniteLoading :finished="finished" @infinite="infiniteLoading"/>
</template>

<script setup lang="ts">
import { requireAuth } from '@/api/auth'
import type { MessageData } from '@/api/type'
import { client } from '@/api/api'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'
import ImageMessageView from '@/components/ImageMessageView.vue'
import InfiniteLoading from '@/components/InfiniteLoading.vue'

requireAuth()

const messages = ref<MessageData[]>([])
const finished = ref(false)
const lastFetch = ref(0)

const infiniteLoading = async () => {
  const now = Date.now()
  if (now - lastFetch.value < 300) return
  lastFetch.value = now
  await fetch()
}

const fetch = async () => {
  const resp = await client.get<MessageData[]>('/api/message/random', {
    params: { count: 20 }
  })
  if (resp.status !== 200) {
    ElMessage({
      type: 'warning',
      message: resp.data as string
    })
    return
  }
  messages.value.push(...resp.data)
}
fetch()
</script>

<style scoped>

</style>
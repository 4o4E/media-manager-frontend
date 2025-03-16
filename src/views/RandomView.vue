<template>
  <message-flow-view :isLoading="isLoading" ref="flow" @fetch="fetch" />
</template>

<script setup lang="ts">
import { requireAuth } from '@/api/auth'
import type { MessageData } from '@/api/types/media'
import { type BaseResp, client } from '@/api/api'
import { ElMessage } from 'element-plus'
import MessageFlowView from '@/components/message/MessageFlowView.vue'
import { ref } from 'vue'

requireAuth()

const flow = ref()
const isLoading = ref(false)

async function fetch() {
  if (isLoading.value) return
  isLoading.value = true
  const resp = await client.get<BaseResp<MessageData[]>>('/api/media/random', {
    params: { count: 20 },
  }).then(e => e.data)
  if (!resp.success) {
    ElMessage({
      type: 'warning',
      message: resp.message,
    })
    return
  }
  flow.value.receive(resp.data!)
  setTimeout(() => isLoading.value = false, 200)
}
</script>

<style scoped>

</style>
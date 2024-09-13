<template>
  <MessageFlowView :load="true" ref="flow" @fetch="fetch" />
</template>

<script setup lang="ts">
import { requireAuth } from '@/api/auth'
import type { MessageData } from '@/api/type'
import { type BaseResp, client } from '@/api/api'
import { ElMessage } from 'element-plus'
import MessageFlowView from '@/components/message/MessageFlowView.vue'
import { ref } from 'vue'

requireAuth()

const flow = ref()

async function fetch() {
  const resp = await client.get<BaseResp<MessageData[]>>('/api/message/random', {
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
}
</script>

<style scoped>

</style>
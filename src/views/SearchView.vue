<template>
  <div class="search-box">
    <search-mode-selector v-model="queryMode" />
    <tag-selector v-model:tags="tags" />
    <el-button
      v-if="tags.length !== 0"
      type="success"
      @click="search"
    >搜索
    </el-button>
  </div>
  <message-flow-view :isLoading="isLoading" ref="flow" @fetch="search" />
</template>

<script setup lang="ts">
import { requireAuth } from '@/api/auth'
import { ref } from 'vue'
import { type BaseResp, client, stringify } from '@/api/api'
import { SearchType } from '@/api/type'
import { ElAffix, ElMessage } from 'element-plus'
import MessageFlowView from '@/components/message/MessageFlowView.vue'
import type { MessageData } from '@/api/types/media'
import TagSelector from '@/components/message/TagSelector.vue'
import SearchModeSelector from '@/components/SearchModeSelector.vue'

requireAuth()

const isLoading = ref(false)

const queryMode = ref<SearchType>(SearchType.ANY)
const flow = ref()

const tags = ref<bigint[]>([])

let lastQuery = ''

async function search() {
  if (isLoading.value || tags.value.length === 0) return
  isLoading.value = true
  const query = {
    queryMode: queryMode.value,
    tags: Array.from(tags.value),
    count: 10,
  }
  const queryJson = stringify(query)
  const clear = lastQuery !== queryJson
  const flowValue = flow.value!
  if (clear) {
    flowValue.clear()
    lastQuery = queryJson
  }
  const resp = await client.post<BaseResp<MessageData[]>>('/api/media/query', query).then(e => e.data)
  if (!resp.success) {
    ElMessage({
      type: 'warning',
      message: resp.message
    })
    isLoading.value = false
    return
  }
  flowValue.receive(resp.data!)
  setTimeout(() => isLoading.value = false, 200)
}
</script>

<style scoped>
.search-box {
  margin: 20px 20px 20px 10px;
  display: flex;
  grid-gap: 0.5rem;
  gap: 0.5rem;
  padding: 20px;
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: var(4px);
}
</style>
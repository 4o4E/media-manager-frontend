<template>
  <div>
    <div class="tags">
      <el-tag
        v-for="tag in tags"
        :key="tag"
        closable
        :disable-transitions="false"
        size="large"
        @close="handleClose(tag)"
      >{{ tagInfo.tagsMap[tag].name }}
      </el-tag>
    </div>
    <div class="flex gap-2">
      <el-select-v2
        style="margin-bottom: 10px; width: 160px;"
        v-model="selectedTagId"
        :options="tagInfo.options"
        @change="onChange"
        filterable
        placeholder="选择标签"
      />
      <el-button
        v-if="tags.size !== 0"
        type="success"
        @click="search(true)"
      >搜索
      </el-button>
      <el-select v-model="queryMode" style="width: 150px">
        <el-option label="包含任意标签" :value="0" />
        <el-option label="包含所有标签" :value="1" />
      </el-select>
    </div>
  </div>
  <el-divider />
  <MessageFlowView :load="load" ref="flow" @fetch="search(false)" />
</template>

<script setup lang="ts">
import { requireAuth } from '@/api/auth'
import { ref } from 'vue'
import type { MessageData } from '@/api/type'
import { type BaseResp, client } from '@/api/api'
import { ElMessage, ElSelectV2 } from 'element-plus'
import MessageFlowView from '@/components/message/MessageFlowView.vue'
import { useTagsStore } from '@/store/tags'

requireAuth()

const load = ref(false)

const queryMode = ref<0 | 1>(0)
const flow = ref()

const tags = ref<Set<number>>(new Set())
const selectedTagId = ref<number>()
const { tagInfo } = useTagsStore()

async function search(clear: boolean) {
  load.value = true
  const resp = await client.post<BaseResp<MessageData[]>>('/api/message', {
    queryMode: queryMode.value,
    tags: Array.from(tags.value),
    count: 10,
    type: 'IMAGE'
  }).then(e => e.data)
  if (!resp.success) {
    ElMessage({
      type: 'warning',
      message: resp.message
    })
    return
  }
  if (clear) flow.value.clear()
  flow.value.receive(resp.data!)
}

function handleClose(tag: number) {
  tags.value.delete(tag)
}

function onChange() {
  if (selectedTagId.value) {
    tags.value.add(selectedTagId.value)
  }
  selectedTagId.value = undefined
}
</script>

<style scoped>
.flex {
  display: flex;
}

.gap-2 {
  grid-gap: 0.5rem;
  gap: 0.5rem;
}

.tags {
  display: flex;
  grid-gap: 0.5rem;
  gap: 0.5rem;
  margin-bottom: 10px;
}
</style>
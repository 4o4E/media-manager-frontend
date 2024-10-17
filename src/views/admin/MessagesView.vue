<template>
  <div>
    <div class="tags" ref="tagsRef">
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
        type="success"
        @click="refresh(true)"
      >搜索</el-button>
      <el-select v-model="queryMode" style="width: 150px">
        <el-option label="包含任意标签" :value="0" />
        <el-option label="包含所有标签" :value="1" />
      </el-select>
    </div>
  </div>
  <el-divider />
  <div>
    <template v-for="(message, index) in data" :key="index">
      <message-preview :width="300" :message="message" @edit="showEdit(message)"/>
      <el-divider />
    </template>
  </div>
  <el-dialog draggable title="编辑" v-model="isShowEdit" destroy-on-close width="80%">
    <div style="height: 60vh">
      <message-builder :data="editing" :tags="editTags" :on-upload="handleUpload" btn="更新" />
    </div>
  </el-dialog>
  <page-selector
    v-model:page="page"
    v-model:size="size"
    v-model:total="total"
    @refresh="refresh"
  />
</template>

<script setup lang="ts">
import { type BaseResp, client, type PageResp } from '@/api/api'
import type { MessageData } from '@/api/type'
import { ElMessage, ElSelectV2, ElDivider } from 'element-plus'
import { ref } from 'vue'
import { useTagsStore } from '@/store/tags'
import PageSelector from '@/components/PageSelector.vue'
import MessagePreview from '@/components/message/edit/MessagePreview.vue'
import MessageBuilder from '@/components/message/MessageBuilder.vue'
import type { UnUploadMessage } from '@/api/upload'
import { toUnUpload } from '@/api/convert'

const tagsRef = ref<HTMLElement>()
const queryMode = ref<0 | 1>(0)
const tags = ref<Set<number>>(new Set())
const selectedTagId = ref<number>()
const { tagInfo } = useTagsStore()

const isShowEdit = ref(false)
const editing = ref<UnUploadMessage[]>([])
const editTags = ref<number[]>([])

async function handleUpload(data: {chain, tags: number[]}): BaseResp {
  await client.put<BaseResp>('/api/message', data).then(e => e.data)
}

async function showEdit(message: MessageData) {
  editing.value = await toUnUpload(message)
  editTags.value = message.tags
  isShowEdit.value = true
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

const data = ref<MessageData[]>([])
const page = ref(1)
const size = ref(20)
const total = ref(0)

async function refresh() {
  const resp = await client.post<BaseResp<PageResp<MessageData[]>>>('/api/admin/message', {
    queryMode: queryMode.value,
    tags: Array.from(tags.value),
    page: page.value,
    size: size.value,
    type: 'IMAGE',
  }).then(e => e.data)
  if (!resp.success) {
    ElMessage({
      type: 'warning',
      message: resp.message,
    })
    return
  }
  data.value = resp.data!.data
  total.value = resp.data!.total
  tagsRef.value?.scrollIntoView({ behavior: 'smooth' })
}

refresh()

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
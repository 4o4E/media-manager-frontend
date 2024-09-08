<template>
  <div style="text-align: center; margin: 0 auto">
    <div class="flex gap-2">
      <el-tag
        v-for="tag in tags"
        :key="tag"
        closable
        :disable-transitions="false"
        size="large"
        @close="handleClose(tag)"
      >{{ tag }}
      </el-tag>
      <el-input
        v-if="inputVisible"
        ref="InputRef"
        v-model="inputValue"
        @keyup.enter="handleInputConfirm"
        @blur="handleInputConfirm"
      />
      <el-button v-else @click="showInput">+</el-button>
      <div>
        <el-button
          v-if="tags.size != 0"
          type="success"
          @click="search(true)"
        >搜索
        </el-button>
      </div>
      <div>
        <el-select v-model="queryMode" style="width: 150px">
          <el-option label="包含任意标签" :value="0" />
          <el-option label="包含所有标签" :value="1" />
        </el-select>
      </div>
    </div>
  </div>
  <el-divider />
  <MessageFlowView :load="load" ref="flow" @fetch="search" />
</template>

<script setup lang="ts">
import { requireAuth } from '@/api/auth'
import { nextTick, ref } from 'vue'
import { type MessageData } from '@/api/type'
import { type BaseResp, client } from '@/api/api'
import { ElInput, ElMessage } from 'element-plus'
import MessageFlowView from '@/components/message/MessageFlowView.vue'

requireAuth()

const load = ref(false)

const queryMode = ref<0 | 1>(0)
const flow = ref()

const search = async (clear: boolean = false) => {
  load.value = true
  const resp: BaseResp<MessageData[]> = await fetchData()
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

const fetchData = async () => {
  return await client.post<BaseResp<MessageData[]>>('/api/message', {
    queryMode: queryMode.value,
    tags: Array.from(tags.value),
    count: 10,
    type: 'IMAGE'
  }).then(e => e.data)
}

const tags = ref<Set<string>>(new Set())
const inputValue = ref('')
const inputVisible = ref(false)
const InputRef = ref<InstanceType<typeof ElInput>>()

const handleClose = (tag: string) => {
  tags.value.delete(tag)
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    InputRef.value!.input!.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value) {
    tags.value.add(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
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
</style>
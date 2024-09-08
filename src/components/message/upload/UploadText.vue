<template>
  <el-form style="width: 300px; margin: auto;">
    <!-- 上传文本 -->
    <el-form-item>
      <el-input
        v-model="text"
        placeholder="输入文本"
        autosize
      />
    </el-form-item>

    <!-- 输入tag -->
    <el-form-item v-if="text.length > 0">
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
        <el-space />
        <div>
          <!-- 确认上传 -->
          <el-button
            v-if="tags.size != 0"
            type="success"
            @click="uploadImageMessage"
          >上传
          </el-button>
        </div>
      </div>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { ElInput, ElMessage } from 'element-plus'
import { type BaseResp, client } from '@/api/api'
import { requireAuth } from '@/api/auth'

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

const tags = ref<Set<string>>(new Set())
const uploadedId = ref<string | null>()

requireAuth()

const text = ref('')

// 上传图片消息
const uploadImageMessage = async () => {
  const resp = await client.put<BaseResp>('/api/message', {
    chain: [{
      id: uploadedId.value,
      type: 'text',
      content: text.value
    }],
    tags: Array.from(tags.value)
  }).then(e => e.data)
  if (!resp.success) {
    ElMessage({
      type: 'warning',
      message: resp.message
    })
    return
  }
  ElMessage({
    type: 'success',
    message: '上传成功'
  })
  text.value = ''
  tags.value.clear()
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
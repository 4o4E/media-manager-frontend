<template>
  <!-- 预览 -->
  <div v-if="data.length !== 0">
    <el-text size="large">预览</el-text>
    <el-row v-for="(message, index) in data" :key="index">
      <corner-icon
        v-if="message.type === 'IMAGE'"
        @close="data.splice(index, 1)"
      >
        <img
          :src="(message as UnUploadImageMessage)?.url ?? ''"
          alt="image"
          style="max-width: 300px; max-height: 300px;"
        />
      </corner-icon>
      <corner-icon
        v-if="message.type === 'VIDEO' || message.type === 'AUDIO'"
        @close="data.splice(index, 1)"
      >
        <video
          v-if="message.type === 'VIDEO' || message.type === 'AUDIO'"
          :src="(message as UnUploadVideoMessage)?.url ?? ''"
        />
      </corner-icon>
      <template v-if="message.type === 'TEXT'">
        <el-text>{{ (message as UnUploadTextMessage).content }}</el-text>
        <el-button size="small" icon="Close" circle @click="data.splice(index, 1)" style="margin-left: 5px;" />
      </template>
    </el-row>
  </div>
  <!-- 新增 -->
  <div>
    <el-text size="large">新增</el-text>
    <el-button v-if="showAddBtn" @click="show"></el-button>
    <div v-else>
      <!-- 选择类型 -->
      <el-row>
        <el-select v-model="temp.type" @change="changeType">
          <el-option label="图片" value="IMAGE" />
          <el-option label="视频" value="VIDEO" />
          <el-option label="音频" value="AUDIO" />
          <el-option label="文本" value="TEXT" />
        </el-select>
      </el-row>
      <!-- 选择文件 -->
      <el-row>
        <choose-file ref="choose" v-if="temp.type !== 'TEXT'" :choose-type="temp.type" />
        <el-input v-else v-model="(temp as UnUploadTextMessage).content" />
      </el-row>
      <el-row>
        <el-button
          v-if="temp.type === 'TEXT'
           ? (temp as UnUploadTextMessage).content.length !== 0
           : choose?.file != null
          "
          @click="addToData"
        >添加
        </el-button>
      </el-row>
    </div>
  </div>
  <!-- 输入tag -->
  <div>
    <el-text size="large">Tag</el-text>
    <el-row>
      <div>
        <el-tag
          v-for="tag in tags"
          :key="tag"
          closable
          :disable-transitions="false"
          size="large"
          @close="handleClose(tag)"
        >{{ tagInfo.tagsMap[tag].name }}
        </el-tag>
        <el-select-v2
          v-model="inputValue"
          filterable
          placeholder="选择Tag"
          style="width: 120px"
          :options="tagInfo.options"
          @change="addTag"
        />
      </div>
    </el-row>
    <el-row>
      <div>
        <!-- 确认上传 -->
        <el-button
          v-if="tags.size != 0 && data.length !== 0"
          type="success"
          @click="uploadCompositeMessage"
        >上传
        </el-button>
      </div>
    </el-row>
  </div>

</template>

<script setup lang="ts">
import { ref } from 'vue'
import ChooseFile from '@/components/message/choose/ChooseFile.vue'
import { ElInput, ElMessage, ElSelectV2 } from 'element-plus'
import type {
  UnUploadImageMessage,
  UnUploadMediaMessage,
  UnUploadMessage,
  UnUploadTextMessage,
  UnUploadVideoMessage
} from '@/api/upload'
import { type BaseResp, client, uploadFile } from '@/api/api'
import { useTagsStore } from '@/store/tags'
import CornerIcon from '@/components/CornerIcon.vue'

const data = ref<UnUploadMessage[]>([])
const showAddBtn = ref<true>()
const temp = ref<UnUploadMessage>({ type: 'IMAGE' })
const inputValue = ref<number>()
const tags = ref(new Set<number>())
const choose = ref()
const { tagInfo } = useTagsStore()

function handleClose(tag: number) {
  tags.value.delete(tag)
}

function addTag() {
  tags.value.add(inputValue.value!)
  inputValue.value = undefined
}

function changeType(t: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'TEXT') {
  choose.value?.clear()
  switch (t) {
    case 'TEXT': {
      temp.value = { content: '', type: 'TEXT' } as UnUploadTextMessage
      return
    }
    case 'IMAGE':
  }
}

function addToData() {
  data.value.push({
    ...temp.value!, ...choose.value?.metaInfo ?? {},
    url: choose.value?.fileUrl,
    file: choose.value?.file
  })
  temp.value = { type: temp.value.type }
  if (temp.value.type === 'TEXT') (temp.value as UnUploadTextMessage).content = ''
  choose.value?.clear()
}

async function uploadCompositeMessage() {
  // 上传各文件
  const messages = await Promise.all(data.value.map(async (e: UnUploadMessage) => {
    if (e.type === 'TEXT') {
      return { type: 'text', content: (e as UnUploadTextMessage).content }
    }
    const media = e as UnUploadMediaMessage
    const rawFile = media.file!
    const blob = new Blob([await rawFile.raw!.arrayBuffer()])
    const id = await uploadFile(blob)
    return {
      id,
      type: 'image',
      format: rawFile.name.substring(rawFile.name.lastIndexOf('.') + 1),
      file: false,
      width: media.width,
      height: media.height,
      length: media.length
    }
  }))

  const resp = await client.put<BaseResp>('/api/message', {
    chain: messages,
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

  // 清理objectUrl
  data.value.forEach(e => {
    const url = (e as UnUploadMediaMessage).url
    if (url) URL.revokeObjectURL(url)
  })
  data.value = []
}

function show() {
  showAddBtn.value = true
}

defineExpose({
  data
})
</script>

<style scoped>
.el-row {
  margin-top: 10px;
  margin-bottom: 10px;
}

.el-tag {
  margin-right: 10px;
}

.el-tag:last-child {
  margin-right: 0;
}
</style>
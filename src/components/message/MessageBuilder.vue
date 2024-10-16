<template>
  <el-row :gutter="20">
    <el-col :span="12">
      <!-- 预览 -->
      <el-text size="large">预览</el-text>
      <div>
        <div v-if="data.length === 0" v-bind:style="{
          border: '1px #777 dashed',
          borderRadius: '15px',
          margin: '10px 0',
          minHeight: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }">
          <p style="font-size: 25px;">还没有内容</p>
        </div>
        <vue-draggable
          v-else
          v-model="data"
          :animation="150"
          target=".message-element"
          @start="drag = true"
          @end="nextTick(() => drag = false)"
        >
          <TransitionGroup
            type="transition"
            tag="ul"
            :name="!drag ? 'fade' : undefined"
            class="message-element"
          >
            <li
              v-for="(message, index) in data"
              :key="message.index"
            >
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
            </li>
          </TransitionGroup>
        </vue-draggable>
      </div>
    </el-col>
    <el-col :span="12">
      <!-- 新增 -->
      <div>
        <el-text size="large">新增</el-text>
        <div>
          <!-- 选择类型 -->
          <el-row>
            <el-select v-model="temp.type" @change="changeType" style="max-width: 120px;">
              <el-option label="图片" value="IMAGE" />
              <el-option label="视频" value="VIDEO" />
              <el-option label="音频" value="AUDIO" />
              <el-option label="文本" value="TEXT" />
            </el-select>
            <el-button
              v-if="showAddBtn()"
              type="primary"
              style="max-width: 120px; margin-left: 10px;"
              @click="addToData"
            >添加
            </el-button>
          </el-row>
          <!-- 选择文件 -->
          <el-row>
            <choose-file ref="choose" v-if="temp.type !== 'TEXT'" :choose-type="temp.type" :max-width="120" />
            <el-input v-else :rows="3" v-model="(temp as UnUploadTextMessage).content" />
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
    </el-col>
  </el-row>

</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import ChooseFile from '@/components/message/choose/ChooseFile.vue'
import { ElInput, ElMessage, ElSelectV2 } from 'element-plus'
import type {
  UnUploadImageMessage,
  UnUploadMediaMessage,
  UnUploadMessage,
  UnUploadTextMessage,
  UnUploadVideoMessage,
} from '@/api/upload'
import { type BaseResp, client, uploadFile } from '@/api/api'
import { useTagsStore } from '@/store/tags'
import CornerIcon from '@/components/CornerIcon.vue'
import { VueDraggable } from 'vue-draggable-plus'
import { now } from '@vueuse/core'

const data = ref<UnUploadMessage[]>([])
const temp = ref<UnUploadMessage>({ type: 'IMAGE' })
const inputValue = ref<number>()
const tags = ref(new Set<number>())
const choose = ref()
const { tagInfo } = useTagsStore()

const drag = ref(false)

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
      temp.value = { type: 'TEXT', content: '' } as UnUploadTextMessage
      return
    }
    case 'IMAGE':
  }
}

function showAddBtn() {
  return temp.value.type === 'TEXT'
    ? (temp.value as UnUploadTextMessage).content.length !== 0
    : choose.value?.file != null
}

function addToData() {
  data.value.push({
    ...temp.value!, ...choose.value?.metaInfo ?? {},
    url: choose.value?.fileUrl,
    file: choose.value?.file,
    index: now(),
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
      length: media.length,
    }
  }))

  const resp = await client.put<BaseResp>('/api/message', {
    chain: messages,
    tags: Array.from(tags.value),
  }).then(e => e.data)
  if (!resp.success) {
    ElMessage({
      type: 'warning',
      message: resp.message,
    })
    return
  }
  ElMessage({
    type: 'success',
    message: '上传成功',
  })

  // 清理objectUrl
  data.value.forEach(e => {
    const url = (e as UnUploadMediaMessage).url
    if (url) URL.revokeObjectURL(url)
  })
  data.value = []
}

defineExpose({
  data,
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

.list-move, /* 对移动中的元素应用的过渡 */
.list-enter-active,
.list-leave-active {
  transition: all 0.2s ease;
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
</style>
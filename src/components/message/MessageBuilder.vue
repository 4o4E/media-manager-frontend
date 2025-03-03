<template>
  <el-row :gutter="20">
    <el-col :span="12">
      <!-- 预览 -->
      <el-text size="large">预览</el-text>
      <div style="margin: 10px 0">
        <div v-if="data.length === 0" v-bind:style="{
          border: '1px #777 dashed',
          borderRadius: '5px',
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
          <transition-group
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
              <div v-if="message.type === 'TEXT'" style="margin-bottom: 8px; display: flex;">
                <el-input type="textarea" disabled :autosize="{ minRows: 1, maxRows: 10 }" v-model="(message as UnUploadTextMessage).content" />
                <el-button size="small" icon="Close" circle @click="data.splice(index, 1)" style="margin-left: 5px;" />
              </div>
            </li>
          </transition-group>
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
            <el-button-group>
              <el-button
                v-for="(label, type) in types"
                :key="type"
                :type="temp.type === type ? 'primary' : undefined"
                @click="changeType(type)"
              >{{ label }}</el-button>
            </el-button-group>
            <el-button
              v-if="showAddBtn()"
              type="primary"
              style="max-width: 120px; margin-left: 10px;"
              @click="addToData"
            >添加
            </el-button>
          </el-row>
          <el-row>
            <!-- 选择文件 -->
            <choose-file ref="choose" v-if="temp.type !== 'TEXT'" :choose-type="temp.type" :max-width="120" />
            <!-- 输入文本 -->
            <el-input v-else type="textarea" :autosize="{ minRows: 3 }" v-model="(temp as UnUploadTextMessage).content" />
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
            >{{ props.btn }}
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
import { type BaseResp, uploadFile } from '@/api/api'
import { useTagsStore } from '@/store/tags'
import CornerIcon from '@/components/CornerIcon.vue'
import { VueDraggable } from 'vue-draggable-plus'
import { now } from '@vueuse/core'

const types = {
  'IMAGE': '图片',
  'VIDEO': '视频',
  'AUDIO': '音频',
  'TEXT': '文本',
}

interface PropsType {
  id?: string,
  data?: UnUploadMessage[],
  tags?: number[],
  btn: string,
  onUpload: (data: { messages, tags: number[] }) => BaseResp
}

const props = defineProps<PropsType>()

const data = ref<UnUploadMessage[]>(props.data ?? [])
const temp = ref<UnUploadMessage>({ type: 'IMAGE' })
const inputValue = ref<number>()
const tags = ref(new Set<number>(props.tags ?? []))
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

function changeType(type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'TEXT') {
  temp.value.type = type
  choose.value?.clear()
  if (type === 'TEXT') temp.value = { type: 'TEXT', content: '' }
}

function showAddBtn() {
  return temp.value.type === 'TEXT'
    ? (temp.value as UnUploadTextMessage).content.length !== 0
    : choose.value?.file != null
}

async function addToData() {
  if (temp.value.type === 'TEXT') data.value.push({ ...temp.value!, index: now() })
  else {
    console.log({
      ...temp.value!, ...choose.value?.metaInfo ?? {},
      url: choose.value!.fileUrl,
      blob: choose.value!.file,
      index: now(),
    })
    data.value.push({
      ...temp.value!, ...choose.value?.metaInfo ?? {},
      url: choose.value!.fileUrl,
      blob: choose.value!.file,
      index: now(),
    })
  }
  temp.value = { type: temp.value.type }
  if (temp.value.type === 'TEXT') (temp.value as UnUploadTextMessage).content = ''
  choose.value?.clear()
}

const emit = defineEmits(['uploadDone'])

async function uploadCompositeMessage() {
  // 上传各文件
  const messages = await Promise.all(data.value.map(async (e: UnUploadMessage) => {
    if (e.type === 'TEXT') {
      return { type: 'text', content: (e as UnUploadTextMessage).content }
    }
    const media = e as UnUploadMediaMessage
    const blob = media.blob!
    const id = await uploadFile(blob)
    return {
      id,
      type: e.type.toLowerCase(),
      format: media.format,
      file: false,
      width: media.width,
      height: media.height,
      length: media.length,
    }
  }))

  const resp = await props.onUpload({ id: props.id, chain: messages, tags: Array.from(tags.value) })
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
  emit('uploadDone')
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

ul {
  list-style-type: none;
  padding: 0;
  margin: 0;
}
</style>
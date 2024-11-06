<template>
  <!-- 预览 -->
  <corner-icon v-if="file" @close="clear">
    <video
      v-if="chooseType === 'VIDEO'"
      style="max-width: 300px; max-height: 300px"
      :src="fileUrl"
      @loadedmetadata="handleVideoMetadata"
      controls
    />
    <img
      v-if="chooseType === 'IMAGE'"
      style="max-width: 300px; max-height: 300px"
      :src="fileUrl"
      alt="IMAGE"
      @load="handleImageMetadata"
    />
  </corner-icon>
  <!-- 上传文件 -->
  <div v-else>
    <div
      ref="uploadZone"
      class="upload-zone"
      @dragenter="fileDragenter"
      @dragover="e => e.preventDefault()"
      @dragleave="fileDragleave"
      @drop="fileDrop"
    >
      <div style="display: block;">
        <div style="display: flex; justify-content: center;">
          <span>将文件拖拽至此</span>
          <template v-if="over">
            <span>，松开鼠标开始上传</span>
          </template>
          <template v-else>
            <span>，或</span>
            <label>
              <span style="color: #11A8FF; cursor: pointer;">点此上传</span>
              <input
                type="file"
                ref="fileInputInstance"
                style="display: none;"
                :accept="choose[chooseType].accept.map(e => '.' + e).join(', ')"
                @change="onFileSelect"
              />
            </label>
            <br />
          </template>
        </div>
        <span>支持 {{ choose[chooseType].accept.join(', ') }} 等格式</span>
      </div>
    </div>
    <!--    <el-upload-->
    <!--      :accept="choose[chooseType].accept"-->
    <!--      :auto-upload="false"-->
    <!--      :limit="1"-->
    <!--      :on-exceed="handleExceed"-->
    <!--      :on-change="onChange"-->
    <!--      :style="`maxWidth: ${maxWidth}px`"-->
    <!--    >-->
    <!--      <el-button>-->
    <!--        <el-text style="width: 300px; margin: 0 auto;">选择{{ choose[chooseType].display }}</el-text>-->
    <!--      </el-button>-->
    <!--    </el-upload>-->
  </div>
</template>

<script setup lang="ts">

import { onMounted, onUnmounted, ref } from 'vue'
import { ElMessage } from 'element-plus'
import type { HasLength, HasSize } from '@/api/type'
import CornerIcon from '@/components/CornerIcon.vue'

interface PropsType {
  chooseType: 'IMAGE' | 'VIDEO' | 'AUDIO'
  maxWidth: number
}

const choose = {
  IMAGE: {
    display: '图片',
    accept: ['png', 'jpg', 'jpeg', 'gif', 'bmp'],
  },
  VIDEO: {
    display: '视频',
    accept: ['mp4', 'avi'],
  },
  AUDIO: {
    display: '音频',
    accept: ['mp3', 'flac', 'm4a', 'ogg'],
  },
}

const props = defineProps<PropsType>()
const file = ref<File>()
const fileUrl = ref<string>()
const uploadZone = ref<HTMLElement>()
const fileInputInstance = ref<HTMLElement>()
const over = ref()

function onFileSelect() {
  const files = fileInputInstance.value.files
  if (files.length === 0) return
  handleFileSelect(files[0])
}

function fileDrop(e) {
  e.preventDefault()
  over.value = undefined
  unHighlight(e)
  handleFileSelect(e.dataTransfer.files[0])
}

function handleFileSelect(selectedFile: File) {
  const format = selectedFile.name.substring(selectedFile.name.lastIndexOf('.') + 1)
  console.log(format)
  const chooseElement = choose[props.chooseType]
  if (!chooseElement.accept.includes(format)) {
    ElMessage({
      type: 'warning',
      message: `文件格式不正确, ${chooseElement.display}仅支持 ${chooseElement.accept.join(', ')} 等格式`,
    })
    return
  }
  metaInfo.value.format = format
  file.value = selectedFile
  fileUrl.value = URL.createObjectURL(selectedFile)
}

function fileDragenter(e) {
  e.preventDefault()
  over.value = e.target
}

function fileDragleave(e) {
  if (e.target !== over.value) return
  e.preventDefault()
  over.value = undefined
  e.preventDefault()
}

const hl = ref()

function highlight(e) {
  hl.value = e.target
  uploadZone.value!.classList.add('active')
}

function unHighlight(e) {
  if (e.target !== hl.value) return
  hl.value = undefined
  uploadZone.value!.classList.remove('active')
}

onMounted(() => {
  document.addEventListener('dragenter', highlight)
  document.addEventListener('dragleave', unHighlight)
  document.addEventListener('dragdrop', unHighlight)
})

onUnmounted(() => {
  document.removeEventListener('dragenter', highlight)
  document.removeEventListener('dragleave', unHighlight)
  document.removeEventListener('dragdrop', unHighlight)
})

const metaInfo = ref<HasLength & HasSize>({})

function clear() {
  file.value = undefined
  fileUrl.value = undefined
  metaInfo.value = {}
}

function handleVideoMetadata(event: Event) {
  const target = event.target as HTMLVideoElement
  if (target) {
    metaInfo.value.length = target.duration
    metaInfo.value.width = target.videoWidth
    metaInfo.value.height = target.videoHeight
  }
}

function handleImageMetadata(event: Event) {
  const target = event.target as HTMLImageElement
  if (target) {
    metaInfo.value.width = target.naturalWidth
    metaInfo.value.height = target.naturalHeight
  }

}

defineExpose({
  file,
  fileUrl,
  metaInfo,
  clear,
})
</script>

<style scoped lang="scss">
.upload-zone {
  border: 1px #777 dashed;
  padding: 10px;
  border-radius: 5px;
  min-height: 300px;
  min-width: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
}

.upload-zone.active {
  background: #409eff77;
  border-color: #409eff;
}
</style>
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
  <el-upload
    v-else
    :accept="choose[chooseType].accept"
    :auto-upload="false"
    :limit="1"
    :on-exceed="handleExceed"
    :on-change="onChange"
    style="width: 100%; margin: 0 auto;"
  >
    <el-button>
      <el-text style="width: 300px; margin: 0 auto;">选择{{ choose[chooseType].display }}</el-text>
    </el-button>
  </el-upload>
</template>

<script setup lang="ts">

import { ref } from 'vue'
import type { UploadFile, UploadInstance, UploadProps, UploadRawFile } from 'element-plus'
import { genFileId } from 'element-plus'
import { requireAuth } from '@/api/auth'
import type { HasLength, HasSize } from '@/api/type'
import CornerIcon from '@/components/CornerIcon.vue'

interface PropsType {
  chooseType: 'IMAGE' | 'VIDEO' | 'AUDIO'
}

const choose = {
  IMAGE: {
    display: '图片',
    accept: '.png, .jpg, .jpeg, .gif, .bmp'
  },
  VIDEO: {
    display: '视频',
    accept: '.mp4, .avi'
  },
  AUDIO: {
    display: '音频',
    accept: '.mp3, .flac, .m4a, .ogg'
  }
}

defineProps<PropsType>()
const upload = ref<UploadInstance>()
const file = ref<UploadFile>()
const fileUrl = ref<string>()

requireAuth()

const metaInfo = ref<HasLength & HasSize>({})

const clear = () => {
  file.value = undefined
  fileUrl.value = undefined
  metaInfo.value = {}
}

const handleVideoMetadata = (event: Event) => {
  const target = event.target as HTMLVideoElement
  if (target) {
    metaInfo.value = {
      length: target.duration,
      width: target.videoWidth,
      height: target.videoHeight
    }
  }
}

const handleImageMetadata = (event: Event) => {
  const target = event.target as HTMLImageElement
  if (target) {
    metaInfo.value = {
      width: target.naturalWidth,
      height: target.naturalHeight
    }
  }

}

// 用于限制只上传一个文件
const handleExceed: UploadProps['onExceed'] = (files) => {
  console.log(upload.value)
  upload.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  metaInfo.value.format = file.name.substring(file.name.lastIndexOf("."))
  upload.value!.handleStart(file)
}

// 用来捕获上传的文件
const onChange = (uploadFile: UploadFile) => {
  file.value = uploadFile
  fileUrl.value = URL.createObjectURL(uploadFile.raw!)
}

defineExpose({
  file,
  fileUrl,
  metaInfo,
  clear
})
</script>

<style scoped>
</style>
<template>
  <!-- 预览 -->
  <div class="box" v-if="file">
    <div class="corner" @click="clear">&nbsp;+</div>
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
      @loadedmetadata="handleImageMetadata"
    />
  </div>
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
      width: target.width,
      height: target.height
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
.box {
  position: relative;
}

.corner {
  color: #ccc;
  user-select: none;
  line-height: 0;
  font-size: 30px;
  position: absolute;
  top: -30px;
  right: -30px;
  width: 0;
  height: 0;
  border: 30px solid transparent;
  border-right-color: #000c;
  transform: rotateZ(135deg);
}

.corner:hover {
  color: #fff;
}
</style>
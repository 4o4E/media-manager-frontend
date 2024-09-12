<template>
  <!-- 预览 -->
  <div class="box" v-if="file">
    <div class="corner" @click="clear">&nbsp;+</div>
    <video
      v-if="chooseType === 'VIDEO'"
      style="max-width: 300px; max-height: 300px"
      :src="fileUrl"
      @loadedmetadata="handleLoadedMetadata"
      controls
    />
    <img
      v-if="chooseType === 'IMAGE'"
      style="max-width: 300px; max-height: 300px"
      :src="fileUrl"
      alt="IMAGE"
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
const fileUrl = ref<string | undefined>()

requireAuth()

const videoDuration = ref<number>()

const clear = () => {
  file.value = undefined
}

const handleLoadedMetadata = (event: Event) => {
  const target = event.target as HTMLVideoElement
  if (target && target.duration) {
    videoDuration.value = target.duration
  }
}

// 用于限制只上传一个文件
const handleExceed: UploadProps['onExceed'] = (files) => {
  console.log(upload.value)
  upload.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  upload.value!.handleStart(file)
}

// 用来捕获上传的文件
const onChange = (uploadFile: UploadFile) => {
  file.value = uploadFile
  fileUrl.value = URL.createObjectURL(uploadFile.raw!)
}

defineExpose({
  file
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
<template>
  <el-tabs v-model="activeName" class="demo-tabs">
    <el-tab-pane label="复合" name="复合">
      <upload-composite />
    </el-tab-pane>
    <el-tab-pane label="图片" name="图片">
      <upload-image />
    </el-tab-pane>
    <el-tab-pane label="视频" name="视频">
      <upload-video />
    </el-tab-pane>
    <el-tab-pane label="音频" name="音频">
      <upload-audio />
    </el-tab-pane>
    <el-tab-pane label="文本" name="文本">
      <upload-text />
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import UploadImage from '@/components/message/upload/UploadImage.vue'
import UploadVideo from '@/components/message/upload/UploadVideo.vue'
import UploadAudio from '@/components/message/upload/UploadAudio.vue'
import UploadText from '@/components/message/upload/UploadText.vue'
import UploadComposite from '@/components/message/upload/UploadComposite.vue'

const activeName = ref('复合')
</script>

<style scoped>
</style>
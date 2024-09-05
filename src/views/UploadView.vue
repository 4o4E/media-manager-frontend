<template>
  <el-tabs v-model="activeName" class="demo-tabs" @tab-click="handleClick">
    <el-tab-pane label="图片" name="图片">
      <upload-image-view/>
    </el-tab-pane>
    <el-tab-pane label="视频" name="视频">
      <upload-video-view/>
    </el-tab-pane>
    <el-tab-pane label="音频" name="音频">
      <upload-audio-view/>
    </el-tab-pane>
    <el-tab-pane label="文本" name="文本">
      <upload-text-view/>
    </el-tab-pane>
  </el-tabs>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { TabsPaneContext } from 'element-plus'
import UploadImageView from '@/views/UploadImageView.vue'
import UploadVideoView from '@/views/UploadVideoView.vue'
import UploadAudioView from '@/views/UploadAudioView.vue'
import UploadTextView from '@/views/UploadTextView.vue'

const activeName = ref('图片')

const handleClick = (tab: TabsPaneContext, event: Event) => {
  console.log(tab, event)
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
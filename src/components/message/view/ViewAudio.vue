<template>
  <div style="display: flex">
    <video
      :src="`${baseUrl}/api/file/${(props.message.data[0] as ImageMessage)!.id}`"
      :style="{ width: width, height: height }"
      @click="clickVideo"
    />
    <div style="display: block">
      <div>
        <el-text>类型: 音频</el-text>
      </div>
      <div>
        <el-text>
          上传于: {{ moment(props.message.info.time).format('YYYY-MM-DD HH:mm:ss') }}
        </el-text>
      </div>
      <div style="padding: 2px">
        <el-text>tags: </el-text>
        <template v-for="tag of message.info.tags" :key="tag">
          <el-tag type="primary">{{ tag }}</el-tag>
        </template>
      </div>
    </div>
    <el-dialog
      v-model="visible"
      center
      fullscreen
    >
      <video
        :src="`${baseUrl}/api/file/${(props.message.data[0] as ImageMessage)!.id}`"
        style="height: 95vh; width: 95vh; margin: auto; display: flex;"
        controls
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { baseUrl } from '@/api/api'
import moment from 'moment'
import { type ImageMessage, type MessageData } from '@/api/type'
import { ref } from 'vue'

interface PropsType {
  message: MessageData
  width: string
  height: string
}

const props = defineProps<PropsType>()
const visible = ref(false)
const clickVideo = () => {
  visible.value = true
}
</script>

<style scoped>

</style>
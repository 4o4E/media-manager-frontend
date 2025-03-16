<template>
  <div :style="style">
    <video
      :src="`/api/file/${(props.message.content[0] as ImageElement)!.id}.${(message.content[0] as ImageElement).format}`"
      @click="clickVideo"
      style="display: flex"
      @load="style = ''"
    />
    <el-dialog
      v-model="visible"
      center
      fullscreen
    >
      <video
        :src="`/api/file/${(props.message.content[0] as ImageElement)!.id}.${(message.content[0] as ImageElement).format}`"
        style="height: 95vh; width: 95vh; margin: auto; display: flex;"
        controls
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { MessageData } from '@/api/types/media'

interface PropsType {
  message: MessageData
  loadHeight: number
}

const props = defineProps<PropsType>()
const visible = ref(false)
const style = ref(`min-height: ${props.loadHeight}px`)

function clickVideo() {
  visible.value = true
}
</script>

<style scoped>

</style>
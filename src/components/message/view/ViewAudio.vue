<template>
  <div>
    <video
      :src="`/api/file/${(props.message.content[0] as ImageElement)!.id}.${(message.content[0] as ImageElement).format}`"
      style="display: flex"
      @click="clickVideo"
    />
    <el-dialog
      draggable
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
import { type ImageElement, type MessageData } from '@/api/types/media'
import { ref } from 'vue'

interface PropsType {
  message: MessageData
}

const props = defineProps<PropsType>()
const visible = ref(false)

function clickVideo() {
  visible.value = true
}
</script>

<style scoped>

</style>
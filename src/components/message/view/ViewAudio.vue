<template>
  <div>
    <video
      :src="`${baseUrl}/api/file/${(props.message.content[0] as ImageMessage)!.id}`"
      style="display: flex"
      @click="clickVideo"
    />
    <el-dialog
      v-model="visible"
      center
      fullscreen
    >
      <video
        :src="`${baseUrl}/api/file/${(props.message.content[0] as ImageMessage)!.id}`"
        style="height: 95vh; width: 95vh; margin: auto; display: flex;"
        controls
      />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { baseUrl } from '@/api/api'
import { type ImageMessage, type MessageData } from '@/api/type'
import { ref } from 'vue'

interface PropsType {
  message: MessageData
}

const props = defineProps<PropsType>()
const visible = ref(false)
const clickVideo = () => {
  visible.value = true
}
</script>

<style scoped>

</style>
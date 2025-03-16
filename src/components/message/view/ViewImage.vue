<template>
  <div :style="style">
    <img
      :src="`/api/file/${(props.message.content[0] as ImageElement).id}.${(message.content[0] as ImageElement).format}`"
      :alt="props.message.id"
      style="display: flex; max-width: 100%; margin: 0 auto;"
      @click="visible = !visible"
      @load="style = ''"
    />
  </div>
</template>

<script setup lang="ts">
import { type ImageElement, type MessageData } from '@/api/types/media'
import { ref } from 'vue'

interface PropsType {
  message: MessageData
  loadHeight: number
}

const props = defineProps<PropsType>()
const style = ref(`min-height: ${props.loadHeight}px`)
</script>

<style scoped>

</style>
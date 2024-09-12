<template>
  <img
    :src="`/api/file/${(props.message.content[0] as ImageMessage).id}`"
    :alt="props.message.id"
    style="display: flex; max-width: 100%; margin: 0 auto"
    @click="visible = !visible"
  />
</template>

<script setup lang="ts">
import { type ImageMessage, type MessageData } from '@/api/type'

interface PropsType {
  message: MessageData
}

const props = defineProps<PropsType>()
</script>

<style scoped>

</style>
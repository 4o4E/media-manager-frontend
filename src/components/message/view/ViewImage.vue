<template>
  <img
    :src="`${baseUrl}/api/file/${(props.message.content[0] as ImageMessage).id}`"
    style="display: flex; max-width: 100%; margin: 0 auto"
    :alt="props.message.id"
    @click="visible = !visible"
  />
</template>

<script setup lang="ts">
import { baseUrl } from '@/api/api'
import { type ImageMessage, type MessageData } from '@/api/type'

interface PropsType {
  message: MessageData
}

const props = defineProps<PropsType>()
</script>

<style scoped>

</style>
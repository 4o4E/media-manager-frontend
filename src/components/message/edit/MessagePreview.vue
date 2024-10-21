<template>
  <div style="display: flex">
    <div :style="`width: ${width}px`">
      <div v-for="(el, index) in message.content" :key="index" style="margin: 5px 0">
        <img
          v-if="el.type == 'image'"
          :src="`/api/file/${(props.message.content[0] as ImageMessage)!.id}`"
          :alt="`/api/file/${(props.message.content[0] as ImageMessage)!.id}`"
          :style="`width: ${width}px`"
        />
        <video
          v-if="el.type == 'video' || el.type == 'audio'"
          :src="`/api/file/${(props.message.content[0] as ImageMessage)!.id}`"
          :style="`width: ${width}px`"
        />
        <el-input
          :style="`min-width: ${width}px; max-width: ${width}px; min-height: 50px`"
          autosize
          v-if="el.type == 'text'"
          disabled
          v-model="(message.content[0] as TextMessage).content"
        />
      </div>
    </div>
    <div style="display: block; margin: 10px;">
      <div>
        <el-text>
          上传于: {{ moment(props.message.time).format('YYYY.MM.DD HH:mm:ss') }}
        </el-text>
      </div>
      <div style="display: flex;">
        <tag-list :tags="message.tags" size="default" />
        <el-button
          v-if="auth.perms.includes('message:edit')"
          :icon="EditPen"
          circle
          @click="emit('edit')"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { type ImageMessage, type MessageData, type TextMessage } from '@/api/type'
import TagList from '@/components/message/TagList.vue'
import { auth } from '@/api/auth'
import { EditPen } from '@element-plus/icons-vue'

interface PropsType {
  message: MessageData
  width: number
}

const props = defineProps<PropsType>()

const emit = defineEmits(['edit'])
</script>

<style scoped>

</style>
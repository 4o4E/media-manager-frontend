<template>
  <div style="display: flex">
    <div :style="`width: ${width}px`">
      <img
        v-if="message.type == 'IMAGE'"
        :src="`/api/file/${(props.message.content[0] as ImageMessage)!.id}`"
        :alt="`/api/file/${(props.message.content[0] as ImageMessage)!.id}`"
        :style="`width: ${width}px`"
      />
      <video
        v-if="message.type == 'VIDEO' || message.type == 'AUDIO'"
        :src="`/api/file/${(props.message.content[0] as ImageMessage)!.id}`"
        :style="`width: ${width}px`"
      />
      <textarea
        :style="`min-width: ${width}px; max-width: ${width}px; min-height: 50px`"
        :rows="5"
        v-if="message.type == 'TEXT'"
        disabled
        v-model="(message.content[0] as TextMessage).content"
      />
    </div>
    <div style="display: block; margin: 10px;">
      <div>
        <el-text v-if="message.type === 'IMAGE'">类型: 图片</el-text>
        <el-text v-else-if="message.type === 'VIDEO'">类型: 视频</el-text>
        <el-text v-else-if="message.type === 'AUDIO'">类型: 音频</el-text>
        <el-text v-else-if="message.type === 'TEXT'">类型: 文本</el-text>
      </div>
      <div>
        <el-text>
          上传于: {{ moment(props.message.time).format('YYYY-MM-DD HH:mm:ss') }}
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
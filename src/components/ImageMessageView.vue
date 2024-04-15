<template>
  <div style="display: flex">
    <el-image
      :preview-src-list="[`${baseUrl}/api/file/${(props.message.data[0] as ImageMessage)!.id}`]"
      :src="`${baseUrl}/api/file/${(props.message.data[0] as ImageMessage)!.id}`"
      fit="scale-down"
      :style="{ width: width, height: height }"
    />
    <div style="display: block">
      <div style="padding: 2px">
        <el-text>tags: </el-text>
        <template v-for="tag of message.info.tags" :key="tag">
          <el-tag type="primary">{{ tag }}</el-tag>
        </template>
      </div>
      <div>
        <el-text>
          上传于: {{ moment(props.message.info.time).format('YYYY-MM-DD HH:mm:ss') }}
        </el-text>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { baseUrl } from '@/api/api'
import moment from 'moment'
import { type ImageMessage, type MessageData } from '@/api/type'

interface PropsType {
  message: MessageData
  width: string
  height: string
}

const props = defineProps<PropsType>()
</script>

<style scoped>

</style>
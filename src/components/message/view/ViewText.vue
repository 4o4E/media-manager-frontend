<template>
  <div style="display: flex">
    <div style="display: block">
      <el-text>{{ (props.message.data[0] as TextMessage).content }}</el-text>
      <div>
        <el-text>类型: 文本</el-text>
      </div>
      <div>
        <el-text>
          上传于: {{ moment(props.message.info.time).format('YYYY-MM-DD HH:mm:ss') }}
        </el-text>
      </div>
      <div style="padding: 2px">
        <el-text>tags:</el-text>
        <template v-for="tag of message.info.tags" :key="tag">
          <el-tag type="primary">{{ tag }}</el-tag>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import moment from 'moment'
import { type MessageData, type TextMessage } from '@/api/type'

interface PropsType {
  message: MessageData
}

const props = defineProps<PropsType>()
</script>

<style scoped>

</style>
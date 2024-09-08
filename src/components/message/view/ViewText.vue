<template>
  <div>
    <div>
      <el-text>{{ (props.message.content[0] as TextMessage).content }}</el-text>
      <!--      <div>-->
      <!--        <el-text>类型: 文本</el-text>-->
      <!--      </div>-->
      <!--      <div>-->
      <!--        <el-text>-->
      <!--          上传于: {{ moment(props.message.info.time).format('YYYY-MM-DD HH:mm:ss') }}-->
      <!--        </el-text>-->
      <!--      </div>-->
    </div>
  </div>
</template>

<script setup lang="ts">
import { type MessageData, type TextMessage } from '@/api/type'

interface PropsType {
  message: MessageData
}

const props = defineProps<PropsType>()
</script>

<style scoped>

</style>
<template>
  <div class="infinite" ref="container">
    <el-text size="large" v-if="!finished">{{ loadingText || '加载中 >_<' }}</el-text>
    <el-text size="large" v-if="finished">{{ finishedText || '到底啦 =w=' }}</el-text>
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { useIntersectionObserver } from '@vueuse/core'

interface PropsInterface {
  loadingText?: string
  finishedText?: string
  finished: boolean
}

const props = defineProps<PropsInterface>()

const emit = defineEmits(['infinite'])

const container = ref()
useIntersectionObserver(
  container,
  (isIntersecting) => {
    if (isIntersecting && !props.finished) emit('infinite')
  },
  {
    threshold: 1
  }
)
</script>

<style scoped>
.infinite {
  text-align: center;
  margin: 1em auto auto auto;
}
</style>

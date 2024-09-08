<template>
  <el-card>
    <div style="height: 93vh">
      <el-row justify="space-evenly">
        <el-col :span="2" style="display: flex; justify-content: center; align-items: center;">
          <el-button
            size="large"
            icon="ArrowLeftBold"
            circle
            @click="prev"
            :disabled="props.index === 0"
          />
        </el-col>
        <el-col
          :span="20"
          style="display: flex; justify-content: center; align-items: center; height: 93vh"
          @pointerdown="onMousedown"
          @pointermove="onMouthMove"
          @pointerup="onMouseup"
          @wheel="onWheel"
        >
          <img
            :style="{
              'max-height': 'fit-content',
              'user-select': 'none',
              'will-change': 'transform',
              transform: `scale(${scale}) translate(${move.x}px, ${move.y}px)`,
              transition: 'transform 0.3s',
              'transform-origin': `${scaleOrigin.x}px ${scaleOrigin.y}px`
            }"
            v-if="messages[index].type === 'IMAGE'"
            :src="`${baseUrl}/api/file/${(messages[index].content[0] as ImageMessage).id}`"
            :alt="(messages[index].content[0] as ImageMessage).id"
            draggable="false"
          />
        </el-col>
        <el-col :span="2" style="display: flex; justify-content: center; align-items: center;">
          <el-button
            size="large"
            icon="ArrowRightBold"
            circle
            @click="next"
            :disabled="props.index >= props.messages.length - 1"
          />
        </el-col>
      </el-row>

    </div>
  </el-card>
</template>

<script setup lang="ts">
import type { ImageMessage, MessageData } from '@/api/type'
import { baseUrl } from '@/api/api'
import { ref } from 'vue'
import { now } from '@vueuse/core'

interface PropsType {
  index: number
  messages: MessageData[]
}

const props = defineProps<PropsType>()
const emit = defineEmits(['next', 'prev'])

const scale = ref(1)
const move = ref<{ x: number, y: number }>({ x: 0, y: 0 })
const last = ref<{ x: number, y: number }>({ x: 0, y: 0 })
const scaleOrigin = ref<{ x: number, y: number }>({ x: 0, y: 0 })
const isDown = ref(false)

const next = () => {
  resetTransform()
  emit('next')
}
const prev = () => {
  resetTransform()
  emit('prev')
}
const onWheel = (e: WheelEvent) => {
  e.deltaY > 0 ? scale.value -= 0.1 : scale.value += 0.1
  scaleOrigin.value = { x: e.offsetX, y: e.offsetY }
}
const onMousedown = (e: PointerEvent) => {
  last.value.x = e.pageX
  last.value.y = e.pageY
  isDown.value = true
  console.log('down')
}
const onMouseup = () => {
  isDown.value = false
  console.log('up')
}
const lastMove = ref(now())
const onMouthMove = (e: PointerEvent) => {
  if (!isDown.value) return
  const n = now()
  if (n - lastMove.value < 30) return
  lastMove.value = n
  console.log('move')
  const deltaX = e.pageX - last.value.x
  const deltaY = e.pageY - last.value.y
  move.value.x += deltaX
  move.value.y += deltaY
  last.value.x = e.pageX
  last.value.y = e.pageY
}

const resetTransform = () => {
  scale.value = 1
  move.value = { x: 0, y: 0 }
}

defineExpose({
  resetTransform
})
</script>

<style scoped>

</style>
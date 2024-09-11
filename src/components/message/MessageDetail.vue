<template>
  <div
    ref="bg"
    @keyup.esc="emit('close')"
    @keyup.left="prev"
    @keyup.right="next"
  >
    <div
      class="mask"
      ref="mask"
      @mousedown="onMouseDown"
      @mousemove="onMouseMove"
      @mouseup="onMouseUp"
    >
      <img
        ref="image"
        class="detail"
        v-if="message.type === 'IMAGE'"
        :src="`/api/file/${(message.content[0] as ImageMessage).id}`"
        :alt="(message.content[0] as ImageMessage).id"
        draggable="false"
      />
    </div>
    <div
      class="toolbox"
      ref="toolbar"
    >
      <el-button-group class="buttons">
        <el-button
          size="large"
          :icon="ArrowLeft"
          @click="prev"
        />
        <el-button
          size="large"
          :icon="Minus"
          @click="setScale(move.x + imgW * scale / 2, move.y + imgH * scale / 2, -0.1)"
        />
        <el-button
          size="large"
          :icon="Promotion"
          @click="autoScale()"
        />
        <el-button
          size="large"
          :icon="Plus"
          @click="setScale(move.x + imgW * scale / 2, move.y + imgH * scale / 2, 0.1)"
        />
        <el-button
          size="large"
          :icon="ArrowRight"
          @click="next"
        />
      </el-button-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ImageMessage, MessageData } from '@/api/type'
import { nextTick, onMounted, onUnmounted, ref, toRef } from 'vue'
import { ArrowLeft, ArrowRight, Minus, Plus, Promotion } from '@element-plus/icons-vue'

interface PropsType {
  message: MessageData
}

const props = defineProps<PropsType>()
const imgW = toRef(() => (props.message.content[0] as ImageMessage).width)
const imgH = toRef(() => (props.message.content[0] as ImageMessage).height)
const emit = defineEmits(['next', 'prev', 'close'])
const image = ref<HTMLElement>()
const mask = ref<HTMLElement>()
const toolbar = ref<HTMLElement>()
const bg = ref<HTMLElement>()

const scale = ref(1)
const realW = toRef(() => imgW.value * scale.value)
const realH = toRef(() => imgH.value * scale.value)
const move = ref<{ x: number, y: number }>({ x: 0, y: 0 })
const last = ref<{ x: number, y: number }>({ x: 0, y: 0 })
// 按住左键状态
const isDown = ref(false)
// 按住后移动状态
const isMove = ref(false)

// 修改样式，减少回流重绘
const setStyle = (el: HTMLElement, arr: string[]) => {
  if (el) el.style.cssText = el.style.cssText + arr.join(';') + ';'
}
const updateImage = () => {
  setStyle(image.value, [
    `transform-origin: ${move.value.x}px ${move.value.y}px`,
    `transform: scale(${scale.value}) translate(${move.value.x}px, ${move.value.y}px)`
  ])
}

const next = () => {
  emit('next')
  nextTick(autoScale)
}
const prev = () => {
  emit('prev')
  nextTick(autoScale)
}

const onWheel = (e: WheelEvent) => {
  if (!e.deltaY) return
  setScale(e.pageX, e.pageY, e.deltaY > 0 ? -0.1 : 0.1)
}
const onMouseDown = (e: MouseEvent) => {
  if (e.button === 2) return
  e.preventDefault()
  last.value.x = e.pageX
  last.value.y = e.pageY
  isDown.value = true
  isMove.value = false
}
const onMouseUp = (e: MouseEvent) => {
  if (e.button === 2) return
  if (!isMove.value) {
    emit('close')
    isDown.value = false
    return
  }
  isDown.value = false
  isMove.value = false
}
const onMouseMove = (e: MouseEvent) => {
  e.preventDefault()
  if (!isDown.value) return
  isMove.value = true
  const deltaX = e.pageX - last.value.x
  const deltaY = e.pageY - last.value.y
  move.value.x += deltaX
  move.value.y += deltaY
  last.value.x = e.pageX
  last.value.y = e.pageY
  updateImage()
}

const setScale = (mouseX: number, mouseY: number, deltaScale: number) => {
  if (Math.min(imgW.value, imgH.value) * scale.value * (1 + deltaScale) < 100) return

  const { x: imgX, y: imgY } = move.value

  move.value.x += (imgX - mouseX) * deltaScale
  move.value.y += (imgY - mouseY) * deltaScale
  scale.value *= (1 + deltaScale)
  updateImage()
}

const resetTransform = () => {
  scale.value = 1
  const { innerWidth: maxW, innerHeight: maxH } = window
  move.value = { x: (maxW - imgW.value) / 2, y: (maxH - imgH.value) / 2 }
  updateImage()
}

defineExpose({
  resetTransform
})

const autoScale = () => {
  const { innerWidth: maxW, innerHeight: maxH } = window
  scale.value = Math.min((maxW - 80) / imgW.value, (maxH - 80) / imgH.value)
  move.value.x = (maxW - realW.value) / 2
  move.value.y = (maxH - realH.value) / 2
  updateImage()
}

const onResize = () => {
  autoScale()
}

onMounted(() => {
  bg.value!.focus()
  const { innerWidth: maxW, innerHeight: maxH } = window
  scale.value = 1
  move.value = {
    x: (maxW - imgW.value) / 2,
    y: (maxH - imgH.value) / 2
  }
  updateImage()
  mask.value.addEventListener('mousewheel', onWheel, { passive: false })
  autoScale()
  window.onresize = onResize
  window.addEventListener('keyup', (e: KeyboardEvent) => {
    switch (e.key) {
      case 'Escape':
        emit('close')
        break
      case 'ArrowLeft':
        prev()
        break
      case 'ArrowRight':
        next()
        break
      default:
        return
    }
    e.preventDefault()
  })
})

onUnmounted(() => window.onresize = null)
</script>

<style scoped>
.mask {
  width: 100vw;
  height: 100vh;
  touch-action: none;
  position: fixed;
  z-index: 99;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.75);
  user-select: none;
}

.detail {
  position: absolute;
  transform: translateZ(0);
  transform-origin: center center
}

.toolbox {
  top: 90%;
  left: 50%;
  transform: translate(-50%, 0);
  position: absolute;
  background-color: #111111ee;
  z-index: 100;
}

.buttons {

}
</style>
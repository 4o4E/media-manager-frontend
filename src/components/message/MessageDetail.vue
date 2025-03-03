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
        v-if="message.message.type === 'IMAGE'"
        :src="`/api/file/${(message.message.content[0] as ImageMessage).id}.${(message.message.content[0] as ImageMessage).format}`"
        :alt="(message.message.content[0] as ImageMessage).id"
        draggable="false"
        @load="autoScale"
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
import type { ImageMessage, MessageViewData } from '@/api/type'
import { onMounted, onUnmounted, ref, toRef } from 'vue'
import { ArrowLeft, ArrowRight, Minus, Plus, Promotion } from '@element-plus/icons-vue'

interface PropsType {
  message: MessageViewData
}

const props = defineProps<PropsType>()
const imgW = toRef(() => (props.message.message.content[0] as ImageMessage).width)
const imgH = toRef(() => (props.message.message.content[0] as ImageMessage).height)
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
const setStyle = (el: HTMLElement | null | undefined, arr: string[]) => {
  if (el) el.style.cssText = el.style.cssText + arr.join(';') + ';'
}

function updateImage() {
  setStyle(image.value, [
    `transform-origin: ${move.value.x}px ${move.value.y}px`,
    `transform: scale(${scale.value}) translate(${move.value.x}px, ${move.value.y}px)`,
  ])
}

function next() {
  emit('next')
}

function prev() {
  emit('prev')
}

function onWheel(e: WheelEvent) {
  if (!e.deltaY) return
  e.preventDefault()
  setScale(e.pageX - window.scrollX, e.pageY - window.scrollY, e.deltaY > 0 ? -0.1 : 0.1)
}

function onMouseDown(e: MouseEvent) {
  if (e.button === 2) return
  e.preventDefault()
  last.value.x = e.pageX
  last.value.y = e.pageY
  isDown.value = true
  isMove.value = false
}

function onMouseUp(e: MouseEvent) {
  if (e.button === 2) return
  if (!isMove.value) {
    emit('close', props.message)
    isDown.value = false
    return
  }
  isDown.value = false
  isMove.value = false
}

function onMouseMove(e: MouseEvent) {
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

function setScale(mouseX: number, mouseY: number, deltaScale: number) {
  const { x: imgX, y: imgY } = move.value

  move.value.x += (imgX - mouseX) * deltaScale
  move.value.y += (imgY - mouseY) * deltaScale
  scale.value *= (1 + deltaScale)
  updateImage()
}

function resetTransform() {
  scale.value = 1
  const { innerWidth: maxW, innerHeight: maxH } = window
  move.value = { x: (maxW - imgW.value) / 2, y: (maxH - imgH.value) / 2 }
  updateImage()
}

defineExpose({
  resetTransform,
})

function autoScale() {
  const { innerWidth: maxW, innerHeight: maxH } = window
  scale.value = Math.min((maxW - 80) / imgW.value, (maxH - 80) / imgH.value)
  move.value.x = (maxW - realW.value) / 2
  move.value.y = (maxH - realH.value) / 2
  updateImage()
}

function onResize() {
  autoScale()
}

onMounted(() => {
  bg.value!.focus()
  const { innerWidth: maxW, innerHeight: maxH } = window
  scale.value = 1
  move.value = {
    x: (maxW - imgW.value) / 2,
    y: (maxH - imgH.value) / 2,
  }
  updateImage()
  mask.value!.addEventListener('mousewheel', onWheel, { passive: false })
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
  position: fixed;
  background-color: #111111ee;
  z-index: 100;
}
</style>
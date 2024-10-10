<template>
  <div v-if="props.load" style="display: flex">
    <template v-for="column in columns" :key="column.id">
      <div style="flex: 1;" :ref="el => column.element = el">
        <template v-for="message in column.messages" :key="message.index">
          <el-card style="margin: 20px">
            <div @click="showDetail(message)" :ref="el => message.element = el">
              <view-image
                v-if="message.type == 'IMAGE'"
                :message="message"
              />
              <view-video
                v-else-if="message.type == 'VIDEO'"
                :message="message"
              />
              <view-audio
                v-else-if="message.type == 'AUDIO'"
                :message="message"
              />
              <view-text
                v-else-if="message.type == 'TEXT'"
                :message="message"
              />
            </div>
            <tag-list :tags="message.tags" size="default" style="margin-top: 20px" />
          </el-card>
        </template>
        <InfiniteLoading :finished="finished" @infinite="loadData" />
      </div>
    </template>
    <InfiniteLoading v-if="columns.length === 0" :finished="finished" @infinite="loadData" />
    <teleport to="body" v-if="visible">
      <message-detail ref="detail" :message="messages[detailIndex]" @next="next" @prev="prev" @close="close" />
    </teleport>
  </div>
</template>

<script setup lang="ts">
import type { MessageData, HasSize } from '@/api/type'
import TagList from '@/components/message/TagList.vue'
import ViewAudio from '@/components/message/view/ViewAudio.vue'
import ViewImage from '@/components/message/view/ViewImage.vue'
import ViewVideo from '@/components/message/view/ViewVideo.vue'
import ViewText from '@/components/message/view/ViewText.vue'
import InfiniteLoading from '@/components/InfiniteLoading.vue'
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import MessageDetail from '@/components/message/MessageDetail.vue'

type PropsType = {
  load: boolean
}

const props = defineProps<PropsType>()
const visible = ref(false)
const detailIndex = ref(0)
const detail = ref()

function showDetail(message: MessageData) {
  if (detail.value) detail.value.resetTransform()
  detailIndex.value = message.index!
  visible.value = true
}

function prev() {
  if (detailIndex.value > 0) {
    detailIndex.value -= 1
  }
}

function next() {
  const remain = messages.value.length - 1 - detailIndex.value

  if (remain > 0) detailIndex.value += 1
  if (remain < 5) {
    emit('fetch')
  }
}

const finished = ref(false)
const emit = defineEmits(['fetch'])
const lastFetch = ref(0)

function loadData() {
  const now = Date.now()
  if (now - lastFetch.value < 300) return
  lastFetch.value = now
  emit('fetch')
}

type Column = {
  id: number
  messages: MessageData[]
  el?: HTMLElement
}

const columnWidth = 500
const columns = ref<Column[]>([])

function initColumns(): boolean {
  const width = document.body.clientWidth
  let columnCount = Math.floor(width / columnWidth)
  if (columnCount === 0) columnCount = 1
  if (columns.value && columns.value.length === columnCount) return false
  columns.value = []
  for (let i = 0; i < columnCount; i++) {
    columns.value.push({ id: i, messages: [] })
  }
  return true
}

function fillColumns(messages: MessageData[]) {
  const computedColumnWidth = (Number.parseFloat(window.getComputedStyle(document.body).width) - 40) / columns.value.length - 80 - 1.6
  // 遍历所有元素
  for (const message of messages) {
    // 找到高度最小的列
    const columnId = columns.value.reduce((acc, current) => {
      const currHeight = current.messages
        .map(e => e.cardHeight)
        .reduce((acc, current) => acc + current, 0)
      const accHeight = acc.messages
        .map(e => e.cardHeight)
        .reduce((acc, current) => acc + current, 0)
      return currHeight < accHeight ? current : acc
    }).id
    const column = columns.value[columnId]
    const { width, height } = message.content[0]
    message.displayWidth = width < computedColumnWidth ? width : computedColumnWidth
    message.displayHeight = width < computedColumnWidth ? height : height / width * computedColumnWidth
    message.cardHeight = message.displayHeight + 20 + 20 + (28 + 2 * 2 + 20) + 20
    column.messages.push(message)
  }
}

const messages = ref<MessageData[]>([])
const init = ref(false)

function receive(data: MessageData[]) {
  messages.value.push(...data)
  messages.value.forEach((e, i) => e.index = i)
  if (!init.value) {
    initColumns()
    init.value = true
  }
  fillColumns(data)
}

function clear() {
  messages.value = []
  columns.value.forEach(e => {
    e.messages.splice(0)
  })
}

function close() {
  visible.value = false
  messages.value[detailIndex.value]?.element?.scrollIntoView({ behavior: 'smooth' })
}

defineExpose({ receive, clear })

onMounted(() => {
  window.onresize = () => {
    if (initColumns()) fillColumns(messages.value)
    console.log((Number.parseFloat(window.getComputedStyle(document.body).width) - 40) / columns.value.length)
  }
})

onUnmounted(() => window.onresize = null)

</script>

<style scoped>
</style>
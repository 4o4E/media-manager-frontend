<template>
  <div v-if="props.load" style="display: flex">
    <template v-for="column in columns" :key="column.id">
      <div style="flex: 1;" :ref="el => column.element = el">
        <template v-for="message in column.messages" :key="message.index">
          <message-card-view :view-data="message" @show-detail="showDetail(message)" />
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
import type { MessageData, MessageViewData } from '@/api/type'
import InfiniteLoading from '@/components/InfiniteLoading.vue'
import { onMounted, onUnmounted, ref } from 'vue'
import MessageDetail from '@/components/message/MessageDetail.vue'
import MessageCardView from '@/components/message/MessageCardView.vue'

type PropsType = {
  load: boolean
}

const props = defineProps<PropsType>()
const visible = ref(false)
const detailIndex = ref(0)
const detail = ref()

function showDetail(message: MessageViewData) {
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
  messages: MessageViewData[]
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

function fillColumns(data: MessageData[]) {
  const computedColumnWidth = (Number.parseFloat(window.getComputedStyle(document.body).width) - 40) / columns.value.length - 80 - 2
  // 遍历所有元素
  for (const message of data) {
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
    const displayHeight = width < computedColumnWidth ? height : height / width * computedColumnWidth
    const viewData: MessageViewData = {
      index: messages.value.length,
      displayWidth: width < computedColumnWidth ? width : computedColumnWidth,
      displayHeight,
      cardHeight: displayHeight + 20 + 20 + (28 + 2 * 2 + 20) + 20,
      message
    }
    column.messages.push(viewData)
    messages.value.push(viewData)
  }
}

const messages = ref<MessageViewData[]>([])
const init = ref(false)

function receive(data: MessageData[]) {
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

const task = ref<number>()

onMounted(() => {
  window.onresize = () => {
    if (task.value) return
    task.value = setTimeout(() => {
      columns.value = []
      initColumns()
      const data = messages.value.map(e => e.message)
      messages.value = []
      fillColumns(data)
      task.value = undefined
    }, 50)
  }
})

onUnmounted(() => {
  clearTimeout(task.value)
  window.onresize = null
})

</script>

<style scoped>
</style>
<template>
  <div v-if="props.load" style="display: flex">
    <template v-for="(column, i) in columns" :key="i">
      <div :style="`flex: 1;`">
        <template v-for="(message, j) in column.messages" :key="j">
          <el-card style="margin: 1em">
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
            <tag-list :tags="message.tags" size="default" style="margin-top: 1em" />
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
import type { HasSize, MessageData } from '@/api/type'
import TagList from '@/components/message/TagList.vue'
import ViewAudio from '@/components/message/view/ViewAudio.vue'
import ViewImage from '@/components/message/view/ViewImage.vue'
import ViewVideo from '@/components/message/view/ViewVideo.vue'
import ViewText from '@/components/message/view/ViewText.vue'
import InfiniteLoading from '@/components/InfiniteLoading.vue'
import { onMounted, onUnmounted, ref } from 'vue'
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
  messages: MessageData[]
  height: number
}

const columnWidth = 600
const columns = ref<Column[]>([])

function initColumns(): boolean {
  const width = document.body.clientWidth > 800 ? document.body.clientWidth * .8 : document.body.clientWidth
  let columnCount = Math.floor(width / columnWidth)
  if (columnCount === 0) columnCount = 1
  if (columns.value && columns.value.length === columnCount) return false
  columns.value = []
  for (let i = 0; i < columnCount; i++) {
    columns.value.push({ messages: [], height: 0 })
  }
  return true
}

function fillColumns(messages: MessageData[]) {
  // 遍历所有元素
  for (const message of messages) {
    // 找到高度最小的列
    const column = columns.value.reduce((acc, current) => current.height < acc.height ? current : acc)
    const height = (message.type === 'IMAGE' || message.type === 'VIDEO') ? (() => {
      const e = message.content[0] as HasSize
      return columnWidth / e.width * e.height
    })() : 100
    column.height += height
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
    e.height = 0
  })
}

function close() {
  visible.value = false
  messages.value[detailIndex.value]?.element?.scrollIntoView({ behavior: "smooth" })
}

defineExpose({ receive, clear })

onMounted(() => {
  window.onresize = () => {
    if (initColumns()) fillColumns(messages.value)
  }
})

onUnmounted(() => window.onresize = null)

</script>

<style scoped>

</style>
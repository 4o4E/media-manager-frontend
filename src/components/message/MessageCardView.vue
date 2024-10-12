<template>
  <el-card style="margin: 20px">
    <p style="display: none;">
      {{ props.viewData }}
    </p>
    <div @click="showDetail(message)" ref="el">
      <view-image
        v-if="type == 'IMAGE'"
        :message="message"
        :load-height="viewData.displayHeight"
      />
      <view-video
        v-else-if="type == 'VIDEO'"
        :message="message"
        :load-height="viewData.displayHeight"
      />
      <view-audio
        v-else-if="type == 'AUDIO'"
        :message="message"
      />
      <view-text
        v-else-if="type == 'TEXT'"
        :message="message"
      />
    </div>
    <tag-list :tags="message.tags" size="default" style="margin-top: 20px" />
  </el-card>
</template>

<script setup lang="ts">
import ViewImage from '@/components/message/view/ViewImage.vue'
import ViewText from '@/components/message/view/ViewText.vue'
import ViewVideo from '@/components/message/view/ViewVideo.vue'
import ViewAudio from '@/components/message/view/ViewAudio.vue'
import TagList from '@/components/message/TagList.vue'
import type { MessageViewData } from '@/api/type'
import { onMounted, ref } from 'vue'

type PropsType = {
  viewData: MessageViewData
}

const props = defineProps<PropsType>()
const el = ref<HTMLElement>()
const type = props.viewData.message.type
const message = props.viewData.message

const emit = defineEmits(['showDetail'])

function showDetail(viewData: MessageViewData) {
  emit('showDetail', viewData)
}

onMounted(() => {
  props.viewData.element = el
})
</script>

<style scoped>

</style>
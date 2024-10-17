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
    <div style="display: flex; margin-top: 20px;">
      <tag-list :tags="message.tags" size="default" />
      <el-button
        v-if="auth.perms.includes('message:edit')"
        :icon="EditPen"
        circle
        style="margin-left: auto; margin-right: 5px"
        @click="showEdit"
      />
      <el-dialog draggable title="编辑" v-model="isShowEdit" width="80%">
        <div style="height: 60vh">
          <message-builder :data="editing" :tags="tags" :on-upload="handleUpload" btn="更新" />
        </div>
      </el-dialog>
    </div>
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
import { EditPen } from '@element-plus/icons-vue'
import { auth } from '@/api/auth'
import MessageBuilder from '@/components/message/MessageBuilder.vue'
import { toUnUpload } from '@/api/convert'
import type { UnUploadMessage } from '@/api/upload'
import { type BaseResp, client } from '@/api/api'

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

const isShowEdit = ref(false)
const editing = ref<UnUploadMessage[]>([])
const tags = ref<number[]>([])

async function handleUpload(data: { chain, tags: number[] }): BaseResp {
  await client.put<BaseResp>('/api/message', data).then(e => e.data)
}

async function showEdit() {
  editing.value = await toUnUpload(message)
  tags.value = message.tags
  isShowEdit.value = true
}

onMounted(() => {
  props.viewData.element = el
})
</script>

<style scoped>

</style>
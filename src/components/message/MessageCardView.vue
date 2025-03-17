<template>
  <el-card style="margin: 20px">
    <p style="display: none;">
      {{ props.viewData }}
    </p>
    <div @click="showDetail(viewData)" ref="el">
      <view-image
        v-if="type == MediaType.IMAGE"
        :message="message"
        :load-height="viewData.displayHeight!"
      />
      <view-video
        v-else-if="type == MediaType.VIDEO"
        :message="message"
        :load-height="viewData.displayHeight!"
      />
      <view-audio
        v-else-if="type == MediaType.AUDIO"
        :message="message"
      />
      <view-text
        v-else-if="type == MediaType.TEXT"
        :message="message"
      />
    </div>
    <div style="display: flex; margin-top: 20px;">
      <tag-list :tags="message.tags" size="default" />
      <el-button
        :icon="Star"
        :type="message.liked ? 'primary' : 'default'"
        circle
        style="margin-left: auto; margin-right: 5px"
        @click="clickLike"
      />
      <el-button
        v-if="auth.perms.includes('media:edit')"
        :icon="EditPen"
        circle
        style="margin-left: 5px; margin-right: 5px"
        @click="showEdit"
      />
      <el-dialog draggable title="编辑" v-model="isShowEdit" width="80%">
        <div style="height: 60vh">
          <message-builder :id="id" :data="editing" :tags="tags" :on-upload="handleUpload" btn="更新" @upload-done="isShowEdit = false" />
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
import { onMounted, ref } from 'vue'
import { EditPen, Star } from '@element-plus/icons-vue'
import { auth } from '@/api/auth'
import MessageBuilder from '@/components/message/MessageBuilder.vue'
import { toUnUpload } from '@/api/convert'
import type { UnUploadElement } from '@/api/upload'
import { type BaseResp, client } from '@/api/api'
import { type MediaContentDto, MediaType, type MessageViewData } from '@/api/types/media'
import { ElMessage } from 'element-plus'

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
const id = ref<bigint>()
const editing = ref<UnUploadElement[]>([])
const tags = ref<bigint[]>([])

async function handleUpload(data: MediaContentDto): Promise<BaseResp> {
  return await client.put<BaseResp>('/api/media', data).then(e => e.data)
}

async function showEdit() {
  id.value = message.id
  editing.value = await toUnUpload(message)
  tags.value = message.tags
  isShowEdit.value = true
}

let switchLike = ref(false)

async function clickLike() {
  if (switchLike.value) return
  switchLike.value = true
  const resp = await client.post<BaseResp>(`/api/media/${message.id}/${message.liked ? 'undoLike' : 'like'}`)
    .then(e => e.data)
  if (!resp.success) {
    ElMessage({
      type: 'warning',
      message: resp.message
    })
    switchLike.value = false
    return
  }
  message.liked = !message.liked
  switchLike.value = false
}

onMounted(() => {
  props.viewData.element = el.value
})
</script>

<style scoped>

</style>
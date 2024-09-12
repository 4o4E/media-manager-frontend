<template>
  <div v-if="data.length !== 0">
    <el-text size="large">内容</el-text>
    <!-- 内容 -->
    <template v-for="(message, index) in data" :key="index">
      <img
        v-if="message.type === 'IMAGE'"
        :src="`/api/file/${(message.content[0] as ImageMessage).id}`"
        :alt="(message.content[0] as ImageMessage).id"
      />
      <video
        v-if="message.type === 'VIDEO' || message.type === 'AUDIO'"
        :src="`/api/file/${(message.content[0] as VideoMessage).id}`"
      />
      <el-text
        v-if="message.type === 'TEXT'"
      >{{ (message.content[0] as TextMessage).content }}
      </el-text>
    </template>
  </div>
  <div>
    <el-text size="large">新增</el-text>
    <!-- 新增 -->
    <el-button v-if="showAddBtn" @click="show"></el-button>
    <div v-else>
      <!-- 选择类型 -->
      <el-row>
        <el-select v-model="chooseType" @change="changeType">
          <el-option label="图片" value="IMAGE" />
          <el-option label="视频" value="VIDEO" />
          <el-option label="音频" value="AUDIO" />
          <el-option label="文本" value="TEXT" />
        </el-select>
      </el-row>
      <!-- 选择文件 -->
      <el-row>
        <choose-file ref="choose" v-if="chooseType !== 'TEXT'" :choose-type="chooseType" />
        <el-input v-else v-model="(temp as TextMessage).content" />
      </el-row>
      <el-row>
        <el-button
          v-if="chooseType === 'TEXT'
         ? (temp as TextMessage).content.length !== 0
         : choose?.file != null
        "
          @click="addToData"
        >添加</el-button>
      </el-row>
    </div>
  </div>
  <div>
    <el-text size="large">Tag</el-text>
    <!-- 输入tag -->
    <el-row>
      <div>
        <el-tag
          v-for="tag in tags"
          :key="tag"
          closable
          :disable-transitions="false"
          size="large"
          @close="handleClose(tag)"
        >{{ tag }}
        </el-tag>
        <el-input
          v-if="inputVisible"
          ref="InputRef"
          v-model="inputValue"
          @keyup.enter="handleInputConfirm"
          @blur="handleInputConfirm"
        />
        <el-button v-else @click="showInput">+</el-button>
      </div>
    </el-row>
    <el-row>
      <div>
        <!-- 确认上传 -->
        <el-button
          v-if="tags.size != 0"
          type="success"
          @click="uploadCompositeMessage"
        >上传
        </el-button>
      </div>
    </el-row>
  </div>

</template>

<script setup lang="ts">
import type { ImageMessage, Message, TextMessage, VideoMessage } from '@/api/type'
import { nextTick, ref } from 'vue'
import ChooseFile from '@/components/message/choose/ChooseFile.vue'
import { ElInput } from 'element-plus'

const data = ref<Message[]>([])
const showAddBtn = ref<true>()
const chooseType = ref<'IMAGE' | 'VIDEO' | 'AUDIO' | 'TEXT'>('IMAGE')
const temp = ref<Message>()
const inputValue = ref('')
const inputVisible = ref(false)
const InputRef = ref<InstanceType<typeof ElInput>>()
const tags = ref(new Set<string>())
const choose = ref()

const handleClose = (tag: string) => {
  tags.value.delete(tag)
}

const showInput = () => {
  inputVisible.value = true
  nextTick(() => {
    InputRef.value!.input!.focus()
  })
}

const handleInputConfirm = () => {
  if (inputValue.value) {
    tags.value.add(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}

const changeType = (t: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'TEXT') => {
  switch (t) {
    case 'TEXT': {
      temp.value = { content: '' }
      return
    }
    case 'IMAGE':
  }
}

const addToData = () => {
  // 其他元素需要额外上传文件
  // if (chooseType.value !== 'TEXT') {
  //   choose.value
  // }
  data.value.push(temp)
  temp.value = undefined
}

const show = () => {
  showAddBtn.value = true
}

defineExpose({
  data
})
</script>

<style scoped>
.el-row {
  margin-top: 10px;
  margin-bottom: 10px;
}

.el-tag {
  margin-right: 10px;
}

.el-tag:last-child {
  margin-right: 0;
}
</style>
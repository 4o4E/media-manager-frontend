<template>
  <el-form style="width: 300px; margin: auto;">
    <el-form-item>
      <!-- 上传文件 -->
      <el-upload
        v-if="!file"
        accept=".png, .jpg, .gif, .bmp"
        :auto-upload="false"
        :limit="1"
        :on-exceed="handleExceed"
        :on-change="onChange"
        style="width: 100%; margin: 0 auto;"
      >
        <el-button>
          <el-text style="width: 300px; margin: 0 auto;">选择图片</el-text>
        </el-button>
      </el-upload>
      <!-- 图片预览 -->
      <el-image
        ref="image"
        v-if="file"
        style="width: 300px; height: 300px" :src="fileUrl" fit="scale-down" />
    </el-form-item>

    <!-- 输入tag -->
    <el-form-item v-if="file">
      <div class="flex gap-2">
        <el-tag
          v-for="tag in tags"
          :key="tag"
          closable
          :disable-transitions="false"
          size="large"
          @close="handleClose(tag)"
        >{{ tag }}</el-tag>
        <el-input
          v-if="inputVisible"
          ref="InputRef"
          v-model="inputValue"
          @keyup.enter="handleInputConfirm"
          @blur="handleInputConfirm"
        />
        <el-button v-else @click="showInput">+</el-button>
        <el-space/>
        <div>
          <!-- 确认上传 -->
          <el-button
            v-if="tags.size != 0"
            type="success"
            @click="uploadImageMessage"
          >上传
          </el-button>
<!--          <el-button-->
<!--            class="flex"-->
<!--            @click="() => {-->
<!--          dynamicTags.add(tag)-->
<!--          tag = ''-->
<!--        }"-->
<!--          >上传</el-button>-->
        </div>
      </div>
    </el-form-item>
  </el-form>
</template>

<script setup lang="ts">
import { nextTick, ref } from 'vue'
import {
  ElMessage,
  genFileId,
  type ImageViewerInstance,
  type UploadFile,
  type UploadInstance,
  type UploadProps,
  type UploadRawFile
} from 'element-plus'
import { baseUrl, uploadFile } from '@/api/api'
import { requireAuth, useToken } from '@/api/auth'
import type { MessageData } from '@/api/type'
import { ElInput } from 'element-plus'

const inputValue = ref('')
const inputVisible = ref(false)
const InputRef = ref<InstanceType<typeof ElInput>>()

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

const upload = ref<UploadInstance>()
const file = ref<UploadFile | null>()
const fileUrl = ref<string | null>()
const tags = ref<Set<string>>(new Set())
const uploadedId = ref<string | null>()
const image = ref<ImageViewerInstance>()

requireAuth()

// 用于限制只上传一个文件
const handleExceed: UploadProps['onExceed'] = (files) => {
  console.log(upload.value)
  upload.value!.clearFiles()
  const file = files[0] as UploadRawFile
  file.uid = genFileId()
  upload.value!.handleStart(file)
}

// 用来捕获上传的文件
const onChange = (uploadFile: UploadFile) => {
  file.value = uploadFile
  fileUrl.value = URL.createObjectURL(uploadFile.raw!)
}
// 上传图片消息
const uploadImageMessage = async () => {

  const blob = new Blob([await file.value!.raw!.arrayBuffer()])
  // 先上传文件
  uploadedId.value = await uploadFile(blob)
  if (!uploadedId.value) return
  const resp = await useToken<MessageData | string>({
    method: 'put',
    url: `${baseUrl}/api/message`,
    data: {
      chain: [
        {
          id: uploadedId.value,
          type: 'image',
          format: file.value!.name.substring(file.value!.name.lastIndexOf('.') + 1),
          file: false,
          width: 0,
          height: 0
        }
      ],
      tags: Array.from(tags.value)
    }
  })
  if (resp.status !== 200) {
    ElMessage({
      type: 'warning',
      message: resp.data as string
    })
    return
  }
  ElMessage({
    type: 'success',
    message: "上传成功"
  })
  file.value = null
  tags.value.clear()
}
</script>

<style scoped>
.flex {
  display: flex;
}
.gap-2 {
  grid-gap: 0.5rem;
  gap: 0.5rem;
}
</style>
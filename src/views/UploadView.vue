<template>
  <div>
    <el-upload
      class="upload-demo"
      method="PUT"
      :action="uploadUrl"
      :limit="1"
      :show-file-list="false"
      :on-success="handleSuccess"
      :before-upload="beforeUpload"
    />
    <!--<el-image src="http://localhost/api/file/5a85b04b1c336b64a5a17916b22733e2aadc42c80520e675d12f3bace4201c21" />-->
    <br />
    <el-button size="small" type="primary" @click="download">点击上传</el-button>
  </div>
</template>

<script setup lang="ts">
import axios from 'axios'


const uploadUrl = 'http://localhost/api/file/'

const handleSuccess = (response: any, file: any, fileList: any) => {
  console.log(response)
}

const beforeUpload = (file: File) => {
  // 在上传前的处理逻辑，可以在这里进行文件格式、大小等的验证
  console.log(file)
  return true // 返回 false 可以取消上传
}

const download = () => {
  axios({
    url: "http://localhost/api/file/aaaa",
    method: 'POST'
  })
}
</script>

<style scoped>
.upload-demo {
  display: inline-block;
  margin-right: 10px;
}
</style>
<template>
  <el-dialog draggable v-model="editTagFormVisible" title="修改Tag" width="500">
    <el-form>
      <el-form-item required label="描述" label-width="6em">
        <el-input v-model="tagForm.remark" />
      </el-form-item>
      <el-form-item required label="名字" label-width="6em">
        <el-container>
          <div class="tagContainer">
            <el-tag
              v-for="(tag, index) in tagForm.names"
              :key="tag"
              class="tag"
              closable
              :disable-transitions="false"
              size="large"
              @close="tagForm.names.splice(index, 1)"
            >{{ tag }}
            </el-tag>
          </div>
        </el-container>
      </el-form-item>
      <el-form-item label="添加" label-width="6em">
        <el-input
          style="width: 200px; margin-right: 10px;"
          v-model="editAliasInputValue"
        />
        <el-button
          v-if="editAliasInputValue.trim().length !== 0 && !tagForm.names.includes(editAliasInputValue)"
          @click="addName"
        >添加
        </el-button>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="editTagFormVisible = false">取消</el-button>
        <el-button type="primary" @click="postEditTag">提交</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Tag } from '@/api/type'
import { type BaseResp, client } from '@/api/api'
import { ElMessage } from 'element-plus'

interface PropsType {
  refresh: () => void
}

const { refresh } = defineProps<PropsType>()

const editTagFormVisible = ref(false)
const tagForm = ref<Tag>({ id: BigInt(-1), names: [], remark: '' })
const editAliasInputValue = ref('')

function addName() {
  tagForm.value.names.push(editAliasInputValue.value)
  editAliasInputValue.value = ''
}

async function postEditTag() {
  const isEdit = tagForm.value.id != BigInt(-1)
  const resp = await (isEdit
      ? client.patch<BaseResp>(`/api/tags`, tagForm.value)
      : client.post<BaseResp>(`/api/tags`, Object.assign({}, tagForm.value, {id: undefined}))
  ).then(e => e.data)
  if (!resp.success) {
    ElMessage({
      type: 'warning',
      message: resp.message
    })
    return
  }
  ElMessage({
    type: 'success',
    message: isEdit ? '修改成功' : '新增成功'
  })
  refresh()
  editTagFormVisible.value = false
}

function close() {
  editTagFormVisible.value = false
}

function show(tag: Tag) {
  tagForm.value = tag
  editTagFormVisible.value = true
}

defineExpose({ show, close })
</script>

<style scoped>
.tag {
  margin-right: 10px;
  margin-bottom: 10px;
}

.tagContainer {
  margin-bottom: -10px;
}
</style>
<template>
  <el-auto-resizer>
    <template #default="{ height, width }">
      <el-button type="primary" @click="clickAdd">创建Tag</el-button>
      <el-button type="info" icon="Refresh" @click="updateTags">刷新</el-button>
      <el-input
        v-model="search"
        placeholder="搜索Tag"
        style="width: 200px; margin-left: 10px;"
        clearable
      >
        <template #append>
          <el-button icon="Search" />
        </template>
      </el-input>
      <el-divider />
      <el-table-v2
        :columns="columns"
        :data="tagInfo.tags.filter(e => e.name.includes(search) || e.alias.some((alias: string) => alias.includes(search)))"
        :width="width"
        :height="height - 70"
        :fixed="true"
      />
    </template>
  </el-auto-resizer>

  <!-- 新增Tag -->
  <el-dialog draggable v-model="addTagFormVisible" title="创建Tag" width="500">
    <el-form :model="tagForm">
      <el-form-item required label="名字" label-width="6em">
        <el-input v-model="tagForm.name" />
      </el-form-item>
      <el-form-item required label="默认密码" label-width="6em">
        <el-input v-model="tagForm.description" />
      </el-form-item>
      <el-form-item required label="选择Tag" label-width="6em">
        <el-tag
          v-for="(tag, index) in tagAliasForm"
          :key="tag"
          closable
          :disable-transitions="false"
          size="large"
          @close="tagAliasForm.splice(index, 1)"
        >{{ tag }}
        </el-tag>
        <el-input
          v-model="addAliasValue"
          @keyup.enter="handleAddInputConfirm"
          @blur="handleAddInputConfirm"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="addTagFormVisible = false">取消</el-button>
        <el-button type="primary" @click="postAdd()">提交</el-button>
      </div>
    </template>
  </el-dialog>
  <!-- 修改Tag -->
  <el-dialog draggable v-model="editTagFormVisible" title="修改Tag" width="500">
    <el-form>
      <el-form-item required label="名字" label-width="6em">
        <el-input v-model="tagForm.name" />
      </el-form-item>
      <el-form-item required label="描述" label-width="6em">
        <el-input v-model="tagForm.description" />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="editTagFormVisible = false">取消</el-button>
        <el-button type="primary" @click="postEditTag">提交</el-button>
      </div>
    </template>
  </el-dialog>
  <!-- 修改alias -->
  <el-dialog draggable v-model="editTagAliasFormVisible" title="修改Tag" width="500">
    <el-form>
      <el-form-item required label="别名" label-width="4em">
        <div class="tagContainer">
          <el-tag
            v-for="(tag, index) in tagAliasForm"
            :key="tag"
            class="tag"
            closable
            :disable-transitions="false"
            size="large"
            @close="removeTag(tag, index)"
          >{{ tag }}
          </el-tag>
        </div>
      </el-form-item>
      <el-form-item label="添加" label-width="4em">
        <el-input
          style="width: 200px; margin-right: 10px;"
          v-model="editAliasInputValue"
        />
        <el-button
          v-if="editAliasInputValue.trim().length !== 0 && !tagAliasForm.includes(editAliasInputValue)"
          @click="addAlias"
        >添加
        </el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script setup lang="tsx">
import { ref } from 'vue'
import {
  type Column,
  ElAutoResizer,
  ElButton,
  ElInput,
  ElMessage,
  ElTableV2,
  ElTag,
  TableV2FixedDir,
} from 'element-plus'
import { useTagsStore } from '@/store/tags'
import { type BaseResp, client } from '@/api/api'

interface Tag {
  id: number
  name: string
  description: string
}

interface HasAlias {
  alias: string[]
}

const search = ref('')
const tagForm = ref<Tag>({ id: 0, name: '', description: '' })
const tagAliasForm = ref<string[]>([])
const { tagInfo, updateTags } = useTagsStore()
const columns: Column[] = [
  {
    key: 'name',
    title: 'Tag',
    dataKey: 'name',
    width: 150,
    fixed: TableV2FixedDir.LEFT,
    // cellRenderer: ({ cellData: name }) => <ElTag>{name}</ElTag>,
  },
  {
    key: 'description',
    title: '描述',
    dataKey: 'description',
    width: 150,
    align: 'left',
    cellRenderer: ({ cellData: description }) => description ?? '无',
  },
  {
    key: 'alias',
    title: '别名',
    width: 1000,
    align: 'left',
    cellRenderer: ({ rowData }) => rowData.alias.map((e: string) => <el-tag size="large"
                                                                            style="margin-right: 10px;">{e}</el-tag>),
  },
  {
    title: '操作',
    width: 250,
    fixed: TableV2FixedDir.RIGHT,
    cellRenderer: ({ rowData }) => <>
      <el-button size="default" onclick={() => editTag(rowData)}>编辑</el-button>
      <el-button size="default" onclick={() => editTagAlias(rowData)}>编辑别名</el-button>
      <el-button size="default" type="danger">删除</el-button>
    </>,
  },
]

function clearForm() {
  tagForm.value = { id: 0, name: '', description: '' }
  tagAliasForm.value = []
}

// add
const addAliasValue = ref('')
const addTagFormVisible = ref(false)

function handleAddInputConfirm() {
  if (addAliasValue.value) {
    tagAliasForm.value.push(addAliasValue.value)
  }
  addAliasValue.value = ''
}

function clickAdd() {
  clearForm()
  addTagFormVisible.value = true
}

async function postAdd() {
  const resp = await client.post<BaseResp>('/api/tags', {
    name: tagForm.value.name,
    description: tagForm.value.description,
    alias: tagAliasForm.value,
  }).then(e => e.data)
  if (!resp.success) {
    ElMessage({
      type: 'warning',
      message: resp.message,
    })
    return
  }
  ElMessage({
    type: 'success',
    message: '添加成功',
  })

}

// edit tag
const editTagFormVisible = ref(false)

function editTag(tag: Tag) {
  tagForm.value = JSON.parse(JSON.stringify(tag))
  editTagFormVisible.value = true
}

async function postEditTag() {
  const resp = await client.put<BaseResp>(`/api/tags/${tagForm.value.id}`, {
    name: tagForm.value.name,
    description: tagForm.value.description,
  }).then(e => e.data)
  if (!resp.success) {
    ElMessage({
      type: 'warning',
      message: resp.message,
    })
    return
  }
  ElMessage({
    type: 'success',
    message: '修改成功',
  })
  await updateTags()
  editTagFormVisible.value = false
}

// edit alias
const editTagAliasFormVisible = ref(false)
const editAliasInputValue = ref('')

function editTagAlias(tag: Tag & HasAlias) {
  tagForm.value = tag
  tagAliasForm.value = JSON.parse(JSON.stringify(tag.alias))
  editTagAliasFormVisible.value = true
}

async function addAlias() {
  const resp = await client.post<BaseResp>(`/api/tags/${tagForm.value.id}/alias/${editAliasInputValue.value}`).then(e => e.data)
  if (!resp.success) {
    ElMessage({
      type: 'warning',
      message: resp.message,
    })
    return
  }
  ElMessage({
    type: 'success',
    message: '添加成功',
  })
  tagAliasForm.value.push(editAliasInputValue.value)
  editAliasInputValue.value = ''
  await updateTags()
  editTagFormVisible.value = false
}

async function removeTag(alias: string, index: number) {
  const resp = await client.delete<BaseResp>(`/api/tags/${tagForm.value.id}/alias/${alias}`).then(e => e.data)
  if (!resp.success) {
    ElMessage({
      type: 'warning',
      message: resp.message,
    })
    return
  }
  ElMessage({
    type: 'success',
    message: '删除成功',
  })
  tagAliasForm.value.splice(index)
  await updateTags()
  editTagFormVisible.value = false
}
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
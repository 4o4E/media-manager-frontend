<template>
  <el-button type="primary" @click="clickAdd">创建Tag</el-button>
  <el-divider />
  <el-auto-resizer>
    <template #default="{ height, width }">
      <el-table-v2
        :columns="columns"
        :data="allTags"
        :width="width"
        :height="height"
        :fixed="true"
      />
    </template>
  </el-auto-resizer>

  <!-- 新增Tag -->
  <el-dialog v-model="addTagFormVisible" title="创建Tag" width="500">
    <el-form :model="addTagForm">
      <el-form-item required label="名字" label-width="6em">
        <el-input v-model="addTagForm.name" />
      </el-form-item>
      <el-form-item required label="默认密码" label-width="6em">
        <el-input v-model="addTagForm.description" />
      </el-form-item>
      <el-form-item required label="选择Tag" label-width="6em">
        <el-tag
          v-for="(tag, index) in addTagForm.alias"
          :key="tag"
          closable
          :disable-transitions="false"
          size="large"
          @close="addTagForm.alias.splice(index, 1)"
        >{{ tag }}
        </el-tag>
        <el-input
          v-model="inputValue"
          @keyup.enter="handleInputConfirm"
          @blur="handleInputConfirm"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="addTagFormVisible = false">取消</el-button>
        <el-button type="primary" @click="addUser()">提交</el-button>
      </div>
    </template>
  </el-dialog>
  <!-- 修改Tag -->
  <el-dialog v-model="editTagFormVisible" title="修改Tag" width="500">
    <el-form>
      <el-form-item required label="名字" label-width="6em">
        <el-input v-model="editTagForm.name" />
      </el-form-item>
      <el-form-item required label="描述" label-width="6em">
        <el-input v-model="editTagForm.description" />
      </el-form-item>
      <el-form-item required label="别名" label-width="6em">
        <el-tag
          v-for="(tag, index) in editTagForm.alias"
          :key="tag"
          style="margin-right: 10px;"
          closable
          :disable-transitions="false"
          size="large"
          @close="editTagForm.alias.splice(index, 1)"
        >{{ tag }}</el-tag>
        <el-input
          style="margin-top: 10px;"
          v-model="editAliasValue"
          @keyup.enter="handleEditInputConfirm"
          @blur="handleEditInputConfirm"
        />
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="editTagFormVisible = false">取消</el-button>
        <el-button type="primary" @click="addUser()">提交</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="tsx">
import { computed, ref } from 'vue'
import { type Column, ElAutoResizer, ElButton, ElInput, ElTableV2, ElTag, TableV2FixedDir } from 'element-plus'
import { useTagsStore } from '@/store/tags'
import { storeToRefs } from 'pinia'

const inputValue = ref('')
const addTagForm = ref<Tag>({
  name: '',
  description: '',
  alias: [],
})
const addTagFormVisible = ref(false)

interface Tag {
  name: string
  description: string
  alias: string[]
}

function handleInputConfirm() {
  if (inputValue.value) {
    addTagForm.value.alias.add(inputValue.value)
  }
  inputValue.value = ''
}

async function clickAdd() {
  addTagForm.value = { name: '', password: '', point: 0 }
  addTagFormVisible.value = true
}

const tagStore = useTagsStore()
const { tags: tagStoreRef } = storeToRefs(tagStore)
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
    align: 'center',
    cellRenderer: ({ cellData: description }) => description ?? '无',
  },
  {
    key: 'alias',
    title: '别名',
    width: 350,
    align: 'center',
    cellRenderer: ({ rowData }) => rowData.alias.map(e => <el-tag>{e}</el-tag>),
  },
  {
    title: '操作',
    width: 200,
    fixed: TableV2FixedDir.RIGHT,
    cellRenderer: ({ rowData }) => (
      <>
        <el-button size="small" onclick={() => editTag(rowData)}>修改</el-button>
        <el-button size="small" type="danger">删除</el-button>
      </>
    ),
  },
]

const editTagFormVisible = ref(false)
const editAliasValue = ref('')
const editTagForm = ref<Tag>({
  name: '',
  description: '',
  alias: new Array<string>(),
})

function editTag(tag: Tag) {
  console.log(tag)
  editTagForm.value = tag
  editTagFormVisible.value = true
}

function handleEditInputConfirm() {
  if (editAliasValue.value && !editTagForm.value.alias.includes(editAliasValue.value)) {
    editTagForm.value.alias.push(editAliasValue.value)
  }
  editAliasValue.value = ''
}

const allTags = computed(() => {
  const all = new Array<Tag>()
  for (const key in tagStoreRef.value) {
    all.push(tagStoreRef.value[key])
  }
  return all
})
</script>

<style scoped>

</style>
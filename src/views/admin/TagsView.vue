<template>
  <div style="height: calc(100vh - 120px)">
    <el-auto-resizer>
      <template #default="{ height, width }">
        <el-button type="primary" @click="addTag">创建Tag</el-button>
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
          :data="tagInfo.tags.filter(e => e.names.find(e => e.includes(search)))"
          :width="width"
          :height="height - 70"
          :fixed="true"
        />
      </template>
    </el-auto-resizer>
  </div>

  <TagEdit ref="tagEdit" :refresh="updateTags" />
</template>

<script setup lang="tsx">
import { ref } from 'vue'
import { type Column, ElAutoResizer, ElButton, ElInput, ElMessage, ElTableV2, TableV2FixedDir } from 'element-plus'
import { useTagsStore } from '@/store/tags'
import { type BaseResp, client } from '@/api/api'
import TagEdit from '@/components/TagEdit.vue'
import type { Tag } from '@/api/type'
import { confirmBox } from '@/api/utils'

const search = ref('')
const { tagInfo, updateTags } = useTagsStore()
const columns: Column[] = [
  {
    key: 'names',
    title: '别名',
    width: 400,
    align: 'left',
    cellRenderer: ({ rowData }) => rowData.names
      .map((e: string) => <el-tag size="large" style="margin-right: 10px;">{e}</el-tag>)
  },
  {
    key: 'remark',
    title: '描述',
    dataKey: 'remark',
    width: 150,
    align: 'left',
    cellRenderer: ({ cellData: remark }) => remark ?? '无'
  },
  {
    title: '操作',
    width: 250,
    fixed: TableV2FixedDir.RIGHT,
    cellRenderer: ({ rowData }) => <>
      <el-button size="default" onclick={() => editTag(rowData)}>编辑</el-button>
      <el-button size="default" type="danger" onclick={() => deleteTag(rowData)}>删除</el-button>
    </>
  }
]
const tagEdit = ref<typeof TagEdit>()

function editTag(tag: Tag) {
  tagEdit.value!.show(tag)
}

function addTag() {
  tagEdit.value!.show({ id: BigInt(-1), names: [], remark: '' })
}

async function deleteTag(tag: Tag) {
  confirmBox('是否确认删除', '删除确认')
    .then(async () => {
      const resp = await client.delete<BaseResp>(`/api/tags/${tag.id}`).then(e => e.data)
      if (!resp.success) {
        ElMessage({
          type: 'warning',
          message: resp.message
        })
        return
      }
      ElMessage({
        type: 'success',
        message: '删除成功'
      })
      await updateTags()
    }).catch(() => {})
}
</script>

<style scoped>
</style>
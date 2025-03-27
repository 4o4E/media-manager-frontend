<template>
  <el-select-v2
    style="max-width: 300px;"
    v-model="tags"
    :options="tagInfo.options"
    multiple
    fit-input-width
    collapse-tags
    collapse-tags-tooltip
    :max-collapse-tags="3"
    filterable
    clearable
    placeholder="选择标签"
  />
</template>

<script setup lang="tsx">
import { ElSelectV2 } from 'element-plus'
import { useTagsStore } from '@/store/tags'

const tags = defineModel<bigint[]>('tags', { default: [] })

const { tagInfo } = useTagsStore()
</script>

<style scoped>

</style>
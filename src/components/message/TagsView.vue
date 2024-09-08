<template>
  <div style="padding: 2px">
    <template v-for="tag of props.tags" :key="tag">
      <el-tag type="primary" size="large" style="margin: .1em .3em">{{ tagStore.tags[tag]?.name ?? tag }}</el-tag>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useTagsStore } from '@/store/tags'

interface PropsType {
  tags: string[]
}

const props = defineProps<PropsType>()

const tagStore = useTagsStore()
</script>

<style scoped>

.el-tag {
  padding: 5px 11px;
}

</style>
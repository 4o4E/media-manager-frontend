<template>
  <div style="padding: 2px">
    <template v-for="tag of props.tags" :key="tag">
      <el-tag
        type="primary"
        :size="props.size ?? 'large'" style="margin: 2px 5px"
      >{{ tagInfo.tagsMap[tag]?.name ?? tag }}</el-tag>
    </template>
  </div>
</template>

<script setup lang="ts">
import { useTagsStore } from '@/store/tags'

interface PropsType {
  tags: number[]
  size: "small" | "default" | "large"
}

const props = defineProps<PropsType>()

const { tagInfo } = useTagsStore()
</script>

<style scoped>

.el-tag {
  padding: 5px 11px;
}

</style>
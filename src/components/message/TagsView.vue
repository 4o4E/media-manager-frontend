<template>
  <div style="padding: 2px">
    <template v-for="tag of props.tags" :key="tag">
      <el-tag type="primary" size="large" style="margin: .1em .3em">{{ tag }}</el-tag>
    </template>
  </div>
</template>

<script setup lang="ts">
interface PropsType {
  tags: string[]
}

const props = defineProps<PropsType>()
</script>

<style scoped>

.el-tag {
  padding: 5px 11px;
}

</style>
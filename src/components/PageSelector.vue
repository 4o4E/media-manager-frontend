<template>
  <div class="flex gap-2" style="padding: 0.5rem">
    <el-space wrap direction="horizontal" :size="8">
      <!-- page -->
      <el-button v-if="hasPrev()" size="small" @click="prevPage">&lt;</el-button>
      <template v-for="(p, i) in pages" :key="i">
        <el-button
          v-if="p !== null"
          :type="page === p ? 'primary' : undefined"
          size="small"
          @click="page = p!;emit('refresh')"
        >{{ p }}</el-button>
        <el-tag v-else disable-transitions>...</el-tag>
      </template>
      <el-button v-if="hasNext()" size="small" @click="nextPage">&gt;</el-button>
      <!-- size -->
      <el-select size="small" style="width: 4em" v-model="size" @change="emit('refresh')">
        <template v-for="(item, i) in [10, 20, 50, 100]" :key="i">
          <el-option :value="item" :label="item" @click="page = 1" />
        </template>
      </el-select>
    </el-space>
  </div>
</template>

<script setup lang="ts">

import { computed } from 'vue'
import { ElMessage } from 'element-plus'

const page = defineModel<number>('page', { default: 0 })
const size = defineModel<number>('size', { default: 0 })
const total = defineModel<number>('total', { default: 0 }) // 外部应更新

const emit = defineEmits(['refresh'])

const pages = computed<(number | null)[]>(() => {
  const before = page.value <= 4
    ? [1, 2, 3, 4].filter(e => e < page.value)
    : [1, null, page.value - 2, page.value - 1]
  const totalPage = Math.ceil(total.value / size.value)
  const afterPages = totalPage - page.value
  const after = afterPages <= 4
    ? [1, 2, 3, 4].map(e => page.value + e).filter(e => e <= totalPage)
    : [page.value + 1, page.value + 2, null, totalPage]

  return [...before, page.value, ...after]
})

function hasNext() {
  return page.value * size.value < total.value
}

function hasPrev() {
  return page.value > 1
}

function nextPage() {
  if (!hasNext()) {
    ElMessage({
      type: 'warning',
      message: '已是最后一页',
    })
    return
  }
  page.value++
  emit('refresh')
}

function prevPage() {
  if (!hasPrev()) {
    ElMessage({
      type: 'warning',
      message: '已是第一页',
    })
    return
  }
  page.value--
  emit('refresh')
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
<template>
  <el-select-v2
    style="max-width: 300px;"
    v-model="selected"
    value-key="vk"
    :options="tagInfo.options"
    @change="onChange"
    multiple
    fit-input-width
    collapse-tags
    collapse-tags-tooltip
    :max-collapse-tags="3"
    filterable
    placeholder="选择标签"
  />
</template>

<script setup lang="tsx">
import { ref } from 'vue'
import { ElSelectV2 } from 'element-plus'
import { useTagsStore } from '@/store/tags'

const props = defineProps({
  modelValue: {
    type: Array<bigint>,
    required: true,
  }
});

const selected = ref<bigint[]>(props.modelValue)

const { tagInfo } = useTagsStore()


const emit = defineEmits(['update:modelValue']);
function onChange() {
  emit('update:modelValue', selected.value);
}

</script>

<style scoped>

</style>
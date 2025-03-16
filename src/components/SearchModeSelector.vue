<template>
  <el-button-group>
    <el-button
      :type="modelValue === SearchType.ANY ? 'primary' : 'default'"
      @click="toggle(SearchType.ANY)"
    >包含任意</el-button>
    <el-button
      :type="modelValue === SearchType.ALL ? 'primary' : 'default'"
      @click="toggle(SearchType.ALL)"
    >包含所有</el-button>
  </el-button-group>
</template>

<script setup lang="ts">
import { SearchType } from '@/api/type';

const props = defineProps({
  modelValue: {
    type: Number,
    required: true,
  }
});

const emit = defineEmits(['update:modelValue']);

const toggle = (value) => {
  if (props.modelValue !== value) {
    emit('update:modelValue', value);
  }
};
</script>

<template>
  <div class="box">
    <div class="corner" @click="emit('close')">&nbsp;+</div>
    <slot></slot>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits(['close'])
</script>

<style scoped>
.box {
  position: relative;
}

.corner {
  color: #ccc;
  user-select: none;
  line-height: 0;
  font-size: 30px;
  position: absolute;
  top: -30px;
  right: -30px;
  width: 0;
  height: 0;
  border: 30px solid transparent;
  border-right-color: #000c;
  transform: rotateZ(135deg);
}

.corner:hover {
  color: #fff;
}
</style>
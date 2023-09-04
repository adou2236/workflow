<template>
  <el-aside width="44" class="flow-element">
    <FlowElementList :nodeList="commonNodes" @setDragInfo="setDragInfo" />
  </el-aside>
</template>

<script lang="ts" setup>
  import FlowElementList from './FlowElementList.vue';
  import { commonNodes } from '@/config/nodes';
  import { OriginNode } from '@/type';

  const emits = defineEmits(['setDragInfo']);

  // 设置dragInfo
  function setDragInfo(info: OriginNode) {
    emits('setDragInfo', info);
  }
</script>

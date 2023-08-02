<template>
  <el-aside width="44" class="flow-element">
    <FlowElementList :nodeList="commonNodes" @setDragInfo="setDragInfo" />
  </el-aside>
</template>

<script lang="ts" setup>
  import FlowElementList from './FlowElementList.vue';
  import { commonNodes } from '/@/config/nodes';
  import { IElement } from '@/type/index';

  const emits = defineEmits(['setDragInfo']);

  // 设置dragInfo
  function setDragInfo(info: IElement) {
    emits('setDragInfo', info);
  }
</script>

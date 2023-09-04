<template>
  <el-menu>
    <el-menu-item v-for="(node, index) in nodeList" :key="index">
      <el-tooltip :content="node.name" placement="right">
        <div class="node-item" draggable="true" @dragstart="dragNode(node)">
          {{ node.basicConfig.name }}
        </div>
      </el-tooltip>
    </el-menu-item>
  </el-menu>
</template>
<script lang="ts" setup>
  import { PropType } from 'vue';
  import { OriginNode } from '@/type';

  defineProps({
    nodeList: {
      type: Array as PropType<OriginNode[]>,
      default: () => [],
    },
  });

  const emits = defineEmits(['setDragInfo']);

  // 开始拖拽
  function dragNode(node: OriginNode) {
    emits('setDragInfo', {
      ...node,
    });
  }
</script>

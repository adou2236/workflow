<template>
  <el-menu>
    <el-menu-item v-for="node in nodeList" :key="node.type">
      <el-tooltip :content="node.nodeName" placement="right">
        <div class="node-item" draggable="true" @dragstart="dragNode(node)">
          <component :is="node.icon" />
        </div>
      </el-tooltip>
    </el-menu-item>
  </el-menu>
</template>
<script lang="ts" setup>
  import { PropType } from 'vue';
  import { IElement } from '@/type/index';

  defineProps({
    nodeList: {
      type: Array as PropType<IElement[]>,
      default: () => [],
    },
  });

  const emits = defineEmits(['setDragInfo']);

  // 开始拖拽
  function dragNode(node: IElement) {
    emits('setDragInfo', {
      ...node,
    });
  }
</script>

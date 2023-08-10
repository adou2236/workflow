<template>
  <el-menu>
    <el-sub-menu index="common1">
      <template #title><span>连接器1</span></template>
      <el-sub-menu index="trigger">
        <template #title><span>触发器</span></template>
        <el-menu-item
          v-for="(node, index) in nodeList.filter((item) => item.flowType === 'trigger')"
          :key="index"
        >
          <el-tooltip :content="node.nodeName" placement="right">
            <div class="node-item" draggable="true" @dragstart="dragNode(node)">
              <component :is="node.icon" />
            </div>
          </el-tooltip>
        </el-menu-item>
      </el-sub-menu>
      <el-sub-menu index="action">
        <template #title><span>动作</span></template>
        <el-menu-item
          v-for="(node, index) in nodeList.filter((item) => item.flowType === 'action')"
          :key="index"
        >
          <el-tooltip :content="node.nodeName" placement="right">
            <div class="node-item" draggable="true" @dragstart="dragNode(node)">
              <component :is="node.icon" />
            </div>
          </el-tooltip>
        </el-menu-item>
      </el-sub-menu>
    </el-sub-menu>
    <el-sub-menu index="common2">
      <template #title><span>连接器2</span></template>
    </el-sub-menu>
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

<template>
  <div class="node__subProcess" @dragover.prevent @drop="handleDrop">
    <slot name="default"></slot>
    <div class="collapse-handle" @click="handleCollapse">{{ isExpanded ? '-' : '+' }}</div>
  </div>
</template>

<script lang="ts" setup>
  import 'bpmn-font/dist/css/bpmn.css';
  import DraggableResizableVue from 'draggable-resizable-vue3';
  import { computed, nextTick, onMounted, PropType, reactive, watch } from 'vue';
  import { INode } from '@/type';
  import { UIGroup } from '@jsplumb/browser-ui';
  const props = defineProps({
    node: {
      type: Object as PropType<INode>,
      default: () => ({}),
    },
    plumb: {
      type: Object,
      default: () => ({}),
    },
  });
  const currentNode = reactive(props.node);
  const icon = computed(() => {
    return props.plumb?.getNodeBasicConfig(currentNode).icon || '';
  });

  const isExpanded = computed(() => {
    return currentNode.properties.isExpanded;
  });

  watch(
    () => isExpanded.value,
    (v) => {
      if (!v) {
        // 重新计算宽高 设置最小宽度
        currentNode.bound.width = props.plumb?.getNodeBasicConfig(props.node).width;
        currentNode.bound.height = props.plumb?.getNodeBasicConfig(props.node).height;
      } else {
        currentNode.bound.width = 800;
        currentNode.bound.height = 400;
      }
    },
    {
      immediate: true,
    },
  );

  onMounted(() => {});

  function handleDrop() {
    event.preventDefault();
    if (isExpanded.value) event.backNode = currentNode;
  }

  function handleCollapse() {
    let currentGroup: UIGroup = props.plumb.getGroup(currentNode.id);
    if (isExpanded.value) {
      props.plumb.collapseGroup(currentNode.id);
      currentGroup.droppable = false;
      currentNode.properties.isExpanded = false;
    } else {
      props.plumb.expandGroup(currentNode.id);
      currentGroup.droppable = true;
      currentNode.properties.isExpanded = true;
    }
  }
</script>

<style scoped>
  .node__subProcess {
    position: relative;
    box-sizing: border-box;
    border: 2px solid var(--el-color-black);
    border-radius: 5px;
    width: 100%;
    height: 100%;
    background-color: white;
  }
  .collapse-handle {
    position: absolute;
    width: 10px;
    height: 10px;
    font-size: 20px;
    left: 50%;
    bottom: 20px;
    transform: translateX(-50%);
    cursor: pointer;
  }
  .icon > span {
    display: flex;
  }
</style>

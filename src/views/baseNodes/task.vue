<template>
  <div class="node__task">
    <div class="icon">
      <span v-if="icon.startsWith('bpmn-icon')" :class="icon"></span>
      <img v-else src="" />
    </div>
  </div>
</template>

<script lang="ts" setup>
  import 'bpmn-font/dist/css/bpmn.css';
  import { computed, PropType } from 'vue';
  import { INode } from '@/type';
  const props = defineProps({
    node: {
      type: Object as PropType<INode>,
    },
    plumb: {
      type: Object,
    },
  });
  const icon = computed(() => {
    return props.plumb?.getNodeBasicConfig(props.node).icon || '';
  });
</script>

<style scoped>
  .node__task {
    position: relative;
    box-sizing: border-box;
    border: 2px solid var(--el-color-black);
    border-radius: 5px;
    width: 100%;
    height: 100%;
    background-color: white;
  }
  .icon {
    position: absolute;
    left: 0;
    top: 0;
    font-size: 30px;
  }
  .icon > span {
    display: flex;
  }
</style>

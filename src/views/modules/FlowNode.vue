<template>
  <draggable-resizable-vue
    :id="node.id"
    ref="nodeRef"
    class-name="node-box"
    :class="[
      {
        'jtk-group-expanded': node.type === 'bpmn:subProcess' && node.properties.isExpanded,
        'jtk-group-collapsed': node.type === 'bpmn:subProcess' && !node.properties.isExpanded,
      },
      node.flowType,
    ]"
    :style="{
      width: node.bound.width + 'px',
      height: node.bound.height + 'px',
      cursor: 'move',
      transform: 'none',
    }"
    handles-type="borders"
    :handles-size="24"
    :x="0"
    :y="0"
    :minWidth="200"
    :minHeight="200"
    :width="node.bound.width"
    :height="node.bound.height"
    @resizing="onResizing"
    :active="node.type === 'bpmn:subProcess' && node.properties.isExpanded"
    :draggable="false"
    :data-x="node.bound.x"
    :data-y="node.bound.y"
    @contextmenu.stop="showNodeContextMenu(node)"
  >
    <div class="node-tools">
      <el-icon @click="updateNodeDisable(node)">
        <VideoPlay v-if="node.disabled" />
        <VideoPause v-else />
      </el-icon>
      <el-icon @click="nodeDelete(node.id)">
        <Delete />
      </el-icon>
    </div>
    <div class="node-notification" v-show="message">
      <el-tooltip :content="message">
        <el-icon :color="`var(--el-color-${status})`">
          <component :is="IconMap[status]" />
        </el-icon>
      </el-tooltip>
    </div>
    <component
      v-if="plumb"
      :is="Nodes[node.type]"
      :node="node"
      :plumb="plumb"
      :style="`font-size: ${Math.min(node.bound.width, node.bound.height)}px`"
    >
      <slot></slot>
    </component>
    <div class="node-description" :title="node.text.value">
      {{ node.bound }}
      <div class="node-name" :title="node.text.value">
        <p data-test-id="canvas-node-box-title" class="node-text">
          {{ node.text.value }}
        </p>
        <p v-if="node.disabled">(禁用)</p>
      </div>
    </div>
    <flow-node
      v-for="n in node.children"
      :key="n.id"
      :node="n"
      :nodes="nodes"
      :plumb="plumb"
      :config="config"
      v-model:select="currentSelect"
      v-model:selectGroup="currentSelectGroup"
      @showNodeContextMenu="showNodeContextMenu"
      @updateNodeDisable="updateNodeDisable"
      @nodeDelete="nodeDelete"
      @setNodeParams="(v) => emits('setNodeParams', v)"
    />
  </draggable-resizable-vue>
</template>

<script lang="ts" setup>
  import DraggableResizableVue from 'draggable-resizable-vue3';
  import { ref, unref, watch, onMounted, PropType, reactive, onBeforeUnmount } from 'vue';
  import { INode, IEdge } from '@/type';
  import { VideoPlay } from '@element-plus/icons-vue';
  import Nodes from '../baseNodes/index';

  const props = defineProps({
    select: {
      type: Object as PropType<INode | IEdge>,
      default: () => ({}),
    },
    selectGroup: {
      type: Array as PropType<INode[]>,
      default: () => [],
    },
    config: {
      type: Object,
      default: () => ({}),
    },
    vNode: {
      type: Object as PropType<INode>,
      default: () => ({}),
    },
    node: {
      type: Object as PropType<INode>,
      default: () => ({}),
    },
    nodes: {
      type: Array as PropType<INode[]>,
      default: () => [],
    },
    plumb: {
      type: Object,
      default: () => undefined,
    },
  });

  const emits = defineEmits([
    'update:select',
    'update:selectGroup',
    'alignForLine',
    'updateNodePos',
    'updateNodeDisable',
    'nodeDelete',
    'setNodeParams',
    'hideAlignLine',
    'isMultiple',
    'showNodeContextMenu',
  ]);

  defineExpose({
    Nodes,
  });

  // 当前节点信息
  const currentNode = reactive(props.node);

  const element = reactive({
    x: 0,
    y: 0,
  });

  // 当前选择的节点
  const currentSelect = ref(props.select);

  // 当前选择的节点组
  const currentSelectGroup = ref(props.selectGroup);

  const nodeRef = ref();

  const message = ref('');

  const status = ref('');

  const IconMap = ref({
    info: 'InfoFilled',
    success: 'SuccessFilled',
    warning: 'WarnTriangleFilled',
    error: 'CircleCloseFilled',
  });

  function onResizing(left, top, width, height) {
    if (currentNode.type === 'bpmn:subProcess' && props.plumb) {
      let changeX = left - element.x;
      let changeY = top - element.y;
      currentNode.bound.x += changeX;
      currentNode.bound.y += changeY;
      unref(props.plumb).setPosition(document.getElementById(props.node.id)!, {
        x: currentNode.bound.x,
        y: currentNode.bound.y,
      });
      currentNode.bound.width = width;
      currentNode.bound.height = height;
      currentNode.properties.width = width;
      currentNode.properties.height = height;
      element.x = left;
      element.y = top;
    }
  }
  // 选中节点
  function selectNode() {
    currentSelect.value = currentNode;
    currentSelectGroup.value = [];
  }
  // 节点右键
  function showNodeContextMenu(node) {
    emits('showNodeContextMenu', event, node);
    selectNode();
  }
  // 节点是否激活
  function isActive() {
    if (!unref(currentSelect)) {
      return false;
    }
    if (unref(currentSelect).id === currentNode.id) return true;
    let f = unref(currentSelectGroup).find((n) => n.id === currentNode.id);
    return !!f;
  }
  // 禁用节点
  function updateNodeDisable(node) {
    emits('updateNodeDisable', node);
  }

  // 删除节点
  function nodeDelete(id) {
    emits('nodeDelete', id);
  }

  // 设置节点内属性
  function setNodeParams(node) {
    emits('setNodeParams', node);
  }

  watch(
    () => props.select,
    (val) => {
      currentSelect.value = val;
    },
    { deep: true },
  );

  watch(
    () => currentSelect.value,
    (currentSelect) => {
      emits('update:select', currentSelect);
    },
  );

  watch(
    () => props.selectGroup,
    (val) => {
      currentSelectGroup.value = val;
    },
  );

  watch(
    () => currentSelectGroup.value,
    (currentSelectGroup) => {
      emits('update:selectGroup', currentSelectGroup);
    },
  );

  // watch(
  //   () => props.plumb,
  //   (v) => {
  //     if (v) {
  //       nextTick(() => {
  //         // registerNode();
  //       });
  //     }
  //   },
  //   {
  //     immediate: true,
  //   },
  // );
  let observer = ref<MutationObserver | null>(null);

  function setAttrs(records) {
    records.map((record) => {
      if (record.attributeName === 'status') {
        status.value = nodeRef.value.getAttribute('status');
      }
      if (record.attributeName === 'message') {
        message.value = nodeRef.value.getAttribute('message');
      }
    });
  }
  //执行观察
  onMounted(() => {
    // if (window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver) {
    //   observer.value = new MutationObserver(setAttrs);
    // }
    // observer.value?.observe(nodeRef.value, { attributes: true });
  });

  onBeforeUnmount(() => {
    observer.value?.disconnect();
  });
</script>

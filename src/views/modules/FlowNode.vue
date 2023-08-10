<template>
  <div
    :id="node.id"
    class="node-box"
    :class="[
      {
        disabled: node.disabled,
        active: isActive(),
      },
      node.flowType,
    ]"
    :style="{
      top: node.y + 'px',
      left: node.x + 'px',
      cursor: 'move',
    }"
    @click.stop="selectNode"
    @contextmenu.stop="showNodeContextMenu(node)"
  >
    <div class="node-tools">
      <el-icon @click="handleDisable(node)">
        <VideoPlay v-if="node.disabled" />
        <VideoPause v-else />
      </el-icon>
      <el-icon @click="handleDelete(node)">
        <Delete />
      </el-icon>
    </div>
    <div class="node-setting">
      <el-icon @click="setNodeParams(node)"><Tools /></el-icon>
    </div>
    <div class="node-icon">
      <component :is="node.icon" />
    </div>
    <div class="node-description">
      <div class="node-name" :title="node.displayName">
        <p data-test-id="canvas-node-box-title">
          {{ node.displayName }}
        </p>
        <p v-if="node.disabled">(禁用)</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, unref, watch, onMounted, PropType, reactive, nextTick } from 'vue';
  import { ToolsTypeEnum } from '@/type/enums';
  import { INode, ILink, NodesType } from '@/type';
  import { VideoPlay } from '@element-plus/icons-vue';

  const props = defineProps({
    select: {
      type: Object as PropType<INode | ILink>,
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
    node: {
      type: Object as PropType<INode>,
      default: () => ({}),
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

  // 流程配置
  const flowConfig = reactive(props.config);

  // 当前节点信息
  const currentNode = reactive(props.node);

  // 当前选择的节点
  const currentSelect = ref(props.select);

  // 当前选择的节点组
  const currentSelectGroup = ref(props.selectGroup);

  // 设置ICON
  function setIcon(type: NodesType) {
    switch (type) {
    }
  }

  // 设置鼠标样式
  function setCursor(type: ToolsTypeEnum) {
    switch (type) {
      case 'drag':
        return 'move';
      case 'connection':
        return 'crosshair';
      default:
        return 'default';
    }
  }

  // 初始节点拖拽
  function registerNode() {
    props.plumb!.draggable(currentNode.id, {
      containment: 'parent',
      handle: (e, el: HTMLElement) => {
        // 判断节点类型
        let possibles = el?.parentNode?.querySelectorAll('.node-box') ?? [];

        for (let i = 0; i < possibles?.length; i++) {
          if (possibles[i] === el || e?.target?.className === 'lane-text') return true;
        }

        return false;
      },
      grid: flowConfig.defaultStyle.alignGridPX,
      drag: (e) => {
        if (flowConfig.defaultStyle.isOpenAuxiliaryLine) {
          emits('alignForLine', e);
        }
      },
      stop: (e) => {
        currentNode.x = e.pos[0];
        currentNode.y = e.pos[1];

        // 是否为组
        if (currentSelectGroup.value.length > 1) {
          // 更新组节点信息
          emits('updateNodePos');
        }
        // 隐藏辅助线
        emits('hideAlignLine');
      },
    });

    currentSelect.value = currentNode;
    currentSelectGroup.value = [];
  }

  // 点击节点
  function selectNode() {
    currentSelect.value = currentNode;
    emits('isMultiple', (flag: boolean) => {
      if (!flag) {
        currentSelectGroup.value = [];
      } else {
        let f = unref(currentSelectGroup).find((s) => s.id === currentNode.id);
        if (f) {
          props.plumb!.addToDragSelection(currentNode.id);
          currentSelectGroup.value.push(currentNode);
        }
      }
    });
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
  function handleDisable(node) {
    emits('updateNodeDisable', node);
  }

  // 删除节点
  function handleDelete(node) {
    emits('nodeDelete', node);
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

  watch(
    () => props.plumb,
    (v) => {
      if (v) {
        nextTick(() => {
          registerNode();
        });
      }
    },
    {
      immediate: true,
    },
  );

  onMounted(() => {});
</script>

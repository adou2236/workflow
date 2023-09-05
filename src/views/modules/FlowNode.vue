<template>
  <div
    :id="node.id"
    ref="nodeRef"
    class="node-box"
    :class="[
      {
        disabled: node.disabled,
        active: isActive(),
      },
    ]"
    :style="{
      top: node.y + 'px',
      left: node.x + 'px',
      cursor: 'move',
    }"
    @click.stop="selectNode"
    @contextmenu.stop="showNodeContextMenu(node)"
    @dblclick="setNodeParams"
  >
    <div class="node-notification" v-show="message">
      <el-tooltip :content="message">
        <el-icon :color="`var(--el-color-${status})`">
          <component :is="IconMap[status]" />
        </el-icon>
      </el-tooltip>
    </div>
    <!--    <img class="node-icon" src="http://dummyimage.com/100x100" />-->
    <div class="node-description">
      <div class="node-name" :title="node.displayName">
        <p data-test-id="canvas-node-box-title">
          {{ node.displayName }}
        </p>
      </div>
    </div>
    <div class="node-anchor node-anchor__top"></div>
    <div class="node-anchor node-anchor__right"></div>
    <div class="node-anchor node-anchor__bottom"></div>
    <div class="node-anchor node-anchor__left"></div>
  </div>
</template>

<script lang="ts" setup>
  import { ref, unref, watch, onMounted, PropType, reactive, nextTick, onBeforeUnmount } from 'vue';
  import { INode, ILink } from '@/type';

  const props = defineProps({
    select: {
      type: Object as PropType<INode | ILink>,
      default: () => ({}),
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

  const nodeRef = ref();

  const message = ref('');

  const status = ref('');

  const IconMap = ref({
    info: 'InfoFilled',
    success: 'SuccessFilled',
    warning: 'WarnTriangleFilled',
    error: 'CircleCloseFilled',
  });

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

        // 隐藏辅助线
        emits('hideAlignLine');
      },
    });

    currentSelect.value = currentNode;
  }

  // 点击节点
  function selectNode() {
    currentSelect.value = currentNode;
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
    return unref(currentSelect).id === currentNode.id;
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
    if (window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver) {
      observer.value = new MutationObserver(setAttrs);
    }
    observer.value?.observe(nodeRef.value, { attributes: true });
  });

  onBeforeUnmount(() => {
    observer.value?.disconnect();
  });
</script>

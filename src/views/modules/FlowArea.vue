<template>
  <div
    class="flow-area"
    id="flow-area-root"
    @dragover="handleDragover"
    @drop="handleDrop"
    @wheel="handleScroll"
  >
    <!--辅助线X-->
    <div
      v-if="container.auxiliaryLine.isOpen && container.auxiliaryLine.isShowXLine"
      class="flow-area__lineX"
      :style="{ top: auxiliaryLinePos.y + 'px' }"
    ></div>

    <!--辅助线Y-->
    <div
      v-if="container.auxiliaryLine.isOpen && container.auxiliaryLine.isShowYLine"
      class="flow-area__lineY"
      :style="{ left: auxiliaryLinePos.x + 'px' }"
    ></div>

    <div
      id="flowContainer"
      class="flow-area__container"
      :class="{
        grid: flowConfig.defaultStyle.showGrid,
        canDrag: container.dragFlag,
        canMultiple: rectangleMultiple.flag,
        readOnly: props.readOnly,
      }"
      :style="gridStyle"
      @click="containerHandler"
      @mousedown="mousedownHandler"
      @mousemove="mousemoveHandler"
      @mouseup="mouseupHandler"
      @mousewheel="scaleContainer"
      @DOMMouseScroll="scaleContainer"
      @contextmenu="showContainerContextMenu"
    >
      <flow-node
        v-for="node in flowData.nodeList"
        :key="node.id"
        :node="node"
        :plumb="plumb"
        :config="flowConfig"
        v-model:select="currentSelect"
        v-model:selectGroup="currentSelectGroup"
        @showNodeContextMenu="showNodeContextMenu"
        @isMultiple="isMultiple"
        @updateNodePos="updateNodePos"
        @updateNodeDisable="updateNodeDisable"
        @nodeDelete="deleteNode"
        @setNodeParams="(v) => emits('setNodeParams', v)"
        @alignForLine="alignForLine"
        @hideAlignLine="hideAlignLine"
      />
      <div
        class="flow-area__multiple"
        v-if="
          rectangleMultiple.flag &&
          rectangleMultiple.multipling &&
          rectangleMultiple.width &&
          rectangleMultiple.height
        "
        :style="{
          top: rectangleMultiple.position.top + 'px',
          left: rectangleMultiple.position.left + 'px',
          width: rectangleMultiple.width + 'px',
          height: rectangleMultiple.height + 'px',
        }"
      ></div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { throttle } from 'lodash-es';
  import { reactive, ref, computed, watch, unref, PropType, nextTick, onMounted } from 'vue';
  import { getZoomToFit, scaleBigger, scaleSmaller, utils } from '@/utils/common';
  import FlowNode from './FlowNode.vue';
  import { useContextMenu } from '@/hooks/useContextMenu';
  import { CommonNodeTypeEnum, FlowStatusEnum } from '@/type/enums';
  import { INode, ILink, IElement } from '@/type';
  import { commonNodes } from '@/config/nodes';
  import { jsPlumb } from 'jsplumb';
  import funcInstall from '@/utils';
  import { __addNode, __addLink } from '@/utils/nodeBase';
  import { flowConfig as defaultConfig } from '@/config/flow';
  import normalizeWheel from 'normalize-wheel';

  const props = defineProps({
    data: {
      type: Object,
      default: () => ({}),
    },
    config: {
      type: Object,
      default: () => undefined,
    },
    select: {
      type: Object as PropType<INode | ILink>,
      default: () => ({}),
    },
    selectGroup: {
      type: Array as PropType<INode[]>,
      default: () => [],
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
  });

  const emits = defineEmits([
    'addNode',
    'setNodeParams',
    'onShortcutKey',
    'saveFlow',
    'update:select',
    'update:selectGroup',
    'update:data',
  ]);

  const [createContextMenu] = useContextMenu();

  // 流程实例
  const plumb = ref();

  const initDone = ref(false);

  // 流程当前状态
  const status = ref('3');

  // 流程配置
  const flowConfig = ref(defaultConfig);

  // 流程DSL数据
  const flowData = computed(() => {
    return props.data;
  });
  watch(
    () => props.data,
    () => {
      nextTick(() => {
        setReadOnly(false);
        dataInit();
      });
    },
    {
      deep: false,
      immediate: true,
    },
  );

  // 当前选择的节点
  const currentSelect = ref(props.select);

  // 当前选择的节点组
  const currentSelectGroup = ref(props.selectGroup);

  const container = reactive({
    pos: {
      top: -5000,
      left: -5000,
    },
    dragFlag: false,
    draging: false,
    scale: flowConfig.value.defaultStyle.containerScale.init,
    scaleFlag: false,
    scaleOrigin: {
      x: 0,
      y: 0,
    },
    // 辅助线
    auxiliaryLine: {
      isOpen: flowConfig.value.defaultStyle.isOpenAuxiliaryLine,
      isShowXLine: false,
      isShowYLine: false,
      controlFnTimesFlag: true,
    },
  });

  // 辅助线位置
  const auxiliaryLinePos = reactive({
    x: 0,
    y: 0,
  });

  const mouse = reactive({
    position: {
      x: 0,
      y: 0,
    },
    // 鼠标点击起始位置
    tempPos: {
      x: 0,
      y: 0,
    },
  });

  // 鼠标划框多选
  const rectangleMultiple = reactive({
    flag: true, // 是否按了shift键
    multipling: false,
    position: {
      top: 0,
      left: 0,
    },
    height: 0,
    width: 0,
  });

  // 当前聚焦的连接线ID
  let tempLinkId = '';

  // 剪切板内容
  let clipboard: INode[] = [];

  const gridStyle = computed(() => {
    return {
      top: `${container.pos.top}px`,
      left: `${container.pos.left}px`,
      transform: `scale(${container.scale})`,
      transformOrigin: `${container.scaleOrigin.x}px ${container.scaleOrigin.y}px`,
    };
  });

  function handleDragover(e: MouseEvent) {
    e.preventDefault();
    mousemoveHandler(e);
  }

  // 查找相关节点
  function findNodeConfig(dragInfo: IElement) {
    let node: IElement | undefined;
    const { nodeName } = dragInfo;

    node = commonNodes.find((n) => n.nodeName === nodeName);

    if (!node) {
      console.error('未知的节点类型！');
      return;
    }

    // 增加节点
    addNewNode(dragInfo);
  }

  // 组件拖拽入画布
  function handleDrop(event) {
    if (props.readOnly) return;
    // 复位拖拽工具
    let dragInfo = event.dataTransfer.getData('dragInfo');
    addNewNode(JSON.parse(dragInfo));
  }

  // 画布鼠标移动
  function mousemoveHandler(e: MouseEvent) {
    const canvasRect = document.getElementById('flowContainer')?.getBoundingClientRect();
    if (!canvasRect) {
      return;
    }
    const offsetX = e.clientX - canvasRect.left;
    const offsetY = e.clientY - canvasRect.top;

    mouse.position = {
      x: offsetX,
      y: offsetY,
    };
    if (rectangleMultiple.multipling) {
      let h = mouse.position.y - mouse.tempPos.y;
      let w = mouse.position.x - mouse.tempPos.x;
      let t = mouse.tempPos.y;
      let l = mouse.tempPos.x;
      if (h >= 0 && w < 0) {
        w = -w;
        l -= w;
      } else if (h < 0 && w >= 0) {
        h = -h;
        t -= h;
      } else if (h < 0 && w < 0) {
        h = -h;
        w = -w;
        t -= h;
        l -= w;
      }
      rectangleMultiple.height = h;
      rectangleMultiple.width = w;
      rectangleMultiple.position.top = t;
      rectangleMultiple.position.left = l;
    }
  }

  // function getPos(e, res) {
  //   if (e.parentNode.id === 'flowContainer') {
  //     return res;
  //   } else {
  //     return getPos(e.parent);
  //   }
  // }

  // x, y取整计算
  function computeNodePos(x: number, y: number) {
    const pxx = flowConfig.value.defaultStyle.alignGridPX[0];
    const pxy = flowConfig.value.defaultStyle.alignGridPX[1];
    if (x % pxx) x = pxx - (x % pxx) + x;
    if (y % pxy) y = pxy - (y % pxy) + y;
    return {
      x: x,
      y: y,
    };
  }

  // 增加画布节点
  function addNewNode(node: IElement) {
    let x = mouse.position.x;
    let y = mouse.position.y;
    let nodePos = computeNodePos(x, y);
    x = nodePos.x;
    y = nodePos.y;

    let newNode = Object.assign({}, node) as INode;
    newNode.id = newNode.type + '-' + utils.getId();
    if (newNode.type === CommonNodeTypeEnum.NOTE) {
      newNode.x = x - 25;
      newNode.y = y - 25;
    } else {
      newNode.x = x - 40;
      newNode.y = y - 40;
    }
    unref(flowData).nodeList.push(newNode);
    nextTick(() => {
      __addNode(plumb.value, newNode);
      emits('update:data', unref(flowData));
      emits('addNode', newNode);
    });
  }

  // 画布鼠标按下
  function mousedownHandler(e: MouseEvent) {
    if (e.button === 0) {
      currentSelectGroup.value = [];
      mouse.tempPos = mouse.position;
      rectangleMultiple.multipling = true;
    }
  }

  // 画布鼠标点击松开
  function mouseupHandler(e: MouseEvent) {
    judgeSelectedNode();
    rectangleMultiple.multipling = false;
    rectangleMultiple.width = 0;
    rectangleMultiple.height = 0;
  }

  // 鼠标划框内的节点
  function judgeSelectedNode() {
    let ay = rectangleMultiple.position.top;
    let ax = rectangleMultiple.position.left;
    let by = ay + rectangleMultiple.height;
    let bx = ax + rectangleMultiple.width;
    let halfNodeWidth = 40;

    let nodeList = unref(flowData).nodeList;
    nodeList.forEach((node: INode) => {
      if (
        node.y + halfNodeWidth >= ay &&
        node.x + halfNodeWidth >= ax &&
        node.y + halfNodeWidth <= by &&
        node.x + halfNodeWidth <= bx
      ) {
        plumb.value.addToDragSelection(node.id);
        unref(currentSelectGroup).push(node);
      }
    });
  }

  // 画布鼠标滚轴
  function scaleContainer(e: WheelEvent) {
    if (container.scaleFlag) {
      if (e.deltaY < 0) {
        zoomIn();
      } else if (container.scale) {
        zoomOut();
      }
    }
  }

  // 画布放大
  const zoomIn = throttle(() => {
    const { scale, x, y } = scaleBigger({
      scale: container.scale,
      x: container.pos.left,
      y: container.pos.top,
    });
    container.scale = scale;
    plumb.value.setZoom(container.scale);
    container.pos.left = x;
    container.pos.top = y;
  }, 20);

  // 画布缩小
  const zoomOut = throttle(() => {
    const { scale, x, y } = scaleSmaller({
      scale: container.scale,
      x: container.pos.left,
      y: container.pos.top,
    });
    container.scale = scale;
    plumb.value.setZoom(container.scale);
    container.pos.left = x;
    container.pos.top = y;
  }, 20);

  // 画布自适应
  function zoomFit() {
    const nodeList = unref(flowData)?.nodeList || [];
    if (!nodeList.length) {
      return;
    }
    const { zoomLevel, x, y } = getZoomToFit(nodeList);
    container.scale = zoomLevel;
    plumb.value.setZoom(zoomLevel);
    container.pos.left = x;
    container.pos.top = y;
  }

  // 画布右健
  function showContainerContextMenu(e: MouseEvent) {
    if (props.readOnly) return;
    createContextMenu({
      event: e,
      items: [
        {
          handler: () => {
            flowInfo();
          },
          label: '流程图信息',
        },
        {
          handler: () => {
            paste();
          },
          label: '粘贴',
        },
        {
          handler: () => {
            selectAll();
          },
          label: '全选',
        },
        {
          handler: () => {
            saveFlow();
          },
          label: '保存流程',
        },
      ],
    });
  }

  // 节点右键
  function showNodeContextMenu(e: MouseEvent, node) {
    if (props.readOnly) return;
    createContextMenu({
      event: e,
      items: [
        {
          handler: () => {
            copyNode();
          },
          label: '复制节点',
        },
        {
          handler: () => {
            deleteNode(node);
          },
          label: '删除节点',
        },
      ],
    });
  }

  // 流程图信息
  function flowInfo() {
    let nodeList = unref(flowData).nodeList;
    let linkList = unref(flowData).linkList;
    console.info(
      '当前流程图中有 ' + nodeList.length + ' 个节点，有 ' + linkList.length + ' 条连线。',
    );
  }

  // 粘贴
  function paste() {
    let dis = 0;
    clipboard.forEach((node: INode) => {
      let newNode = Object.assign({}, node);
      newNode.id = newNode.type + '-' + utils.getId();
      let nodePos = computeNodePos(mouse.position.x + dis, mouse.position.y + dis);
      newNode.x = nodePos.x;
      newNode.y = nodePos.y;
      dis += 20;
      unref(flowData).nodeList.push(newNode);
      emits('update:data', unref(flowData));
    });
  }

  // 全选
  function selectAll() {
    unref(flowData).nodeList.forEach((node: INode) => {
      plumb.value.addToDragSelection(node.id);
      unref(currentSelectGroup).push(node);
    });
  }

  // 保存流程
  function saveFlow() {
    emits('saveFlow');
  }

  // 复制节点
  function copyNode() {
    clipboard = [];
    if (unref(currentSelectGroup).length > 0) {
      clipboard = Object.assign([], unref(currentSelectGroup));
    } else if (unref(currentSelect).id) {
      clipboard.push(unref(currentSelect) as INode);
    }
  }

  // 查询删除节点关联的连接线
  function getConnectionsByNodeId(nodeId: string) {
    let conns1 = plumb.value.getConnections({
      source: nodeId,
    });
    let conns2 = plumb.value.getConnections({
      target: nodeId,
    });
    return conns1.concat(conns2);
  }

  // 删除节点
  function deleteNode(nodes: INode[] | INode) {
    let nodeList = unref(flowData).nodeList;
    let linkList = unref(flowData).linkList;
    let arr: INode[] = Array.isArray(nodes) ? nodes : [nodes];

    status.value = FlowStatusEnum.LOADING;

    arr.forEach((c) => {
      let conns = getConnectionsByNodeId(c.id);
      conns.forEach((conn: Recordable) => {
        linkList.splice(
          linkList.findIndex(
            (link: ILink) => link.sourceId === conn.sourceId && link.targetId === conn.targetId,
          ),
          1,
        );
        plumb.value.deleteConnection(
          plumb.value.getConnections({
            source: conn.sourceId,
            target: conn.targetId,
          })[0],
        );
      });
      let inx = nodeList.findIndex((node: INode) => node.id === c.id);
      (plumb.value.getEndpoints(c.id) || [])
        .flat()
        .forEach((endpoint) => plumb.value?.deleteEndpoint(endpoint));
      nodeList.splice(inx, 1);
    });
    status.value = FlowStatusEnum.CREATE;
    emits('update:data', unref(flowData));
    selectContainer();
  }

  // 点击画布
  function containerHandler() {
    selectContainer();
  }
  // 清除画布已选内容
  function selectContainer() {
    currentSelect.value = {} as INode | ILink;
    // 开启快捷键
    emits('onShortcutKey');
  }
  // 是否为多选行为
  function isMultiple(callback: Fn) {
    callback(rectangleMultiple.flag);
  }
  // 更新组节点信息
  function updateNodePos() {
    let nodeList = unref(flowData).nodeList;
    unref(currentSelectGroup).forEach((node) => {
      let dom = document.querySelector('#' + node.id) as HTMLElement;
      let l = parseInt(dom?.style?.left);
      let t = parseInt(dom?.style?.top);
      let f = nodeList.find((n: INode) => n.id === node.id);
      f.x = l;
      f.y = t;
    });
  }
  // 更新节点可以状态
  function updateNodeDisable(node: INode) {
    let { disabled } = node;
    let nodeList = unref(flowData).nodeList;
    let current = nodeList.find((n: INode) => n.id === node.id);
    current.disabled = !disabled;
  }

  // 计算辅助线
  function alignForLine(e: Recordable) {
    if (unref(currentSelectGroup).length > 1) return;
    if (container.auxiliaryLine.controlFnTimesFlag) {
      let elId = e.el.id;
      let nodeList = unref(flowData).nodeList;
      nodeList.forEach((node: INode) => {
        if (elId !== node.id) {
          let nodeDom = document.getElementById(node.id);
          let dis = flowConfig.value.defaultStyle.showAuxiliaryLineDistance,
            elPos = e.pos,
            elH = e.el.offsetHeight,
            elW = e.el.offsetWidth,
            disX = elPos[0] - node.x,
            disY = elPos[1] - node.y;
          if ((disX >= -dis && disX <= dis) || (disX + elW >= -dis && disX + elW <= dis)) {
            container.auxiliaryLine.isShowYLine = true;
            auxiliaryLinePos.x = node.x + container.pos.left;
            let nodeMidPointX = node.x + nodeDom!.offsetWidth / 2;
            if (nodeMidPointX === elPos[0] + elW / 2) {
              auxiliaryLinePos.x = nodeMidPointX + container.pos.left;
            }
          }
          if ((disY >= -dis && disY <= dis) || (disY + elH >= -dis && disY + elH <= dis)) {
            container.auxiliaryLine.isShowXLine = true;
            auxiliaryLinePos.y = node.y + container.pos.top;
            let nodeMidPointY = node.y + nodeDom!.offsetHeight / 2;
            if (nodeMidPointY === elPos[1] + elH / 2) {
              auxiliaryLinePos.y = nodeMidPointY + container.pos.left;
            }
          }
        }
      });
      container.auxiliaryLine.controlFnTimesFlag = false;
      setTimeout(() => {
        container.auxiliaryLine.controlFnTimesFlag = true;
      }, 200);
    }
  }
  // 隐藏辅助线
  function hideAlignLine() {
    if (container.auxiliaryLine.isOpen) {
      container.auxiliaryLine.isShowXLine = false;
      container.auxiliaryLine.isShowYLine = false;
    }
  }

  // 画布初始化
  function initJsPlumb() {
    plumb.value = jsPlumb.getInstance(unref(flowConfig).jsPlumbInsConfig);

    unref(plumb).bind('beforeDrop', (info: Recordable) => {
      let sourceId = info.sourceId;
      let targetId = info.targetId;

      // 不允许自连接
      // if (sourceId === targetId) return false;
      let notOnlyLink = flowData.value.linkList.find(
        (link: ILink) => link.sourceId === sourceId && link.targetId === targetId,
      );
      return !notOnlyLink;
    });

    unref(plumb).bind('connection', (conn: Recordable) => {
      let connObj = conn.connection.canvas;
      let o: Recordable = {};
      let id = '';
      let label = '';
      if (status.value === FlowStatusEnum.CREATE || status.value === FlowStatusEnum.MODIFY) {
        id = 'link-' + utils.getId();
        label = '';
      } else if (status.value === FlowStatusEnum.LOADING) {
        let l = conn.connection.getParameters();
        id = l.id;
        label = l.label;
      }
      connObj.id = id;
      o.type = 'link';
      o.id = id;
      o.label = label;
      o.sourceId = conn.sourceId;
      o.targetId = conn.targetId;
      o.sourceEndpoint = conn.sourceEndpoint.getParameters().endpoint;
      o.targetEndpoint = conn.targetEndpoint.getParameters().endpoint;
      o.cls = {
        linkType: unref(flowConfig).jsPlumbInsConfig.Connector?.[0],
        linkColor: unref(flowConfig).jsPlumbInsConfig.PaintStyle?.stroke,
        linkThickness: unref(flowConfig).jsPlumbInsConfig.PaintStyle?.strokeWidth,
      };
      document.querySelector('#' + id)?.addEventListener('contextmenu', (e: Event) => {
        showLinkContextMenu(e);
        currentSelect.value = flowData.value.linkList.find((l: ILink) => l.id === id);
      });

      document.querySelector('#' + id)?.addEventListener('click', (e: Event) => {
        e.stopPropagation();
        currentSelect.value = flowData.value.linkList.find((l: ILink) => l.id === id);
      });

      if (status.value !== FlowStatusEnum.LOADING) {
        delete o.cls;
        flowData.value.linkList.push(o);
      }
    });

    unref(plumb).importDefaults({
      ConnectionsDetachable: unref(flowConfig).jsPlumbConfig.conn.isDetachable,
    });
  }

  // 数据初始化
  function dataInit() {
    if (!unref(plumb)) return;
    status.value = FlowStatusEnum.LOADING;
    try {
      if (flowData.value.nodeList && flowData.value.nodeList.length > 0) {
        flowData.value.nodeList.forEach((item) => {
          __addNode(plumb.value, item);
        });
      }
      if (flowData.value.linkList && flowData.value.linkList.length > 0) {
        flowData.value.linkList.forEach((item) => {
          __addLink(
            plumb.value,
            { id: item.sourceId, endpoint: item.sourceEndpoint },
            { id: item.targetId, endpoint: item.targetEndpoint },
            { id: item.id, label: item.label },
          );
        });
      }
    } catch (e) {
      console.error('渲染失败', e);
    }
    status.value = FlowStatusEnum.MODIFY;
    setTimeout(() => {
      setReadOnly(props.readOnly);
    });
  }

  function setReadOnly(flag: boolean) {
    if (!unref(plumb)) return;
    unref(plumb).setSuspendDrawing(flag);
    const connections = unref(plumb).getAllConnections();
    connections.forEach((connection) => {
      connection.setDetachable(!flag);
    });
    const nodes = unref(flowData).nodeList || [];
    nodes.forEach((node) => {
      unref(plumb).setDraggable(document.getElementById(node.id), !flag);
    });
  }

  // 连接线右键
  function showLinkContextMenu(e) {
    e.stopPropagation();
    createContextMenu({
      event: e,
      items: [
        {
          handler: () => {
            deleteLink();
          },
          label: '删除连线',
        },
      ],
    });
  }

  // 鼠标滚动事件
  function handleScroll(e: WheelEvent) {
    if (e.ctrlKey) {
      if (e.deltaY > 0) {
        zoomOut();
      } else {
        zoomIn();
      }

      e.preventDefault();
      return;
    }
    moveWorkflow(e);
  }

  // 移动画布
  function moveWorkflow(e: WheelEvent) {
    const normalized = normalizeWheel(e);
    const nodeViewOffsetPositionX =
      container.pos.left - (e.shiftKey ? normalized.pixelY : normalized.pixelX);
    const nodeViewOffsetPositionY =
      container.pos.top - (e.shiftKey ? normalized.pixelX : normalized.pixelY);
    container.pos = {
      top: nodeViewOffsetPositionY,
      left: nodeViewOffsetPositionX,
    };
  }

  // 删除线
  function deleteLink() {
    let sourceId = (unref(currentSelect) as ILink)?.sourceId;
    let targetId = (unref(currentSelect) as ILink)?.targetId;
    unref(plumb).deleteConnection(
      unref(plumb).getConnections({
        source: sourceId,
        target: targetId,
      })[0],
    );
    let linkList = unref(flowData).linkList;
    linkList.splice(
      linkList.findIndex((link: ILink) => link.sourceId === sourceId && link.targetId === targetId),
      1,
    );
    emits('update:data', unref(flowData));
    selectContainer();
  }

  onMounted(() => {
    initJsPlumb();
  });

  defineExpose({
    container,
    rectangleMultiple,
    deleteNode,
    zoomOut,
    zoomIn,
    zoomFit,
    plumb,
    ...funcInstall({ flowData: flowData, plumb: plumb }),
  });

  watch(
    () => props.select,
    (val) => {
      currentSelect.value = val;
      // 清除连接线焦点
      if (tempLinkId !== '') {
        document.querySelector('#' + tempLinkId)?.classList.remove('link-active');
        tempLinkId = '';
      }
      // 设置连接线焦点
      if (unref(currentSelect).type === 'link') {
        tempLinkId = unref(currentSelect).id;
        document.querySelector('#' + unref(currentSelect).id)?.classList.add('link-active');
      }
    },
    { deep: true },
  );

  watch(
    () => currentSelect.value,
    (val) => {
      emits('update:select', val);
    },
    { deep: true },
  );

  watch(
    () => props.selectGroup,
    (val) => {
      currentSelectGroup.value = val;
      if (unref(currentSelectGroup).length <= 0) plumb.value.clearDragSelection();
    },
  );

  watch(
    () => currentSelectGroup.value,
    (val) => {
      emits('update:selectGroup', val);
    },
    { deep: true },
  );

  watch(
    () => props.readOnly,
    (v) => {
      setReadOnly(v);
    },
  );
</script>

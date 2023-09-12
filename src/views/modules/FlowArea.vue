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
        readOnly: props.readOnly,
      }"
      :style="gridStyle"
      @mousemove="mousemoveHandler"
      @contextmenu="showContainerContextMenu"
    >
      <flow-node
        v-for="node in flowData.nodes"
        :key="node.id"
        :node="node"
        :nodes="flowData.nodes"
        :plumb="plumb"
        :config="flowConfig"
        @click.stop
        v-model:select="currentSelect"
        v-model:selectGroup="currentSelectGroup"
        @showNodeContextMenu="showNodeContextMenu"
        @updateNodeDisable="updateNodeDisable"
        @nodeDelete="nodeDelete"
        @setNodeParams="(v) => emits('setNodeParams', v)"
      >
        <!--        是否选用树型结构-->
      </flow-node>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { cloneDeep, throttle } from 'lodash-es';
  import {
    computed,
    nextTick,
    onMounted,
    PropType,
    provide,
    reactive,
    ref,
    unref,
    watch,
  } from 'vue';
  import { arrayToTree, getZoomToFit, scaleBigger, scaleSmaller, utils } from '@/utils/common';
  import FlowNode from './FlowNode.vue';
  import { useContextMenu } from '@/hooks/useContextMenu';
  import { FlowStatusEnum, NodeType } from '@/type/enums';
  import { IEdge, INode, IProcess, ISubProcess } from '@/type';
  import funcInstall from '@/utils';
  import { flowConfig as defaultConfig } from '@/config/flow';
  import normalizeWheel from 'normalize-wheel';
  import DragSelect from 'dragselect';
  import {
    CONNECTION,
    EVENT_CONNECTION_ABORT,
    EVENT_CONNECTION_CLICK,
    EVENT_CONNECTION_CONTEXTMENU,
    EVENT_CONNECTION_DBL_CLICK,
    EVENT_CONNECTION_DETACHED,
    EVENT_CONNECTION_DRAG,
    EVENT_DRAG_MOVE,
    EVENT_DRAG_START,
    EVENT_DRAG_STOP,
    EVENT_GROUP_MEMBER_ADDED,
    EVENT_GROUP_EXPAND,
    ready,
  } from '@jsplumb/browser-ui';
  import { NODE_SIZE } from '@/config/const';
  import plumbRegister from '@/utils/plumbRegister';
  import { commonNodes } from '@/config/nodes';

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
      type: Object as PropType<INode | IEdge>,
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

  // 流程当前状态
  const status = ref('3');

  const ds = ref();

  // 流程配置
  const flowConfig = ref(defaultConfig);

  // 流程DSL数据
  const flowData = computed(() => {
    return props.data;
  });

  // 网格信息
  const gridStyle = computed(() => {
    return {
      top: `${container.pos.top}px`,
      left: `${container.pos.left}px`,
      transform: `scale(${container.scale})`,
      transformOrigin: `${container.scaleOrigin.x}px ${container.scaleOrigin.y}px`,
    };
  });

  // 虚拟节点树
  const visualNodeTree = computed(() => {
    return arrayToTree(unref(flowData).nodes);
  });
  watch(
    () => props.data,
    () => {
      nextTick(() => {
        // setReadOnly(false);
        dataInit();
      });
    },
    {
      deep: false,
      immediate: true,
    },
  );

  // 当前选择的节点
  const currentSelect = ref<IEdge | INode>(props.select);

  // 当前选择的节点组
  const currentSelectGroup = ref(props.selectGroup);

  const container = reactive({
    pos: {
      top: 0,
      left: 0,
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

  // 当前聚焦的连接线ID
  let tempLinkId = '';

  // 剪切板内容
  let clipboard: INode[] = [];

  function handleDragover(e: MouseEvent) {
    e.preventDefault();
    mousemoveHandler(e);
  }

  // 组件拖拽入画布
  function handleDrop() {
    if (props.readOnly) return;
    let dragInfo = window.dragInfo;
    if (dragInfo) {
      addNewNode(dragInfo);
      window.dragInfo = null;
    }
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

  // 增加画布节点 相对于画布的绝对位置
  function addNewNode(node: INode) {
    const { backNode } = event;
    let x = mouse.position.x;
    let y = mouse.position.y;
    let nodePos = computeNodePos(x, y);
    x = nodePos.x;
    y = nodePos.y;

    let newNode = cloneDeep(node) as INode;
    delete newNode.basicConfig;
    newNode.id = newNode.type + '-' + utils.getId();
    // 位置矫正
    newNode.bound = {
      width: unref(plumb).getNodeBasicConfig(node)?.width || NODE_SIZE,
      height: unref(plumb).getNodeBasicConfig(node)?.height || NODE_SIZE,
      x: x - (unref(plumb).getNodeBasicConfig(node)?.width || NODE_SIZE) / 2,
      y: y - (unref(plumb).getNodeBasicConfig(node)?.height || NODE_SIZE) / 2,
    };
    // 设置文字内容
    newNode.text = {
      value: unref(plumb).getNodeBasicConfig(node)?.name,
    };
    unref(flowData).nodes.push(newNode);
    emits('update:data', unref(flowData));
    nextTick(() => {
      // 设置位置
      flowData.value.nodes.forEach((item) => {
        let group = unref(plumb).getGroupFor(document.getElementById(item.id));
        let parent;
        if (group) {
          parent = flowData.value.nodes.find((item) => item.id === group.elId);
        }
        unref(plumb).setPosition(document.getElementById(item.id)!, {
          x: item.bound.x - (parent?.bound.x || 0),
          y: item.bound.y - (parent?.bound.y || 0),
        });
      });
      unref(plumb).addNode(newNode);
    });
  }

  // 画布事件绑定
  function mutipleDrag() {
    ds.value = new DragSelect({
      selectables: document.getElementsByClassName('node-box'),
      area: document.getElementById('flowContainer'),
      multiSelectKeys: ['Shift', 'Meta', 'Control'], // special keys that allow multiselection.
    });
    unref(ds).subscribe('callback', (e) => {
      selectContainer();
      // TODO 有bug
      // console.log(e.items);
      // e.items.forEach((item) => {
      //   let node = unref(flowData)?.nodes.find((n) => n.id === item.id);
      //   unref(plumb).addToDragSelection(document.getElementById(node.id));
      //   unref(currentSelectGroup).push(node);
      // });
    });
  }

  // 画布放大
  const zoomIn = throttle(() => {
    const { scale, x, y } = scaleBigger({
      scale: container.scale,
      x: container.pos.left,
      y: container.pos.top,
    });
    container.scale = scale;
    unref(plumb).setZoom(container.scale);
    container.pos.left = x;
    container.pos.top = y;
  }, 50);

  // 画布缩小
  const zoomOut = throttle(() => {
    const { scale, x, y } = scaleSmaller({
      scale: container.scale,
      x: container.pos.left,
      y: container.pos.top,
    });
    container.scale = scale;
    unref(plumb).setZoom(container.scale);
    container.pos.left = x;
    container.pos.top = y;
  }, 50);

  // 画布自适应
  function zoomFit() {
    const nodes = unref(flowData)?.nodes || [];
    if (!nodes.length) {
      return;
    }
    const { zoomLevel, x, y } = getZoomToFit(nodes);
    container.scale = zoomLevel;
    unref(plumb).setZoom(zoomLevel);
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
            nodeDelete(node.id);
          },
          label: '删除节点',
        },
      ],
    });
  }

  // 粘贴
  function paste() {
    let dis = 0;
    clipboard.forEach((node: INode) => {
      let newNode = cloneDeep(node);
      newNode.id = newNode.type + '-' + utils.getId();
      let nodePos = computeNodePos(mouse.position.x + dis, mouse.position.y + dis);
      newNode.bound.x = nodePos.x;
      newNode.bound.y = nodePos.y;
      dis += 20;
      unref(flowData).nodes.push(newNode);
      emits('update:data', unref(flowData));
      nextTick(() => {
        unref(plumb).addNode(newNode);
      });
    });
  }

  // 全选
  function selectAll() {
    unref(flowData).nodes.forEach((node: INode) => {
      plumb.value.addToDragSelection(document.getElementById(node.id));
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
      clipboard = cloneDeep(unref(currentSelectGroup));
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
  function nodeDelete(deleteNodes: string[] | string) {
    let nodes = unref(flowData).nodes;
    let arr: string[] = Array.isArray(deleteNodes) ? deleteNodes : [deleteNodes];

    status.value = FlowStatusEnum.LOADING;

    handleDelete(arr);

    function handleDelete(arr) {
      arr.forEach((c) => {
        let inx = nodes.findIndex((node: INode) => node.id === c);
        let node = nodes.find((node: INode) => node.id === c);
        // 删除子链接信息
        unref(plumb).deleteNode(c);
        nodes.splice(inx, 1);
        if (node?.children && node.children.length > 0) {
          handleDelete(node.children);
        }
      });
    }

    status.value = FlowStatusEnum.CREATE;
    emits('update:data', unref(flowData));
    selectContainer();
  }

  // 清除画布已选内容
  function selectContainer() {
    currentSelect.value = {} as INode | IEdge;
    currentSelectGroup.value = [];
  }
  // 更新多选节点位置
  // TODO 存在问题
  function updateNodePos() {
    let nodes = unref(flowData).nodes;
    unref(currentSelectGroup).forEach((node) => {
      let dom = document.getElementById(node.id) as HTMLElement;
      let l = parseInt(dom?.style?.left);
      let t = parseInt(dom?.style?.top);
      let f = nodes.find((n: INode) => n.id === node.id);
      f.bound.x = l;
      f.bound.y = t;
    });
  }

  // 更新多选节点位置
  function updateGroupNodePos(parent: INode) {
    if (!parent.children || parent.children.length <= 0) return;
    let nodes = unref(flowData).nodes;
    let children = parent.children;
    children.forEach((node) => {
      let dom = document.getElementById(node) as HTMLElement;
      let l = parseInt(dom?.style?.left);
      let t = parseInt(dom?.style?.top);
      let f = nodes.find((n: INode) => n.id === node);
      f.bound.x = l + parent.bound.x;
      f.bound.y = t + parent.bound.y;
      updateGroupNodePos(f);
    });
  }
  // 更新节点可以状态
  function updateNodeDisable(node: INode) {
    let { disabled } = node;
    let nodes = unref(flowData).nodes;
    let current = nodes.find((n: INode) => n.id === node.id);
    current.disabled = !disabled;
  }

  // 计算辅助线
  function alignForLine(e: Recordable) {
    if (unref(currentSelectGroup).length > 1) return;
    if (container.auxiliaryLine.controlFnTimesFlag) {
      let elId = e.el.id;
      let nodes = unref(flowData).nodes;
      nodes.forEach((node: INode) => {
        if (elId !== node.id) {
          let nodeDom = document.getElementById(node.id);
          let dis = flowConfig.value.defaultStyle.showAuxiliaryLineDistance,
            elPos = e.pos,
            elH = e.el.offsetHeight,
            elW = e.el.offsetWidth,
            disX = elPos['x'] - node.bound.x,
            disY = elPos['y'] - node.bound.y;
          if ((disX >= -dis && disX <= dis) || (disX + elW >= -dis && disX + elW <= dis)) {
            container.auxiliaryLine.isShowYLine = true;
            auxiliaryLinePos.x = node.bound.x + container.pos.left;
            let nodeMidPointX = node.bound.x + nodeDom!.offsetWidth / 2;
            if (nodeMidPointX === elPos[0] + elW / 2) {
              auxiliaryLinePos.x = nodeMidPointX + container.pos.left;
            }
          }
          if ((disY >= -dis && disY <= dis) || (disY + elH >= -dis && disY + elH <= dis)) {
            container.auxiliaryLine.isShowXLine = true;
            auxiliaryLinePos.y = node.bound.y + container.pos.top;
            let nodeMidPointY = node.bound.y + nodeDom!.offsetHeight / 2;
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

  function getWaypoints(startPoints, endPoints, segment) {
    let res = [startPoints];
    segment.forEach((item) => {
      let moveX = item.x2 - item.x1;
      let moveY = item.y2 - item.y1;
      let lastPoint = res[res.length - 1];
      res.push({ x: lastPoint.x + moveX, y: lastPoint.y + moveY });
    });
    if (JSON.stringify(res[res.length - 1]) !== JSON.stringify(endPoints)) {
      res.push(endPoints);
    }
    return res;
  }

  // 画布初始化
  function initJsPlumb() {
    plumb.value = new plumbRegister({
      container: document.getElementById('flowContainer'),
      ...unref(flowConfig).jsPlumbInsConfig,
    });
    unref(plumb).nodeRegister(commonNodes);
  }

  // 事件绑定
  function eventRegister() {
    unref(plumb).bind(EVENT_CONNECTION_DRAG, () => {
      unref(ds).stop();
    });
    unref(plumb).bind(EVENT_CONNECTION_ABORT, () => {
      unref(ds).start();
    });
    // 建立连接
    unref(plumb).bind(CONNECTION, (conn: Recordable) => {
      unref(ds).start();
      const { connection, sourceEndpoint, targetEndpoint } = conn;
      let o: Recordable = {};
      let id = connection.parameters.id || 'edge-' + utils.getId();
      connection.id = id;
      let startPoint = {
        x: sourceEndpoint.parameters.x,
        y: sourceEndpoint.parameters.y,
      };
      let endPoint = {
        x: targetEndpoint.parameters.x,
        y: targetEndpoint.parameters.y,
      };
      if (status.value === FlowStatusEnum.CREATE || status.value === FlowStatusEnum.MODIFY) {
        // 新建链接
        o.id = id;
        o.type = connection.connector.type;
        // 设置文字位置与内容
        o.text = {
          value: '',
        };
        o.sourceNodeId = conn.sourceId;
        o.targetNodeId = conn.targetId;
        // 计算端点位置
        o.startPoint = startPoint;
        o.endPoint = endPoint;
        o.wayPoints = getWaypoints(startPoint, endPoint, connection.connector.segments);
        flowData.value.edges.push(o);
      } else if (status.value === FlowStatusEnum.LOADING) {
        // 加载链接
      }
      // 添加标签
      unref(plumb).addOverlay(connection, {
        type: 'Label',
        options: {
          id: `${connection.id}__label`,
          label: connection.parameters.label || '',
          location: 0.5,
        },
      });
      unref(plumb).addOverlay(connection, {
        type: 'Custom',
        options: {
          id: `${connection.id}__labelEditor`,
          create: () => {
            const d = document.createElement('input');
            const label = connection.getOverlay(`${connection.id}__label`);
            d.setAttribute('autofocus', 'true');
            d.value = label.getLabel();
            const func = () => {
              connection.getOverlay(`${connection.id}__labelEditor`).setVisible(false);
              label.setVisible(true);
              label.setLabel(d.value);
              flowData.value.edges.find((edge: IEdge) => edge.id === connection.id).text.value =
                d.value;
            };
            d.addEventListener('blur', func);
            return d;
          },
          location: 0.5,
        },
      });
      connection.getOverlay(`${connection.id}__labelEditor`).setVisible(false);
    });
    // 拖拽开始
    unref(plumb).bind(EVENT_DRAG_START, ({ e, el, dragGroup }) => {
      if (!currentSelectGroup.value.find((item) => item.id === el.id)) {
        unref(plumb).clearDragSelection();
      }
      unref(ds).stop();
    });
    // 拖拽中
    unref(plumb).bind(EVENT_DRAG_MOVE, (e) => {
      if (flowConfig.value.defaultStyle.isOpenAuxiliaryLine) {
        alignForLine(e);
      }
    });
    // 拖拽结束
    unref(plumb).bind(EVENT_DRAG_STOP, ({ e, el, elements, payload }) => {
      unref(ds).start();
      elements.forEach(({ el, e, pos, dropGroup, originalGroup }) => {
        let currentNode = flowData.value.nodes.find((n) => n.id === el.id);
        currentNode.bound.x = pos.x;
        currentNode.bound.y = pos.y;
        if (dropGroup) {
          // 拖拽到组内
          unref(plumb).addToGroup(dropGroup.id, document.getElementById(currentNode.id));
        } else if (originalGroup) {
          // 组内拖拽，计算绝对位置
          let parent = flowData.value.nodes.find((n) => n.id === originalGroup.elId);
          currentNode.bound.x += parent.bound.x;
          currentNode.bound.y += parent.bound.y;
        }

        // 更新端点位置
        let endpoints = unref(plumb).getEndpoints(el);
        endpoints.forEach((item) => {
          item.parameters = {
            ...item.parameters,
            x: item.endpoint.x + item.endpoint.w / 2,
            y: item.endpoint.y + item.endpoint.h / 2,
          };
        });
        let edges = getConnectionsByNodeId(currentNode.id);
        // 更新连线数据
        edges.forEach((item) => {
          let currentEdge = flowData.value.edges.find((n) => n.id === item.id);
          currentEdge.startPoint = {
            x: item.endpoints[0].parameters.x,
            y: item.endpoints[0].parameters.y,
          };
          currentEdge.endPoint = {
            x: item.endpoints[1].parameters.x,
            y: item.endpoints[1].parameters.y,
          };
          currentEdge.wayPoints = getWaypoints(
            currentEdge.startPoint,
            currentEdge.endPoint,
            item.connector.segments,
          );
        });
        updateGroupNodePos(currentNode);
      });

      // 是否为组
      if (currentSelectGroup.value.length > 1) {
        // 更新组节点信息
        unref(currentSelectGroup).forEach((item) => {
          unref(plumb).addToDragSelection(document.getElementById(item.id));
        });
        updateNodePos();
      }
      // 隐藏辅助线
      hideAlignLine();
    });
    // 组添加新成员
    unref(plumb).bind(EVENT_GROUP_MEMBER_ADDED, ({ group, el, pos, sourceGroup }) => {
      let parent = unref(flowData).nodes.find((item) => item.id === group.elId);
      parent.children = [...new Set([el.id, ...(parent.children || [])])];
      // unref(plumb).addToDragGroup(
      //   { id: group.id, active: true },
      //   ...group.children.map((i) => i.el),
      // );
    });
    // 组展开
    unref(plumb).bind(EVENT_GROUP_EXPAND, ({ group }) => {});
    // 连线断开
    unref(plumb).bind(EVENT_CONNECTION_DETACHED, ({ connection }) => {
      const edges = unref(flowData).edges;
      edges.splice(
        edges.findIndex((edge: IEdge) => edge.id === connection.id),
        1,
      );
    });
    // 连线点击
    unref(plumb).bind(EVENT_CONNECTION_CLICK, (connection) => {
      event.stopPropagation();
      currentSelect.value = flowData.value.edges.find(
        (l: IEdge) => l.id === connection.parameters.id,
      );
    });
    // 连线双击更改标签
    unref(plumb).bind(EVENT_CONNECTION_DBL_CLICK, (connection) => {
      event.stopPropagation();
      const show = function () {
        connection.getOverlay(`${connection.id}__label`).setVisible(false);
        connection.getOverlay(`${connection.id}__labelEditor`).setVisible(true);
      };
      const hide = function () {
        connection.getOverlay(`${connection.id}__label`).setVisible(true);
        connection.getOverlay(`${connection.id}__labelEditor`).setVisible(false);
        window.removeEventListener('click', hide);
      };
      show();
      window.addEventListener('click', hide);
    });
    // 连线右键
    unref(plumb).bind(EVENT_CONNECTION_CONTEXTMENU, (connection) => {
      event.stopPropagation();
      showLinkContextMenu(event, connection);
    });
  }

  // 数据初始化
  // TODO 待优化 -- 数据管理机制获取指定节点
  function dataInit() {
    if (!unref(plumb)) return;
    status.value = FlowStatusEnum.LOADING;
    unref(plumb).setSuspendDrawing(true);
    try {
      if (flowData.value.nodes && flowData.value.nodes.length > 0) {
        // 添加节点
        flowData.value.nodes.forEach((item) => {
          unref(plumb).addNode(item);
        });
        // 添加到组
        // TODO 存在某些问题
        flowData.value.nodes.forEach((item) => {
          if (item.children && item.children.length > 0) {
            unref(plumb).addToGroup(
              item.id,
              ...item.children.map((i) => document.getElementById(i)),
            );
          }
        });
        // 设置位置
        flowData.value.nodes.forEach((item) => {
          let group = unref(plumb).getGroupFor(document.getElementById(item.id));
          let parent;
          if (group) {
            parent = flowData.value.nodes.find((item) => item.id === group.elId);
          }
          unref(plumb).setPosition(document.getElementById(item.id)!, {
            x: item.bound.x - (parent?.bound.x || 0),
            y: item.bound.y - (parent?.bound.y || 0),
          });
        });
      }

      if (flowData.value.edges && flowData.value.edges.length > 0) {
        flowData.value.edges.forEach((item) => {
          unref(plumb).addEdge(item);
        });
      }
    } catch (e) {
      console.error('渲染失败', e);
    }
    nextTick(() => {
      status.value = FlowStatusEnum.MODIFY;
      unref(plumb).setSuspendDrawing(false, true);
    });
    // setTimeout(() => {
    //   setReadOnly(props.readOnly);
    // });
  }

  // 连接线右键
  function showLinkContextMenu(e, connection) {
    createContextMenu({
      event: e,
      items: [
        {
          handler: () => {
            deleteLink(connection);
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
  function deleteLink(connection) {
    let sourceId = connection.sourceId;
    let targetId = connection.targetId;
    unref(plumb).deleteConnection(connection);
    let edges = unref(flowData).edges;
    edges.splice(
      edges.findIndex(
        (edge: IEdge) => edge.sourceNodeId === sourceId && edge.targetNodeId === targetId,
      ),
      1,
    );
    emits('update:data', unref(flowData));
    selectContainer();
  }

  onMounted(() => {
    mutipleDrag();
    ready(() => {
      initJsPlumb();
      eventRegister();
    });
  });

  defineExpose({
    container,
    nodeDelete,
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
      // if (tempLinkId !== '') {
      //   // 清除连接线焦点
      //   let connection = unref(plumb).getConnections({
      //     target: unref(flowData).edges.find((i) => i.id === tempLinkId)?.targetId,
      //     source: unref(flowData).edges.find((i) => i.id === tempLinkId)?.sourceId,
      //   })[0];
      //   if (connection) connection.removeClass('link-active');
      //   tempLinkId = '';
      // }
      // // 设置连接线焦点
      // if (unref(currentSelect).type === 'link') {
      //   tempLinkId = unref(currentSelect).id;
      //   let connection = unref(plumb).getConnections({
      //     target: unref(flowData).edges.find((i) => i.id === tempLinkId)?.targetId,
      //     source: unref(flowData).edges.find((i) => i.id === tempLinkId)?.sourceId,
      //   })[0];
      //   if (connection) connection.addClass('link-active');
      // }
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
      unref(plumb).setReadOnly(v);
    },
  );
</script>

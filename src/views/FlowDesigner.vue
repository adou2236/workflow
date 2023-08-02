<template>
  <el-container class="flow-wrapper">
    <!-- 左侧边组件元素 -->
    <flow-element @setDragInfo="setDragInfo" />
    <el-container class="is-vertical">
      <!-- 工具区 -->
      <Toolbar
        :currentTool="currentTool"
        :flowData="flowData"
        v-model:readOnly="readOnly"
        :readOnly="readOnly"
        @showData="showData"
        @generateFlowImage="
          generateFlowImage(
            flowData.nodeList,
            flowConfig.defaultStyle.photoBlankDistance,
            checkFlow,
          )
        "
        @clear="clear"
        @toggleShowGrid="toggleShowGrid"
        @setting="setting"
        @openTest="openTest"
        @shortcutHelper="shortcutHelper"
        @saveFlow="saveFlow"
      />
      <!-- 画布区 -->
      <el-main class="flow-content">
        <flow-area
          ref="flowAreaRef"
          :dragInfo="dragInfo"
          :config="flowConfig"
          v-model:data="flowData"
          v-model:select="currentSelect"
          v-model:selectGroup="currentSelectGroup"
          @setNodeParams="setNodeParams"
          @onShortcutKey="onShortcutKey"
          @saveFlow="saveFlow"
        />
      </el-main>
    </el-container>
    <el-drawer v-model="nodeSettingDrawer" title="节点设置">
      <el-form :model="currentSelect">
        <el-form-item label="重命名" props="displayName">
          <el-input v-model="currentSelect.displayName" />
        </el-form-item>
      </el-form>
      <el-divider />
      <Fc
        :rule="currentSelect.parameters.rule"
        :option="currentSelect.parameters.options"
        @submit="onSubmit"
      />
    </el-drawer>
  </el-container>

  <el-dialog v-model="dialogVisible">
    <json-viewer :value="flowData" :expand-depth="3" boxed copyable v-if="dialogVisible" />
  </el-dialog>

  <!-- 生成流程图片 -->
  <el-dialog
    :title="'流程设计图_' + flowData.attr.id + '.png'"
    centered
    width="90%"
    :closable="false"
    :maskClosable="false"
    v-model="flowImage.modalVisible"
    okText="下载到本地"
    cancelText="取消"
    @ok="downLoadFlowImage(flowData.attr.id)"
    @cancel="cancelDownLoadFlowImage"
  >
    <img :src="flowImage.url" style="width: 100%" />
  </el-dialog>

  <!-- 设置 -->
  <!--  <SettingModal v-model:settingVisible="settingVisible" v-model:config="flowConfig" />-->

  <!--  &lt;!&ndash; 快捷键大全 &ndash;&gt;-->
  <!--  <ShortcutKeyModal v-model:shortcutVisible="shortcutVisible" />-->

  <!--  &lt;!&ndash; 测试 &ndash;&gt;-->
  <!--  <TestModal v-model:testVisible="testVisible" :flowData="flowData" @loadFlow="loadFlow" />-->
</template>

<script lang="ts" setup>
  import { reactive, ref, onMounted, unref, nextTick } from 'vue';
  import { message } from 'ant-design-vue';
  import { cloneDeep } from 'lodash-es';
  import { ls } from 'vue-lsp';
  import FlowArea from './modules/FlowArea.vue';
  import FlowElement from './modules/FlowElement.vue';
  import Toolbar from './modules/Toolbar.vue';
  import formCreate from '@form-create/element-ui';
  import { tools } from '@/config/tools';
  import { INode, ILink, ITool, IElement } from '@/type';
  import { FlowStatusEnum } from '@/type/enums';
  import { utils, setFlowConfig } from '@/utils/common';
  import { useContextMenu } from '@/hooks/useContextMenu';
  import { useGenerateFlowImage } from '/@/hooks/useGenerateFlowImage';
  import { useShortcutKey } from '@/hooks/useShortcutKey';
  import { flowConfig as defaultFlowConfig, settingConfig } from '@/config/flow';
  import { JsonViewer } from 'vue3-json-viewer';
  import 'vue3-json-viewer/dist/index.css';

  const Fc = formCreate.$form();
  const [createContextMenu] = useContextMenu();

  // 生成流程图片
  const { flowImage, downLoadFlowImage, cancelDownLoadFlowImage, generateFlowImage } =
    useGenerateFlowImage();

  // 快捷键
  const { listenShortcutKey, offShortcutKey, onShortcutKey } = useShortcutKey();

  // 流程配置
  const flowConfig = ref(cloneDeep(defaultFlowConfig));

  // 流程实例
  const plumb = ref();

  // 只读
  const readOnly = ref(false);

  // 当前工具类型
  const currentTool = ref<ITool>(tools[0]);

  // 画布Ref
  const flowAreaRef = ref();

  const fapi = ref(null);

  // 设置弹窗显隐
  const settingVisible = ref<boolean>(false);

  // 节点设置
  const nodeSettingDrawer = ref<boolean>(false);

  // 快捷键弹窗显隐
  const shortcutVisible = ref<boolean>(false);

  // 测试弹窗显隐
  const testVisible = ref<boolean>(false);
  const dialogVisible = ref<boolean>(false);

  // 流程DSL
  const flowData = reactive<Recordable>({
    nodeList: [],
    linkList: [],
    attr: {
      id: '',
    },
    config: {
      showGrid: true,
      showGridText: '隐藏网格',
    },
    status: FlowStatusEnum.CREATE,
  });

  // 当前选择节点
  const currentSelect = ref<INode | ILink>();

  // 当前选择组
  const currentSelectGroup = ref<INode[]>([]);

  // 拖拽组件元素信息
  const dragInfo = ref<IElement | null>(null);

  // 初始化流程图
  function initFlow() {
    if (flowData.status === FlowStatusEnum.CREATE) {
      flowData.attr.id = 'flow-' + utils.getId();
    } else {
      loadFlow();
    }
  }

  // TODO 渲染流程
  async function loadFlow(str = '') {
    // clear();
    // await nextTick();
    // const loadData = JSON.parse(str);
    // flowData.attr = loadData.attr;
    // flowData.config = loadData.config;
    // flowData.status = FlowStatusEnum.LOADING;
    // unref(plumb).batch(async () => {
    //   const nodeList = loadData.nodeList;
    //   nodeList.forEach((node: INode) => {
    //     flowData.nodeList.push(node);
    //   });
    //
    //   await nextTick();
    //   const linkList = loadData.linkList;
    //   linkList.forEach((link: ILink) => {
    //     flowData.linkList.push(link);
    //     let conn = unref(plumb).connect({
    //       source: link.sourceId,
    //       target: link.targetId,
    //       anchor: unref(flowConfig).jsPlumbConfig.anchor.default,
    //       connector: [link.cls.linkType, unref(flowConfig).jsPlumbInsConfig.Connector?.[1]],
    //       paintStyle: {
    //         stroke: link.cls.linkColor,
    //         strokeWidth: link.cls.linkThickness,
    //       },
    //     });
    //     let link_id = conn.canvas.id;
    //     let link_dom = document.querySelector('.' + link_id);
    //     let labelHandle = (e: Event) => {
    //       e.stopPropagation();
    //       currentSelect.value = flowData.linkList.find((l: ILink) => l.id === link_id);
    //     };
    //
    //     if (link.label !== '') {
    //       conn.setLabel({
    //         label: link.label,
    //         cssClass: `linkLabel ${link_id}`,
    //       });
    //
    //       // 添加label点击事件
    //       link_dom?.addEventListener('click', labelHandle);
    //     } else {
    //       // 移除label点击事件
    //       link_dom?.removeEventListener('click', labelHandle);
    //     }
    //   });
    //
    //   clearSelect();
    //   flowData.status = FlowStatusEnum.MODIFY;
    // }, true);
    //
    // unref(flowAreaRef).container.pos = {
    //   top: 0,
    //   left: 0,
    // };
  }

  // 检测流程数据有效性
  function checkFlow() {
    let nodeList = flowData.nodeList;

    if (nodeList.length <= 0) {
      message.error('流程图中无任何节点！');
      return false;
    }
    return true;
  }

  // 保存流程
  function saveFlow() {
    let flowObj = Object.assign({}, flowData);

    if (!checkFlow()) return;
    flowObj.status = FlowStatusEnum.SAVE;
    message.success('保存流程成功！请查看控制台。');
    console.log(flowObj);
  }

  // 拖拽节点进入画布
  function setDragInfo(info: IElement) {
    dragInfo.value = setDefault(info);
  }

  function setDefault(info: IElement) {
    return {
      ...info,
      displayName: info.nodeName,
      disabled: false,
      value: {}, // 节点内部属性值
    };
  }

  // TODO 键盘移动节点
  function moveNode(type: string) {
    let m = unref(flowConfig).defaultStyle.movePx,
      isX = true;
    switch (type) {
      case 'left':
        m = -m;
        break;
      case 'up':
        m = -m;
        isX = false;
        break;
      case 'right':
        break;
      case 'down':
        isX = false;
        break;
    }

    if (unref(currentSelectGroup).length > 0) {
      unref(currentSelectGroup).forEach((node) => {
        if (isX) {
          node.x += m;
        } else {
          node.y += m;
        }
      });
    } else if (unref(currentSelect)?.id) {
      if (isX) {
        (unref(currentSelect) as INode).x += m;
      } else {
        (unref(currentSelect) as INode).y += m;
      }
    }

    unref(plumb).repaintEverything();
  }

  // TODO 清除画布
  function clear() {
    // flowData.nodeList.forEach((node: INode) => {
    //   unref(plumb).remove(node.id);
    // });
    // clearSelect();
    // flowData.nodeList = [];
    // flowData.linkList = [];
  }

  // 清除当前选择节点
  function clearSelect() {
    currentSelect.value = undefined;
    currentSelectGroup.value = [];
  }

  // 显示隐藏网格
  function toggleShowGrid() {
    let flag = flowData.config.showGrid;
    flowData.config.showGrid = !flag;
    flowData.config.showGridText = flag ? '显示网格' : '隐藏网格';
  }

  function showData() {
    dialogVisible.value = true;
  }
  // 测试
  function openTest() {
    testVisible.value = true;
  }

  // 设置
  function setting() {
    settingVisible.value = true;
  }

  // 快捷键大全
  function shortcutHelper() {
    shortcutVisible.value = true;
  }

  // 点击节点设置项
  function setNodeParams(node) {
    nextTick(() => {
      nodeSettingDrawer.value = true;
    });
  }

  //
  function onSubmit(formData) {
    console.log(formData);
  }

  // 初始画布设置
  function initSettingConfig() {
    if (!ls.get('settingConfig')) {
      ls.set('settingConfig', settingConfig);
    } else {
      flowConfig.value = setFlowConfig(unref(flowConfig), ls.get('settingConfig'));
    }
  }

  onMounted(() => {
    // // 实例化JsPlumb
    // initJsPlumb();

    // 初始化快捷键
    // listenShortcutKey(unref(flowAreaRef), {
    //   selectTool,
    //   moveNode,
    //   saveFlow,
    //   openTest,
    // });

    // 初始画布设置
    initSettingConfig();

    // 初始化流程图
    initFlow();
  });
</script>

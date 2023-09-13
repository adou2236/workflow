<template>
  <el-container class="flow-wrapper">
    <!-- 左侧边组件元素 -->
    <flow-element @setDragInfo="setDragInfo" />
    <el-container class="is-vertical">
      <!-- 工具区 -->
      <Toolbar
        :flowData="flowData"
        v-model:readOnly="readOnly"
        @showData="showData"
        @showDataXML="showDataXML"
        @generateFlowImage="
          generateFlowImage(flowData.nodes, flowConfig.defaultStyle.photoBlankDistance, checkFlow)
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
          :read-only="readOnly"
          v-model:data="flowData"
          v-model:select="currentSelect"
          v-model:selectGroup="currentSelectGroup"
          @setNodeParams="setNodeParams"
          @onShortcutKey="onShortcutKey"
          @saveFlow="saveFlow"
        />
      </el-main>
    </el-container>
    <!--    <el-drawer v-model="nodeSettingDrawer" title="节点设置">-->
    <!--      <el-form :model="currentSelect">-->
    <!--        <el-form-item label="重命名" props="displayName">-->
    <!--          <el-input v-model="currentSelect.displayName" />-->
    <!--        </el-form-item>-->
    <!--      </el-form>-->
    <!--      <el-divider />-->
    <!--      <Fc-->
    <!--        v-if="nodeSettingDrawer"-->
    <!--        :rule="currentSelect.parameters.rule"-->
    <!--        :option="currentSelect.parameters.options"-->
    <!--        @submit="onSubmit"-->
    <!--      />-->
    <!--    </el-drawer>-->
  </el-container>

  <el-dialog v-model="dialogVisible">
    <json-viewer :value="flowData" :expand-depth="3" boxed copyable v-if="dialogVisible" />
  </el-dialog>

  <!--  &lt;!&ndash; 生成流程图片 &ndash;&gt;-->
  <!--  <el-dialog-->
  <!--    :title="'流程设计图_' + flowData.attr.id + '.png'"-->
  <!--    centered-->
  <!--    width="90%"-->
  <!--    :closable="false"-->
  <!--    :maskClosable="false"-->
  <!--    v-model="flowImage.modalVisible"-->
  <!--    okText="下载到本地"-->
  <!--    cancelText="取消"-->
  <!--    @ok="downLoadFlowImage(flowData.attr.id)"-->
  <!--    @cancel="cancelDownLoadFlowImage"-->
  <!--  >-->
  <!--    <img :src="flowImage.url" style="width: 100%" />-->
  <!--  </el-dialog>-->

  <!-- 设置 -->
  <!--  <SettingModal v-model:settingVisible="settingVisible" v-model:config="flowConfig" />-->

  <!--  &lt;!&ndash; 快捷键大全 &ndash;&gt;-->
  <!--  <ShortcutKeyModal v-model:shortcutVisible="shortcutVisible" />-->

  <!--  &lt;!&ndash; 测试 &ndash;&gt;-->
  <!--  <TestModal v-model:testVisible="testVisible" :flowData="flowData" @loadFlow="loadFlow" />-->
</template>

<script lang="ts" setup>
  import { reactive, ref, onMounted, unref, nextTick } from 'vue';
  import FlowArea from './modules/FlowArea.vue';
  import FlowElement from './modules/FlowElement.vue';
  import Toolbar from './modules/Toolbar.vue';
  import formCreate from '@form-create/element-ui';
  import { INode, IEdge, OriginNode, IProcess } from '@/type';
  import { useGenerateFlowImage } from '@/hooks/useGenerateFlowImage';
  import { useShortcutKey } from '@/hooks/useShortcutKey';
  import { JsonViewer } from 'vue3-json-viewer';
  import 'vue3-json-viewer/dist/index.css';
  import { extraProps } from '@/config/const';

  const Fc = formCreate.$form();

  // 生成流程图片
  const { flowImage, downLoadFlowImage, cancelDownLoadFlowImage, generateFlowImage } =
    useGenerateFlowImage();

  // 快捷键
  const { listenShortcutKey, offShortcutKey, onShortcutKey } = useShortcutKey();

  // 流程配置
  const flowConfig = ref({});

  // 流程实例
  const plumb = ref();

  // 适配器实例
  const adapt = ref();

  // 只读
  const readOnly = ref(false);

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
  const dialogVisible2 = ref<boolean>(false);

  // 流程DSL
  const flowData = reactive<IProcess>({
    id: 'ggg',
    nodes: [
      {
        type: 'bpmn:subProcess',
        properties: {
          isExpanded: false,
          width: 800,
          height: 400,
        },
        id: 'bpmn:subProcess-8e9b6c1a38164a3dab3947d4962b68d6',
        bound: {
          width: 800,
          height: 400,
          x: 205,
          y: 210,
        },
        text: {
          value: '子流程',
        },
        children: [
          {
            type: 'bpmn:subProcess',
            properties: {
              isExpanded: false,
              width: 400,
              height: 200,
            },
            id: 'bpmn:subProcess-083571aa61b544c4818e2cc53b626404',
            bound: {
              width: 400,
              height: 200,
              x: 30,
              y: 30,
            },
            text: {
              value: '子流程',
            },
            children: [
              {
                type: 'bpmn:inclusiveGateway',
                properties: {
                  parameters: {},
                },
                id: 'bpmn:inclusiveGateway-4f5cf1e475d442c48ead915ba14b81a1',
                bound: {
                  width: 50,
                  height: 50,
                  x: 10,
                  y: 10,
                },
                text: {
                  value: '包容网关',
                },
              },
            ],
          },
        ],
      },
    ],
    edges: [],
  });

  // 当前选择节点
  const currentSelect = ref<INode | IEdge>();

  // 当前选择组
  const currentSelectGroup = ref<INode[]>([]);

  // 拖拽组件元素信息
  const dragInfo = ref<OriginNode | null>(null);

  // TODO 渲染流程
  // 检测流程数据有效性
  function checkFlow() {
    let nodeList = flowData.value.nodeList;

    if (nodeList.length <= 0) {
      console.error('流程图中无任何节点！');
      return false;
    }
    return true;
  }

  // 拖拽节点进入画布
  function setDragInfo(info: OriginNode) {
    window.dragInfo = info;
  }

  // 设置初始设置
  function setDefault(info: OriginNode) {
    return {
      ...info,
      text: {
        value: info.basicConfig?.name || '',
      },
    };
  }

  // TODO 清除画布
  function clear() {
    flowAreaRef.value.clear();
  }

  // 清除当前选择节点
  function clearSelect() {
    currentSelect.value = undefined;
    currentSelectGroup.value = [];
  }

  // 显示隐藏网格
  function toggleShowGrid() {}

  function showData() {
    dialogVisible.value = true;
  }
  function showDataXML() {
    console.log(flowAreaRef.value.plumb.adapterOut(flowData));
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

  onMounted(() => {
    // 初始化快捷键
    // listenShortcutKey(unref(flowAreaRef), {
    //   selectTool,
    //   moveNode,
    //   saveFlow,
    //   openTest,
    // });
    // 初始画布设置
    // initSettingConfig();
    // 初始化流程图
    // initFlow();
  });
</script>

<style lang="scss">
  $primary-color: #0960bd;

  .flow-wrapper {
    height: 100%;
    user-select: none;

    .ant-list-item {
      margin-bottom: 8px !important;
    }

    .ant-list {
      padding-left: 6px;
    }
  }

  .flow-element {
    position: relative;
    box-shadow: 3px 0 10px #999;

    .tab {
      background-color: #002752;
      border-top: 1px dashed $primary-color;
      border-bottom: 1px dashed $primary-color;
      border-left: 2px solid $primary-color;
      text-align: center;
      margin-bottom: 10px;
      font-size: 12px;
      height: 26px;
      line-height: 22px;
      color: #fff;
      width: 100%;
    }

    .ant-row {
      padding-bottom: 10px;
    }
  }

  .header-option {
    background: #fff;
    height: 36px;
    line-height: 36px;
    padding: 0 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    box-shadow: 0 3px 5px #ddd;
    position: relative;
    z-index: 100;

    &__tools {
      > span {
        margin-right: 6px;
      }
    }

    &__button {
      border: 0;
      margin-left: 8px;
      color: #333;
    }
  }

  .flow-content {
    background: #fafafa;
    height: 100%;
    border: 1px dashed rgb(170 170 170 / 70%);
  }

  .flow-footer {
    display: flex;
    justify-content: center;
    align-items: center;

    &.ant-layout-footer {
      padding: 4px 8px;
    }
  }

  .node-item {
    height: 32px;
    width: 32px;
    border-radius: 5px;
    line-height: 32px;
    text-align: left;
    cursor: move;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      color: $primary-color;
      outline: 1px dashed $primary-color;
    }
  }

  .linkLabel {
    background-color: white;
    padding: 1px;
    border: 1px solid #346789;
    border-radius: 5px;
    opacity: 0.8;
    z-index: 3;
  }
</style>

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
    <el-drawer v-model="nodeSettingDrawer" title="节点设置">
      <el-form :model="currentSelect">
        <el-form-item label="重命名" props="displayName">
          <el-input v-model="currentSelect.displayName" />
        </el-form-item>
      </el-form>
      <el-divider />
      <Fc
        v-if="nodeSettingDrawer"
        :rule="currentSelect.parameters.rule"
        :option="currentSelect.parameters.options"
        @submit="onSubmit"
      />
    </el-drawer>
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
  import { INode, ILink, ITool, IElement } from '@/type';
  import { FlowStatusEnum } from '@/type/enums';
  import { utils } from '@/utils/common';
  import { useGenerateFlowImage } from '@/hooks/useGenerateFlowImage';
  import { useShortcutKey } from '@/hooks/useShortcutKey';
  import { JsonViewer } from 'vue3-json-viewer';
  import 'vue3-json-viewer/dist/index.css';

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

  // 只读
  const readOnly = ref(true);

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
  // const flowData = reactive<Recordable>({
  //   nodeList: [],
  //   linkList: [],
  //   attr: {
  //     id: '',
  //   },
  //   config: {
  //     showGrid: true,
  //     showGridText: '隐藏网格',
  //   },
  //   status: FlowStatusEnum.CREATE,
  // });
  const flowData = ref<Recordable>();

  // 当前选择节点
  const currentSelect = ref<INode | ILink>();

  // 当前选择组
  const currentSelectGroup = ref<INode[]>([]);

  // 拖拽组件元素信息
  const dragInfo = ref<IElement | null>(null);

  // 初始化流程图
  function initFlow() {
    if (flowData.value.status === FlowStatusEnum.CREATE) {
      flowData.value.attr.id = 'flow-' + utils.getId();
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
    let nodeList = flowData.value.nodeList;

    if (nodeList.length <= 0) {
      console.error('流程图中无任何节点！');
      return false;
    }
    return true;
  }

  // 保存流程
  function saveFlow() {
    let flowObj = Object.assign({}, flowData);

    if (!checkFlow()) return;
    flowObj.status = FlowStatusEnum.SAVE;
    console.log('保存流程成功！请查看控制台。');
  }

  // 拖拽节点进入画布
  function setDragInfo(info: IElement) {
    dragInfo.value = setDefault(info);
    event.dataTransfer.setData('dragInfo', JSON.stringify(dragInfo.value));
  }

  // 设置初始设置
  function setDefault(info: IElement) {
    return {
      ...info,
      displayName: info.nodeName,
      disabled: false,
      value: {}, // 节点内部属性值
    };
  }

  // // TODO 键盘移动节点
  // function moveNode(type: string) {
  //   let m = unref(flowConfig).defaultStyle.movePx,
  //     isX = true;
  //   switch (type) {
  //     case 'left':
  //       m = -m;
  //       break;
  //     case 'up':
  //       m = -m;
  //       isX = false;
  //       break;
  //     case 'right':
  //       break;
  //     case 'down':
  //       isX = false;
  //       break;
  //   }
  //
  //   if (unref(currentSelectGroup).length > 0) {
  //     unref(currentSelectGroup).forEach((node) => {
  //       if (isX) {
  //         node.x += m;
  //       } else {
  //         node.y += m;
  //       }
  //     });
  //   } else if (unref(currentSelect)?.id) {
  //     if (isX) {
  //       (unref(currentSelect) as INode).x += m;
  //     } else {
  //       (unref(currentSelect) as INode).y += m;
  //     }
  //   }
  //
  //   unref(plumb).repaintEverything();
  // }

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

  function handle() {
    flowAreaRef.value.setStatus('common-74f27436a41f44bcb09eaf57a6019149', '', '');
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
    nextTick(() => {
      flowData.value = {
        nodeList: [
          {
            type: 'common',
            nodeName: '触发器0',
            icon: 'Bell',
            inputs: [],
            outputs: ['output1'],
            formalParameter: ['key', 'name'],
            flowType: 'trigger',
            parameters: {
              options: {
                form: {
                  labelPosition: 'right',
                  size: 'mini',
                  labelWidth: '125px',
                  hideRequiredAsterisk: false,
                  showMessage: true,
                  inlineMessage: false,
                },
                submitBtn: true,
                resetBtn: true,
              },
              rule: [
                {
                  type: 'input',
                  field: 'Fgl35zs712gen',
                  title: '输入框',
                  info: '',
                  _fc_drag_tag: 'input',
                  hidden: false,
                  display: true,
                },
                {
                  type: 'inputNumber',
                  field: 'F7ap5zs712ub0',
                  title: '计数器',
                  info: '',
                  _fc_drag_tag: 'inputNumber',
                  hidden: false,
                  display: true,
                },
                {
                  type: 'radio',
                  field: 'Fmpd5zs7137v5',
                  title: '单选框',
                  info: '',
                  effect: {
                    fetch: '',
                  },
                  options: [
                    {
                      value: '1',
                      label: '选项1',
                    },
                    {
                      value: '2',
                      label: '选项2',
                    },
                  ],
                  _fc_drag_tag: 'radio',
                  hidden: false,
                  display: true,
                },
              ],
            },
            displayName: '触发器0',
            disabled: false,
            value: {},
            id: 'common-21657bad7c00400a8c829ff044e3ca30',
            x: 5165,
            y: 5045,
          },
          {
            type: 'common',
            nodeName: '动作2',
            icon: 'House',
            inputs: ['input1'],
            outputs: ['output1'],
            formalParameter: ['key', 'name'],
            flowType: 'action',
            parameters: {
              options: {
                form: {
                  labelPosition: 'right',
                  size: 'mini',
                  labelWidth: '125px',
                  hideRequiredAsterisk: false,
                  showMessage: true,
                  inlineMessage: false,
                },
                submitBtn: true,
                resetBtn: true,
              },
              rule: [
                {
                  type: 'input',
                  field: 'Fgl35zs712gen',
                  title: '输入框',
                  info: '',
                  _fc_drag_tag: 'input',
                  hidden: false,
                  display: true,
                },
                {
                  type: 'inputNumber',
                  field: 'F7ap5zs712ub0',
                  title: '计数器',
                  info: '',
                  _fc_drag_tag: 'inputNumber',
                  hidden: false,
                  display: true,
                },
                {
                  type: 'radio',
                  field: 'Fmpd5zs7137v5',
                  title: '单选框',
                  info: '',
                  effect: {
                    fetch: '',
                  },
                  options: [
                    {
                      value: '1',
                      label: '选项1',
                    },
                    {
                      value: '2',
                      label: '选项2',
                    },
                  ],
                  _fc_drag_tag: 'radio',
                  hidden: false,
                  display: true,
                },
              ],
            },
            displayName: '动作2',
            disabled: false,
            value: {},
            id: 'common-d0947d7784674bb19d33c59d8368b59e',
            x: 5310,
            y: 5310,
          },
          {
            type: 'common',
            nodeName: '逻辑判断',
            icon: 'House',
            inputs: ['input1'],
            outputs: ['true', 'false'],
            formalParameter: ['key', 'name'],
            flowType: 'action',
            parameters: {
              options: {
                form: {
                  labelPosition: 'right',
                  size: 'mini',
                  labelWidth: '125px',
                  hideRequiredAsterisk: false,
                  showMessage: true,
                  inlineMessage: false,
                },
                submitBtn: true,
                resetBtn: true,
              },
              rule: [
                {
                  type: 'input',
                  field: 'Fgl35zs712gen',
                  title: '输入框',
                  info: '',
                  _fc_drag_tag: 'input',
                  hidden: false,
                  display: true,
                },
                {
                  type: 'inputNumber',
                  field: 'F7ap5zs712ub0',
                  title: '计数器',
                  info: '',
                  _fc_drag_tag: 'inputNumber',
                  hidden: false,
                  display: true,
                },
                {
                  type: 'radio',
                  field: 'Fmpd5zs7137v5',
                  title: '单选框',
                  info: '',
                  effect: {
                    fetch: '',
                  },
                  options: [
                    {
                      value: '1',
                      label: '选项1',
                    },
                    {
                      value: '2',
                      label: '选项2',
                    },
                  ],
                  _fc_drag_tag: 'radio',
                  hidden: false,
                  display: true,
                },
              ],
            },
            displayName: '逻辑判断',
            disabled: false,
            value: {},
            id: 'common-c56770095aee4e0581d321230428866d',
            x: 5325,
            y: 5055,
          },
          {
            type: 'common',
            nodeName: '动作2',
            icon: 'House',
            inputs: ['input1'],
            outputs: ['output1'],
            formalParameter: ['key', 'name'],
            flowType: 'action',
            parameters: {
              options: {
                form: {
                  labelPosition: 'right',
                  size: 'mini',
                  labelWidth: '125px',
                  hideRequiredAsterisk: false,
                  showMessage: true,
                  inlineMessage: false,
                },
                submitBtn: true,
                resetBtn: true,
              },
              rule: [
                {
                  type: 'input',
                  field: 'Fgl35zs712gen',
                  title: '输入框',
                  info: '',
                  _fc_drag_tag: 'input',
                  hidden: false,
                  display: true,
                },
                {
                  type: 'inputNumber',
                  field: 'F7ap5zs712ub0',
                  title: '计数器',
                  info: '',
                  _fc_drag_tag: 'inputNumber',
                  hidden: false,
                  display: true,
                },
                {
                  type: 'radio',
                  field: 'Fmpd5zs7137v5',
                  title: '单选框',
                  info: '',
                  effect: {
                    fetch: '',
                  },
                  options: [
                    {
                      value: '1',
                      label: '选项1',
                    },
                    {
                      value: '2',
                      label: '选项2',
                    },
                  ],
                  _fc_drag_tag: 'radio',
                  hidden: false,
                  display: true,
                },
              ],
            },
            displayName: '动作2',
            disabled: false,
            value: {},
            id: 'common-74f27436a41f44bcb09eaf57a6019149',
            x: 5625,
            y: 5010,
          },
        ],
        linkList: [
          {
            type: 'link',
            id: 'link-e4c707a8f79841078b80d56571daa141',
            sourceId: 'common-21657bad7c00400a8c829ff044e3ca30',
            targetId: 'common-c56770095aee4e0581d321230428866d',
            sourceEndpoint: 'output1',
            targetEndpoint: 'input1',
            label: '',
          },
          {
            type: 'link',
            id: 'link-be8141e936524832808c27f50541ec3f',
            sourceId: 'common-c56770095aee4e0581d321230428866d',
            targetId: 'common-d0947d7784674bb19d33c59d8368b59e',
            sourceEndpoint: 'false',
            targetEndpoint: 'input1',
            label: '',
          },
          {
            type: 'link',
            id: 'link-a40591025b51400e969b63cade1b56ca',
            sourceId: 'common-c56770095aee4e0581d321230428866d',
            targetId: 'common-74f27436a41f44bcb09eaf57a6019149',
            sourceEndpoint: 'true',
            targetEndpoint: 'input1',
            label: '',
          },
          {
            type: 'link',
            id: 'link-fe067fca5b084ea7866c9bb3c87a91df',
            sourceId: 'common-d0947d7784674bb19d33c59d8368b59e',
            targetId: 'common-74f27436a41f44bcb09eaf57a6019149',
            sourceEndpoint: 'output1',
            targetEndpoint: 'input1',
            label: '',
          },
        ],
        attr: {
          id: 'flow-cfb0b971eb4845018c8a59fccf2fa51f',
        },
        status: '3',
      };
    });
  });
</script>

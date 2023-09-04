import { NodeType } from '@/type/enums';
import { OriginNode } from '@/type';
import {
  EndEventConfig,
  ExclusiveGatewayConfig,
  ServiceTaskConfig,
  StartEventConfig,
  SubProcessConfig,
  UserTaskConfig,
} from '@/config/const';

export const commonNodes: OriginNode[] = [
  {
    type: NodeType.START_EVENT,
    basicConfig: {
      name: '开始事件',
      ...StartEventConfig,
      icon: 'bpmn-icon-start-event-none',
    },
    properties: {
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
    },
  },
  {
    type: NodeType.START_EVENT,
    basicConfig: {
      name: '时间开始事件',
      ...StartEventConfig,
      icon: 'bpmn-icon-start-event-timer',
    },
    properties: {
      definitionType: NodeType.TIMER_EVENT_DEFINITION,
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
    },
  },
  {
    type: NodeType.END_EVENT,
    basicConfig: {
      name: '结束事件',
      ...EndEventConfig,
      icon: 'bpmn-icon-end-event-none',
    },
    properties: {
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
    },
  },
  {
    type: NodeType.USER_TASK,
    basicConfig: {
      name: '用户任务',
      ...UserTaskConfig,
      icon: 'bpmn-icon-user',
    },
    properties: {
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
    },
  },
  {
    type: NodeType.SERVER_TASK,
    basicConfig: {
      name: '服务任务',
      ...ServiceTaskConfig,
      icon: 'bpmn-icon-service',
    },
    properties: {
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
    },
  },
  {
    type: NodeType.EXCLUSIVE_GATEWAY,
    basicConfig: {
      name: '排他网关',
      ...ExclusiveGatewayConfig,
      icon: 'bpmn-icon-gateway-xor',
    },
    properties: {
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
    },
  },
  {
    type: NodeType.INCLUSIVE_GATEWAY,
    basicConfig: {
      name: '包容网关',
      ...ExclusiveGatewayConfig,
      icon: 'bpmn-icon-gateway-or',
    },
    properties: {
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
    },
  },
  {
    type: NodeType.PARALLEL_GATEWAY,
    basicConfig: {
      name: '并行网关',
      ...ExclusiveGatewayConfig,
      icon: 'bpmn-icon-gateway-parallel',
    },
    properties: {
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
    },
  },
  {
    type: NodeType.SUB_PROCESS,
    basicConfig: {
      name: '子流程',
      ...SubProcessConfig,
      icon: 'bpmn-icon-subprocess-expanded',
    },
    properties: {
      isExpanded: true,
    },
  },
];

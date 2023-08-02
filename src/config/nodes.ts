import { CommonNodeTypeEnum } from '/@/type/enums';
import { IElement } from '/@/type/index';

export const commonNodes: IElement[] = [
  {
    type: CommonNodeTypeEnum.START,
    nodeName: '开始节点',
    icon: 'Bell',
    inputs: ['input1'],
    outputs: ['output1', 'output2', 'output3'],
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
  {
    type: CommonNodeTypeEnum.START,
    nodeName: '中间节点',
    icon: 'House',
    inputs: ['input1', 'input2', 'input3', 'input4'],
    outputs: ['output1', 'output2'],
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
  {
    type: CommonNodeTypeEnum.START,
    nodeName: '结束节点',
    icon: 'House',
    inputs: ['input1', 'input2', 'input3'],
    outputs: [],
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
];

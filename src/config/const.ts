//@typescript-eslint/no-unused-vars
export const NODE_SIZE = 40; //节点默认尺寸

export const StartEventConfig = {
  width: 40,
  height: 40,
  sourceRules: [],
  targetRules: [
    {
      message: '不可作为终点',
      validate: function ({ sourceNode, targetNode, sourceAnchor, targetAnchor }) {
        return !targetNode;
      },
    },
  ],
};

export const EndEventConfig = {
  width: 40,
  height: 40,
  sourceRules: [
    {
      message: '不可作为起点',
      validate: function ({ sourceNode, sourceAnchor }) {
        return !sourceNode;
      },
    },
    {
      message: '这是另一个条件',
      validate: function ({ sourceNode, sourceAnchor }) {
        return !sourceNode;
      },
    },
  ],
  targetRules: [],
};

export const ExclusiveGatewayConfig = {
  width: 50,
  height: 50,
};

export const InclusiveGatewayConfig = {
  width: 50,
  height: 50,
  icon: '',
};

export const ParallelGatewayConfig = {
  width: 50,
  height: 50,
  icon: '',
};

export const ServiceTaskConfig = {
  width: 100,
  height: 80,
};

export const UserTaskConfig = {
  width: 100,
  height: 80,
  sourceRules: [
    {
      message: '验证错误信息',
      validate: (sourceNode, targetNode, sourceAnchor, targetAnchor) => {
        return true;
      },
    },
  ],
  targetRules: [
    {
      message: '验证错误信息',
      validate: (sourceNode, targetNode, sourceAnchor, targetAnchor) => {
        return true;
      },
    },
  ],
};

export const BoundaryEventConfig = {
  width: 40,
  height: 40,
};

export const IntermediateEventConfig = {
  width: 40,
  height: 40,
  icon: '',
};

export const SubProcessConfig = {
  width: 100,
  height: 80,
};

export const extraProps = {
  transformer: {
    'bpmn:timerEventDefinition': {
      out(data: any) {
        const {
          properties: { timerType, timerValue, definitionId },
        } = data;

        const typeFunc = () =>
          `<bpmn:${timerType} xsi:type="bpmn:tFormalExpression">${timerValue}</bpmn:${timerType}>`;

        return {
          json: `<bpmn:timerEventDefinition id="${definitionId}"${
            timerType && timerValue ? `>${typeFunc()}</bpmn:timerEventDefinition>` : '/>'
          }`,
        };
      },
      in(key: string, data: any) {
        const definitionType = key;
        const definitionId = data['-id'];
        let timerType = '';
        let timerValue = '';
        for (const key of Object.keys(data)) {
          if (key.includes('bpmn:')) {
            [, timerType] = key.split(':');
            timerValue = data[key]?.['#text'];
          }
        }
        return {
          '-definitionId': definitionId,
          '-definitionType': definitionType,
          '-timerType': timerType,
          '-timerValue': timerValue,
        };
      },
    },
  },
};

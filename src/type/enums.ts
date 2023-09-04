export enum NodeType {
  START_EVENT = 'bpmn:startEvent', //开始节点
  TIMER_EVENT_DEFINITION = 'bpmn:timerEventDefinition', //事件开始节点
  END_EVENT = 'bpmn:endEvent', //结束节点
  USER_TASK = 'bpmn:userTask', //用户任务
  SERVER_TASK = 'bpmn:serviceTask', //服务任务
  EXCLUSIVE_GATEWAY = 'bpmn:exclusiveGateway', //排他网关
  INCLUSIVE_GATEWAY = 'bpmn:inclusiveGateway', //包容网关
  PARALLEL_GATEWAY = 'bpmn:parallelGateway', //并行网关
  SUB_PROCESS = 'bpmn:subProcess', //并行网关
}

export enum EdgeType {}

export enum FlowStatusEnum {
  CREATE = '0',
  SAVE = '1',
  MODIFY = '2',
  LOADING = '3',
}

// ID的生成类型。1.uuid uuid 2.time_stamp 时间戳 3.sequence 序列 4.time_stamp_and_sequence 时间戳加序列 5.custom 自定义
export enum IdTypeEnum {
  UUID = 'uuid',
  TIME_STAMP = 'time_stamp',
  SEQUENCE = 'sequence',
  TIME_STAMP_AND_SEQUENCE = 'time_stamp_and_sequence',
  CUSTOM = 'custom',
}

// 节点在工作流中的角色
export enum FLOW_TYPE {
  TRIGGER = 'trigger',
  ACTION = 'action',
}

// 节点、连线状态
export enum NOTIFICATION_STATUS {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

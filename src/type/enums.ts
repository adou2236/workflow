export enum ToolsTypeEnum {
  DRAG = 'drag',
  CONNECTION = 'connection',
}

export enum NodeTypeEnum {
  Common_Node_Type = 'CommonNodeType',
  High_Node_Type = 'HighNodeType',
  Lane_Node_Type = 'LaneNodeType',
}

export enum CommonNodeTypeEnum {
  COMMON = 'common',
  NOTE = 'note',
}

export enum HighNodeTypeEnum {
  CHILD_FLOW = 'child_flow',
}

export enum LaneNodeTypeEnum {
  X_LANE = 'x_lane',
  Y_LANE = 'y_lane',
}

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

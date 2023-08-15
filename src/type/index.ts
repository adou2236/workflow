import {
  ToolsTypeEnum,
  NodeTypeEnum,
  CommonNodeTypeEnum,
  HighNodeTypeEnum,
  LaneNodeTypeEnum,
  FLOW_TYPE,
} from './enums';

import { settingConfig } from '@/config/flow';

export type NodesType = CommonNodeTypeEnum | HighNodeTypeEnum | LaneNodeTypeEnum;

export interface IDragInfo extends IElement {
  belongTo: Nullable<NodeTypeEnum>;
}

export interface ITool {
  type: ToolsTypeEnum;
  nodeName: string;
  icon: string;
}

export interface IElement {
  type: NodesType;
  nodeName: string; //节点唯一名称
  flowType: FLOW_TYPE; // 节点角色 触发器or响应器
  icon: string; // string or http
  inputs: string[];
  outputs: string[];
  args?: string[]; // 模拟形参
  parameters?: {
    options: any;
    rule: any;
  }; // form-create内容
}

export interface INode extends IElement {
  id: string;
  x: number;
  y: number;
  displayName?: string; //节点展示名称
  description?: string; //节点描述
  disabled?: boolean; //是否禁用
  value?: object; // 节点内表单
}

export interface ILink {
  type: string;
  id: string;
  sourceId?: string;
  targetId?: string;
  label: string;
  cls: {
    linkType: string;
    linkColor: string;
    linkThickness: number;
  };
}

export interface IShortcutKey {
  code: string;
  codeName: string;
  shortcutName: string;
}

export interface IZoomConfig {
  scale: number;
  x: number;
  y: number;
}

export type ISettingConfig = typeof settingConfig;

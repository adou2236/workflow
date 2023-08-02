import {
  ToolsTypeEnum,
  NodeTypeEnum,
  CommonNodeTypeEnum,
  HighNodeTypeEnum,
  LaneNodeTypeEnum,
} from './enums';

import { settingConfig } from '../config/flow';

export type NodesType = CommonNodeTypeEnum | HighNodeTypeEnum | LaneNodeTypeEnum;

export interface IDragInfo extends IElement{
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
  icon: string;
  inputs: string[];
  outputs: string[];
  parameters?: {
    options: any;
    rule: any;
  }; // form-create内容
}

export interface INode extends IElement {
  height: number;
  id: string;
  width: number;
  x: number;
  y: number;
  displayName?: string; //节点展示名称
  description?: string; //节点描述
  disabled?: boolean; //是否禁用
  manualTrigger?: boolean; //是否是触发器
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

export type ISettingConfig = typeof settingConfig;

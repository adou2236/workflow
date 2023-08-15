import { ToolsTypeEnum, NodeTypeEnum, CommonNodeTypeEnum, HighNodeTypeEnum, LaneNodeTypeEnum, FLOW_TYPE } from './enums';
import { settingConfig } from '../config/flow';
export declare type NodesType = CommonNodeTypeEnum | HighNodeTypeEnum | LaneNodeTypeEnum;
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
    nodeName: string;
    flowType: FLOW_TYPE;
    icon: string;
    inputs: string[];
    outputs: string[];
    args?: string[];
    parameters?: {
        options: any;
        rule: any;
    };
}
export interface INode extends IElement {
    id: string;
    x: number;
    y: number;
    displayName?: string;
    description?: string;
    disabled?: boolean;
    value?: object;
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
export declare type ISettingConfig = typeof settingConfig;

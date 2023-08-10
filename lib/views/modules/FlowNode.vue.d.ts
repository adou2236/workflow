import { PropType } from 'vue';
import { INode, ILink } from '../../type';
declare const _default: import("vue").DefineComponent<{
    select: {
        type: PropType<INode | ILink>;
        default: () => {};
    };
    selectGroup: {
        type: PropType<INode[]>;
        default: () => never[];
    };
    config: {
        type: ObjectConstructor;
        default: () => {};
    };
    node: {
        type: PropType<INode>;
        default: () => {};
    };
    plumb: {
        type: ObjectConstructor;
        default: () => undefined;
    };
}, {}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("update:select" | "update:selectGroup" | "alignForLine" | "updateNodePos" | "updateNodeDisable" | "nodeDelete" | "setNodeParams" | "hideAlignLine" | "isMultiple" | "showNodeContextMenu")[], "update:select" | "update:selectGroup" | "alignForLine" | "updateNodePos" | "updateNodeDisable" | "nodeDelete" | "setNodeParams" | "hideAlignLine" | "isMultiple" | "showNodeContextMenu", import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    select: {
        type: PropType<INode | ILink>;
        default: () => {};
    };
    selectGroup: {
        type: PropType<INode[]>;
        default: () => never[];
    };
    config: {
        type: ObjectConstructor;
        default: () => {};
    };
    node: {
        type: PropType<INode>;
        default: () => {};
    };
    plumb: {
        type: ObjectConstructor;
        default: () => undefined;
    };
}>> & {
    "onUpdate:select"?: ((...args: any[]) => any) | undefined;
    "onUpdate:selectGroup"?: ((...args: any[]) => any) | undefined;
    onAlignForLine?: ((...args: any[]) => any) | undefined;
    onUpdateNodePos?: ((...args: any[]) => any) | undefined;
    onUpdateNodeDisable?: ((...args: any[]) => any) | undefined;
    onNodeDelete?: ((...args: any[]) => any) | undefined;
    onSetNodeParams?: ((...args: any[]) => any) | undefined;
    onHideAlignLine?: ((...args: any[]) => any) | undefined;
    onIsMultiple?: ((...args: any[]) => any) | undefined;
    onShowNodeContextMenu?: ((...args: any[]) => any) | undefined;
}, {
    select: INode | ILink;
    selectGroup: INode[];
    config: Record<string, any>;
    node: INode;
    plumb: Record<string, any>;
}>;
export default _default;

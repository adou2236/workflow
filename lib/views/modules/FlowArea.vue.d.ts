import { PropType } from 'vue';
import { INode, ILink } from '../../type';
declare function zoomFit(): void;
declare function deleteNode(nodes: INode[] | INode): void;
declare const _default: import("vue").DefineComponent<{
    data: {
        type: ObjectConstructor;
        default: () => {};
    };
    config: {
        type: ObjectConstructor;
        default: () => undefined;
    };
    select: {
        type: PropType<INode | ILink>;
        default: () => {};
    };
    readOnly: {
        type: BooleanConstructor;
        default: boolean;
    };
}, {
    getPreNodes: (nodeId: any) => INode[];
    clear: () => void;
    setStatus: (id: any, status: any, message: any) => void;
    container: {
        pos: {
            top: number;
            left: number;
        };
        dragFlag: boolean;
        draging: boolean;
        scale: number;
        scaleFlag: boolean;
        scaleOrigin: {
            x: number;
            y: number;
        };
        auxiliaryLine: {
            isOpen: boolean;
            isShowXLine: boolean;
            isShowYLine: boolean;
            controlFnTimesFlag: boolean;
        };
    };
    deleteNode: typeof deleteNode;
    zoomOut: import("lodash").DebouncedFunc<() => void>;
    zoomIn: import("lodash").DebouncedFunc<() => void>;
    zoomFit: typeof zoomFit;
    plumb: import("vue").Ref<any>;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("update:select" | "setNodeParams" | "addNode" | "onShortcutKey" | "update:data")[], "update:select" | "setNodeParams" | "addNode" | "onShortcutKey" | "update:data", import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    data: {
        type: ObjectConstructor;
        default: () => {};
    };
    config: {
        type: ObjectConstructor;
        default: () => undefined;
    };
    select: {
        type: PropType<INode | ILink>;
        default: () => {};
    };
    readOnly: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & {
    "onUpdate:select"?: ((...args: any[]) => any) | undefined;
    onSetNodeParams?: ((...args: any[]) => any) | undefined;
    onAddNode?: ((...args: any[]) => any) | undefined;
    onOnShortcutKey?: ((...args: any[]) => any) | undefined;
    "onUpdate:data"?: ((...args: any[]) => any) | undefined;
}, {
    select: INode | ILink;
    config: Record<string, any>;
    data: Record<string, any>;
    readOnly: boolean;
}>;
export default _default;

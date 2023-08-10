import { PropType } from 'vue';
import { INode, ILink, IElement } from '../../type';
declare function enlargeContainer(): void;
declare function narrowContainer(): void;
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
    selectGroup: {
        type: PropType<INode[]>;
        default: () => never[];
    };
    dragInfo: {
        type: PropType<IElement>;
        default: () => {};
    };
    readOnly: {
        type: BooleanConstructor;
        default: boolean;
    };
}, {
    getPreNodes: (nodeId: any) => INode[];
    clear: () => void;
    container: {
        pos: {
            top: number;
            left: number;
        };
        dragFlag: boolean;
        draging: boolean;
        scale: any;
        scaleFlag: boolean;
        scaleOrigin: {
            x: number;
            y: number;
        };
        scaleShow: number;
        auxiliaryLine: {
            isOpen: any;
            isShowXLine: boolean;
            isShowYLine: boolean;
            controlFnTimesFlag: boolean;
        };
    };
    rectangleMultiple: {
        flag: boolean;
        multipling: boolean;
        position: {
            top: number;
            left: number;
        };
        height: number;
        width: number;
    };
    deleteNode: typeof deleteNode;
    narrowContainer: typeof narrowContainer;
    enlargeContainer: typeof enlargeContainer;
    plumb: import("vue").Ref<any>;
}, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, ("update:select" | "update:selectGroup" | "setNodeParams" | "addNode" | "onShortcutKey" | "saveFlow" | "update:data")[], "update:select" | "update:selectGroup" | "setNodeParams" | "addNode" | "onShortcutKey" | "saveFlow" | "update:data", import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
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
    selectGroup: {
        type: PropType<INode[]>;
        default: () => never[];
    };
    dragInfo: {
        type: PropType<IElement>;
        default: () => {};
    };
    readOnly: {
        type: BooleanConstructor;
        default: boolean;
    };
}>> & {
    "onUpdate:select"?: ((...args: any[]) => any) | undefined;
    "onUpdate:selectGroup"?: ((...args: any[]) => any) | undefined;
    onSetNodeParams?: ((...args: any[]) => any) | undefined;
    onAddNode?: ((...args: any[]) => any) | undefined;
    onOnShortcutKey?: ((...args: any[]) => any) | undefined;
    onSaveFlow?: ((...args: any[]) => any) | undefined;
    "onUpdate:data"?: ((...args: any[]) => any) | undefined;
}, {
    select: INode | ILink;
    selectGroup: INode[];
    config: Record<string, any>;
    data: Record<string, any>;
    dragInfo: IElement;
    readOnly: boolean;
}>;
export default _default;

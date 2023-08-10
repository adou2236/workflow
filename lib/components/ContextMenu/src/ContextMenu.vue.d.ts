import type { ContextMenuItem, Axis } from './typing';
import type { CSSProperties, PropType } from 'vue';
declare const _default: import("vue").DefineComponent<{
    width: {
        type: NumberConstructor;
        default: number;
    };
    customEvent: {
        type: PropType<Event>;
        default: null;
    };
    styles: {
        type: PropType<CSSProperties>;
    };
    axis: {
        type: PropType<Axis>;
        default(): {
            x: number;
            y: number;
        };
    };
    items: {
        type: PropType<ContextMenuItem[]>;
        default(): never[];
    };
}, () => JSX.Element | null, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<import("vue").ExtractPropTypes<{
    width: {
        type: NumberConstructor;
        default: number;
    };
    customEvent: {
        type: PropType<Event>;
        default: null;
    };
    styles: {
        type: PropType<CSSProperties>;
    };
    axis: {
        type: PropType<Axis>;
        default(): {
            x: number;
            y: number;
        };
    };
    items: {
        type: PropType<ContextMenuItem[]>;
        default(): never[];
    };
}>>, {
    width: number;
    customEvent: Event;
    axis: Axis;
    items: ContextMenuItem[];
}>;
export default _default;

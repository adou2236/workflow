import type { INode } from '../type';
import { EndpointOptions, jsPlumbInstance } from 'jsplumb';
export declare const getEndpointUUID: (nodeId: string, type: string, outputIndex: number) => string;
export declare const ANCHOR_POSITIONS: {
    [key: string]: {
        [key: number]: any[];
    };
};
export declare function __addInputEndpoints(node: INode): EndpointOptions[];
export declare function __addOutputEndpoints(node: INode): EndpointOptions[];
export declare function __addNode(instance: jsPlumbInstance, node: INode): void;
export declare function __addLink(instance: jsPlumbInstance, source: {
    id: string;
    endpoint: string;
}, target: {
    id: string;
    endpoint: string;
}, parameters: any): void;

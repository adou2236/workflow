import type { INode } from '../type';
import { jsPlumbInstance } from 'jsplumb';
export declare function __addNode(instance: jsPlumbInstance, node: INode): void;
export declare function __addLink(instance: jsPlumbInstance, source: string, target: string, parameters: any): void;

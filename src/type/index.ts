import { NodeType } from './enums';

import { settingConfig } from '@/config/flow';

export type NodesType = NodeType;

export interface Point {
  x: number;
  y: number;
}

export interface Bound extends Point {
  width: number;
  height: number;
}

export interface Text extends Bound {
  value: string;
}

export interface OriginNode {
  type: NodeType;
  basicConfig?: Record<string, any>; // 基本设置，不参与保存
  name?: string;
  definition?: OriginNode;
  properties?: Record<string, unknown>;
}

export interface INode extends OriginNode {
  id: string;
  bound: Bound;
  text?: Text;
  children: string[];
}

export interface IEdge {
  id: string;
  type: string;
  sourceNodeId: string;
  targetNodeId: string;
  startPoint: Point;
  endPoint: Point;
  text?: Text;
  wayPoints?: Point[];
  properties?: Record<string, unknown>;
}

export interface IProcess {
  id: string;
  nodes: INode[];
  edges: IEdge[];
}

export interface IZoomConfig {
  scale: number;
  x: number;
  y: number;
}

export type ISettingConfig = typeof settingConfig;

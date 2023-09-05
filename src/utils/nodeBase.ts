import type { INode } from '@/type';
import { jsPlumbInstance } from 'jsplumb';

// 新增节点
export function __addNode(instance: jsPlumbInstance, node: INode) {
  instance.makeSource(node.id, {
    filter: '.node-anchor',
    filterExclude: false,
    anchor: ['TopCenter', 'RightMiddle', 'BottomCenter', 'LeftMiddle'],
    allowLoopback: false,
  });
  // // 设置目标点，其他源点拖出的线可以连接该节点
  instance.makeTarget(node.id, {
    filter: '.node-anchor',
    filterExclude: false,
    anchor: ['TopCenter', 'RightMiddle', 'BottomCenter', 'LeftMiddle'],
    allowLoopback: false,
  });
}

// 新增链接
export function __addLink(instance: jsPlumbInstance, source: string, target: string, parameters) {
  instance.connect({
    source,
    target,
    parameters,
  });
}

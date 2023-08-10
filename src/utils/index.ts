/**
 * 配合工作流使用的一些函数
 */

import { INode } from '@/type';
import { unref } from 'vue';

/**
 * 获取某节点的前链节点
 */
function getPreNodes(nodeId: string, rest: any): INode[] {
  const { flowData } = rest;
  const { nodeList, linkList } = flowData.value;
  let res = [] as INode[];
  if (nodeList.some((item) => item.id === nodeId)) {
    const links = linkList.filter((link) => link.targetId === nodeId);
    links.forEach((o) => {
      res.push(nodeList.find((node) => node.id === o.sourceId));
      res = res.concat(getPreNodes(o.sourceId, rest));
    });
  } else {
    console.error('节点不存在');
    return [];
  }
  return [...new Map(res.map((item) => [item.id, item])).values()];
}

function install(global) {
  return {
    getPreNodes: (nodeId) => getPreNodes(nodeId, global),
    clear: () => clear(global),
  };
}

/**
 * 清空画布
 */
function clear(rest: any): void {
  const { flowData, plumb } = rest;
  unref(flowData).nodeList.forEach((node: INode) => {
    unref(plumb).remove(node.id);
  });
  unref(flowData).nodeList = [];
  unref(flowData).linkList = [];
}

export default install;

/**
 * 配合工作流使用的一些函数
 */

import { INode } from '@/type';
import { unref } from 'vue';
import { NOTIFICATION_STATUS } from '@/type/enums';

/**
 * 获取某节点的前链节点
 * @param nodeId
 * @param rest
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
    setStatus: (id, status, message) => setStatus(id, status, message, global),
  };
}

/**
 * 清空画布
 */
function clear(rest: any): void {
  const { flowData, plumb } = rest;
  unref(flowData).nodes.forEach((node: INode) => {
    unref(plumb).remove(node.id);
  });
  unref(flowData).nodes = [];
  unref(flowData).edges = [];
}

/**
 *
 * @param id 节点或连线id
 * @param status 状态 enum
 * @param message 提示信息
 * @param rest
 */
function setStatus(id: string, status: NOTIFICATION_STATUS, message: string, rest: any) {
  const { plumb } = rest;
  unref(plumb).setAttributes(document.getElementById(id), { status, message });
}

export default install;

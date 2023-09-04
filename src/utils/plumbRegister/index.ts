import { Endpoint, EndpointOptions, newInstance } from '@jsplumb/browser-ui';
import type { BrowserJsPlumbInstance, BrowserJsPlumbDefaults } from '@jsplumb/browser-ui/types';
import { IEdge, INode, OriginNode } from '@/type';
import { NodeType } from '@/type/enums';
import { BPMNAdapter } from '@/utils/bpmnAdapter/index_new';
import { cloneDeep } from 'lodash-es';
import { extraProps } from '@/config/const';
import { nextTick, unref } from 'vue';

class PlumbRegister {
  public instance: { [key: string]: any } & BrowserJsPlumbInstance;
  public readonly = false;
  public adapter;
  private registerNodes: OriginNode[] = [];
  private endpoints = [
    {
      name: 'Top',
      pos: [0.5, 0, 0, -1], // top
    },
    {
      name: 'Right',
      pos: [1, 0.5, 1, 0], // right
    },
    {
      name: 'Bottom',
      pos: [0.5, 1, 0, 1], // bottom
    },
    {
      name: 'Left',
      pos: [0, 0.5, -1, 0], //left
    },
  ];
  constructor(config: BrowserJsPlumbDefaults) {
    this.instance = newInstance(config);
    this.adapter = new BPMNAdapter({ lf: this.instance, props: extraProps });
    this.eventRegister();
    this.instance.addNode = this.addNode;
    this.instance.addEdge = this.addEdge;
    this.instance.nodeRegister = this.nodeRegister;
    this.instance.deleteNode = this.deleteNode;
    this.instance.getNodeBasicConfig = this.getNodeBasicConfig;
    this.instance.setReadOnly = this.setReadOnly;
    return this.instance;
  }

  /**
   * first-step
   * 节点注册，记录基本信息
   * @param nodes
   */
  nodeRegister = (nodes: OriginNode[]) => {
    this.registerNodes = cloneDeep(nodes);
    this.registerNodes.forEach((item) => {
      if (item.basicConfig?.definition) {
        item.definition = this.registerNodes.find((n) => n.type === item.basicConfig?.definition);
      }
    });
  };

  // 获取节点基本信息(包含拓展类型)
  getNodeBasicConfig = (node: OriginNode) => {
    const { type, properties } = node;
    const definitionType = properties?.definitionType;
    return (
      this.registerNodes.find((item) => {
        return (
          item.type === type &&
          (definitionType
            ? item.properties?.definitionType && definitionType === item.properties.definitionType
            : true)
        );
      })?.basicConfig || {}
    );
  };

  // 事件注册
  eventRegister = () => {
    // 作为起点的规则
    this.instance.bind('beforeDrag', (info: Recordable) => {
      const { endpoint, source } = info;
      console.log(endpoint);
      const sourceRules = this.getNodeBasicConfig(endpoint.parameters.node).sourceRules || [];
      let res = sourceRules.map((item) => {
        return item.validate({ sourceNode: source }) ? true : item.message;
      });
      res = res.filter((item) => item !== true);
      if (res.length > 0) {
        console.error(res);
        return false;
      }
      return true;
    });
    this.instance.bind('beforeDrop', (info: Recordable) => {
      // 作为终点的规则
      const { connection, dropEndpoint } = info;
      const targetRules = this.getNodeBasicConfig(dropEndpoint.parameters.node)?.targetRules || [];
      let res = targetRules.map((item) => {
        return item.validate({
          sourceNode: connection.source,
          targetNode: connection.target,
          sourceAnchor: connection.endpoints[0],
          targetAnchor: connection.endpoints[1],
        })
          ? true
          : item.message;
      });
      res = res.filter((item) => item !== true);
      if (res.length > 0) {
        console.error(res);
        return false;
      }
      return true;
    });
  };

  /**
   * 生成uuid
   * @param nodeId
   * @param index
   */
  getEndpointUUID = (nodeId: string, index: number) => {
    return `${nodeId}-endpoint${index}`;
  };

  /**
   * 新增组
   * @param node
   */
  addGroup = (node: INode) => {
    const endpoints = this.addEndpoints(node);
    endpoints.forEach((anchor) => {
      this.instance.addEndpoint(document.getElementById(node.id)!, anchor);
    });
  };

  /**
   * 新增节点
   * @param node
   */
  addNode = (node: INode) => {
    const backNode = event?.backNode || null;
    this.instance.setPosition(document.getElementById(node.id)!, node.bound);
    const endpoints = this.addEndpoints(node);
    endpoints.forEach((anchor) => {
      this.instance.addEndpoint(document.getElementById(node.id)!, anchor);
    });
    // 拖拽子任务
    if (node.type === NodeType.SUB_PROCESS) {
      const group = this.instance.addGroup({
        el: document.getElementById(node.id)!,
        id: node.id,
        constrain: true,
        proxied: false,
      });
      if (!node.properties.isExpanded) {
        setTimeout(() => {
          this.instance.collapseGroup(group);
        });
      }
    }
    // 拖拽进入子任务
    if (backNode) {
      this.instance.addToGroup(backNode.id, document.getElementById(node.id)!);
    }
  };

  /**
   * 新增连接
   * @param edge
   */
  addEdge = (edge: IEdge) => {
    const { sourceNodeId, targetNodeId, startPoint, endPoint, id, text } = edge;
    const sourceEndpoints = this.instance.getEndpoints(document.getElementById(sourceNodeId)!);
    const targetEndpoints = this.instance.getEndpoints(document.getElementById(targetNodeId)!);
    let sourceEndpoint = null as Endpoint | null;
    let targetEndpoint = null as Endpoint | null;
    sourceEndpoints.forEach((item) => {
      if (item.parameters?.x === startPoint.x && item.parameters?.y === startPoint.y) {
        sourceEndpoint = item;
      }
    });
    targetEndpoints.forEach((item) => {
      if (item.parameters?.x === endPoint.x && item.parameters?.y === endPoint.y) {
        targetEndpoint = item;
      }
    });
    if (sourceEndpoint && targetEndpoint) {
      this.instance.connect({
        source: sourceEndpoint,
        target: targetEndpoint,
        parameters: {
          id: id,
          label: text?.value,
        },
      });
    }
  };

  /**
   * 新增锚点
   * @param node
   */
  addEndpoints = (node: INode): EndpointOptions[] => {
    return this.endpoints.map((anchor: any, index: number) => {
      const uuid = this.getEndpointUUID(node.id, index);
      const newEndpointData: EndpointOptions = {
        uuid: uuid,
        parameters: {
          node: node,
          x: node.bound.x + anchor.pos[0] * node.bound.width,
          y: node.bound.y + anchor.pos[1] * node.bound.height,
        },
        anchor: anchor.pos,
        maxConnections: -1,
        endpoint: {
          type: 'Dot',
          options: {
            radius: 4,
          },
        },
        reattachConnections: true,
        connectionsDirected: true,
        source: true,
        target: true,
        cssClass: 'dot-endpoint',
        hoverClass: 'dropHover',
      };
      return newEndpointData;
    });
  };

  /**
   * 查询删除节点关联的连接线
   * @param nodeId
   */
  getConnectionsByNodeId = (nodeId: string) => {
    const conns1 = this.instance.getConnections({
      source: nodeId,
    });
    const conns2 = this.instance.getConnections({
      target: nodeId,
    });
    return conns1.concat(conns2);
  };
  /**
   * 删除节点
   * @param deleteNodes
   */
  deleteNode = (deleteNodes: string[] | string) => {
    const arr: string[] = Array.isArray(deleteNodes) ? deleteNodes : [deleteNodes];
    arr.forEach((c) => {
      try {
        this.instance.deleteConnectionsForElement(document.getElementById(c));
        this.instance.selectEndpoints({ element: document.getElementById(c) }).deleteAll();
        this.instance.removeGroup(this.instance.getGroup(c), true);
      } catch (e) {}
    });
  };

  /**
   * 设置只读
   * @param flag
   */
  setReadOnly = (flag: boolean) => {
    this.instance.setSuspendDrawing(flag);
    this.instance.select().setDetachable(!flag);
    const nodes = document.getElementsByClassName('node-box') || [];
    Array.from(nodes).forEach((node) => {
      this.instance.setDraggable(node, !flag);
    });
  };
}

export default PlumbRegister;

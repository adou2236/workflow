import { Endpoint, EndpointOptions, newInstance } from '@jsplumb/browser-ui';
import type { BrowserJsPlumbInstance, BrowserJsPlumbDefaults } from '@jsplumb/browser-ui/types';
import { IEdge, INode, IProcess, OriginNode } from '@/type';
import { NodeType } from '@/type/enums';
import { BPMNAdapter } from '@/utils/bpmnAdapter/index_new';
import { cloneDeep } from 'lodash-es';
import { extraProps, NODE_SIZE } from '@/config/const';
import { utils } from '@/utils/common';

class PlumbRegister {
  public instance: { [key: string]: any } & BrowserJsPlumbInstance;
  public readonly = false;
  public nodeMap = {};
  public adapter;
  public value: IProcess;
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
  constructor(config: BrowserJsPlumbDefaults, value) {
    this.instance = newInstance(config);
    this.value = value; // 画布数据
    this.nodeMap = this.getNodeMap(value.nodes);
    this.adapter = new BPMNAdapter({ lf: this.instance, props: extraProps });
    this.eventRegister();
    this.instance.addNode = this.addNode;
    this.instance.addEdge = this.addEdge;
    this.instance.nodeRegister = this.nodeRegister;
    this.instance.nodeDelete = this.nodeDelete;
    this.instance.getNodeBasicConfig = this.getNodeBasicConfig;
    this.instance.setReadOnly = this.setReadOnly;
    this.instance.getNode = this.getNode;
    this.instance.newNodeInit = this.newNodeInit;
    this.instance.nodeMap = this.nodeMap;
    this.instance.value = this.value;
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
   * @param node 节点信息 非node实例
   * @param isNew 是否是新增节点
   */
  addNode = (node: INode, isNew = false) => {
    const backNode = event?.backNode || null;
    this.instance.setPosition(document.getElementById(node.id)!, {
      x: node.bound.x,
      y: node.bound.y,
    });
    const endpoints = this.addEndpoints(node);
    endpoints.forEach((anchor) => {
      this.instance.addEndpoint(document.getElementById(node.id)!, anchor);
    });
    // 子任务
    if (node.type === NodeType.SUB_PROCESS) {
      this.instance.addGroup({
        el: document.getElementById(node.id)!,
        id: node.id,
        constrain: true,
        proxied: true,
        collapsed: !node.properties?.isExpanded,
      });
      // // TODO 压缩状态下的子节点初始化定位会存在问题，方法待优化
      // if (!node.properties?.isExpanded) {
      //   setTimeout(() => {
      //     this.instance.collapseGroup(group);
      //   });
      // }
      if (node.children && node.children.length > 0) {
        node.children.forEach((item) => {
          this.addNode(item);
        });
        this.instance.addToGroup(
          node.id,
          ...node.children.map((n) => document.getElementById(n.id)!),
        );
      }
    }
    // 进入子任务
    if (backNode) {
      this.instance.addToGroup(backNode.id, document.getElementById(node.id)!);
    }

    if (isNew) {
      this.nodeMap = this.getNodeMap(this.value.nodes);
    }
  };

  /**
   * 新节点数据初始化
   * 位置，尺寸，文本等赋初值
   * @param node
   */
  newNodeInit = (node) => {
    const { offsetX, offsetY } = event;
    const x = offsetX;
    const y = offsetY;
    const newNode = cloneDeep(node) as INode;
    delete newNode.basicConfig;
    newNode.id = newNode.type + '-' + utils.getId();
    // 位置矫正
    newNode.bound = {
      width: this.instance.getNodeBasicConfig(node)?.width || NODE_SIZE,
      height: this.instance.getNodeBasicConfig(node)?.height || NODE_SIZE,
      x: x - (this.instance.getNodeBasicConfig(node)?.width || NODE_SIZE) / 2,
      y: y - (this.instance.getNodeBasicConfig(node)?.height || NODE_SIZE) / 2,
    };
    // 设置文字内容
    newNode.text = {
      value: this.instance.getNodeBasicConfig(node)?.name,
    };
    return newNode;
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

  /**
   * 删除节点
   * @param nodeId
   */
  nodeDelete = (nodeId: string) => {
    const children = this.nodeMap[nodeId].children;
    // 子元素元素删除
    if (children && children.length > 0) {
      console.log(children);
      children.forEach((c) => {
        console.log(
          c.id,
          document.getElementById(c.id),
          this.instance.selectEndpoints({ element: document.getElementById(c.id) }),
        );
        try {
          this.instance.deleteConnectionsForElement(document.getElementById(c.id));
          this.instance.selectEndpoints({ element: document.getElementById(c.id) }).deleteAll();
          this.instance.removeGroup(this.instance.getGroup(c.id), true);
        } catch (e) {}
      });
    }
    try {
      this.instance.deleteConnectionsForElement(document.getElementById(nodeId));
      this.instance.selectEndpoints({ element: document.getElementById(nodeId) }).deleteAll();
      this.instance.removeGroup(this.instance.getGroup(nodeId), true);
    } catch (e) {}
    // 数据上删除
    function deleteNode(tree, nodeIdToDelete) {
      tree.forEach((item, index) => {
        if (item.id === nodeIdToDelete) {
          tree.splice(index, 1);
          return;
        }
        if (item.children && item.children.length > 0) {
          deleteNode(item.children, nodeIdToDelete);
        }
      });
    }
    deleteNode(this.value.nodes, nodeId);
    this.nodeMap = this.getNodeMap(this.value.nodes);
  };

  /**
   * 获取指定节点
   * @param nodeId
   */
  getNode = (nodeId: string) => {
    return this.nodeMap[nodeId];
  };
  /**
   * 获取父节点
   * @param nodeId
   */
  getParent = (nodeId: string) => {
    return this.nodeMap[nodeId]?.parentId ? this.nodeMap[this.nodeMap[nodeId].parentId] : null;
  };

  /**
   * 获取节点索引
   */
  getNodeMap = (arr: INode[], parentId: string | null = null) => {
    let map = {};
    arr.forEach((item) => {
      map[item.id] = { ...item, parentId: parentId };
      if (item.children && item.children.length > 0) {
        map = { ...map, ...this.getNodeMap(item.children, item.id) };
      }
    });
    return map;
  };
}

export default PlumbRegister;

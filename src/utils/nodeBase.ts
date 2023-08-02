import type { INode } from '@/type';
import { flowConfig, settingConfig } from '@/config/flow';
import { jsPlumbInstance } from 'jsplumb';

export const getEndpointUUID = (nodeId: string, type: string, outputIndex: number) => {
  return `${nodeId}${type}${outputIndex}`;
};
// 锚点位置
export const ANCHOR_POSITIONS: {
  [key: string]: {
    [key: number]: any[];
  };
} = {
  input: {
    1: [[0.01, 0.5, -1, 0]],
    2: [
      [0.01, 0.3, -1, 0],
      [0.01, 0.7, -1, 0],
    ],
    3: [
      [0.01, 0.25, -1, 0],
      [0.01, 0.5, -1, 0],
      [0.01, 0.75, -1, 0],
    ],
    4: [
      [0.01, 0.2, -1, 0],
      [0.01, 0.4, -1, 0],
      [0.01, 0.6, -1, 0],
      [0.01, 0.8, -1, 0],
    ],
  },
  output: {
    1: [[0.99, 0.5, 1, 0]],
    2: [
      [0.99, 0.3, 1, 0],
      [0.99, 0.7, 1, 0],
    ],
    3: [
      [0.99, 0.25, 1, 0],
      [0.99, 0.5, 1, 0],
      [0.99, 0.75, 1, 0],
    ],
    4: [
      [0.99, 0.2, 1, 0],
      [0.99, 0.4, 1, 0],
      [0.99, 0.6, 1, 0],
      [0.99, 0.8, 1, 0],
    ],
  },
};
// 新增数据锚点
export function __addInputEndpoints(node: INode) {
  let index;
  const indexData: {
    [key: string]: number;
  } = {};

  return node.inputs.map((inputName: string, i: number) => {
    // Increment the index for inputs with current name
    if (indexData.hasOwnProperty(inputName)) {
      indexData[inputName]++;
    } else {
      indexData[inputName] = 0;
    }
    index = indexData[inputName];

    const anchorPosition = ANCHOR_POSITIONS.input[node.inputs.length][i];

    const newEndpointData = {
      uuid: getEndpointUUID(node.id, 'input', index),
      anchor: anchorPosition,
      maxConnections: 2,
      endpoint: 'Rectangle',
      paintStyle: {
        width: 4,
        height: 12,
        fill: '#555555',
        stroke: '#555555',
        lineWidth: 0,
      },
      hoverPaintStyle: {
        width: 4,
        height: 12,
        fill: '#FF6D5A',
        stroke: '#FF6D5A',
        lineWidth: 0,
      },
      isSource: false,
      isTarget: true,
      target: node.inputs.length > 1, // only enabled for nodes with multiple inputs.. otherwise attachment handled by connectionDrag event in NodeView,
      cssClass: 'rect-input-endpoint',
      hoverClass: 'dropHover',
      overlays: ['Arrow'],
    };
    return newEndpointData;

    // const endpoint = this.instance?.addEndpoint(
    //   this.$refs[this.data.name] as Element,
    //   newEndpointData,
    // );
    // if (!Array.isArray(endpoint)) {
    //   endpoint.__meta = {
    //     nodeName: node.name,
    //     nodeId: this.nodeId,
    //     index: i,
    //     totalEndpoints: nodeTypeData.inputs.length,
    //   };
    // }

    // TODO: Activate again if it makes sense. Currently makes problems when removing
    //       connection on which the input has a name. It does not get hidden because
    //       the endpoint to which it connects when letting it go over the node is
    //       different to the regular one (have different ids). So that seems to make
    //       problems when hiding the input-name.

    // if (index === 0 && inputName === 'main') {
    // 	// Make the first main-input the default one to connect to when connection gets dropped on node
    // 	this.instance.makeTarget(this.nodeId, newEndpointData);
    // }
  });
  if (node.inputs.length === 0) {
    console.log('S');
  }
}

// 新增输出锚点
export function __addOutputEndpoints(node: INode) {
  let index;
  const indexData: {
    [key: string]: number;
  } = {};

  return node.outputs.map((inputName: string, i: number) => {
    // Increment the index for outputs with current name
    if (indexData.hasOwnProperty(inputName)) {
      indexData[inputName]++;
    } else {
      indexData[inputName] = 0;
    }
    index = indexData[inputName];

    // Get the position of the anchor depending on how many it has
    const anchorPosition = ANCHOR_POSITIONS.output[node.outputs.length][i];

    const newEndpointData = {
      uuid: getEndpointUUID(node.id, 'output', index),
      anchor: anchorPosition,
      maxConnections: -1,
      endpoint: ['Dot', { radius: 6 }],
      paintStyle: {
        strokeWidth: 4,
        fill: '#555555',
        outlineStroke: 'none',
      },
      hoverPaintStyle: {
        strokeWidth: 4,
        fill: '#FF6D5A',
        outlineStroke: 'none',
      },
      isSource: true,
      isTarget: false,
      hoverClass: 'dot-output-endpoint-hover',
      connectionsDirected: true,
      cssClass: 'dot-output-endpoint',
    };
    return newEndpointData;

    // const endpoint = this.instance.addEndpoint(
    //   this.$refs[this.data.name] as Element,
    //   newEndpointData,
    // );
    // this.__addEndpointTestingData(endpoint, 'output', index);
    // if (nodeTypeData.outputNames) {
    //   // Apply output names if they got set
    //   const overlaySpec = NodeViewUtils.getOutputNameOverlay(nodeTypeData.outputNames[index]);
    //   endpoint.addOverlay(overlaySpec);
    // }
    //
    // if (!Array.isArray(endpoint)) {
    //   endpoint.__meta = {
    //     nodeName: node.name,
    //     nodeId: this.nodeId,
    //     index: i,
    //     totalEndpoints: nodeTypeData.outputs.length,
    //   };
    // }
  });
}

// 新增节点
export function __addNode(node: INode) {
  __addInputEndpoints(node);
  __addOutputEndpoints(node);
}

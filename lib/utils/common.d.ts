import { INode, IZoomConfig } from '../type';
export declare const utils: {
    seqNo: number;
    consoleLog: (strArr: any) => void;
    getId: () => any;
    getUUID: () => string;
    getTimeStamp: () => number;
    getSequence: (seqNoLength: any) => string;
    getTimeStampAndSequence: (seqNoLength: any) => string;
    add: (a: any, b: any) => number;
    sub: (a: any, b: any) => number;
    mul: (a: any, b: any) => number;
    div: (a: any, b: any) => number;
};
export declare function setFlowConfig(config: any, settingConfig: any): any;
export declare function getZoomToFit(nodeList: INode[]): {
    x: number;
    y: number;
    zoomLevel: number;
};
export declare const getWorkflowCorners: (nodes: INode[]) => {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
};
export declare const closestNumberDivisibleBy: (inputNumber: number, divisibleBy: number) => number;
export declare const scaleSmaller: ({ scale, x, y }: IZoomConfig) => IZoomConfig;
export declare const scaleBigger: ({ scale, x, y }: IZoomConfig) => IZoomConfig;

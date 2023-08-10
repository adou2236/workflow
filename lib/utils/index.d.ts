import { INode } from '../type';
declare function install(global: any): {
    getPreNodes: (nodeId: any) => INode[];
    clear: () => void;
};
export default install;

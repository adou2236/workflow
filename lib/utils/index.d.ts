import { INode } from '../type';
declare function install(global: any): {
    getPreNodes: (nodeId: any) => INode[];
    clear: () => void;
    setStatus: (id: any, status: any, message: any) => void;
};
export default install;

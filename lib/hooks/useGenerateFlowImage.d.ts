export declare function useGenerateFlowImage(): {
    flowImage: {
        url: string;
        modalVisible: boolean;
    };
    downLoadFlowImage: (id: any) => void;
    cancelDownLoadFlowImage: () => void;
    generateFlowImage: (nodeList: any, photoBlankDistance: number | undefined, checkFlow: any) => void;
};

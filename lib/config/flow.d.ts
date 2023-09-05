import { Defaults } from 'jsplumb';
import { IdTypeEnum } from '../type/enums';
export declare const settingConfig: {
    containerScale: {
        onceNarrow: number;
        onceEnlarge: number;
    };
    cls: {
        linkType: string;
        linkColor: string;
        linkThickness: number;
    };
    other: {
        isOpenAuxiliaryLine: boolean;
        horizontal: number;
        vertical: number;
        movePx: number;
    };
};
export declare const flowConfig: {
    jsPlumbInsConfig: Defaults;
    defaultStyle: {
        showGrid: boolean;
        dragOpacity: number;
        alignGridPX: number[];
        alignSpacing: {
            horizontal: number;
            vertical: number;
        };
        alignDuration: number;
        containerScale: {
            init: number;
            min: number;
            max: number;
            onceNarrow: number;
            onceEnlarge: number;
        };
        isOpenAuxiliaryLine: boolean;
        showAuxiliaryLineDistance: number;
        movePx: number;
        photoBlankDistance: number;
    };
};
export declare const idType = IdTypeEnum.UUID;

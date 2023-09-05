import { Defaults } from 'jsplumb';
import { IdTypeEnum } from '@/type/enums';
import variable from '@/assets/style/variable.module.scss';

export const settingConfig = {
  containerScale: {
    onceNarrow: 0.1,
    onceEnlarge: 0.1,
  },
  cls: {
    linkType: 'Flowchart',
    linkColor: variable['line-color'],
    linkThickness: 2,
  },
  other: {
    isOpenAuxiliaryLine: true,
    horizontal: 100,
    vertical: 100,
    movePx: 5,
  },
};

const jsPlumbInsConfig: Defaults = {
  Connector: [
    settingConfig.cls.linkType,
    {
      gap: 0,
      cornerRadius: 8,
      alwaysRespectStubs: true,
    },
  ],
  ConnectionOverlays: [
    [
      'Arrow',
      {
        width: 10,
        length: 10,
        location: 1,
      },
    ],
  ],
  ConnectionsDetachable: false, // 不可重连
  PaintStyle: {
    stroke: settingConfig.cls.linkColor,
    strokeWidth: settingConfig.cls.linkThickness,
  },
  HoverPaintStyle: { stroke: '#ff00cc', strokeWidth: 3 },
  EndpointStyle: {
    fill: 'none',
    stroke: 'none',
    strokeWidth: 0,
  },
  EndpointHoverStyle: {
    fill: 'none',
  },
};

const defaultStyle = {
  showGrid: true,
  dragOpacity: 0.7,
  alignGridPX: [15, 15], // 最小步长
  alignSpacing: {
    horizontal: settingConfig.other.horizontal,
    vertical: settingConfig.other.vertical,
  },
  alignDuration: 300,
  containerScale: {
    init: 1,
    min: 0.5,
    max: 3,
    onceNarrow: settingConfig.containerScale.onceNarrow,
    onceEnlarge: settingConfig.containerScale.onceEnlarge,
  },
  isOpenAuxiliaryLine: settingConfig.other.isOpenAuxiliaryLine,
  showAuxiliaryLineDistance: 20,
  movePx: settingConfig.other.movePx,
  photoBlankDistance: 200,
};

export const flowConfig = {
  jsPlumbInsConfig,
  defaultStyle,
};

export const idType = IdTypeEnum.UUID;

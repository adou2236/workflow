import { Defaults } from 'jsplumb';
import { IdTypeEnum } from '@/type/enums';
import variable from '@/assets/style/variable.module.scss';

export const settingConfig = {
  containerScale: {
    onceNarrow: 0.1,
    onceEnlarge: 0.1,
  },
  cls: {
    linkType: 'Bezier',
    linkColor: variable['rect-color'],
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
      gap: 5,
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
  PaintStyle: {
    stroke: settingConfig.cls.linkColor,
    strokeWidth: settingConfig.cls.linkThickness,
  },
  HoverPaintStyle: {
    stroke: variable['primary-color'],
    strokeWidth: 3,
  },
  EndpointStyle: {
    fill: '#456',
    stroke: '#2a2929',
    strokeWidth: 1,
  },
  EndpointHoverStyle: {
    fill: 'pink',
  },
};

const jsPlumbConfig = {
  anchor: {
    default: ['Bottom', 'Right', 'Top', 'Left'],
  },
  conn: {
    isDetachable: false,
  },
  makeSourceConfig: {
    filter: 'a',
    filterExclude: true,
    source: true,
    target: false,
    maxConnections: -1,
    endpoint: 'Dot',
    connectionsDirected: true,
    anchor: ['Right'],
  },
  makeTargetConfig: {
    filter: 'a',
    filterExclude: true,
    source: false,
    target: true,
    maxConnections: -1,
    endpoint: 'Rectangle',
    paintStyle: {
      width: 8,
      height: 12,
      fill: '#F00',
      stroke: '#F00',
      lineWidth: 0,
    },
    anchor: ['Left'],
  },
};

const defaultStyle = {
  showGrid: true,
  dragOpacity: 0.7,
  alignGridPX: [5, 5], // 最小步长
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
  jsPlumbConfig,
  defaultStyle,
};

export const idType = IdTypeEnum.UUID;

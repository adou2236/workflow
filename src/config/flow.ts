import { IdTypeEnum } from '@/type/enums';
import variable from '@/assets/style/variable.module.scss';
import { BrowserJsPlumbDefaults } from '@jsplumb/browser-ui';

export const settingConfig = {
  containerScale: {
    onceNarrow: 0.1,
    onceEnlarge: 0.1,
  },
  cls: {
    linkType: 'Flowchart',
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
    anchor: ['Left'],
  },
};

const defaultStyle = {
  showGrid: true,
  dragOpacity: 0.7,
  alignGridPX: [20, 20], // 最小步长
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

const jsPlumbInsConfig: BrowserJsPlumbDefaults = {
  dragOptions: {
    grid: { w: 10, h: 10 },
  },
  connector: {
    type: settingConfig.cls.linkType,
    options: {
      cornerRadius: 5,
    },
  },
  reattachConnections: true,
  connectionsDetachable: true,
  connectionOverlays: [
    {
      type: 'Arrow',
      options: {
        width: 10,
        length: 10,
        location: 1,
      },
    },
  ],
  paintStyle: {
    stroke: settingConfig.cls.linkColor,
    strokeWidth: settingConfig.cls.linkThickness,
  },
  hoverPaintStyle: {
    stroke: variable['primary-color'],
    strokeWidth: 5,
  },
  endpointStyle: {
    strokeWidth: 1,
    fill: 'white',
    stroke: 'black',
  },
  endpointHoverStyle: {
    strokeWidth: 1,
    fill: variable['primary-color'],
    stroke: variable['primary-color'],
  },
};

export const flowConfig = {
  jsPlumbInsConfig,
  jsPlumbConfig,
  defaultStyle,
};

export const idType = IdTypeEnum.UUID;

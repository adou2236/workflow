import { idType as flowIdType } from '@/config/flow';
import { IdTypeEnum } from '@/type/enums';
import { INode, IZoomConfig } from '@/type';

const NODE_SIZE = 80;
export const utils = {
  seqNo: 1,
  consoleLog: function (strArr) {
    let log = '';
    for (let i = 0, len = strArr.length; i < len; i++) {
      log += strArr[i] + '\n';
    }
    console.log('%c' + log, 'color: red; font-weight: bold;');
  },
  getId: function () {
    const idType = flowIdType;

    if (typeof idType === 'string') {
      if (idType === IdTypeEnum.UUID) {
        return this.getUUID();
      } else if (idType === IdTypeEnum.TIME_STAMP) {
        return this.getTimeStamp();
      }
    } else if (idType instanceof Array) {
      if (idType[0] === IdTypeEnum.SEQUENCE) {
        return this.getSequence(idType[1]);
      } else if (idType[0] === IdTypeEnum.TIME_STAMP_AND_SEQUENCE) {
        return this.getTimeStampAndSequence(idType[1]);
      } else if (idType[0] === IdTypeEnum.CUSTOM) {
        return idType[1]();
      }
    }
  },
  getUUID: function () {
    const s = [];
    const hexDigits = '0123456789abcdef';
    for (let i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
    }
    s[14] = '4';
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1);
    s[8] = s[13] = s[18] = s[23] = '-';

    const uuid = s.join('');
    return uuid.replace(/-/g, '');
  },
  getTimeStamp: function () {
    return new Date().getTime();
  },
  getSequence: function (seqNoLength) {
    const zeroStr = new Array(seqNoLength).fill('0').join('');
    return (zeroStr + this.seqNo++).slice(-seqNoLength);
  },
  getTimeStampAndSequence: function (seqNoLength) {
    return this.getTimeStamp() + this.getSequence(seqNoLength);
  },
  add: function (a, b) {
    let c, d, e;
    try {
      c = a.toString().split('.')[1].length;
    } catch (f) {
      c = 0;
    }
    try {
      d = b.toString().split('.')[1].length;
    } catch (f) {
      d = 0;
    }
    return (e = Math.pow(10, Math.max(c, d))), (this.mul(a, e) + this.mul(b, e)) / e;
  },
  sub: function (a, b) {
    let c, d, e;
    try {
      c = a.toString().split('.')[1].length;
    } catch (f) {
      c = 0;
    }
    try {
      d = b.toString().split('.')[1].length;
    } catch (f) {
      d = 0;
    }
    return (e = Math.pow(10, Math.max(c, d))), (this.mul(a, e) - this.mul(b, e)) / e;
  },
  mul: function (a, b) {
    let c = 0;
    const d = a.toString();
    const e = b.toString();
    try {
      c += d.split('.')[1].length;
    } catch (f) {}
    try {
      c += e.split('.')[1].length;
    } catch (f) {}
    return (Number(d.replace('.', '')) * Number(e.replace('.', ''))) / Math.pow(10, c);
  },
  div: function (a, b) {
    let c,
      d,
      e = 0,
      f = 0;
    try {
      e = a.toString().split('.')[1].length;
    } catch (g) {}
    try {
      f = b.toString().split('.')[1].length;
    } catch (g) {}
    return (
      (c = Number(a.toString().replace('.', ''))),
      (d = Number(b.toString().replace('.', ''))),
      this.mul(c / d, Math.pow(10, f - e))
    );
  },
};

// 设置流程配置
export function setFlowConfig(config, settingConfig) {
  // 画布
  config.defaultStyle.containerScale.onceNarrow = settingConfig.containerScale.onceNarrow;
  config.defaultStyle.containerScale.onceEnlarge = settingConfig.containerScale.onceEnlarge;
  // 连线
  config.jsPlumbInsConfig.Connector[0] = settingConfig.cls.linkType;
  config.jsPlumbInsConfig.PaintStyle.stroke = settingConfig.cls.linkColor;
  config.jsPlumbInsConfig.PaintStyle.strokeWidth = settingConfig.cls.linkThickness;
  // 其它设置
  config.defaultStyle.isOpenAuxiliaryLine = settingConfig.other.isOpenAuxiliaryLine;
  config.defaultStyle.alignSpacing.horizontal = settingConfig.other.horizontal;
  config.defaultStyle.alignSpacing.vertical = settingConfig.other.vertical;
  config.defaultStyle.movePx = settingConfig.other.movePx;

  return config;
}

// 获取自适应缩放
export function getZoomToFit(nodeList: INode[]): { x: number; y: number; zoomLevel: number } {
  const { minX, minY, maxX, maxY } = getWorkflowCorners(nodeList);
  const { editorWidth, editorHeight } = getContentDimensions();

  const PADDING = NODE_SIZE * 4;

  const diffX = maxX - minX + PADDING;
  const scaleX = editorWidth / diffX;

  const diffY = maxY - minY + PADDING;
  const scaleY = editorHeight / diffY;

  const zoomLevel = Math.min(scaleX, scaleY, 1);

  let xOffset = minX * -1 * zoomLevel; // find top right corner
  xOffset += (editorWidth - (maxX - minX) * zoomLevel) / 2; // add padding to center workflow

  let yOffset = minY * -1 * zoomLevel; // find top right corner
  yOffset += (editorHeight - (maxY - minY) * zoomLevel) / 2; // add padding to center workflow

  return {
    zoomLevel,
    x: closestNumberDivisibleBy(xOffset, 20),
    y: closestNumberDivisibleBy(yOffset, 20),
  };
}

export const getWorkflowCorners = (nodes: INode[]) => {
  return nodes.reduce(
    (accu, node) => {
      const xOffset = NODE_SIZE;
      const yOffset = NODE_SIZE;

      const x = node.x;
      const y = node.y;

      if (x < accu.minX) {
        accu.minX = x;
      }
      if (y < accu.minY) {
        accu.minY = y;
      }
      if (x + NODE_SIZE > accu.maxX) {
        accu.maxX = x + xOffset;
      }
      if (y + yOffset > accu.maxY) {
        accu.maxY = y + yOffset;
      }

      return accu;
    },
    {
      minX: nodes[0].x,
      minY: nodes[0].y,
      maxX: nodes[0].x,
      maxY: nodes[0].y,
    },
  );
};

export const closestNumberDivisibleBy = (inputNumber: number, divisibleBy: number): number => {
  const quotient = Math.ceil(inputNumber / divisibleBy);

  // 1st possible closest number
  const inputNumber1 = divisibleBy * quotient;

  // 2nd possible closest number
  const inputNumber2 =
    inputNumber * divisibleBy > 0 ? divisibleBy * (quotient + 1) : divisibleBy * (quotient - 1);

  // if true, then inputNumber1 is the required closest number
  if (Math.abs(inputNumber - inputNumber1) < Math.abs(inputNumber - inputNumber2)) {
    return inputNumber1;
  }

  // else inputNumber2 is the required closest number
  return inputNumber2;
};

const getContentDimensions = (): { editorWidth: number; editorHeight: number } => {
  let contentWidth = window.innerWidth;
  let contentHeight = window.innerHeight;
  const nodeViewRoot = document.getElementById('flow-area-root');

  if (nodeViewRoot) {
    const contentBounds = nodeViewRoot.getBoundingClientRect();
    contentWidth = contentBounds.width;
    contentHeight = contentBounds.height;
  }
  return {
    editorWidth: contentWidth,
    editorHeight: contentHeight,
  };
};

export const scaleSmaller = ({ scale, x, y }: IZoomConfig): IZoomConfig => {
  scale /= 1.25;
  x /= 1.25;
  y /= 1.25;
  x += window.innerWidth / 10;
  y += window.innerHeight / 10;

  return {
    scale,
    x,
    y,
  };
};

export const scaleBigger = ({ scale, x, y }: IZoomConfig): IZoomConfig => {
  scale *= 1.25;
  x -= window.innerWidth / 10;
  y -= window.innerHeight / 10;
  x *= 1.25;
  y *= 1.25;

  return {
    scale,
    x,
    y,
  };
};

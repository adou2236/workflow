## props
### v-model:data
```typescript
// 双向绑定数据，数据保持以下格式 //待定
{
  "nodeList": Node[], // 节点列表
  "linkList": Link[], // 连接线列表
  "attr": [key: string]: any, // 其他冗余数据
  "status": enum, // 全流程状态
  "id": string; // 工作流id
  "name": string; // 工作流名称
}

type Node {
    type: string, //节点类型
    nodeName: string, //节点唯一名称
    flowType: "action" | "trigger", // 节点功能 动作或触发器
    inputs: string[], // 工作流入
    outputs: string[], // 工作流出
    icon: string, // 图标
    description?: string, //节点描述
    disabled?: boolean, //是否禁用
    displayName: string, // 节点展示名称
    parameters: Schema, // 节点配置schema
    setting: [key: string]: any, // 节点基础设置 重试策略等
    value: [key: string]: any, // 节点属性值
    x: number, // 横坐标
    y: number, // 纵坐标
}

type Link {
  id: string, // 自动生成唯一id
  sourceId: string, // 源节点id
  targetId: string, // 目标节点id
  sourceOutput: string, // 源节点出参
  targetInput: string, //目标节点入参
  label: string, // 连线注释
}
```

### v-model:select
```
当前选中节点
```
### readOnly
```javascript
// 设置工作流是否只读，默认false
```

## methods
### registNodes TODO
```typescript
// 注册节点，节点格式保持以下格式
  type: string, //节点类型，用于区分,
  nodeName: string, // 节点唯一名称
  icon: string, //节点图标
  inputs: string[], // 入参，保持在4个以内
  outputs: string[], // 出参，保持在4个以内
  parameters: {}, // 低代码渲染json，目前保持与form-create(v3)保持一致

```

### deleteNode TODO
删除节点

params:

| 参数 | 说明 |
|-----|-----|
| id | 节点唯一id |

### testWorkflow TODO
测试工作流

| 参数       | 说明      |
|----------|---------|
| callback | 测试完成的回调 |

## events

### setNodeParams

```typescript
点击节点设置按钮
function(node){
    // node: 点击的节点
}
```

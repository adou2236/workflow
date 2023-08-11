<template>
  <el-header class="header-option">
    <div>
      <el-switch :value="readOnly" @change="(v) => emits('update:readOnly', v)" />
      只读
    </div>
    <div class="header-option__buttons">
      <el-button @click="emits('showData')" size="small"> 查看数据 </el-button>

      <el-button @click="emits('generateFlowImage')" size="small"> 生成流程图片 </el-button>

      <el-button size="small" @click="emits('clear')"> 清空 </el-button>

      <el-button @click="emits('toggleShowGrid')" size="small"> 网格 </el-button>
    </div>
  </el-header>
</template>

<script lang="ts" setup>
  import { PropType } from 'vue';
  import { ITool } from '@/type/index';
  import { ToolsTypeEnum } from '@/type/enums';

  defineProps({
    flowData: {
      type: Object,
      default: () => ({}),
    },
    readOnly: {
      type: Boolean,
      default: false,
    },
  });

  const emits = defineEmits([
    'selectTool',
    'generateFlowImage',
    'clear',
    'toggleShowGrid',
    'setting',
    'openTest',
    'shortcutHelper',
    'saveFlow',
  ]);

  function selectTool(type: ToolsTypeEnum) {
    emits('selectTool', type);
  }
</script>

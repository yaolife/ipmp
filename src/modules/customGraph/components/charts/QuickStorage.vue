<template>
  <div class="quick-storage">快捷入库组件</div>
</template>

<script>
/**
 * 快捷入库组件
 *
 * 用于提供快速入库操作的功能组件，支持通过配置自定义入库表单和流程
 * 特性：
 * - 提供快捷入库操作界面
 * - 支持自定义入库表单配置
 * - 可配置入库流程和验证规则
 * - 响应式布局，适配不同尺寸
 *
 * @component
 * @example
 * <quick-storage
 *   :config="{
 *     title: '快捷入库',
 *     fields: [
 *       { label: '物品名称', type: 'input' },
 *       { label: '数量', type: 'number' }
 *     ]
 *   }"
 * />
 */
export default {
  name: "QuickStorage",
  props: {
    /**
     * 组件配置对象
     * 用于自定义快捷入库组件的表单字段、样式和行为
     * @example
     * {
     *   title: '快捷入库',           // 组件标题
     *   theme: 'light',             // 主题：'light'|'dark'
     *   layout: 'vertical',         // 布局方式：'vertical'|'horizontal'|'grid'
     *   submitButtonText: '提交入库', // 提交按钮文本
     *   showReset: true,            // 是否显示重置按钮
     *   resetButtonText: '重置',     // 重置按钮文本
     *   fields: [                   // 表单字段配置
     *     {
     *       label: '物品名称',       // 字段标签
     *       name: 'itemName',       // 字段名称
     *       type: 'input',          // 字段类型：'input'|'number'|'select'|'date'|'upload'
     *       required: true,         // 是否必填
     *       placeholder: '请输入物品名称', // 占位文本
     *       rules: [               // 验证规则
     *         { required: true, message: '请输入物品名称' },
     *         { min: 2, max: 20, message: '长度在 2 到 20 个字符' }
     *       ],
     *       defaultValue: '',      // 默认值
     *       disabled: false        // 是否禁用
     *     },
     *     {
     *       label: '数量',
     *       name: 'quantity',
     *       type: 'number',
     *       min: 1,
     *       max: 9999,
     *       step: 1,
     *       precision: 0,          // 小数位数
     *       controls: true         // 是否显示增减按钮
     *     },
     *     {
     *       label: '类别',
     *       name: 'category',
     *       type: 'select',
     *       options: [            // 下拉选项
     *         { label: '原材料', value: 'raw' },
     *         { label: '成品', value: 'finished' }
     *       ],
     *       multiple: false       // 是否多选
     *     }
     *   ],
     *   actions: [                // 额外的操作按钮
     *     {
     *       text: '扫码录入',
     *       type: 'primary',
     *       icon: 'el-icon-camera'
     *     }
     *   ],
     *   showScanCode: true,       // 是否显示扫码功能
     *   showBatchImport: true,    // 是否显示批量导入
     *   autoComplete: true,       // 是否启用自动完成
     *   validateOnChange: false,  // 是否在字段变化时验证
     *   submitConfirm: true,      // 提交时是否需要确认
     *   confirmMessage: '确认提交入库？', // 确认提示文本
     *   successMessage: '入库成功',     // 成功提示文本
     *   storage: {                // 入库相关配置
     *     warehouseId: 'default', // 默认仓库ID
     *     locationRequired: true, // 是否必须选择库位
     *     batchRequired: false,   // 是否必须输入批次号
     *     autoGenerateBatch: true // 是否自动生成批次号
     *   }
     * }
     */
    config: {
      type: Object,
      default: () => ({}),
    },
  },
};
</script>

<template>
  <div class="task-count">任务数量组件</div>
</template>

<script>
/**
 * 任务数量组件
 *
 * 用于展示各类任务的数量统计信息，支持多种展示方式和交互功能
 * 特性：
 * - 支持多种任务类型的数量统计展示
 * - 可配置不同的展示样式（卡片、列表等）
 * - 支持任务数量变化的动态更新
 * - 可配置点击事件跳转到任务详情
 * - 支持数据筛选和排序功能
 *
 * @component
 * @example
 * <task-count
 *   :config="{
 *     title: '任务统计',
 *     types: ['待处理', '进行中', '已完成'],
 *     showTotal: true,
 *     style: 'card'
 *   }"
 * />
 */
export default {
  name: "TaskCount",
  props: {
    /**
     * 组件配置对象
     * 用于自定义任务数量组件的展示内容、样式和交互行为
     * @example
     * {
     *   title: '任务统计',          // 组件标题
     *   subTitle: '本周任务概览',    // 副标题
     *   types: [                   // 任务类型配置
     *     {
     *       key: 'pending',        // 类型标识
     *       label: '待处理',        // 显示名称
     *       icon: 'el-icon-time',  // 图标
     *       color: '#FF9800',      // 主题色
     *       description: '需要处理的任务' // 描述文本
     *     },
     *     {
     *       key: 'processing',
     *       label: '进行中',
     *       icon: 'el-icon-loading',
     *       color: '#2196F3'
     *     },
     *     {
     *       key: 'completed',
     *       label: '已完成',
     *       icon: 'el-icon-success',
     *       color: '#4CAF50'
     *     }
     *   ],
     *   counts: [12, 5, 8],        // 各类型对应的数量
     *   style: 'card',             // 展示样式：'card'|'list'|'simple'
     *   layout: 'horizontal',      // 布局方式：'horizontal'|'vertical'|'grid'
     *   showTotal: true,           // 是否显示总数
     *   totalPosition: 'top',      // 总数显示位置：'top'|'bottom'|'none'
     *   showTrend: true,          // 是否显示趋势
     *   trendDays: 7,             // 趋势天数
     *   showPercentage: true,     // 是否显示百分比
     *   animation: true,          // 是否启用数字动画
     *   refreshInterval: 300,     // 自动刷新间隔（秒），0表示不自动刷新
     *   showEmpty: true,         // 数量为0时是否显示
     *   emptyText: '暂无任务',    // 空状态文本
     *   sorting: 'desc',         // 排序方式：'asc'|'desc'|'none'
     *   filter: {               // 筛选配置
     *     enabled: true,        // 是否启用筛选
     *     options: [           // 筛选选项
     *       { label: '全部', value: 'all' },
     *       { label: '今日', value: 'today' },
     *       { label: '本周', value: 'week' }
     *     ]
     *   },
     *   onClick: (type, data) => { // 点击事件处理
     *     console.log(`查看${type}任务`, data)
     *   },
     *   onRefresh: () => {        // 刷新事件处理
     *     console.log('刷新数据')
     *   },
     *   permission: {             // 权限控制
     *     view: ['user'],        // 查看权限
     *     export: ['admin']      // 导出权限
     *   },
     *   exportConfig: {          // 导出配置
     *     enabled: true,         // 是否启用导出
     *     fileName: '任务统计',   // 导出文件名
     *     format: 'xlsx'         // 导出格式
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

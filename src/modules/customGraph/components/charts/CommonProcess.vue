<template>
  <div class="common-process">常用流程组件</div>
</template>

<script>
/**
 * 常用流程组件
 *
 * 用于展示和快速访问系统中的常用业务流程
 * 可通过config配置展示的流程项目、样式和交互方式
 * 特性：
 * - 支持流程分类展示
 * - 可配置流程图标、名称、描述和跳转链接
 * - 支持权限控制，根据用户角色显示不同流程
 * - 可记录用户使用频率，智能推荐常用流程
 */
export default {
  name: "CommonProcess",
  props: {
    /**
     * 组件配置对象
     * 用于自定义常用流程组件的展示内容、样式和交互行为
     * @example
     * {
     *   title: '常用业务流程',       // 组件标题
     *   displayMode: 'grid',        // 展示模式：'grid'|'list'|'card'
     *   showIcon: true,             // 是否显示图标
     *   columns: 4,                 // 网格模式下的列数
     *   categories: [               // 流程分类
     *     {
     *       id: 'approval',
     *       name: '审批流程',
     *       icon: 'el-icon-s-check'
     *     }
     *   ],
     *   processes: [                // 流程项配置
     *     {
     *       id: 'leave-approval',   // 流程唯一标识
     *       name: '请假申请',        // 流程名称
     *       icon: 'el-icon-date',   // 流程图标
     *       description: '发起请假申请流程', // 流程描述
     *       link: '/workflow/leave', // 流程链接
     *       categoryId: 'approval', // 所属分类ID
     *       permissions: ['employee'], // 可访问的角色
     *       frequencyScore: 95,     // 使用频率分数（用于排序）
     *       isNew: false,           // 是否为新流程
     *       isHot: true,            // 是否为热门流程
     *       badgeText: ''           // 徽章文本
     *     }
     *   ],
     *   enableFrequencyTracking: true, // 是否启用频率跟踪
     *   enablePersonalization: true,   // 是否启用个性化推荐
     *   maxDisplay: 8,                 // 最大显示数量
     *   showViewMore: true,            // 是否显示"查看更多"
     *   showSearch: true               // 是否显示搜索框
     * }
     */
    config: {
      type: Object,
      default: () => ({}),
    },
  },
};
</script>

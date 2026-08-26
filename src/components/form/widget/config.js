/*
 * config.fieldsConfig 控件信息配置
 *
 * */
export default {
  fieldsConfig:  [
    {
      modelType: 'common', // 区分是组件类型（常用组件-common/数据模型-model）
      type: 'fsscApplyCompany',
      name: '申请公司', // name必须要有 否则常用组件搜索不到
      label: '申请公司',
      version: 'V1.0',//版本
      illustrate: '',//组件描述
      modifyContent: '',//修改内容
      labelWidth: '140',//label的默认宽度
      hiddenLabel: false,//默认是否隐藏label
      icon: 'icon-zujiantubiao-xuanbumen',//控件列表的图标
      span: 12,//默认宽度
      display: true,//控件是否显示
      component: "cud-fssc-apply-company",//控件页面的vue文件名
      events: [], // 控件自定义扩展事件list
      fieldColumn: ['value'] // 模型映射字段配置，目前只有value一个
    },
  ],
}

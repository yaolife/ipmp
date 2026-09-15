/*
 * config - 表格树组件模块配置
 * config.fieldsConfig 组件信息配置
 * config.components 表格树模块组件
 *
 * */
import TableTree from "./cud-table-tree.vue";
export default {
  //注意：组件配置信息是入库的，更改了组件配置后需要在表单里点击刷新或者重新拉一个组件出来
  fieldsConfig: [
    {
      modelType: "common", // 区分是组件类型（常用组件-common/数据模型-model）
      type: "tableTree",   //和表单的组件标识要一致
      name: "表格树组件",  // name必须要有 否则常用组件搜索不到
      isCustom: true,     //是否时自定义的组件，默认写true即可
      labelWidth: "140",  // 组件的标题宽度，隐藏标题的话写'0'
      label: "表格树组件",// 组件的标题，隐藏标题的话写''
      hiddenLabel: true, // 是否隐藏标题
      icon: "icon-zujiantubiao-xuanbumen", // 组件在表单设计器里的图标
      span: 24,        // 组件宽度，用法同vue栅格，24代表整行
      component: "cud-tableTree", //组件的文件名
      display: true,// 组件是否显示，默认写true显示
      required:true,
      detail:false,
      events: [
        {
          name: "click",
          params: "val",
          func: ""
        }
      ], // 组件自定义事件list
      /** value字段 组件提交到表单的数据结构，表单设计的模型映射界面中组件映射
       * 字段来自于此配置；一版与组件数据模型的结构保持一致。 */
      value: {
        kcCode: '',  // 主实体 课程编号字段
        kcName: '',  // 主实体 课程名称字段
        kcInfo: [],  // 子实体 表格树信息字段
      },
      // 组件的数据模型映射字段
      fieldColumn: [
        {
          name: 'kcCode',
        },
        {
          name: 'kcName',
        },
        {
          name: 'muluName',
          type: 'report',
          parentName: 'kcInfo',
        },
        {
          name: 'zerenren',
          type: 'report',
          parentName: 'kcInfo',
        },
        {
          name: 'muLuInfo',
          type: 'report',
          parentName: 'kcInfo',
        },
        {
          name: 'ckId',
          type: 'report',
          parentName: 'kcInfo',
        },
        {
          type: 'report',
          name: 'treeChildren',
          parentName: 'kcInfo',
        },
        {
          type: 'report',
          name: 'parentId',
          parentName: 'kcInfo',
        },
      ],
      isControl: true,
    }
  ],
  components: {
    TableTree
  }
};

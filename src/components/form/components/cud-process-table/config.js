/*
 * @Author: your name
 * @Date: 2023-08-22 09:23:25
 * @LastEditTime: 2023-08-24 17:25:53
 * @LastEditors: Please set LastEditors
 * @Description: 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 * @FilePath: \cud\src\components\form\components\cud-process2-table\config.js
 */
/*
 * config - 表格树组件模块配置
 * config.fieldsConfig 组件信息配置
 * config.components 表格树模块组件
 *
 * */
import ProcessTable from "./cud-process-table.vue";
export default {
  //注意：组件配置信息是入库的，更改了组件配置后需要在表单里点击刷新或者重新拉一个组件出来
  fieldsConfig: [
    {
      modelType: "common", // 区分是组件类型（常用组件-common/数据模型-model）
      type: "processTable",   //和表单的组件标识要一致
      name: "自定义组件示例",  // name必须要有 否则常用组件搜索不到
      isCustom: true,     //是否时自定义的组件，默认写true即可
      labelWidth: "140",  // 组件的标题宽度，隐藏标题的话写'0'
      label: "自定义组件示例",// 组件的标题，隐藏标题的话写''
      hiddenLabel: true, // 是否隐藏标题
      icon: "icon-zujiantubiao-xuanbumen", // 组件在表单设计器里的图标
      span: 24,        // 组件宽度，用法同vue栅格，24代表整行
      component: "cud-processTable", //组件的文件名
      display: true,// 组件是否显示，默认写true显示
      required: true,
      handleClass: "com.cgnpc.cuddemo.form.component.handler.ComponentProcessTableHandler", //组件处理类路径
      dataModelClassPath: "com.cgnpc.cuddemo.form.component.model.ComponentProcessTableModel", //组件数据模型路径
      initJavaClass: "com.cgnpc.cuddemo.form.component.vo.ComponentProcessTableVO", //组件VO路径
      events: [], // 组件自定义事件list
      // value字段 组件提交到表单的数据结构，表单设计的模型映射界面中组件映射字段来自于此配置；一般与组件数据模型的结构保持一致。
      value: {
        text:'',
        textArea:'',
        option1: false,
        option2: false,
        select: '',
        listData: []
      },
      // 组件的数据模型映射字段，当列表数据映射时，需要同时设置type为report和parentName
      fieldColumn: [
        {
          name: 'text'
        },
        {
          name: 'textArea'
        },
        {
          name: 'option1'
        },
        {
          name: 'option2'
        },
        {
          name: 'select'
        },
        {
          name: 'id',
          type: 'report',
          parentName: 'listData',
        },
        {
          name: 'name',
          type: 'report',
          parentName: 'listData',
        },
        {
          name: 'value',
          type: 'report',
          parentName: 'listData',
        },
      ],
      isControl: false
    }
  ],
  components: {
    ProcessTable
  }
};

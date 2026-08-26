import FunctionLocation from "./cud-function-location.vue";
export default {
  //注意：组件配置信息是入库的，更改了组件配置后需要在表单里点击刷新或者重新拉一个组件出来
  fieldsConfig: [
    {
      modelType: "common", // 区分是组件类型（常用组件-common/数据模型-model）
      type: "functionLocation",   //和表单的组件标识要一致
      name: "功能位置",  // name必须要有 否则常用组件搜索不到
      isCustom: true,     //是否是自定义的组件，默认写true即可
      labelWidth: "140",  // 组件的标题宽度，隐藏标题的话写'0'
      label: "功能位置",// 组件的标题，隐藏标题的话写''
      hiddenLabel: true, // 是否隐藏标题
      icon: "icon-zujiantubiao-xuanbumen", // 组件在表单设计器里的图标
      span: 24,        // 组件宽度，用法同vue栅格，24代表整行
      component: "cud-functionLocation", //组件的文件名
      display: true,// 组件是否显示，默认写true显示
      required: false,
      // handleClass: "com.cgnpc.cuddemo.form.component.handler.ComponentFunctionLocationHandler", //组件处理类路径
      // dataModelClassPath: "com.cgnpc.cuddemo.form.component.model.ComponentFunctionLocationModel", //组件数据模型路径
      initJavaClass: "com.cgnpc.cuddemo.form.component.vo.ComponentFunctionLocationVO", //组件VO路径
      events: [], // 组件自定义事件list
      value: "",
      fieldColumn: ['value'],
    }
  ],
  components: {
    FunctionLocation
  }
};

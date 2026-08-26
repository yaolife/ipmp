/*
 * config - 税费信息信息组件模块配置
 * config.fieldsConfig 组件信息配置
 * config.components 税费信息信息模块组件
 *
 * */
import TaxFee from "./cud-tax-fee";
export default {
  //注意：组件配置信息是入库的，更改了组件配置后需要在表单里点击刷新或者重新拉一个组件出来
  fieldsConfig: [
    {
      modelType: "common", // 区分是组件类型（常用组件-common/数据模型-model）
      type: "taxFee", //和表单的组件标识要一致
      name: "税费信息", // name必须要有 否则常用组件搜索不到
      isCustom: true, //fieldColumn里有parentName的时候需要这样写
      labelWidth: "140",
      label: "税费信息",
      hiddenLabel: true,
      icon: "icon-zujiantubiao-xuanbumen",
      span: 24,
      component: "cud-tax-fee", //组件的文件名
      //注册组件，所以以下三处配置成组件相关类
      handleClass: "com.cgnpc.cuddemo.form.component.handler.ComponentTaxFeeHandler", //组件处理类路径
      dataModelClassPath: "com.cgnpc.cuddemo.form.component.model.ComponentTaxFeeModel", //组件数据模型路径
      initJavaClass: "com.cgnpc.cuddemo.form.component.vo.ComponentTaxFeeVO", //组件VO路径
      display: true,
      children: {
        column: []
      },
      events: [], // 组件自定义事件list

      //这里要和定义的组件的watch的对象里的 this.$emit("input", {tableData: n.tableData}); 对应
      value: {
        tableData: []
      },
      //表单
      fieldColumn: [
        {
          name: "billNo",
          type: "report",
          parentName: "tableData"
        },
        {
          name: "customerVendor",
          type: "report",
          parentName: "tableData"
        },
        {
          name: "mAmount",
          type: "report",
          parentName: "tableData"
        },
        {
          name: "signDate",
          type: "report",
          parentName: "tableData"
        },
        {
          name: "dueDate",
          type: "report",
          parentName: "tableData"
        }
      ],

      isControl: true,
      controlNames: [
        "billNo",
        "customerVendor",
        "mAmount",
        "signDate",
        "dueDate"
      ],
      billNo: {
        prop: "billNo",
        type: "input",
        label: "票据号码"
      },
      customerVendor: {
        prop: "customerVendor",
        type: "input",
        label: "客户/应收单位"
      },
      mAmount: {
        prop: "mAmount",
        type: "input",
        label: "金额"
      },
      signDate: {
        prop: "signDate",
        type: "input",
        label: "签发日期"
      },
      dueDate: {
        prop: "dueDate",
        type: "input",
        label: "到期日"
      }
    }
  ],
  components: {
    TaxFee
  }
};

/*
 * config - 记账凭证信息组件模块配置
 * config.fieldsConfig 组件信息配置
 * config.components 记账凭证信息模块组件
 *
 * */
import BookingVoucher from "./cud-booking-voucher";// 组件前端vue代码文件名
export default {
  //注意：组件配置信息是入库的，更改了组件配置后需要在表单里点击刷新或者重新拉一个组件出来
  fieldsConfig: [
    {
      modelType: "common", // 区分是组件类型（常用组件-common/数据模型-model），默认写common即可
      type: "bookingVoucher", // 组件类型，要求唯一不可重复（相当于组件唯一标识）
      name: "记账凭证组件", // name必须要有，组件在表单设计器里显示的名字，组件支持按name搜索
      isCustom: true, //是否时自定义的组件，默认写true即可
      labelWidth: "140", // 组件的标题宽度，隐藏标题的话写'0'
      label: "记账凭证组件", // 组件的标题，隐藏标题的话写''
      hiddenLabel: true, // 是否隐藏标题
      icon: "icon-zujiantubiao-xuanbumen", // 组件在表单设计器里的图标
      span: 24, // 组件宽度，用法同vue栅格，24代表整行
      component: "cud-booking-voucher", // 组件注册的名字，默认为vue文件名
      //注册组件，所以以下三处配置成组件相关类
      handleClass: "com.cgnpc.cuddemo.form.component.handler.ComponentBookingVoucherHandler", //组件处理类路径
      dataModelClassPath: "com.cgnpc.cuddemo.form.component.model.ComponentBookingVoucherModel", //组件数据模型路径
      initJavaClass: "com.cgnpc.cuddemo.form.component.vo.ComponentBookingVoucherVO", //组件VO路径
      display: true, // 组件是否显示，默认写true显示
      value: {
        businessCategory: '',
        businessSubCategory: '',
        voucherHeaderDtos: [],
        voucherContentDtos: []
      }, // 组件提交到表单的数据结构，表单设计的模型映射界面中组件映射字段来自于此配置；一版与组件数据模型的结构保持一致。
      fieldColumn: [
        {
            name: 'businessCategory',
        },
        {
            name: 'businessSubCategory',
        },
        {
            name: 'voucherHeadId',
            start: true,
            type: 'report',
            parentName: 'voucherHeaderDtos',
        },
        {
            name: 'companyCode',
            type: 'report',
            parentName: 'voucherHeaderDtos',
        },
        {
            name: 'headerText',
            type: 'report',
            parentName: 'voucherHeaderDtos',
        },
        {
            name: 'voucherNo',
            type: 'report',
            parentName: 'voucherHeaderDtos',
        },
        {
            name: 'voucherItemId',
            start: true,
            type: 'report',
            parentName: 'voucherContentDtos',
        },
        {
            name: 'voucherHeadId',
            type: 'report',
            parentName: 'voucherContentDtos',
        },
        {
            name: 'lendDirection',
            type: 'report',
            parentName: 'voucherContentDtos',
        },
        {
            name: 'accountCode',
            type: 'report',
            parentName: 'voucherContentDtos',
        },
        {
            name: 'amount',
            type: 'report',
            parentName: 'voucherContentDtos',
        },
        {
          name: 'lineItemText',
          type: 'report',
          parentName: 'voucherContentDtos',
        }
      ], // 组件的数据模型映射字段
      isControl: true,
      controlNames: [
        "businessCategoryCtrl",
        "businessSubCategoryCtrl",
        "companyCodeCtrl",
        "copyBtnCtrl",
        "delBtnCtrl",
        "headerTextCtrl",
        "voucherNoCtrl",
        "addItemCtrl",
        "delItemCtrl",
        "lendDirectionCtrl",
        "accountCodeCtrl",
        "amountCtrl",
        "lineItemTextCtrl",
      ],
      businessCategoryCtrl:{
        prop: "businessCategoryCtrl",
        type: 'input',
        label: '大分类',
      },
      businessSubCategoryCtrl: {
        prop: "businessSubCategoryCtrl",
        type: "input",
        label: "小分类"
      },
      companyCodeCtrl:{
        prop: "companyCodeCtrl",
        type: 'input',
        label: '申请公司',
      },
      copyBtnCtrl:{
        prop: "copyBtnCtrl",
        type: 'input',
        label: '凭证复制',
      },
      delBtnCtrl:{
        prop: "delBtnCtrl",
        type: 'input',
        label: '凭证取消',
      },
      headerTextCtrl: {
        prop: "headerTextCtrl",
        type: "input",
        label: "头文本"
      },
      voucherNoCtrl:{
        prop: "voucherNoCtrl",
        type: 'input',
        label: '凭证编号',
      },
      addItemCtrl:{
        prop: "addItemCtrl",
        type: 'input',
        label: '分录行添加',
      },
      delItemCtrl:{
        prop: "delItemCtrl",
        type: 'input',
        label: '分录行删除',
      },
      lendDirectionCtrl: {
        prop: "lendDirectionCtrl",
        type: "input",
        label: "借贷方向"
      },
      accountCodeCtrl:{
        prop: "accountCodeCtrl",
        type: 'input',
        label: '记账码',
      },
      amountCtrl: {
        prop: "amountCtrl",
        type: "input",
        label: "金额"
      },
      lineItemTextCtrl:{
        prop: "lineItemTextCtrl",
        type: 'input',
        label: '行文本',
      }
    }
  ],
  components: {
    BookingVoucher
  }
};

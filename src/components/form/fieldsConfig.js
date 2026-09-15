/*
 * @Author: [P631038]杨旭
 * @Date: 2024-11-08 17:14:00
 * @LastEditors: [P631038]杨旭
 * @LastEditTime: 2025-07-29 09:39:11
 * @FilePath: \4.2.0-node16\cud4demo-ui\src\components\form\fieldsConfig.js
 * @Description: 
 */
/******************* 组件列表 *******************/
// import CudTaxFee from './components/cud-tax-fee/config'; // 税费信息组件模块
import CudBookingVoucher from './components/cud-booking-voucher/config'; // 记账凭证组件模块
import CudTableTree from './components/cud-table-tree/config'
import CudProcessTable from './components/cud-process-table/config'
import CudBlankTemp from './components/cud-blankTemp/config'
import CudCustomTable from './components/cud-customTable/config'
import CudFunctionLocation from './components/cud-function-location/config'
/******************* 控件列表 *******************/
import CudFsscWidgets from './widget/config';

export default [
  {
    title: '自定义组件 ( 编码开发 )',
    list: [
      ...CudBlankTemp.fieldsConfig,
      ...CudCustomTable.fieldsConfig,
      ...CudProcessTable.fieldsConfig,
      // ...CudTaxFee.fieldsConfig,
      ...CudBookingVoucher.fieldsConfig,
      ...CudTableTree.fieldsConfig,
      // ...CudFsscWidgets.fieldsConfig,
      // ...CudFunctionLocation.fieldsConfig
    ]
  },
  {
    title: 'ICP项目定制组件 ( 编码开发 )',
    list: [
      ...CudFunctionLocation.fieldsConfig
    ]
  },
  // {
  //   title: 'XXXX系统控件',
  //   list: CudFsscWidgets.fieldsConfig
  // },
]

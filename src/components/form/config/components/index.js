/*
 * @Author: [P631038]杨旭
 * @Date: 2024-11-08 17:14:00
 * @LastEditors: [P631038]杨旭
 * @LastEditTime: 2024-12-17 15:13:38
 * @FilePath: \4.2.0-node16\cud4demo-ui\src\components\form\config\components\index.js
 * @Description: 
 */
/*
* ### 注: 导入组件，组件必须声明  config - 组件名词
* @description: 组件注册
* 获取组件名称以config开头的组件列表
*
* config下的组件用于扩展配置表单设计中组件属性内容
* */
import TaxFee from './tax-fee';
import BookingVoucher from './booking-voucher';
import tableTree from './table-tree';
import processTable from './process-table';
import blankTemp from './blankTemp';
import customTable from './customTable';
import functionLocation from './functionLocation';
const compAttrConfigComponents = [
  ...TaxFee,
  ...BookingVoucher,
  ...tableTree,
  ...processTable,
  ...blankTemp,
  ...customTable,
  ...functionLocation
]
export default compAttrConfigComponents;

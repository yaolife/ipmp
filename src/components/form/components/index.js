/*
 * @Author: [P631038]杨旭
 * @Date: 2024-11-08 17:14:00
 * @LastEditors: [P631038]杨旭
 * @LastEditTime: 2024-12-16 17:29:26
 * @FilePath: \4.2.0-node16\cud4demo-ui\src\components\form\components\index.js
 * @Description: 
 */
/*

* @description: 组件注册
* ### 注: 导入组件，组件必须声明 name
*
* */
import { componentObject2Array } from '../utils/objToArray';
import BookingVoucher from './cud-booking-voucher/config';
import TableTree from './cud-table-tree/config'
import ProcessBaseInfo from './cud-process-base-info/config'
import ProcessTable from './cud-process-table/config'
import blankTemp from './cud-blankTemp/config'
import customTable from './cud-customTable/config'
import FunctionLocation from './cud-function-location/config'
// 存储组件列表
const components = [
  ...componentObject2Array(BookingVoucher.components),
  ...componentObject2Array(TableTree.components),
  ...componentObject2Array(ProcessBaseInfo.components),
  ...componentObject2Array(ProcessTable.components),
  ...componentObject2Array(blankTemp.components),
  ...componentObject2Array(customTable.components),
  ...componentObject2Array(FunctionLocation.components),
]

// 定义 install 方法，接收 Vue 作为参数。如果使用 use 注册插件，则所有的组件都将被注册
const install = function (Vue) {
  // 判断是否安装
  if (install.installed) return;
  // 遍历注册全局组件
  components.map(component => Vue.component('Cud' + component.name, component));
}

// 判断是否是直接引入文件
if (typeof window !== 'undefined' && window.Vue) install(window.Vue);

export default {
  // 导出的对象必须具有 install，才能被 Vue.use() 方法安装
  install,
  // 以下是具体的组件列表
  ...BookingVoucher.components,
  ...TableTree.components,
  ...ProcessBaseInfo.components,
  ...ProcessTable.components,
  ...customTable.components,
  ...FunctionLocation.components,
}

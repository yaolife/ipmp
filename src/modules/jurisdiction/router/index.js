/*
 * @Author: P646008 P646008@gnpjvc.com.cn
 * @Date: 2025-09-18 18:02:05
 * @LastEditors: [P631038]杨旭
 * @LastEditTime: 2025-11-13 15:53:05
 * @FilePath: \cud4demo-ui\src\modules\jurisdiction\router\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
// 路由组件 
import RolePermissionManage from "@/modules/jurisdiction/modules/rolePermissionManage/index.vue";
import PositionPermissionManage from "@/modules/jurisdiction/modules/positionPermissionManage/index.vue";
import RolePermissionDetail from "@/modules/jurisdiction/modules/rolePermissionManage/detail.vue";
import DataPermissionRegister from "@/modules/jurisdiction/modules/dataPermissionRegister/index.vue";
import ValueHelp from "@/modules/jurisdiction/modules/valueHelp/index.vue";
import AuthorizationLog from "@/modules/jurisdiction/modules/authorizationLog/index.vue";
import PostionAuthorizationLog from "@/modules/jurisdiction/modules/positionAuthorizationLog/index.vue";
import RegisterLog from "@/modules/jurisdiction/modules/registerLog/index.vue";
import userDataPermission from "@/modules/jurisdiction/modules/userDataPermission/index.vue";
import entityAuthorization from "@/modules/jurisdiction/modules/entityAuthorization/index.vue";
import NoticeList from '@/modules/jurisdiction/modules/notice/index.vue'
import NoticeEdit from '@/modules/jurisdiction/modules/notice/edit.vue'
import NoticeDetail from '@/modules/jurisdiction/modules/notice/detail.vue'
// 1. 获取 zoom 值并更新 CSS 变量
import Vue from 'vue'
const root = document.documentElement;
const zoomRate = parseFloat(window.getComputedStyle(document.body).zoom || 1);
root.style.setProperty('--zoom-value', zoomRate);
import ReturnButton from '../components/ReturnButton';
Vue.component("ReturnButton", ReturnButton);

export default [
  {
    path: "/rolePermissionManage",
    name: "角色数据权限授权",
    component: RolePermissionManage,
    meta: "rolePermissionManage"
  },
  {
    path: "/rolePermissionManageDetail/:roleCode",
    name: "角色数据权限授权详情",
    component: RolePermissionDetail,
    meta: "rolePermissionDetail"
  },
  {
    path: "/positionPermissionManage",
    name: "岗位数据权限授权",
    component: PositionPermissionManage,
    meta: "positionPermissionManage"
  },
  {
    path: "/dataPermissionRegister",
    name: "数据权限点注册",
    component: DataPermissionRegister,
    meta: "dataPermissionRegister"
  },
  {
    path: "valueHelp",
    name: "属性值",
    component: ValueHelp,
    meta: "valueHelp"
  },
  {
    path: "registerLog",
    name: "数据权限点注册操作日志",
    component: RegisterLog,
    meta: "registerLog"
  },
  {
    path: "authorizationLog",
    name: "数据权限操作日志",
    component: AuthorizationLog,
    meta: "authorizationLog"
  },
  {
    path: "positionAuthorizationLog",
    name: "岗位授权操作日志",
    component: PostionAuthorizationLog,
    meta: "positionAuthorizationLog"
  },
  {
    path: '/userDataPermission',
    name: '用户数据权限查询',
    component: userDataPermission,
    meta: "userDataPermission"
  },
  {
    path: '/entityAuthorization',
    name: '实体授权查询',
    component: entityAuthorization,
    meta: "entityAuthorization"
  },
  {
    path: '/notice',
    name: 'NoticeList',
    component: NoticeList,
    meta: "notice"
  },
  {
    path: '/notice/edit/:noticeCode',
    name: 'NoticeEdit',
    component: NoticeEdit,
    meta: "noticeEdit"
  },
  {
    path: '/notice/detail/:noticeCode',
    name: 'NoticeDetail',
    component: NoticeDetail,
    meta: "noticeDetail"
  }
]

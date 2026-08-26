
//应用管理
import system_manage from '../../sysAppManage/view/sys_app_manage'
//功能管理
import function_manage from '../../functionManage/view/function_manage'
//角色管理
import role_manage from '../../roleManage/view/role_manage'
//人员管理
import user_manage from '../../userManage/view/user_manage'
import user_manage_edit from '../../userManage/view/user_edit'
//部门管理
import dept_manage from '../../deptManage/view/dept_manage'
//数据授权
import data_auth from '../../dataAuth/view/data_auth'
import data_auth_insert from '../../dataAuth/view/data_auth_insert'
//数据授权查询
import data_statics from '../../dataStatics/view/data_statics'

//用户中心
import userinfo from "../../userCenter/view/userinfo"
import password from "../../userCenter/view/password"
import permission from "../../userCenter/view/permission"

//数据模型模块路由
export default [
  //应用管理
  {
    path:'/systemManage',
    name:'应用管理',
    component: system_manage,
    meta: 'system_manage',
  },
  //功能管理
  {
    path:'/functionManage',
    name:'菜单管理',
    component: function_manage,
    meta: 'function_manage',
  },
  //角色管理
  {
    path:'/roleManage',
    name:'角色管理',
    component: role_manage,
    meta: 'role_manage',
  },
  //用户管理
  {
    path:'/userManage',
    name:'用户管理',
    component: user_manage,
    meta: 'user_manage',
  },
  {
    path:'/userManage/edit',
    name:'用户编辑',
    component: user_manage_edit,
    meta: 'user_manage_edit',
  },
  //部门管理
  {
    path:'/deptManage',
    name:'组织管理',
    component: dept_manage,
    meta: 'dept_manage',
  },
  //授权管理
  {
    path:'/dataAuth',
    name:'授权管理',
    component: data_auth,
    meta: 'data_auth',
  },
  {
    path:'/dataAule/insert',
    name:'编辑授权',
    component: data_auth_insert,
    meta: 'data_auth_insert',
  },
  //权限查询
  {
    path:'/dataStatics',
    name:'权限查询',
    component: data_statics,
    meta: 'data_statics',
  },
  //用户中心
  {
    path:'/userinfo',
    component: userinfo,
    name:'基本信息',
    meta:'user_userinfo'
  },
  {
    path:'/password',
    component: password,
    name:'修改密码',
    meta:'user_password'
  },
  {
    path:'/permission',
    component: permission,
    name:'权限查询',
    meta:'user_permission'
  },
]

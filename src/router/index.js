import Vue from "vue";
import Router from "vue-router";
import manage from "@/components/manage";

// 登录页
import login from "@/modules/login/login";

// 管道数据库
import drafts from "@/modules/drafts/drafts";
// 支吊架数据库
import concern from "@/modules/concern/concern";
// 管道元件数据库
import delegation from "@/modules/delegation/delegation";
// 日志管理
import logManage from "@/modules/logManage/logManage.vue";

// 用户中心
import userinfo from "@/modules/authManage/userCenter/view/userinfo";
import password from "@/modules/authManage/userCenter/view/password";
import permission from "@/modules/authManage/userCenter/view/permission";

/** ---------- 其他页面路由 ---------- */
// 404页面
import nofindurl from "@/components/common/404";
// 401页面
import nopermission from "@/components/common/401";
// 面包屑
import breadcrumb from "@/components/common/breadcrumb";

Vue.use(Router);
const _router = new Router({
  routes: [
    {
      path: "/login",
      name: "登录页面",
      component: login
    },
    {
      path: "/",
      name: "manage",
      component: manage,
      children: [
        {
          path: "",
          redirect: "/pipeDatabase"
        },
        {
          path: "/welcome/:id?",
          redirect: "/pipeDatabase"
        },
        {
          path: "/breadcrumb",
          name: "面包屑",
          component: breadcrumb,
          hidden: true
        },
        {
          path: "/404",
          name: "404页面",
          component: nofindurl
        },
        {
          path: "/401",
          name: "401页面",
          component: nopermission
        },
        // 资产管理
        {
          path: "/pipeDatabase",
          name: "管道数据库",
          component: drafts,
          meta: "pipeDatabase",
          alias: "/drafts"
        },
        {
          path: "/hangerDatabase",
          name: "支吊架数据库",
          component: concern,
          meta: "hangerDatabase",
          alias: "/concern"
        },
        {
          path: "/pipeComponentDatabase",
          name: "管道元件数据库",
          component: delegation,
          meta: "pipeComponentDatabase",
          alias: "/delegation"
        },
        {
          path: "/logManage",
          name: "日志管理",
          component: logManage,
          meta: "operationLogManage"
        },
        // 用户中心
        {
          path: "/userinfo",
          component: userinfo,
          name: "基本信息",
          meta: "user_userinfo"
        },
        {
          path: "/password",
          component: password,
          name: "修改密码",
          meta: "user_password"
        },
        {
          path: "/permission",
          component: permission,
          name: "权限查询",
          meta: "user_permission"
        }
      ]
    }
  ]
});
//解决重复点击导航时，控制台出现报错—--亦可在跳转时做判断
const VueRouterPush = Router.prototype.push
Router.prototype.push = function push(to) {
  return VueRouterPush.call(this, to).catch(err => err)
}
export default _router

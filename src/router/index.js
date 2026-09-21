import Vue from "vue";
import Router from "vue-router";
import manage from "@/components/manage";

// 登录页
import login from "@/modules/login/login";

// 管道数据库
import drafts from "@/modules/drafts/drafts";
// 数字孪生可视化
import digitalTwinScreen from "@/modules/screen/index";
// 支吊架数据库
import concern from "@/modules/concern/concern";
// 管道模型数据库
import delegation from "@/modules/delegation/delegation";
// 模型管理
import modelManage from "@/modules/modelManage/modelManage";
// 日志管理
import logManage from "@/modules/logManage/logManage.vue";
// 分析治理 / LOF
import lofLedger from "@/modules/lof/ledger.vue";
import lofTm01 from "@/modules/lof/tm01.vue";
import lofTm02 from "@/modules/lof/tm02.vue";
import lofTm05 from "@/modules/lof/tm05.vue";

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

import { getPixelStreamUrl } from "@/utils/pixelStream";

Vue.use(Router);

const pixelStreamUrl = getPixelStreamUrl();

function redirectToYj3dvp(to) {
  let path = "/YJ3DVP";
  if (to.params.modelId) path += "/" + to.params.modelId;
  if (to.params.others) path += "/" + to.params.others;
  return path;
}

const _router = new Router({
  routes: [
    {
      path: "/login",
      name: "登录页面",
      component: login
    },
    {
      name: "YJ3DVP",
      path: "/YJ3DVP/:modelId?/:others?",
      component: digitalTwinScreen,
      meta: {
        title: "阳江核电融合定位可视化平台",
        menuCode: "digitalTwin",
        pixelStreamUrl: pixelStreamUrl
      },
      props: route => ({ key: route.path })
    },
    {
      path: "/screen/:modelId?/:others?",
      redirect: redirectToYj3dvp
    },
    {
      path: "/",
      name: "manage",
      component: manage,
      children: [
        {
          path: "",
          redirect: "/YJ3DVP"
        },
        {
          path: "/welcome/:id?",
          redirect: "/pipeDatabase"
        },
        {
          path: "/main",
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
          name: "管道模型数据库",
          component: delegation,
          meta: "pipeComponentDatabase",
          alias: "/delegation"
        },
        {
          path: "/modelManage",
          name: "模型管理",
          component: modelManage,
          meta: "modelManage"
        },
        {
          path: "/logManage",
          name: "日志管理",
          component: logManage,
          meta: "operationLogManage"
        },
        {
          path: "/lof/ledger",
          name: "三维台账",
          component: lofLedger,
          meta: "lofLedger"
        },
        {
          path: "/lof/tm01",
          name: "TM01 定性评估",
          component: lofTm01,
          meta: "lofTm01"
        },
        {
          path: "/lof/tm02",
          name: "TM02 定量评估",
          component: lofTm02,
          meta: "lofTm02"
        },
        {
          path: "/lof/tm05",
          name: "TM05 振动校核",
          component: lofTm05,
          meta: "lofTm05"
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
        },
        {
          path: "*",
          redirect: "/YJ3DVP"
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

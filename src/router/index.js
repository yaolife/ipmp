import Vue from "vue";
import Router from "vue-router";
import manage from "@/components/manage";

// 首页 默认重定向至待办/office
import welcome from "@/components/common/welcome";
// 新版首页
import home from "@/modules/home/index";
// 登录页
import login from "@/modules/login/login";

/** ---------- 个人工作台 ---------- */
// 发起流程
import start from "@/modules/mywork/start";
// 我的办公
import office from "@/modules/mywork/office";
// 我的草稿
import drafts from "@/modules/drafts/drafts";
// 我的关注
import concern from "@/modules/concern/concern";
// 我的代理
import delegation from "@/modules/delegation/delegation";

/** ---------- 字典管理 ---------- */
import dict from "@/modules/dict/dict_manage";

/** ---------- http连接器 ---------- */
// HTTP连接器
import httpConnector from "@/modules/connector/http_connector";
// 编辑HTTP连接器
import httpConnectorEdit from "@/modules/connector/http_connector_edit";
// 连接器日志
import connectorLog from "@/modules/connector/connector_log";

/** ---------- 模板管理 ---------- */
// 邮件模板
import email_template from "@/modules/emailtemplate/email_template";
// 邮件模板新增
import email_template_add from "@/modules/emailtemplate/email_template_add";
// 邮件模板修改
import email_template_edit from "@/modules/emailtemplate/email_template_edit";
// 消息模板
import message_template from "../modules/messagetemplate/message_template";
// 消息模板新增
import message_template_add from "../modules/messagetemplate/message_template_add";
// 消息模板修改
import message_template_edit from "../modules/messagetemplate/message_template_edit";

/** ---------- 流程管理 ---------- */
// 流程实例管理
import proc_instance_manage from "@/modules/procInst/wf_proc_instance_manage";
// 流程实例编辑
import wf_proc_instance_manage_update from "@/modules/procInst/wf_proc_instance_manage_update";
// 流程操作日志
import proc_instance_manage_log from "@/modules/procInst/wf_proc_instance_manage_log";
// 流程督办管理
import proc_instance_manage_supervise from "@/modules/procInst/wf_proc_instance_manage_supervise";

/** ---------- 系统管理 ---------- */
// 全局参数
import global_param_manage from "@/modules/system/globalParam/global_param_manage";
import i18n_lang_manage from "@/modules/system/i18n/i18n_lang_manage.vue";
import i18n_item_manage from "@/modules/system/i18n/i18n_item_manage.vue";


// 业务消息管理
import business_msg_manage from "@/modules/system/businessMsg/business_msg_manage";
// 多语言管理
import lang_manage from "@/modules/system/i18n/lang_manage.vue";
// 接口管理
// import interfaceManage from "@/modules/system/interfacemanage/interface_manage";
// 接口日志一览
import interfaceLogManage from "@/modules/system/interfaceLogManage/interface_log_manage.vue";
// 审计日志一览
import auditLogManage from "@/modules/system/auditLogManage/audit_log_manage.vue";
// 性能日志一览
import performanceLogManage from "@/modules/system/performanceLogManage/performance_log_manage.vue";
// 业务数据日志
import dataLogManage from "@/modules/system/dataLogManage/data_log_manage.vue";

// 授权管理
import authManage from "@/modules/authManage/common/router";

/** ---------- 宁德迁移至CUD的功能模块 ---------- */
// 流程模板管理
// import processManage from "@/modules/processSimulation/processManage";
// 流程图绘制
// import processMap from "@/modules/processSimulation/processMap";
// 流程执行界面
import runPage from "@/modules/processSimulation/runPage";
// 流程参数界面1
// import processParameter1 from "@/modules/processSimulation/processParameter1";
// 流程参数界面2
// import processParameter2 from "@/modules/processSimulation/processParameter2";
// 模拟日志
// import simulationLog from "@/modules/processSimulation/simulationLog";
// 流程模板设计
// import wf_template_design from "@/modules/processSimulation/component/wf_template_design";
// 运维调度
import operationDispatch from "@/modules/processMaintenance/operationDispatch";
// 异常任务
// import abnormalTask from "@/modules/processMaintenance/abnormalTask";
// 挂起任务
// import suspendTask from "@/modules/processMaintenance/suspendTask";

/** ---------- 其他页面路由 ---------- */
// 404页面
import nofindurl from "@/components/common/404";
// 401页面
import nopermission from "@/components/common/401";
// 面包屑
import breadcrumb from "@/components/common/breadcrumb";
// 自定义表单demo
import customFlow from "@/modules/customFlow";

/** 组件示例库(开发中) */
// 选人选部门组件示例
import globalComponents from "@/modules/demoLib/personDeptDemo/index";
import onlyOffice from "@/modules/demoLib/onlyOffice/index";
// vueOffice预览
import previewDemo from "@/modules/demoLib/preViewDemo/index.vue";
// icon示例库
import iconDemo from "@/modules/demoLib/iconDemo/index.vue";
// 三级菜单
import thirdPage01 from "@/modules/demoLib/thirdPage01";
import thirdPage02 from "@/modules/demoLib/thirdPage02";
import thirdPage03 from "@/modules/demoLib/thirdPage03";
// kkfileView预览示例
import kkFileViewDemo from "@/modules/demoLib/kkFileViewDemo/index.vue";
// pdfJs预览示例
import pdfJsDemo from "@/modules/demoLib/pdfJsDemo/index.vue";
// // 短链接生成预览示例
import shortLink from "@/modules/demoLib/shortLink/index.vue";
// 富文本编辑器示例
import editor from "@/modules/demoLib/editor/index.vue";
// vxeTable表格示例
import vxeTable from "@/modules/demoLib/vxeTable/index.vue";
import grafana from "@/modules/demoLib/grafana/index.vue";
// 大文件上传示例
import bigFileUploadDemo from "@/modules/demoLib/bigFileUploadDemo/index.vue";
// 自定义门户
import pageManagement from "@/modules/customPortal/index.vue";
// 画布编辑
import customGraph from "@/modules/customGraph/index.vue";
// 画布预览
import customPreview from "@/modules/customGraph/preview.vue";
// 工程
import engineering from "@/modules/engineering/engineering";
// 版本管理
import version from "@/modules/version/version";
// 版本调整记录
import versionRecord from "@/modules/version/versionRecord";
// 版本比对
import versionComparison from "@/modules/version/versionComparison";
//监控码管理
import monitoringCode from "@/modules/monitor/monitoringCode";
//监控模块管理
import monitoringModule from "@/modules/monitor/monitoringModule";
//监控维度管理
import monitoringDimension from "@/modules/monitor/monitoringDimension";

import jurisdictionRouter from "@/modules/jurisdiction/router/index.js";

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
        //授权管理
        ...authManage,
        ...jurisdictionRouter,
        {
          path: "/welcome/:id?",
          component: welcome,
          name: "首页",
          alias: ["/", "/welcome/:path*/:id"],
          meta: "welcome"
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
        // 个人工作台
        {
          path: "/office",
          name: "我的办公",
          component: office,
          meta: "office"
        },
        {
          path: "/start",
          name: "发起流程",
          component: start,
          meta: "start"
        },
        {
          path: "/drafts",
          name: "我的草稿",
          component: drafts,
          meta: "drafts"
        },
        {
          path: "/concern",
          name: "我的关注",
          component: concern,
          meta: "concern"
        },
        {
          path: "/delegation",
          name: "我的代理",
          component: delegation,
          meta: "delegation"
        },
        // 数据字典管理
        {
          path: "/dict",
          name: "数据字典管理",
          component: dict,
          meta: "dict_manage"
        },
        // 系统管理
        {
          path: "/interfaceLogManage",
          name: "接口日志一览",
          component: interfaceLogManage,
          meta: "interface_log_manage"
        },
        {
          path: "/auditLogManage",
          name: "审计日志一览",
          component: auditLogManage,
          meta: "audit_log_manage"
        },
        {
          path: "/performanceLogManage",
          name: "性能日志一览",
          component: performanceLogManage,
          meta: "performance_log_manage"
        },
        {
          path: "/dataLogManage",
          name: "数据日志一览",
          component: dataLogManage,
          meta: "data_log_manage"
        },
        {
          path: "/global_param",
          component: global_param_manage,
          name: "全局参数",
          meta: "global_param"
        },
        {
          path: "/i18n/lang",
          component: i18n_lang_manage,
          name: "全局参数",
          meta: "global_param"
        },
        {
          path: "/i18n/item",
          component: i18n_item_manage,
          name: "全局参数",
          meta: "global_param"
        },


        {
          path: "/businessMsg",
          component: business_msg_manage,
          name: "业务消息管理",
          meta: "business_msg_manage"
        },
        {
          path: "/i18n/lang_manage",
          component: lang_manage,
          name: "多语言管理",
          meta: "lang_manage"
        },
        //HTTP连接器
        {
          path: "/httpConnector",
          name: "HTTP连接器",
          component: httpConnector,
          meta: "http_connector"
        },
        {
          path: "/httpConnector/edit",
          name: "编辑HTTP连接器",
          component: httpConnectorEdit,
          meta: "http_connector_edit",
          props: {
            //关联菜单
            menuPath: "/httpConnector"
          }
        },
        {
          path: "/connectorLog",
          name: "连接器日志",
          component: connectorLog,
          meta: "connector_log"
        },
        // 流程管理
        {
          path: "/proc_instance_manage",
          name: "流程实例管理",
          component: proc_instance_manage,
          meta: "proc_instance_manage"
        },
        {
          path: "/wf_proc_instance_manage_update",
          name: "流程实例编辑",
          component: wf_proc_instance_manage_update,
          meta: "wf_proc_instance_manage_update",
          props: {
            //关联菜单
            menuPath: "/proc_instance_manage"
          }
        },
        {
          path: "/proc_instance_manage_log",
          name: "流程操作日志",
          component: proc_instance_manage_log,
          meta: "proc_instance_manage_log"
        },
        {
          path: "/proc_instance_manage_supervise",
          name: "流程督办管理",
          component: proc_instance_manage_supervise,
          meta: "proc_instance_manage_supervise"
        },
        // 模板管理
        {
          path: "/email_template",
          component: email_template,
          name: "邮件模板",
          meta: "EmailTemplate"
        },
        {
          path: "/email_template/add",
          name: "邮件模板新增",
          component: email_template_add,
          meta: "email_template_add",
          props: {
            //关联菜单
            menuPath: "/email_template"
          }
        },
        {
          path: "/email_template/edit",
          name: "邮件模板修改",
          component: email_template_edit,
          meta: "email_template_edit",
          props: {
            //关联菜单
            menuPath: "/email_template"
          }
        },
        {
          path: "/message_template",
          component: message_template,
          name: "消息模板",
          meta: "MessageTemplate"
        },
        {
          path: "/message_template/add",
          name: "消息模板新增",
          component: message_template_add,
          meta: "message_template_add",
          props: {
            //关联菜单
            menuPath: "/message_template"
          }
        },
        {
          path: "/message_template/edit",
          name: "消息模板修改",
          component: message_template_edit,
          meta: "message_template_edit",
          props: {
            //关联菜单
            menuPath: "/message_template"
          }
        },
        // 宁德迁移至CUD的功能模块
        // {
        //   path: "/processSimulation/processManage",
        //   name: "流程模板管理",
        //   component: processManage,
        //   meta: "processManage"
        // },
        // {
        //   path: "/processSimulation/processMap",
        //   name: "流程图绘制",
        //   component: processMap,
        //   meta: "processMap"
        // },
        {
          path: "/processSimulation/runPage",
          name: "流程执行界面",
          component: runPage,
          meta: "runPage"
        },
        // {
        //   path: "/processSimulation/processParameter1",
        //   name: "流程参数界面1",
        //   component: processParameter1,
        //   meta: "processParameter1"
        // },
        // {
        //   path: "/processSimulation/processParameter2",
        //   name: "流程参数界面2",
        //   component: processParameter2,
        //   meta: "processParameter2"
        // },
        // {
        //   path: "/processSimulation/simulationLog",
        //   name: "模拟日志",
        //   component: simulationLog,
        //   meta: "simulationLog"
        // },
        // {
        //   path: "/wf_template_design",
        //   name: "流程模板设计",
        //   component: wf_template_design,
        //   meta: "workflow_temp_design"
        // },
        {
          path: "/operationDispatch",
          name: "运维调度",
          component: operationDispatch,
          meta: "operationDispatch"
        },
        // {
        //   path: "/abnormalTask",
        //   name: "异常任务",
        //   component: abnormalTask,
        //   meta: "abnormalTask"
        // },
        // {
        //   path: "/suspendTask",
        //   name: "挂起任务",
        //   component: suspendTask,
        //   meta: "suspendTask"
        // },



        {
          path: "/pageManagement",
          name: "自定义门户",
          component: pageManagement,
          meta: "pageManagement"
        },
        {
          path: "/customGraph/:id",
          name: "自定义画布编辑",
          component: customGraph,
          meta: "customGraph"
        },
        {
          path: "/customEditView",
          name: "自定义画布查看",
          component: customPreview,
          meta: "customEditView"
        },
        {
          path: "/customPreview",
          name: "画布预览",
          component: customPreview,
          meta: "customPreview"
        },
        // 工程
        {
          path: "/engineering",
          name: "工程",
          component: engineering,
          meta: "engineering",
          props: {
            code: "fcc84ef5-69a2-4073-add4-b5ebb27a9778"
          }
        },
        // 版本管理
        {
          path: "/version",
          name: "版本管理",
          component: version,
          meta: "version",
          props: {
            code: "58d4da52-dd7f-42b3-bdcc-de1359481319"
          }
        },
        // 版本调整记录
        {
          path: "/versionRecord",
          name: "版本调整记录",
          component: versionRecord,
          meta: "versionRecord",
          props: {
            code: "d7924a3d-69d1-471f-80e9-550a550ff88e"
          }
        },
        //版本比对
        {
          path: "/versionComparison",
          name: "版本比对",
          component: versionComparison,
          meta: "versionComparison",
          props: {
            code: "01eae870-9edd-4d6a-93e5-ff5957efde44"
          }
        },
        //监控码管理
        {
          path: "/monitoringCode",
          name: "监控码管理",
          component: monitoringCode,
          meta: "monitoringCode"
        },
        //监控模块管理
        {
          path: "/monitoringModule",
          name: "监控模块管理",
          component: monitoringModule,
          meta: "monitoringModule"
        },
        //监控维度管理
        {
          path: "/monitoringDimension",
          name: "监控维度管理",
          component: monitoringDimension,
          meta: "monitoringDimension"
        },
        // 组件库示例
        {
          path: "/onlyOffice",
          name: "在线文档编辑",
          component: onlyOffice,
          meta: "onlyOffice"
        },
        {
          path: "/globalComponents",
          name: "选人/选部门",
          component: globalComponents,
          meta: "globalComponents"
        },
        {
          path: "/editor",
          name: "富文本编辑器",
          component: editor,
          meta: "editor"
        },
        {
          path: "/vxeTable",
          name: "vxeTable表格",
          component: vxeTable,
          meta: "vxeTable"
        },
        {
          path: "/grafana",
          name: "Grafana页面嵌套",
          component: grafana,
          meta: "grafana"
        },
        {
          path: "/kkFileViewDemo",
          name: "kkFileView预览",
          component: kkFileViewDemo,
          meta: "kkFileViewDemo"
        },
        {
          path: "/pdfJsDemo",
          name: "pdfJs预览",
          component: pdfJsDemo,
          meta: "pdfJsDemo"
        },
        {
          path: "/bigFileUploadDemo",
          name: "大文件上传下载示例",
          component: bigFileUploadDemo,
          meta: "bigFileUploadDemo"
        },
        {
          path: "/previewDemo",
          name: "vueOffice预览",
          component: previewDemo,
          meta: "previewDemo"
        },
        {
          path: "/shortLink",
          name: "shortLink短链接生成",
          component: shortLink,
          meta: "shortLink"
        },
        {
          path: "/iconDemo",
          name: "icon图标",
          component: iconDemo,
          meta: "iconDemo"
        },
        {
          path: "/customFlow",
          name: "自定义表单示例",
          component: customFlow,
          meta: "customFlow"
        },
        {
          path: "/thirdPage01",
          name: "三级菜单示例01",
          component: thirdPage01,
          meta: "thirdPage01"
        },
        {
          path: "/thirdPage02",
          name: "三级菜单示例02",
          component: thirdPage02,
          meta: "thirdPage02"
        },
        {
          path: "/thirdPage03",
          name: "三级菜单示例03",
          component: thirdPage03,
          meta: "thirdPage03"
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

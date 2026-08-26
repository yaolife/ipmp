// import { http } from '../network'
import http from "@/api/http";
import { withLoading } from "@/api/requestLoading";
const commonlyUseUrl = '/workbench/getCommonlyUseAllData';
const checkURLOnly = '/page/checkURLOnly';
const getChiefPage = '/page/getChiefPage'//获取首页ID
// 获取页面列表
export function getPageList({ pages, params }, isLoading) {
  return withLoading(
    "getPageList",
    http.post(`/page/getPageList/${pages.pageSize}/${pages.current}`, params),
    isLoading
  );
}

// 导入
export function importPages(zipFile) {
  return withLoading(
    "importPages",
    http.post("/page/importPages", zipFile, {
      headers: {
        "Content-Type": "application/zip"
      }
    })
  );
}

// 导出
export function exportPages(params) {
  return withLoading(
    "exportPages",
    http.post("/page/exportPages", params, {
      responseType: "blob"
    })
  );
}
// 自定义导出
export function customExportPages(pathUrl) {
  return withLoading(
    "customExportPages",
    http.post(
      `${pathUrl}`,
      {},
      {
        responseType: "blob"
      }
    )
  );
}

// 创建
export function createPage(params) {
  return withLoading("createPage", http.post("/page/create", params));
}

// 版本列表
export function versionList({ pages, params }) {
  return withLoading(
    "versionList",
    http.post(
      `/pageVersion/getPagePublishVersions/${pages.pageSize}/${pages.current}?pageId=${params.pageId}`
    )
  );
}

// 版本列表删除
export function versionListDelete(params) {
  return withLoading(
    "versionListDelete",
    http.post(`/pageVersion/deletePagePublishVersions`, params)
  );
}
// 删除页面
export function deletePage(params) {
  return withLoading("deletePage", http.post(`/page/deletePages`, params));
}

// 回退版本到编辑状
export function rollbackPageVersion(params) {
  return withLoading(
    "rollbackPageVersion",
    http.post(`/pageVersion/backToVersions`, params)
  );
}

// 发布页面
export function publishPage(params) {
  return withLoading(
    "publishPage",
    http.post(`/pageVersion/publishPage`, params)
  );
}
// 更新基本信息
export function updatePageInfo(params) {
  return withLoading(
    "updatePageInfo",
    http.post(`/page/updatePageInfo`, params)
  );
}
// 预览和编辑获取详情接口
export function getPageDetail(params) {
  return http.post(`/page/getPageDetail?pageId=${params.pageId}`);
}
// 画布保存
export function savePage(params) {
  return withLoading("savePage", http.post(`/page/savePage`, params));
}

// 数据源请求
export function dataUrl(url, isLoading) {
  return withLoading("dataUrl", http.post(url), isLoading);
}

// 数据源请求
export function dataUrlPost(url, isLoading) {
  return withLoading("dataUrl", http.post(url), isLoading);
}

// 柱状图
export function postDataUrl(url, isLoading) {
  return withLoading("postDataUrl", http.post(url), isLoading);
}
// 待我处理
export function queryTask(params, isLoading) {
  return withLoading(
    "queryTask",
    http.post(`/assembly/queryTask`, params),
    isLoading
  );
}

// 我创建的
export function queryTaskList(params, isLoading) {
  return withLoading(
    "queryTaskList",
    http.post(`/proc-instance/queryTaskList`, params),
    isLoading
  );
}

// 我已处理
export function queryTaskHist(params, isLoading) {
  return withLoading(
    "queryTaskHist",
    http.post(`/assembly/queryTaskHist`, params),
    isLoading
  );
}

// 抄送我的
export function queryTaskCC(params, isLoading) {
  return withLoading(
    "queryTaskCC",
    http.post(`/component/queryTaskCC`, params),
    isLoading
  );
}

// 查询待阅列表
export function queryTaskWaiting(params, isLoading) {
  return withLoading(
    "queryTaskCC",
    http.post(`/assembly/queryTaskCC`, params),
    isLoading
  );
}

// 查询已阅列表
export function queryTaskCCHist(params, isLoading) {
  return withLoading(
    "queryTaskCCHist",
    http.post(`/assembly/queryTaskCCHist`, params),
    isLoading
  );
}

// 待办指标
export function queryIndicator(isLoading) {
  return withLoading("queryIndicator", http.post(`/component/queryIndicator`), isLoading);
}

export function getViewData(id) {
  return withLoading(
    "getViewData",
    http.post(`/pageVersion/getPageVersionDetail?id=${id}`)
  );
}

export function commonlyUseListAPI(params) {
  return http.post(commonlyUseUrl, params).then(res => res.data);
}

//检验输入URL是否重复
export function checkURLOnlyAPI(params) {
  return http.post(checkURLOnly, params).then(res => res.data);
}

//获取首页ID
export function getChiefPageAPI(params) {
  return http.post(getChiefPage, params).then(res => res.data);
}
/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2025-06-09 13:35:48
 * @LastEditors: Yin Rui Xue P644244@gnpjvc.com.cn
 * @LastEditTime: 2025-07-02 20:46:06
 * @FilePath: \cud4demo-ui\src\modules\version\api\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import axios from "@/api/http";

const getPageListUrl = "versionManage/getPageList";
const createVersionUrl = "versionManage/create";
const checkVersionUrl = "versionManage/checkVersion";
const checkBeforeUpdateUrl = "versionManage/checkBeforeUpdate";
const getVersionsUrl = "versionManage/getVersions/100/1";
const updateVersionUrl = "versionManage/update";
const deleteVersionUrl = "versionManage/delete";
const adjustGetPageListUrl = "versionAdjust/getPageList";
const createAdjustUrl = "versionAdjust/create";
const updateAdjustUrl = "versionAdjust/update";
const deleteAdjustUrl = "versionAdjust/delete";
const getItemsUrl = "/influenceItem/getItems";
const createUpdateItemUrl = "/influenceItem/createUpdate";
const versionCompareUrl = "/versionManage/versionCompare";
const upgradePathUrl = "/versionManage/upgradePath";
const getVersionCompareUrl = "/versionManage/getVersionComparePageList";
const exportVersionComByPageUrl = "/versionManage/exportVersionComByPage";

export default {
  getPageList: params => {
    return axios.post(
      getPageListUrl + `/${params.pageSize}/${params.pageIndex}`,
      params
    );
  },
  createVersion: params => {
    return axios.post(createVersionUrl, params);
  },
  checkVersion: params => {
    return axios.post(`${checkVersionUrl}`, params);
  },
  checkBeforeUpdate: params => {
    return axios.post(checkBeforeUpdateUrl, params);
  },
  getVersions: params => {
    return axios.post(`${getVersionsUrl}?projectId=${params.projectId || ""}`);
  },
  updateVersion: params => {
    return axios.post(updateVersionUrl, params);
  },
  deleteVersion: params => {
    return axios.post(deleteVersionUrl, params);
  },
  adjustGetPageList: params => {
    return axios.post(
      adjustGetPageListUrl + `/${params.pageSize}/${params.pageIndex}`,
      params
    );
  },
  createAdjust: params => {
    return axios.post(createAdjustUrl, params);
  },
  updateAdjust: params => {
    return axios.post(updateAdjustUrl, params);
  },
  deleteAdjust: params => {
    return axios.post(deleteAdjustUrl, params);
  },
  getItems: params => {
    return axios.post(`${getItemsUrl}?adjustId=${params.adjustId || ""}`);
  },
  //创建 编辑 删除条目
  createUpdateItem: params => {
    return axios.post(createUpdateItemUrl, params);
  },
  //版本比对
  versionCompare: params => {
    return axios.post(versionCompareUrl, params);
  },
  //升级路线
  upgradePath: params => {
    return axios.post(upgradePathUrl, params);
  },
  //版本比对分页查询
  getVersionCompare: params => {
    return axios.post(
      getVersionCompareUrl + `/${params.pageSize}/${params.currentPage}`,
      params
    );
  },
  //版本比对分页查询
  exportVersionComByPage: params => {
    return axios.post(exportVersionComByPageUrl, params);
  }
};

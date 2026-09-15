/*
 * @Author: error: error: git config user.name & please set dead value or install git && error: git config user.email & please set dead value or install git & please set dead value or install git
 * @Date: 2025-06-09 13:35:48
 * @LastEditors: Yin Rui Xue P644244@gnpjvc.com.cn
 * @LastEditTime: 2025-07-07 14:48:49
 * @FilePath: \cud4demo-ui\src\modules\version\api\index.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
import axios from "@/api/http";

const getPageListUrl = "monitorCode/getMonitorCode";
const createMonitorCodeUrl = "monitorCode/createMonitorCode";
const updateMonitorCodeUrl = "monitorCode/updateMonitorCode";
const deleteCodesUrl = "monitorCode/codes/batchDelete";
const batchUpdateEffectiveUrl = "monitorCode/codes/batchUpdateEffective";
const moudleGetPageListUrl = "monitorModule/getMonitorModule";
const createModuleUrl = "monitorModule/createMonitorModule";
const updateModuleUrl = "monitorModule/updateMonitorModule";
const deleteModuleUrl = "monitorModule/deleteMonitorModule";
const dimensionGetPageListUrl =
  "monitorDimension/findMonitorDimensionPagedList";
const createDimesUrl = "monitorDimension/dimensions";
const deleteDimesUrl = "monitorDimension/dimensions/delete";
const downloadExcelTemplateUrl = "monitorDimension/downloadExcelTemplate";
const downloadExcelTemplateCodeUrl = "monitorCode/downloadExcelTemplate";
const monitorDimensionExportExcelUrl = "monitorDimension/exportExcel";
const monitorCodeExportExcelUrl = "monitorCode/exportExcel";
const importCodeExcelUrl = "monitorCode/importExcelRealtime";
const importDimensionExcelUrl = "monitorDimension/importExcelRealtime";


export default {
  getPageList: params => {
    return axios.post(
      `${getPageListUrl}/${params.pageSize}/${params.pageIndex}`,
      params
    );
  },
  createMonitorCode: params => {
    return axios.post(createMonitorCodeUrl, params);
  },
  updateMonitorCode: params => {
    return axios.put(`${updateMonitorCodeUrl}/${params.id}`, params);
  },
  deleteCodes: params => {
    return axios.post(deleteCodesUrl, params);
  },
  moudleGetPageList: params => {
    return axios.post(
      `${moudleGetPageListUrl}/${params.pageSize}/${params.pageIndex}`,
      params
    );
  },
  createModule: params => {
    return axios.post(createModuleUrl, params);
  },
  updateModule: params => {
    return axios.put(`${updateModuleUrl}/${params.id}`, params);
  },
  deleteModule: params => {
    return axios.post(deleteModuleUrl, params);
  },
  dimensionGetPageList: params => {
    return axios.post(
      `${dimensionGetPageListUrl}/${params.pageSize}/${params.pageIndex}`,
      params
    );
  },
  batchUpdateEffective: params => {
    return axios.post(batchUpdateEffectiveUrl, params);
  },
  createDimes: params => {
    return axios.post(createDimesUrl, params);
  },
  editDimes: params => {
    return axios.put(`${createDimesUrl}/${params.id}`, params);
  },
  deleteDimes: params => {
    return axios.post(deleteDimesUrl, params);
  },
  downloadExcelTemplate: params => {
    return axios.post(downloadExcelTemplateUrl, params, {
      responseType: "blob"
    });
  },
  downloadExcelCodeTemplate: params => {
    return axios.post(downloadExcelTemplateCodeUrl, params, {
      responseType: "blob"
    });
  },
  monitorDimensionExportExcel: params => {
    return axios.post(monitorDimensionExportExcelUrl, params, {
      responseType: "blob"
    });
  },
  monitorCodeExportExcel: params => {
    return axios.post(monitorCodeExportExcelUrl, params, {
      responseType: "blob"
    });
  },
  importCodeExcel: params => {
    return axios.post(importCodeExcelUrl, params);
  },
  importDimensionExcel: params => {
    return axios.post(importDimensionExcelUrl, params);
  }
};

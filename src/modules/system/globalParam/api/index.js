/*
 * @Author: P624219
 * @Date: 2021-09-11 09:58:14
 * @LastEditors: P624219
 * @LastEditTime: 2021-09-11 09:58:14
 * @Description: 全局参数后台交互
 */
import axios from '@/api/http';

const paramTypeTreeUrl = '/system/globalParamTypeTree';
const getListUrl = '/system/getGlobalParamPage';
const saveParamTypeUrl = '/system/saveParamType';
const deleteParamTypeUrl = '/system/deleteParamType';
const saveParamUrl = '/system/saveParam';
const deleteParamUrl = '/system/deleteParam';
const getParamTypeByIdUrl = '/system/getParamTypeById';
const checkParamTypeCodeOnLyUrl = '/system/checkParamTypeCodeOnLy';
const checkParamTypeNameOnLyUrl = '/system/checkParamTypeNameOnLy';
const checkParamCodeOnLyUrl = '/system/checkParamCodeOnLy';
const checkParamNameOnLyUrl = '/system/checkParamNameOnLy';

export default{
  //参数分类树查询
  paramTypeTreeAPI: function (params) {
    return axios.post(paramTypeTreeUrl, params, { apiTitle: "参数分类树查询" }).then(res => res.data);
  },
  //获得参数的分页列表
  getListAPI: function (params) {
    return axios.post(getListUrl, params, { apiTitle: "获得参数的分页列表" }).then(res => res.data);
  },
  // 保存参数分类
  saveParamTypeAPI: function (params) {
    return axios.post(saveParamTypeUrl, params, { apiTitle: "保存参数分类" }).then(res => res.data);
  },
  // 删除参数分类
  deleteParamTypeAPI: function (params) {
    return axios.post(deleteParamTypeUrl, params, { apiTitle: "删除参数分类" }).then(res => res.data);
  },
  // 保存参数
  saveParamAPI: function (params) {
    return axios.post(saveParamUrl, params, { apiTitle: "保存参数" }).then(res => res.data);
  },
  // 删除参数
  deleteParamAPI: function (params) {
    return axios.post(deleteParamUrl, params, { apiTitle: "删除参数" }).then(res => res.data);
  },
  // 获取参数分类列表
  getParamTypeByIdAPI: function (params) {
    return axios.post(getParamTypeByIdUrl, params, { apiTitle: "获取参数分类列表" }).then(res => res.data);
  },
  // 校验参数分类编码唯一性
  checkParamTypeCodeOnLyAPI: function (params) {
    return axios.post(checkParamTypeCodeOnLyUrl, params, { apiTitle: "校验参数分类编码唯一性" }).then(res => res.data);
  },
  // 校验参数分类名称唯一性
  checkParamTypeNameOnLyAPI: function (params) {
    return axios.post(checkParamTypeNameOnLyUrl, params, { apiTitle: "校验参数分类名称唯一性" }).then(res => res.data);
  },
  // 校验参数编码唯一性
  checkParamCodeOnLyAPI: function (params) {
    return axios.post(checkParamCodeOnLyUrl, params, { apiTitle: "校验参数编码唯一性" }).then(res => res.data);
  },
  // 校验参数名称唯一性
  checkParamNameOnLyAPI: function (params) {
    return axios.post(checkParamNameOnLyUrl, params, { apiTitle: "校验参数名称唯一性" }).then(res => res.data);
  },
}

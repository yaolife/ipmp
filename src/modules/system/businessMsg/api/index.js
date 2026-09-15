import axios from '@/api/http';

const cateTreeUrl = '/businessMsgCategory/msgCategoryTree';
const getCateByIdUrl = '/businessMsgCategory/queryCategoryDetail/';
const saveCateUrl = '/businessMsgCategory/saveOrUpdate';
const deleteCateUrl = '/businessMsgCategory/remove/';
const checkCateCodeOnLyUrl = '/businessMsgCategory/checkCategoryCode';
const checkCateNameOnLyUrl = '/businessMsgCategory/checkCategoryName';

const getListUrl = '/businessMsg/pageBusinessMsg';
const saveMsgUrl = '/businessMsg/saveOrUpdate';
const deleteMsgUrl = '/businessMsg/remove';
const checkMsgKeyOnLyUrl = '/businessMsg/checkMsgKey';
const checkMsgNameOnLyUrl = '';

const getLangListUrl = '/sys/i18n/lang/list';
const getAllMsgUrl = '/businessMsg/queryMsgListByType/2';
const getOneMsgUrl = '/businessMsg/queryMsgDetailById/';

export default{
  //分类树查询
  cateTreeAPI: function (params) {
    return axios.post(cateTreeUrl, params, { apiTitle: "消息分类树查询" }).then(res => res.data);
  },
  // 获取分类列表
  getCateByIdAPI: function (params) {
    return axios.post(getCateByIdUrl + params.categoryId, params, { apiTitle: "获取消息分类列表" }).then(res => res.data);
  },
  // 保存分类
  saveCateAPI: function (params) {
    return axios.post(saveCateUrl, params, { apiTitle: "保存消息分类" }).then(res => res.data);
  },
  // 删除分类
  deleteCateAPI: function (params) {
    return axios.post(deleteCateUrl + params.categoryId, params, { apiTitle: "删除消息分类" }).then(res => res.data);
  },
  // 校验分类编码唯一性
  checkCateCodeOnLyAPI: function (params) {
    return axios.post(checkCateCodeOnLyUrl, params, { apiTitle: "校验消息分类编码唯一性" }).then(res => res.data);
  },
  // 校验分类名称唯一性
  checkCateNameOnLyAPI: function (params) {
    return axios.post(checkCateNameOnLyUrl, params, { apiTitle: "校验消息分类名称唯一性" }).then(res => res.data);
  },

  //获取消息列表
  getListAPI: function (params) {
    return axios.post(getListUrl, params, { apiTitle: "获得消息分页列表" }).then(res => res.data);
  },
  // 保存消息
  saveMsgAPI: function (params) {
    return axios.post(saveMsgUrl, params, { apiTitle: "保存消息" }).then(res => res.data);
  },
  // 删除消息
  deleteMsgAPI: function (params) {
    return axios.post(deleteMsgUrl, params, { apiTitle: "删除消息" }).then(res => res.data);
  },
  // 校验消息编码唯一性
  checkMsgKeyOnLyAPI: function (params) {
    return axios.post(checkMsgKeyOnLyUrl, params, { apiTitle: "校验消息编码唯一性" }).then(res => res.data);
  },
  // 校验消息名称唯一性
  checkMsgNameOnLyAPI: function (params) {
    return axios.post(checkMsgNameOnLyUrl, params, { apiTitle: "校验消息名称唯一性" }).then(res => res.data);
  },
  //获取语言列表
  getLangListAPI: function (params) {
    return axios.post(getLangListUrl, params, { apiTitle: "获取语言列表" }).then(res => res.data);
  },
  // 获取所有消息
  getAllMsgAPI: function (params) {
    return axios.post(getAllMsgUrl, params, { apiTitle: "获取所有消息" }).then(res => res.data);
  },
  // 获取单个消息
  getOneMsgAPI: function (params) {
    return axios.post(getOneMsgUrl + params.businessMsgId, params, { apiTitle: "获取单个消息" }).then(res => res.data);
  },
}

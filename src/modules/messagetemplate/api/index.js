import axios from '@/api/http';
import qs from "qs";

const getMessageTemplateListUrl = '/messageTemplate/listByPaging'
const addMessageTemplateUrl = '/messageTemplate/add'
const deleteMessageTemplateUrl = '/messageTemplate/delete'
const updateMessageTemplateUrl = '/messageTemplate/update'
const getMessageTemplateByIdUrl = '/messageTemplate/getById'
const checkMessageTemplateByCodeUrl = '/messageTemplate/checkTemplateCode'
const queryTemplateRelation = '/messageTemplate/queryTemplateRelation'

export default {
  getMessageTemplateList: params => {
    return axios.post(getMessageTemplateListUrl,params);
  },
  addMessageTemplate: params => {
    return axios.post(addMessageTemplateUrl,params);
  },
  queryTemplateRelation: params => {
    return axios.post(queryTemplateRelation,params);
  },
  deleteMessageTemplate: params => {
    return axios.post(deleteMessageTemplateUrl + "?ids=" + params.ids);
  },
  updateMessageTemplate: params => {
    return axios.post(updateMessageTemplateUrl,params);
  },
  getMessageTemplateById: params => {
    return axios.post(getMessageTemplateByIdUrl + "?id=" + params.id);
  },
  checkMessageTemplateByCode: params => {
    return axios.post(checkMessageTemplateByCodeUrl + "?templateCode=" + params.templateCode);
  }
}

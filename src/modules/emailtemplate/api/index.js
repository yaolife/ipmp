import axios from '@/api/http';
import qs from 'qs';

const getEmailTemplateListUrl = '/emailTemplate/listByPaging'
const addEmailTemplateUrl = '/emailTemplate/add'
const deleteEmailTemplateUrl = '/emailTemplate/delete'
const updateEmailTemplateUrl = '/emailTemplate/update'
const getEmailTemplateByIdUrl = '/emailTemplate/getById'
const checkEmailTemplateByCodeUrl = '/emailTemplate/checkTemplateCode'
const queryTemplateRelation = '/emailTemplate/queryTemplateRelation'

export default {
  getEmailTemplateList: params => {
    return axios.post(getEmailTemplateListUrl,params);
  },
  addEmailTemplate: params => {
    return axios.post(addEmailTemplateUrl,params);
  },
  deleteEmailTemplate: params => {
    return axios.post(deleteEmailTemplateUrl + "?ids=" + params.ids);
  },
  updateEmailTemplate: params => {
    return axios.post(updateEmailTemplateUrl,params);
  },
  queryTemplateRelation: params => {
    return axios.post(queryTemplateRelation,params);
  },
  getEmailTemplateById: params => {
    return axios.post(getEmailTemplateByIdUrl + "?id=" + params.id);
  },
  checkEmailTemplateByCode: params => {
    return axios.post(checkEmailTemplateByCodeUrl + "?templateCode=" + params.templateCode);
  }
}

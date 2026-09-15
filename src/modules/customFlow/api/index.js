import axios from '@/api/http';
const prepareSubmit = '/assembly/prepareSubmit';
const initProcess = '/assembly/initProcess'
const startProcess = '/assembly/startProcess'
const saveOrUpdate = '/custom/form/saveOrUpdate'
const queryByProcInstId = '/custom/form/queryByProcInstId'
const submitProcess = '/assembly/submitProcess'
const saveDrafts = '/procssinfo/saveDrafts'
const sendBack = '/assembly/sendBack'
const queryGoBackActIdSelList = '/assembly/queryGoBackActIdSelList'
const queryProcessLog = '/assembly/queryProcessLog'
const termsAdd = '/terms/add'
const termsDelete = '/terms/del'
const termsQuery = '/terms/query'
const getWfAuth = '/wfAuth/getWfAuth';
const getProcInstInfoUrl = '/proc-instance/getProcInstInfo'
const delConcernUrl = '/concern/deleteMyConcern';
const addConcernUrl = '/assembly/addMyConcern'
//查询能否作废
const queryAbandonUrl = '/abandon/isAbandon';
//用于获取会签项名称复杂参数
const getDataItemManTableList = '/processRelData/getDataItemManTableList';
const downloadFileUrl = '/procAttachment/downloadFile'
const physicalDelFileUrl = '/procAttachment/physicalDelFile'
const sendSubmitProcess = "/assembly/backSubmitProcess"

export default {
    // 下载接口
    downloadFile: params => {
        return axios.post(downloadFileUrl, params, { responseType: 'blob' }).then(res => res);
    },
    // 删除文件
    delFiles: function (params) {
        return axios.post(physicalDelFileUrl, params);
    },
    //流程预提交接口
    prepareSubmitApi: params => {
        return axios.post(prepareSubmit, params);
    },
    //流程初始化接口
    initProcessApi: params => {
        return axios.post(initProcess, params);
    },
    //流程提交接口
    startProcessApi: params => {
        return axios.post(startProcess, params);
    },
    // 流程数据保存接口
    saveOrUpdateApi: params => {
        return axios.post(saveOrUpdate, params);
    },
    // 获取自定义表单数据接口
    queryByProcInstIdApi: params => {
        return axios.post(queryByProcInstId, params);
    },
    // 流程提交接口
    submitProcessApi: params => {
        return axios.post(submitProcess, params);
    },
    // 数据保存接口
    saveDraftsApi: params => {
        return axios.post(saveDrafts, params);
    },
    // 获取可退回环节列表
    queryGoBackActIdSelListApi: params => {
        return axios.post(queryGoBackActIdSelList, params);
    },
    // 退回接口
    sendBackApi: params => {
        return axios.post(sendBack, params);
    },
    // 审批日志查询
    queryProcessLogApi: params => {
        return axios.post(queryProcessLog, params);
    },
    // 词条新增
    termsAddApi: params => {
        return axios.post(termsAdd, params);
    },
    // 词条删除
    termsDeleteApi: params => {
        return axios.post(termsDelete, params);
    },
    // 词条查询
    termsQueryApi: params => {
        return axios.post(termsQuery, params);
    },
    // 获取工作流授权参数
    postWfAuthAPI: function () {
        return axios.post(getWfAuth, { apiTitle: "获取工作流授权参数" }).then(res => res.data);
    },
    getProcInstInfoAbi: function (params) {
        return axios.post(getProcInstInfoUrl, params);
    },
    // 取消关注
    deleteMyConcern: function (params) {
      return axios.post(delConcernUrl + "?ids=" + params.ids, params).then(res => res.data);
    },
    //关注保存
    addConcernUrl: function (params) {
      return axios.post(addConcernUrl, params);
    }, 
    //查询能否作废
    queryIsAbandon: function (params) {
      return axios.post(queryAbandonUrl, params);
    }, 
    //查询数据管理项页面的表中的内容不分页-用于获取会签项名称复杂参数
    getDataItemManTableListAPI: function (params) {
      return axios.post(getDataItemManTableList, params, { apiTitle: "查询数据管理项页面的表中的内容-不分页" }).then(res => res.data);
    },
    sendSubmitProcess: function (params) {
        return axios.post(sendSubmitProcess, params).then(res => res.data);
      },
    
}

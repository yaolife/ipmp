import http from '@/api/http'
const getAllProcColleRule = '/processCollectionRule/getAllProcColleRule';

export default {
  //查询流程集内流程规则全部内容
  getAllProcColleRule: function (params) {
    return http.post(getAllProcColleRule + '/' + params.processColleId, {apiTitle: "查询流程集内流程规则全部内容"}).then(res => res.data);
  }
}

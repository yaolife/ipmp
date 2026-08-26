import axios from '@/api/http';

// 获取申请公司
const getApplyCompanyListUrl = '/widget/queryAllApplyCompany';
export default {

  //获取申请公司列表
  getApplyCompanyListAPI: function () {
    return axios.post(getApplyCompanyListUrl, { apiTitle: "获取申请公司列表" }).then(res => res.data);
  }
}

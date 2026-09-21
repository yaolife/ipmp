/*
 * @Author: P623437
 * @Date: 2022-04-15 14:16:13
 * @LastEditors: P623437
 * @LastEditTime: 2022-04-15 14:16:50
 * @Description: 
 */
import axios from '@/api/http';

const getAllCanSeeProcess = 'processCategory/getFlowAndTypeTreeNew';

export default {
  //获取所有可发起的流程模板
  getAllCanSeeProcessAPI: function (params) {
    return axios.post(getAllCanSeeProcess, params, {apiTitle: "获取所有可发起的流程模板"}).then(res => res.data);
  },
}

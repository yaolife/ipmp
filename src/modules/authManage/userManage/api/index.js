import axios from '@/api/http'

export default {
  //查询用户列表
  userList: function (param) {
    return axios.post('/cudAuth/user/getUserInfoListByPage', param);
  },
  //查询用户详情
  userDetail: function (param) {
    //return axios.post('/cudAuth/user/queryUserListByUserId', param);
    return axios.post('/cudAuth/user/queryUserListByUserId?userId=' + param.userId);
  },
  //新增用户/修改用户
  userEdit: function (param) {
    return axios.post('/cudAuth/user/saveOrUpdateUser', param);
  },
  //查询当前用户详情（开放接口）
  userInfo: function (param) {
    return axios.post('/valid/getUserInfo');
  },
  //更新当前用户信息（开放接口）
  userUpdate: function (param) {
    return axios.post('/valid/updateUserInfo', param);
  },
  //删除用户
  userDel: function (param) {
    return axios.post('/cudAuth/user/deleteUser', param);
  },
  //重置密码
  userResetPsw: function(param) {
    return axios.get('/cudAuth/user/resetPassword?id=' + param.id);
  },
  //员工号验证
  validateUserId: function (param) {
    return axios.post('/cudAuth/user/validated/userId?userId=' + param.userId);
  },

  //导出数据列表
  exportList: function(params) {
    return axios({
      method: "post",
      url: "/cudAuth/user/exportUserList",
      data: params,
      responseType: "blob"
    })
  },
  //导出模板
  exportTemplate: function(params) {
    return axios({
      method: "get",
      url: "/cudAuth/user/exportUserTemplate",
      data: null,
      responseType: "blob"
    })
  }
}

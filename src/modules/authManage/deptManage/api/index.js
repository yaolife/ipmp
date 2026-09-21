import axios from '@/api/http'

export default {
  //查询分类树
  getTreeList: function (param) {
    return axios.get('/cudAuth/dept/queryDeptTreeByParentId?deptParentId=' + param.deptParentId)
  },

  //查询列表
  getDeptList: function (param) {
    return axios.post('/cudAuth/dept/getDeptListByPage', param)
  },
  //查询详情
  getDeptDetail: function (param) {
    return axios.post('/cudAuth/dept/queryDeptDetailByDeptId?deptId=' + param.deptId)
  },
  //新增编辑
  deptEdit: function (param) {
    return axios.post('/cudAuth/dept/saveOrUpdateDept', param)
  },
  //删除
  deptDel: function (param) {
    return axios.post('/cudAuth/dept/deleteDept', param)
  },
  //部门ID验证
  validateDeptId: function (param) {
    return axios.post('/cudAuth/dept/validated/deptId?deptId=' + param.deptId);
  },

  //导出数据列表
  exportList: function(params) {
    return axios({
      method: "post",
      url: "/cudAuth/dept/exportDeptList",
      data: params,
      responseType: "blob"
    })
  },
  //导出模板
  exportTemplate: function(params) {
    return axios({
      method: "get",
      url: "/cudAuth/dept/exportDeptTemplate",
      data: null,
      responseType: "blob"
    })
  }
}

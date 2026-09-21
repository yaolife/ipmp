import axios from '@/api/http';

export default {

  // 获取支吊架分页列表
  getFupportListAPI: params => {
    return axios.post("fupportInfo/getFupportList", params);
  },

  // 新增/编辑保存支吊架数据
  saveModifyFupportApi: params => {
    return axios.post("fupportInfo/saveModifyFupport", params);
  },

  // 获取支吊架单条详情
  getFupportDetailApi: params => {
    return axios.post("fupportInfo/getFupportDetail", params);
  },

  // 逻辑删除支吊架数据（支持单条/批量删除）
  deleteFupportInfoApi: params => {
    return axios.post("fupportInfo/deleteFupportInfo", params);
  },

  // Excel批量导入支吊架数据
  importFupportApi: formData => {
    return axios.post("fupportInfo/importFupport", formData, {
      timeout: 30 * 60 * 1000, // 5分钟超时，足够覆盖2分钟导入耗时
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  // Excel导出支吊架数据（支持全量导出/选中ID批量导出）
  exportFupportApi: (params) => {
    return axios({
      method: 'post',
      url: '/fupportInfo/exportFupport',
      data: params,
      responseType: 'blob',
    })
  },

  // 下载支吊架数据导入模板
  downloadImportTemplateApi: (params) => {
    return axios({
      method: 'post',
      url: '/fupportInfo/downloadTemplate',
      responseType: 'blob',
    })
  }
};

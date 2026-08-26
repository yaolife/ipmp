import request from '@/modules/jurisdiction/utils/request'

// 获取业务组件列表
export const getBusinessComponentPage = (data) => {
  return request.post('/dp/api/business-component/page', data)
}

// 删除业务组件
export const deleteBusinessComponent = (id) => {
  return request.delete(`/dp/api/business-component/delete/${id}`)
}

// 新增业务组件
export const addBusinessComponent = (data) => {
  return request.post('/dp/api/business-component/create', data)
}

// 更新业务组件
export const updateBusinessComponent = (data) => {
  return request.post('/dp/api/business-component/update', data)
}

// 获取字典
export const getDictionaryType = () => {
  return request.post('/dp/api/business-component/dic-tree')
}
export const getComInfo=(compCode)=>{
  return request.post(`/dp/api/business-component/get/${compCode}`)
}
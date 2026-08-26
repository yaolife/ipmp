import request from '@/modules/jurisdiction/utils/request'

// 所有实体列表 /dp/api/entity-and-field/all-entities
export const getAllEntities = () => {
  return request.post('/dp/api/entity-and-field/all-entities')
}

// 所有开启权限控制的实体列表 /dp/api/entity-and-field/permed-entities
export const getPermedEntities = () => {
  return request.post('/dp/api/entity-and-field/permed-entities')
}

// 查询对实体有授权信息的角色 /dp/api/role-data-permission/related-roles/{entityCode}
export const getRelatedRoles = (entityCode) => {
  return request.post(`/dp/api/role-data-permission/related-roles/${entityCode}`,{entityCode:entityCode})
}

// 查询对实体不含授权信息的角色 /dp/api/role-data-permission/unrelated-roles/{entityCode}
export const getUnrelatedRoles = (entityCode) => {
  return request.post(`/dp/api/role-data-permission/unrelated-roles/${entityCode}`,{entityCode:entityCode})
}
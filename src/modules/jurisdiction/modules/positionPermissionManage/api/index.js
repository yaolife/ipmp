import request from '@/modules/jurisdiction/utils/request'

// 岗位分页查询
export const getPostPage = (params) => {
  return request.post('/dp/api/post-role/post-page',params)
}

// 查询岗位关联的角色信息
export const getPostRoleList = (postCode) => {
  return request.get(`/dp/api/post-role/role-list/${postCode}`)
}

// 岗位关联角色 /dp/api/post-role/post-role-relation/upsert
export const postRoleRelation = (params) => {
  return request.post('/dp/api/post-role/post-role-relation/upsert',params)
}

// 岗位与角色-角色组解除关联 /dp/api/post-role/post-role-relation/delete
export const postRoleRelationDelete = (params) => {
  return request.post('/dp/api/post-role/post-role-relation/delete',params)
}

// 全量角色列表 /dp/api/role-info/list
export const getRoleList = (params={}) => {
  return request.post('/dp/api/role-info/list',params)
}
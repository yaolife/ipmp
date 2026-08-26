import request from '@/modules/jurisdiction/utils/request'

export const  getAuthLogList=(data)=>{
  return request.post('/dp/api/data-perm-operation-log/page/role-data-perm',data);
}

export const getRoleList=(data)=>{
  return request.post('/dp/api/role-info/list',data);
}

export const getEntityList=(data)=>{
  return request.post('/dp/api/entity-and-field/all-entities',data);
}
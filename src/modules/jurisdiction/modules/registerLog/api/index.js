import request from '@/modules/jurisdiction/utils/request'

export const  getRegisterLogList=(data)=>{
  return request.post('/dp/api/data-perm-operation-log/page/data-perm-object',data);
}

export const getEntityList=(data)=>{
  return request.post('/dp/api/entity-and-field/all-entities',data);
}
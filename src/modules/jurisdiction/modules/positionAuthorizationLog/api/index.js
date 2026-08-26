import request from '@/modules/jurisdiction/utils/request'

export const  getAuthLogList=(data)=>{
  return request.post('/dp/api/data-perm-operation-log/page/post-role',data);
}

export const getRoleList=(data)=>{
  return request.post('/dp/api/role-info/list',data);
}

export const getPostList=(data)=>{
  return request.post('/dp/api/post-role/post-page',data);
}
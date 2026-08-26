import request from '@/modules/jurisdiction/utils/request';

// 根据实体编码数组拉取字段控权、可见、可编辑、脱敏等配置
// 入参：entityCodes: string[]
// 返回：后端原始响应
export function getFormColPermissions(entityCodes) {
  return request({
    url: '/dp/api/user-data-permission/form-col-permissions',
    method: 'post',
    data: Array.isArray(entityCodes) ? entityCodes : [entityCodes]
  })
}

// 批量查询可操作（可编辑）的数据行
// 入参：rowDataPermRoList: Array<{ entityCode: string, uniqueKey: string, values: any[] }>
// 返回：后端原始响应，data 结构与请求一致但 values 为可编辑记录的子集
export function getRowDataPermissions(rowDataPermRoList) {
  return request({
    url: '/dp/api/user-data-permission/row-data-permissions',
    method: 'post',
    data: Array.isArray(rowDataPermRoList) ? rowDataPermRoList : [rowDataPermRoList]
  })
}


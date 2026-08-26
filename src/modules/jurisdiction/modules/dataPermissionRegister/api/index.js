import request from "@/modules/jurisdiction/utils/request";

// 获取所有可控权实体列表
export const getAllEntities = () => {
  return request.post("/dp/api/entity-and-field/all-entities");
};

// 获取有权限的实体列表
export const getPermedEntities = () => {
  return request.post("/dp/api/entity-and-field/permed-entities");
};
// 获取角色有权限的实体列表
export const getRolePermedEntities = (roleCode) => {
  return request.post(`/dp/api/entity-and-field/permed-entities/${roleCode}`);
};

// 获取指定实体的可控权字段
export const getDataPermissionFields = (entityCode) => {
  return request.post(`/dp/api/data-permission-object/all/${entityCode}`);
};

// 更新字段权限配置（预留接口，功能待完善）
export const updateFieldPermission = (data) => {
  return request.post("/dp/api/data-permission-object/update", data);
};

// 行数据权限控制类型信息查询 /dp/api/row-perm-control-type/list
export const getRowPermControlTypeList = (data = {}) => {
  return request.post("/dp/api/row-perm-control-type/list", data);
};

// 注册 /dp/api/data-permission-object/register
export const register = (data) => {
  return request.post("/dp/api/data-permission-object/register", data);
};

const dataPermissionRegisterApi = {
  getAllEntities,
  getPermedEntities,
  getDataPermissionFields,
  updateFieldPermission,
  getRowPermControlTypeList,
  register,
};

export default dataPermissionRegisterApi;

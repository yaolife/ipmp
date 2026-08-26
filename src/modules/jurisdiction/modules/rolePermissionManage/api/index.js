import request from '@/modules/jurisdiction/utils/request'

// 角色权限管理相关API
export const rolePermissionApi = {
  /**
   * 查询角色列表
   * @description 根据条件查询角色列表，支持分页，对应 /dp/api/role-info/list 接口
   * @param {Object} params - 查询参数
   * @param {string} [params.roleCode] - 角色编码
   * @param {string} [params.roleName] - 角色名称  
   * @param {string} [params.roleStatus] - 角色状态
   * @param {number} [params.pageNum=1] - 当前页码
   * @param {number} [params.pageSize=10] - 每页大小
   * @returns {Promise<Object>} 返回分页查询结果
   */
  async getRoleInfoList(params = {}) {
    try {
      // 构建请求参数
      const requestData = {
        roleCode: params.roleCode || '',
        roleName: params.roleName || '',
        roleStatus: params.roleStatus || '',
        pageNum: params.pageNum || 1,
        pageSize: params.pageSize || 10
      }

      // 发送POST请求到真实接口
      const response = await request.post('/dp/api/role-info/list', requestData)
      
      return response.data
    } catch (error) {
      console.error('查询角色列表失败:', error)
      throw error
    }
  },

  /**
   * 获取角色详情
   * @description 根据角色编码获取角色详情信息，对应 /dp/api/role-info/info/{roleCode} 接口
   * @param {string} roleCode - 角色编码
   * @returns {Promise<Object>} 返回角色详情数据
   * @example
   * // 返回数据格式
   * {
   *   "success": true,
   *   "code": 200,
   *   "message": "操作成功",
   *   "data": {
   *     "roleName": "刘廷桢",
   *     "roleCode": "ltz", 
   *     "roleStatus": "1",
   *     "roleDesc": "系统管理员角色"
   *   }
   * }
   */
  async getRoleDetail(roleCode) {
    try {
      // 发送POST请求到真实接口
      const response = await request.post(`/dp/api/role-info/info/${roleCode}`)
      
      return response.data.data
    } catch (error) {
      console.error('获取角色详情失败:', error)
      throw error
    }
  },

  /**
   * 获取所有实体列表
   * @description 获取所有实体列表，对应 /dp/api/entity-and-field/all-entities 接口
   * @returns {Promise<Array>} 返回实体列表数据
   * @example
   * // 返回数据格式
   * {
   *   "success": true,
   *   "code": 200,
   *   "message": "操作成功",
   *   "data": [
   *     {
   *       "resourceEntityId": 1,
   *       "entityName": "通知公告",
   *       "entityCode": "notice"
   *     }
   *   ]
   * }
   */
  async getAllEntities() {
    try {
      // 发送GET请求到真实接口
      const response = await request.post('/dp/api/entity-and-field/all-entities')
      
      return response.data.data
    } catch (error) {
      console.error('获取实体列表失败:', error)
      throw error
    }
  },

  /**
   * 获取列权限数据
   * @description 获取指定角色和实体的列权限配置，对应 /dp/api/role-data-permission/col/role-col-data-perm/get 接口
   * @param {string} roleCode - 角色编码
   * @param {string} entityCode - 实体编码
   * @returns {Promise<Array>} 返回列权限列表
   * @example
   * // 返回数据格式
   * {
   *   "success": true,
   *   "code": 200,
   *   "message": "操作成功",
   *   "data": {
   *     "colDataPermissionId": "1",
   *     "roleCode": "ltz",
   *     "entityCode": "notice",
   *     "fieldColDataPermissions": [
   *       {
   *         "colDataPermissionId": "1",
   *         "entityCode": "notice",
   *         "fieldCode": "priority_level",
   *         "operationLevel": 1,
   *         "colDataDisplayCode": "three_stars"
   *       }
   *     ]
   *   }
   * }
   * // operationLevel: 0=无权限, 1=仅查看, 3=可编辑
   */
  async getColumnDataPermissions(roleCode, entityCode) {
    try {
      // 构建请求参数
      const requestData = {
        roleCode: roleCode,
        entityCode: entityCode
      }

      // 发送POST请求到真实接口
      const response = await request.post('/dp/api/role-data-permission/col/role-col-data-perm/get', requestData)
      
      // 直接返回接口数据，不进行字段重命名
      const responseData = response.data.data
      if (responseData && responseData.fieldColDataPermissions) {
        return responseData.fieldColDataPermissions
      }
      
      return []
    } catch (error) {
      console.error('获取列权限数据失败:', error)
      throw error
    }
  },

  /**
   * 更新/创建列权限数据
   * @description 更新或创建列权限配置，对应 /dp/api/role-data-permission/col/role-col-data-perm/upsert 接口
   * @param {Object} permissionData - 完整的列权限数据
   * @param {string} permissionData.colDataPermissionId - 列权限ID
   * @param {string} permissionData.roleCode - 角色编码
   * @param {string} permissionData.entityCode - 实体编码
   * @param {Array} permissionData.fieldColDataPermissions - 字段列权限列表
   * @returns {Promise<Object>} 返回更新结果
   * @example
   * // 入参格式
   * {
   *   "colDataPermissionId": "1",
   *   "roleCode": "ltz",
   *   "entityCode": "notice",
   *   "fieldColDataPermissions": [
   *     {
   *       "colDataPermissionId": "1",
   *       "entityCode": "notice",
   *       "fieldCode": "priority_level",
   *       "operationLevel": 3,
   *       "colDataDisplayCode": "three_stars"
   *     }
   *   ]
   * }
   * // operationLevel: 0=无权限, 1=仅查看, 3=可编辑
   */
  async upsertColumnDataPermission(permissionData) {
    try {
      // 发送POST请求到真实接口
      const response = await request.post('/dp/api/role-data-permission/col/role-col-data-perm/upsert', permissionData)
      
      return response.data.data
    } catch (error) {
      console.error('更新列权限数据失败:', error)
      throw error
    }
  },

  // 获取业务组件列表（指定）
  async getBusinessComponentPage (
    data={
      pageNum: 1,
      pageSize: 10000
    }
  ) {
    try {
      // 发送POST请求到真实接口
      const response = await request.post('/dp/api/business-component/page', data)
      return response.data.records
    } catch (error) {
      console.error('获取业务组件列表失败:', error)
      throw error
    }
  },

  // 获取字典组件（指定）/dict/dictTreeItem
  async getDictTreeItem (data) {
    try {
      // 发送POST请求到真实接口
      return await request.post('/dict/dictTreeItem', data)
    } catch (error) {
      console.error('获取字典组件失败:', error)
      throw error
    }
  },

  /**
   * 获取实体的权限点信息
   * @description 获取指定实体的行权限控制点和列权限点信息，对应 /dp/api/data-permission-object/entity-perm-points/{entityCode} 接口
   * @param {string} entityCode - 实体编码
   * @returns {Promise<Object>} 返回实体的权限点信息
   * @example
   * // 返回数据格式
   * {
   *   "success": true,
   *   "code": 200,
   *   "message": "操作成功",
   *   "data": {
   *     "entityCode": "notice",
   *     "rowPermPointList": [
   *       {
   *         "entityField": {
   *           "entityCode": "notice",
   *           "fieldName": "工厂名称",
   *           "fieldCode": "plant_name",
   *           "dataType": null,
   *           "permField": false
   *         },
   *         "rowPermControlType": {
   *           "rowPermControlTypeId": 3,
   *           "strategyType": "custom",
   *           "name": "电厂选择器",
   *           "code": "plant_selector",
   *           "description": null,
   *           "rowPermControlMethods": [
   *             {
   *               "rowPermControlMethodId": 6,
   *               "controlType": "plant_selector",
   *               "name": "所有",
   *               "code": "all",
   *               "dataComponent": null,
   *               "description": "所有值",
   *               "sortOrder": 0
   *             }
   *           ]
   *         }
   *       }
   *     ],
   *     "colPermPointList": [
   *       {
   *         "entityField": {
   *           "entityCode": "notice",
   *           "fieldName": "优先级",
   *           "fieldCode": "priority_level",
   *           "dataType": null,
   *           "permField": false
   *         },
   *         "colDataDisplayCode": "hide"
   *       }
   *     ]
   *   }
   * }
   */
  async getEntityPermPoints(entityCode) {
    try {
      // 发送POST请求到真实接口
      const response = await request.post(`/dp/api/data-permission-object/entity-perm-points/${entityCode}`)
      
      return response.data.data
    } catch (error) {
      console.error('获取实体权限点信息失败:', error)
      throw error
    }
  },

  /**
   * 创建行数据权限
   * @description 创建新的行数据权限配置，对应 /dp/api/role-data-permission/row/role-row-data-perm/new 接口
   * @param {Object} data - 行数据权限数据
   * @param {string} data.entityCode - 实体编码（必填）
   * @param {number} data.operationLevel - 操作级别（必填）：1[01]-查看，3[11]-可编辑
   * @param {string} data.roleCode - 角色编码（必填）
   * @param {Array} data.rowDataPermDetailList - 行数据权限详情列表
   * @returns {Promise<Object>} 返回创建结果
   * @example
   * // 入参格式
   * {
   *   "entityCode": "notice",
   *   "operationLevel": 3,
   *   "roleCode": "ltz",
   *   "rowDataPermDetailList": [
   *     {
   *       "entityCode": "notice",
   *       "fieldCode": "plant_name",
   *       "rowPermControlMethod": "all"
   *     },
   *     {
   *       "entityCode": "notice",
   *       "dataScopeOperator": "in",
   *       "dataScopeValue": "(宁德电厂，大亚湾电厂)",
   *       "fieldCode": "plant_name",
   *       "rowPermControlMethod": "appoint"
   *     },
   *     {
   *       "entityCode": "notice",
   *       "dataScopeOperator": "gt",
   *       "dataScopeValue": "100",
   *       "fieldCode": "priority_level",
   *       "rowPermControlMethod": "custom"
   *     }
   *   ]
   * }
   * 
   * // rowDataPermDetailList 说明：
   * // 1. 当 rowPermControlMethod 是 "all" 时，仅传递 fieldCode
   * // 2. 当为 "appoint" 时，dataScopeValue 为 "(选项1，选项2)"，dataScopeOperator 默认为 "in"
   * // 3. 当为 "custom" 时，dataScopeOperator 为选择的操作符类型，dataScopeValue 为输入框键入的值
   * // 注意：rowPermControlType 不需要传递，这个是后续用来渲染指定类型下拉框的编码
   */
  async addRowDataPermission(data) {
    try {
      // 发送POST请求到真实接口
      const response = await request.post('/dp/api/role-data-permission/row/role-row-data-perm/new', data)
      
      return response.data.data
    } catch (error) {
      console.error('创建行数据权限失败:', error)
      throw error
    }
  },

  /**
   * 获取行数据权限列表
   * @description 获取指定角色和实体的行数据权限列表，对应 /dp/api/role-data-permission/row/role-row-data-perm/list 接口
   * @param {Object} params - 查询参数
   * @param {string} params.entityCode - 实体编码（必填）
   * @param {string} params.roleCode - 角色编码（必填）
   * @returns {Promise<Array>} 返回行数据权限列表
   * @example
   * // 入参格式
   * {
   *   "entityCode": "notice",
   *   "roleCode": "ltz"
   * }
   * 
   * // 返回数据格式
   * {
   *   "success": true,
   *   "code": 200,
   *   "message": "操作成功",
   *   "data": [
   *     {
   *       "rowDataPermissionId": "4",
   *       "roleCode": "ltz",
   *       "entityCode": "notice",
   *       "operationLevel": 1,
   *       "rowDataPermDetailList": [
   *         {
   *           "rowDataPermissionDetailId": "17",
   *           "rowDataPermissionId": "4",
   *           "entityCode": "notice",
   *           "fieldCode": "plant_name",
   *           "rowPermControlType": null,
   *           "permStrategyType": null,
   *           "rowPermControlMethod": "all",
   *           "dataScopeOperator": "in",
   *           "dataScopeValue": "('dd','bb')"
   *         }
   *       ],
   *       "sqlSeg": null
   *     }
   *   ]
   * }
   */
  async getRowDataPermissionList(params) {
    try {
      // 发送POST请求到真实接口
      const response = await request.post('/dp/api/role-data-permission/row/role-row-data-perm/list', params)
      
      return response.data.data || []

    } catch (error) {
      console.error('获取行数据权限列表失败:', error)
      throw error
    }
  },

  /**
   * 删除行数据权限
   * @description 删除指定的行数据权限，对应 /dp/api/role-data-permission/row/role-row-data-perm/delete/{rowDataPermId} 接口
   * @param {string} rowDataPermId - 行数据权限ID
   * @returns {Promise<Object>} 返回删除结果
   * @example
   * // 返回数据格式
   * {
   *   "code": 0,
   *   "data": true,
   *   "message": "",
   *   "success": true
   * }
   */
  async deleteRowDataPermission(rowDataPermId) {
    try {
      // 发送POST请求到真实接口
      const response = await request.post(`/dp/api/role-data-permission/row/role-row-data-perm/delete/${rowDataPermId}`)
      
      return response.data
    } catch (error) {
      console.error('删除行数据权限失败:', error)
      throw error
    }
  },

  /**
   * 更新行数据权限
   * @description 更新现有的行数据权限配置，对应 /dp/api/role-data-permission/row/role-row-data-perm/update 接口
   * @param {Object} data - 行数据权限数据
   * @param {string} data.entityCode - 实体编码（必填）
   * @param {number} data.operationLevel - 操作级别（必填）：1[01]-查看，3[11]-可编辑
   * @param {string} data.roleCode - 角色编码（必填）
   * @param {Array} data.rowDataPermDetailList - 行数据权限详情列表
   * @param {string} data.rowDataPermissionId - 行数据权限ID（必填）
   * @returns {Promise<Object>} 返回更新结果
   * @example
   * // 入参格式
   * {
   *   "entityCode": "notice",
   *   "operationLevel": 3,
   *   "roleCode": "ltz",
   *   "rowDataPermDetailList": [
   *     {
   *       "dataScopeOperator": "in",
   *       "dataScopeValue": "(宁德电厂，大亚湾电厂)",
   *       "entityCode": "notice",
   *       "fieldCode": "plant_name",
   *       "rowDataPermissionDetailId": "17",
   *       "rowDataPermissionId": "4",
   *       "rowPermControlMethod": "appoint",
   *       "rowPermControlType": "plant_selector"
   *     }
   *   ],
   *   "rowDataPermissionId": "4"
   * }
   * 
   * // rowDataPermDetailList 说明：
   * // 1. 当 rowPermControlMethod 是 "all" 时，仅传递 fieldCode
   * // 2. 当为 "appoint" 时，dataScopeValue 为 "(选项1，选项2)"，dataScopeOperator 默认为 "in"
   * // 3. 当为 "custom" 时，dataScopeOperator 为选择的操作符类型，dataScopeValue 为输入框键入的值
   * // 注意：rowPermControlType 不需要传递，这个是后续用来渲染指定类型下拉框的编码
   */
  async updateRowDataPermission(data) {
    try {
      // 发送POST请求到真实接口
      const response = await request.post('/dp/api/role-data-permission/row/role-row-data-perm/update', data)
      
      return response.data
    } catch (error) {
      console.error('更新行数据权限失败:', error)
      throw error
    }
  },

  /**
   * 获取字段数据类型对应的SQL操作符映射
   * @description 获取不同数据类型支持的SQL操作符列表，对应 /dp/api/role-data-permission/fieldDataType/sqlOperator/map 接口
   * @returns {Promise<Object>} 返回操作符映射数据
   * @example
   * // 返回数据格式
   * {
   *   "success": true,
   *   "code": 200,
   *   "message": "操作成功",
   *   "data": {
   *     "text": [
   *       {
   *         "name": "等于",
   *         "code": "="
   *       },
   *       {
   *         "name": "不等于", 
   *         "code": "!="
   *       },
   *       {
   *         "name": "包含于",
   *         "code": "IN"
   *       }
   *     ],
   *     "integer": [...],
   *     "decimal": [...],
   *     ...
   *   }
   * }
   */
  async getFieldDataTypeSqlOperatorMap() {
    try {
      const response = await request.get('/dp/api/role-data-permission/fieldDataType/sqlOperator/map');
      return response.data.data;
    } catch (error) {
      console.error('获取字段数据类型SQL操作符映射失败:', error);
      throw error;
    }
  },

  /**
   * 校验自定义SQL条件
   * @description 校验自定义SQL条件是否合法，对应 /dp/api/role-data-permission/customizeSqlCondition/check 接口
   * @param {Object} data - 校验参数
   * @param {string} data.content - 条件值内容
   * @param {string} data.entityCode - 实体编码
   * @param {string} data.entityFieldCode - 实体字段编码
   * @param {string} data.operator - 操作符
   * @returns {Promise<Object>} 返回校验结果
   * @example
   * // 请求参数
   * {
   *   "content": "100",
   *   "entityCode": "notice",
   *   "entityFieldCode": "priority_level",
   *   "operator": ">"
   * }
   * 
   * // 返回结果
   * {
   *   "success": true,
   *   "code": 200,
   *   "message": "操作成功",
   *   "data": true  // true表示校验通过，false表示校验失败
   * }
   */
  async checkCustomSqlCondition(data) {
    try {
      const response = await request.post('/dp/api/role-data-permission/customizeSqlCondition/check', data);
      return response.data;
    } catch (error) {
      console.error('校验自定义SQL条件失败:', error);
      throw error;
    }
  }
} 

// 岗位分页查询 /dp/api/post-role/post-page
export const getPostPage = (params) => {
  return request.post('/dp/api/post-role/post-page',params)
}

// 查询角色关联的岗位信息 /dp/api/post-role/post-list/{roleCode}
export const getRolePostList = (roleCode) => {
  return request.get(`/dp/api/post-role/post-list/${roleCode}`)
}

// 角色关联岗位 /api/post-role/role-post-relation/upsert
export const rolePostRelation = (params) => {
  return request.post('/dp/api/post-role/role-post-relation/upsert',params)
}

// 岗位与角色-角色组解除关联 /dp/api/post-role/post-role-relation/delete
export const postRoleRelationDelete = (params) => {
  return request.post('/dp/api/post-role/post-role-relation/delete',params)
}
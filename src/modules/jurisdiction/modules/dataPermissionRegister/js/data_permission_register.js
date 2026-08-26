import { getAllEntities, getPermedEntities, getDataPermissionFields, updateFieldPermission,getRowPermControlTypeList,register } from '../api'

export default {
  data() {
    return {
      // 加载状态
      loading: {
        entityList: false,
        fieldList: false,
        permissionUpdate: false
      },
      
      // 实体类型切换
      entityType: 'all', // 'all': 可控权实体, 'permed': 已控权实体
      
      // 实体列表相关
      entityList: [],
      filteredEntityList: [],
      entitySearchKeyword: '',
      selectedEntity: null,
      
      // 字段权限列表
      fieldPermissionList: [],

      // 修改中
      editList: [],
      // 行权限控制类型列表 （关联值帮助）
      rowPermControlTypeList: [],
    }
  },

  mounted() {
    this.loadEntityList()
    this.getRowPermControlTypeList()
  },

  methods: {
    // 获取行权限控制类型信息
    async getRowPermControlTypeList() {
      const response = await getRowPermControlTypeList()
      if (response.data) {
        this.rowPermControlTypeList = response.data.data || []
      } else {
        this.$message.error(response.data.message || '获取行权限控制类型信息失败')
      }
    },

    // 切换实体类型
    handleEntityTypeChange(type) {
      const f =()=>{
        this.selectedEntity = null
        this.fieldPermissionList = []
        this.entitySearchKeyword = ''
        this.loadEntityList()
      }
      f()
    },

    // 加载实体列表（根据类型调用不同接口）
    async loadEntityList() {
      this.loading.entityList = true
      try {
        const response = this.entityType === 'all' ? await getAllEntities() : await getPermedEntities()
        if (response.data) {
          this.entityList = response.data.data || []
          this.filteredEntityList = [...this.entityList];
          if(this.filteredEntityList[0]){
            this.selectedEntity = this.filteredEntityList[0];
            this.handleEntitySelect(this.selectedEntity);
          }
        } else {
          this.$message.error(response.data.message || '获取实体列表失败')
        }
      } catch (error) {
        console.error('获取实体列表失败:', error)
        this.$message.error('获取实体列表失败')
      } finally {
        this.loading.entityList = false
      }
    },

    // 实体搜索
    handleEntitySearch() {
      const keyword = this.entitySearchKeyword.toLowerCase()
      if (!keyword) {
        this.filteredEntityList = [...this.entityList]
      } else {
        this.filteredEntityList = this.entityList.filter(entity => 
          entity.entityName.toLowerCase().includes(keyword) || 
          entity.entityCode.toLowerCase().includes(keyword)
        )
      }
    },

    // 选择实体
    handleEntitySelect(entity) {
      if(this.editList.length){
        return this.$message.error('当前有修改未保存')
      }
      this.selectedEntity = entity
      this.loadFieldPermissions(entity.entityCode)
    },

    // 加载字段权限配置
    async loadFieldPermissions(entityCode) {
      this.loading.fieldList = true
      try {
        const response = await getDataPermissionFields(entityCode)
        if (response.data) {
          this.fieldPermissionList = response.data.data || []
        } else {
          this.$message.error(response.data.message || '获取字段权限配置失败')
        }
      } catch (error) {
        console.error('获取字段权限配置失败:', error)
        this.$message.error('获取字段权限配置失败')
      } finally {
        this.loading.fieldList = false
      }
    },

    // 行权限开关切换
    async handleRowPermissionChange(row, value) {
      this.loading.permissionUpdate = true
      try {
        // 这里可以调用更新接口
        row.rowPermissionEnable = value
      } catch (error) {
        // 回滚状态
        row.rowPermissionEnable = !value
      } finally {
        this.loading.permissionUpdate = false
      }
    },

    // 列权限开关切换
    async handleColPermissionChange(row, value) {
      this.loading.permissionUpdate = true
      try {
        // 这里可以调用更新接口
        row.colPermissionEnable = value
      } catch (error) {
        // 回滚状态
        row.colPermissionEnable = !value
      } finally {
        this.loading.permissionUpdate = false
      }
    },

    // 修改字段权限（功能待完善）
    async handleEditFieldPermission(row) {
      if (this.editList.includes(row.fieldCode)) {
        const response = await register(row)
        if (response.data.code == 0) {
          this.$message.success('修改字段权限成功')
          this.editList = this.editList.filter(code => code !== row.fieldCode)
        } else {
          this.$message.error(response.data.message || '修改字段权限失败')
        }
      } else if(this.editList.length){
        this.$message.error('当前有修改未保存')
      } else {
        this.editList=[
          ...this.editList,
          row.fieldCode 
        ]
      }
    },
     // 取消修改字段权限
     async cancelEditFieldPermission(row) {
      this.editList = this.editList.filter(code => code !== row.fieldCode);
    }
  }
} 
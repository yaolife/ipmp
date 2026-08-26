import { rolePermissionApi,getRolePostList,getPostPage,rolePostRelation,postRoleRelationDelete } from "../api/index.js";
import { getRolePermedEntities } from "../../dataPermissionRegister/api/index.js";
import request from '@/modules/jurisdiction/utils/request'
import DataTable from '@/modules/jurisdiction/components/DataTable.vue';
import noDataImg from '@/assets/img/search-no-data.png';

export default {
  name: "RolePermissionDetail",
  components: {
    DataTable
  },
  data() {
    return {
      // 角色基础信息
      roleInfo: {},
      noDataImg,
      // tab
      activeName: "1",

      // 实体相关
      assetSearchKeyword: "",
      assetList: [],
      filteredAssetList: [],
      selectedAsset: null,

      // 行权限相关
      rowPermissions: [],
      addRowPermissionVisible: false,
      rowPermissionForm: {
        operation: "",
        condition: "",
        description: "",
      },
      isEditingRowPermission: false,
      editingRowPermissionId: null,

      // 行数据权限授权弹窗相关
      fieldPermissionsList: [],
      operationPermission: "read",
      entityPermPoints: null,

      // 弹窗中的临时选择状态 - 数组结构
      tempPermissionSelections: [],

      // 指定范围配置
      specifiedConfigVisible: false,
      currentConfigField: {},
      specifiedValues: [],
      currentFieldOptions: [],
      allOptions: [],

      // 自定义条件配置
      customConfigVisible: false,
      customCondition: {
        operator: "",
        value: "",
        type: "",
      },
      customConfigSaving: false,

      // 列权限相关
      columnPermissions: [],

      // 操作符映射数据
      sqlOperatorMap: {},


      // 已分配岗位
      tableColumns: [
        {
          prop: "postName",
          label: "岗位",
        },
        {
          prop: "postCode",
          label: "编码",
        }
      ],

      operationConfig: {
        width: 220,
        actions: [
          {
            text: '取消分配',
            type: 'text',
            event: this.handlePostRoleRelationDelete
          }
        ]
      },
      searchConfig:[
        {
          prop: "postName",
          label: "岗位",
          placeholder: '请输入',
        },
        {
          prop: "postCode",
          label: "编码",
          placeholder: '请输入',
        }
      ],
      dialogTableVisible: false,

      // 已选中的角色
      selectedRoles: [],
      roles:[],

      // 加载状态
      loading: {
        roleInfo: false,
        assetList: false,
        permissions: false,
        columnUpdate: false,
        saveRowPermission: false,
      },
    };
  },

  created() {
    this.initData();
  },

  methods: {
    // 初始化数据
    async initData() {
      await this.loadRoleInfo();
      await this.loadAssetList();
      await this.loadSqlOperatorMap();
    },

    // 加载角色信息
    async loadRoleInfo() {
      const roleCode = this.$route.params.roleCode;
      this.loading.roleInfo = true;
      try {
        this.roleInfo = await rolePermissionApi.getRoleDetail(roleCode);
      } catch (error) {
        console.error("加载角色信息失败:", error);
        this.$message.error("加载角色信息失败");
        // 如果角色不存在，返回列表页
        this.$router.back();
      } finally {
        this.loading.roleInfo = false;
      }
    },

    // 加载实体列表
    async loadAssetList() {
      this.loading.assetList = true;
      try {
        const roleCode = this.$route.params.roleCode;
        const entities = await getRolePermedEntities(roleCode);
        // 适配数据格式，将实体数据转换为资产列表格式
        this.assetList = entities.data.data.map((entity) => ({
          id: entity.entityId,
          name: entity.entityName,
          code: entity.entityCode,
          type: "entity",
          hasPermission: entity.hasPermission,
        }));
        this.filteredAssetList = [...this.assetList];
      } catch (error) {
        console.error("加载实体列表失败:", error);
        this.$message.error("加载实体列表失败");
      } finally {
        this.loading.assetList = false;
      }
    },

    // 加载SQL操作符映射
    async loadSqlOperatorMap() {
      try {
        this.sqlOperatorMap = await rolePermissionApi.getFieldDataTypeSqlOperatorMap();
      } catch (error) {
        console.error("加载SQL操作符映射失败:", error);
        // 如果加载失败，使用默认的操作符映射
        this.sqlOperatorMap = {
          text: [
            { name: "等于", code: "=" },
            { name: "不等于", code: "!=" },
            { name: "包含于", code: "IN" }
          ]
        };
      }
    },

    // 搜索实体
    handleAssetSearch() {
      if (!this.assetSearchKeyword) {
        this.filteredAssetList = [...this.assetList];
      } else {
        this.filteredAssetList = this.assetList.filter(
          (asset) =>
            asset.name.includes(this.assetSearchKeyword) ||
            asset.code.includes(this.assetSearchKeyword)
        );
      }
    },

    // 选择实体
    handleAssetSelect(asset) {
      // 防止重复选择同一个实体
      if (this.selectedAsset && this.selectedAsset.id === asset.id) {
        return;
      }

      // 防止在加载中时切换
      if (this.loading.permissions) {
        this.$message.warning("正在加载权限数据，请稍候");
        return;
      }

      this.selectedAsset = asset;
      this.loadPermissions(asset.id);
      this.tempPermissionSelections = [];
    },

    // 加载权限数据
    async loadPermissions(assetId) {
      const roleCode = this.$route.params.roleCode;
      this.loading.permissions = true;
      try {
        // 获取选中实体的编码
        const selectedEntity = this.assetList.find(
          (asset) => asset.id === assetId
        );
        const entityCode = selectedEntity ? selectedEntity.code : null;

        if (!entityCode) {
          console.error("未找到实体编码");
          this.$message.error("未找到实体编码");
          return;
        }

        // 并行加载行权限、列权限和字段权限配置列表
        const [rowPermissions, columnPermissions, entityPermPoints] =
          await Promise.all([
            rolePermissionApi.getRowDataPermissionList({
              roleCode: roleCode,
              entityCode: entityCode,
            }),
            rolePermissionApi.getColumnDataPermissions(roleCode, entityCode),
            rolePermissionApi.getEntityPermPoints(entityCode),
          ]);

                  // 适配行权限数据格式，将新接口返回的数据转换为页面需要的格式
        this.$nextTick(() => {
         
          this.rowPermissions = rowPermissions.map((rowPermission) => {
            return {
              ...rowPermission,
              displayName: this.generateRowPermissionDisplayName(rowPermission.rowDataPermDetailList),
            };
          });

          this.columnPermissions = columnPermissions.map(i=>{
            return {
              ...i,
              fieldName: this.generateColumnPermissionDisplayName(i.fieldCode)
            }
          });
        })

        // 设置实体权限点信息
        this.entityPermPoints = entityPermPoints;
        let allOptions = {}
        await Promise.all(
          entityPermPoints.rowPermPointList.map(async item =>{
            const options = await this.getOptions(item)
            const key = item.entityField.fieldCode
            allOptions = {...allOptions,[key]:options}
          })
        )
        this.allOptions = allOptions
      } catch (error) {
        console.error("加载权限数据失败:", error);
        this.$message.error("加载权限数据失败");
      } finally {
        this.loading.permissions = false;
      }
    },

    // 获取指定的选项
    async getOptions(params) {
      try {
        // 获取指定的参数,目前是权限点信息获取对应的组件信息,
        const comData = await rolePermissionApi.getBusinessComponentPage({
          pageNum: 1,
          pageSize: 1,
          compCode: params.rowPermControlType.code
        })
        if(comData[0] && comData[0].dataSource == 'URL'){
          // 拿到组件信息,根据配置,动态请求,获取对应行数据的指定选项
          const comConfig = JSON.parse(comData[0].compOptions)
          let params;
          if (comConfig.requestType.toLocaleLowerCase() === 'get' && comConfig.requestParams) {
              params = new URLSearchParams(JSON.parse(comConfig.requestParams) || {})
          }
          const data = await request[comConfig.requestType.toLocaleLowerCase()](
            comConfig.requestType.toLocaleLowerCase()==='post' ? comConfig.dataUrl : `${comConfig.dataUrl}?${params}`, 
            comConfig.requestType.toLocaleLowerCase()==='post' ? JSON.parse(comConfig.requestParams || '{}'):null
          )
          if (data.data.code != 0) {
            return []
          }
          // 解析saveContent和viewContent
          const saveFields = comConfig.saveContent.split(',')
          const viewFields = comConfig.viewContent.split(',')
  
          // 数据节点
          const s = saveFields.splice(0,saveFields.length-1)
          const saveNode = s.reduce((pre,curr)=>{
            return pre[curr] || pre['records']
          },data.data)
  
          const l = viewFields.splice(0,viewFields.length-1)
          const viewNode = l.reduce((pre,curr)=>{
            return pre[curr] || pre['records']
          },data.data)
          // 生成选项数组
          const label = viewNode.map(item=>{
            return {
              label: item[viewFields[0]]
            }
          })
          const value = saveNode.map(item=>{
            return {
              value: item[saveFields[0]]
            }
          })
          // 合并数组
          const options = label.map((item,index)=>{
            return {
              ...item,
              ...value[index]
            }
          })
  
          return options
        } else if(comData[0] && comData[0].dataSource == 'DICT') {
          const dictCode = JSON.parse(comData[0].compOptions).dictCode
          const res = await rolePermissionApi.getDictTreeItem({dictCode:dictCode,itemStatus:"1",itemText:""})
          return res.data.data.row.map(item=>{
            return {
              label: item.itemText,
              value: item.itemValue
            }
          }) || []
        }

      } catch (error) {
        console.log('获取选项失败',error)
      }
    },

    // 添加行权限
    async handleAddRowPermission() {
      if (!this.selectedAsset) {
        this.$message.warning("请先选择实体");
        return;
      }

      // 检查是否有权限点数据
      if (!this.entityPermPoints || !this.entityPermPoints.rowPermPointList) {
        this.$message.warning("权限点数据未加载，请重新选择实体");
        return;
      }

      // 重置表单数据
      this.rowPermissionForm = {
        operation: "",
        condition: "",
        description: "",
      };
      this.isEditingRowPermission = false;
      this.editingRowPermissionId = null;
      this.operationPermission = "read";

      // 初始化临时选择状态 - 数组结构
      this.initDefaultTempPermissionSelections();

      this.addRowPermissionVisible = true;
    },

    // 编辑行权限
    handleEditRowPermission(row) {
      this.rowPermissionForm = { ...row };
      this.isEditingRowPermission = true;
      this.editingRowPermissionId = row.rowDataPermissionId;
      // 设置操作权限
      this.operationPermission = row.operationLevel === 1 ? "read" : "modify";
      
      // 初始化临时选择状态，基于现有的行权限数据
      this.initTempPermissionSelectionsForEdit(row);
      
      this.addRowPermissionVisible = true;
    },

    // 保存行权限
    async handleSaveRowPermission() {
      // 添加防抖
      if (this.loading.saveRowPermission) {
        return;
      }

      this.loading.saveRowPermission = true;
      try {
        const roleCode = this.$route.params.roleCode;
        const entityCode = this.selectedAsset.code;

        // 构建行数据权限详情列表
        const rowDataPermDetailList = [];

        this.tempPermissionSelections.forEach((selection) => {
          if(selection.selectedMethod === "appoint" && !selection.config){
            throw new Error("请选择指定范围")
          }
          if((selection.selectedMethod === "custom" || selection.selectedMethod === "customize_sql_condition") && !selection.config){
            throw new Error("请选择自定义条件")
          }

          if (selection.selectedMethod === "all") {
            // 全部数据权限
            rowDataPermDetailList.push({
              entityCode: entityCode,
              fieldCode: selection.fieldCode,
              rowPermControlMethod: "all",
            });
          } else if (
            selection.selectedMethod === "appoint" &&
            selection.config
          ) {
            // 指定范围权限
            const values = selection.config.values.map(item=>`'${item}'`).join(",");
            rowDataPermDetailList.push({
              entityCode: entityCode,
              fieldCode: selection.fieldCode,
              rowPermControlMethod: "appoint",
              dataScopeOperator: "in",
              dataScopeValue: `(${values})`,
            });
          } else if (
            selection.selectedMethod === "custom" || selection.selectedMethod === "customize_sql_condition" &&
            selection.config
          ) {
            // 自定义条件权限
            rowDataPermDetailList.push({
              entityCode: entityCode,
              fieldCode: selection.fieldCode,
              rowPermControlMethod: selection.selectedMethod,
              dataScopeOperator: selection.config.operator,
              dataScopeValue: selection.config.value,
            });
          }
        });

        const operationLevel = this.operationPermission === "read" ? 1 : 3;

        if (this.isEditingRowPermission) {
          // 更新行权限
          const updateData = {
            entityCode: entityCode,
            operationLevel: operationLevel,
            roleCode: roleCode,
            rowDataPermDetailList: rowDataPermDetailList.map((detail) => ({
              ...detail,
              rowDataPermissionDetailId: "", // 这里可能需要从原有数据中获取
              rowDataPermissionId: this.editingRowPermissionId,
            })),
            rowDataPermissionId: this.editingRowPermissionId,
          };

          try {
            await rolePermissionApi.updateRowDataPermission(updateData);
            await this.loadAssetList();
            // 只有更新成功后才执行后续操作
            await this.loadPermissions(this.selectedAsset.id);
            this.$message.success("更新行权限成功");
          } catch (updateError) {
            console.error("更新行权限失败:", updateError);
            this.$message.error("更新行权限失败");
            return; // 更新失败时直接返回，不关闭弹窗
          }
        } else {
          // 添加行权限
          const addData = {
            entityCode: entityCode,
            operationLevel: operationLevel,
            roleCode: roleCode,
            rowDataPermDetailList: rowDataPermDetailList,
          };

          try {
            await rolePermissionApi.addRowDataPermission(addData);
            await this.loadAssetList();
            // 只有添加成功后才执行后续操作
            await this.loadPermissions(this.selectedAsset.id);
            this.$message.success("添加行权限成功");
          } catch (addError) {
            console.error("添加行权限失败:", addError);
            this.$message.error("添加行权限失败");
            return; // 添加失败时直接返回，不关闭弹窗
          }
        }
        setTimeout(() => {
          this.loading.saveRowPermission = false;
        }, 300);
        this.addRowPermissionVisible = false;
      } catch (error) {
        console.error("保存行权限失败:", error);
        setTimeout(() => {
          this.loading.saveRowPermission = false;
        }, 300);
        this.$message.error(`保存行权限失败：${error.message}`);
      }
    },

    // 删除行权限
    handleDeleteRowPermission(index) {
      this.$confirm("确认删除这条行权限吗?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(async () => {
          try {
            const permission = this.rowPermissions[index];
            await rolePermissionApi.deleteRowDataPermission(permission.rowDataPermissionId);
            await this.loadAssetList();
            this.rowPermissions.splice(index, 1);
            this.$message.success("删除成功");
          } catch (error) {
            console.error("删除行权限失败:", error);
            this.$message.error("删除行权限失败");
          }
        })
        .catch(() => {
          // 用户取消删除
        });
    },

    // 生成权限描述
    generatePermissionDescription(item) {
      if (
        !item.rowDataPermDetailList ||
        item.rowDataPermDetailList.length === 0
      ) {
        return "无特定条件";
      }

      const descriptions = item.rowDataPermDetailList
        .map((detail) => {
          const method = detail.rowPermControlMethod;
          if (method === "all") {
            return "所有数据";
          } else if (method === "appoint") {
            return `指定范围：${detail.dataScopeValue || ""}`;
          } else if (method === "custom" || method === "customize_sql_condition") {
            const operator = detail.dataScopeOperator;
            const value = detail.dataScopeValue;
            return `自定义条件：${detail.fieldCode} ${operator} ${value}`;
          }
          return "";
        })
        .filter((desc) => desc);

      return descriptions.join(" 且 ") || "无特定条件";
    },

    // 列权限变更
    async handleColumnPermissionChange(row) {
      // 防止重复提交
      if (this.loading.columnUpdate) {
        return;
      }

      this.loading.columnUpdate = true;
      try {
        const roleCode = this.$route.params.roleCode;
        const entityCode = this.selectedAsset.code;

        // 构建完整的权限数据
        const permissionData = {
          colDataPermissionId: row.colDataPermissionId || "1", // 如果没有ID，使用默认值
          roleCode: roleCode,
          entityCode: entityCode,
          fieldColDataPermissions: this.columnPermissions.map((col) => ({
            colDataPermissionId: col.colDataPermissionId,
            entityCode: col.entityCode,
            fieldCode: col.fieldCode,
            operationLevel: col.operationLevel,
            colDataDisplayCode: col.colDataDisplayCode,
          })),
        };

        // 调用列权限更新接口，传递全量数据
        await rolePermissionApi.upsertColumnDataPermission(permissionData);
        await this.loadAssetList();
        this.$message.success("列权限更新成功");
      } catch (error) {
        console.error("更新列权限失败:", error);
        this.$message.error("更新列权限失败");
      } finally {
        this.loading.columnUpdate = false;
      }
    },

    // 根据fieldCode获取tempPermissionSelections中的项
    getTempPermissionItem(fieldCode) {
      return this.tempPermissionSelections.find(
        (item) => item.fieldCode === fieldCode
      );
    },

    // 根据字段类型获取可用的操作符列表
    getOperatorsByFieldType(fieldCode) {
      const tempItem = this.getTempPermissionItem(fieldCode);
      if (!tempItem || !tempItem.entityField) {
        return this.sqlOperatorMap.text || [];
      }

      // 获取字段的数据类型，如果为null则默认为text
      const dataType = tempItem.entityField.dataType || 'text';
      
      // 返回对应数据类型的操作符列表
      return this.sqlOperatorMap[dataType] || this.sqlOperatorMap.text || [];
    },

    // 为编辑模式初始化临时权限选择状态
    initTempPermissionSelectionsForEdit(rowPermission) {
      // 先初始化基础的tempPermissionSelections（如果还没有的话）
      if (this.tempPermissionSelections.length === 0) {
        this.initDefaultTempPermissionSelections();
      }

      // 根据当前行权限数据更新tempPermissionSelections
      if (rowPermission.rowDataPermDetailList) {
        rowPermission.rowDataPermDetailList.forEach(async detail => {
          const tempItem = this.tempPermissionSelections.find(
            item => item.fieldCode === detail.fieldCode
          );
          
          if (tempItem) {
            // 更新选择方法
            tempItem.selectedMethod = detail.rowPermControlMethod;
            
            // 根据方法类型设置配置和显示
            switch (detail.rowPermControlMethod) {
              case "all":
                tempItem.config = null;
                tempItem.display = "所有数据";
                break;
                
              case "appoint":
                if (detail.dataScopeValue) {
                  const valueString = detail.dataScopeValue.replace(/[()]/g, "").replaceAll(/'/g, "");
                  const values = valueString.split(",").map(v => v.trim()).filter(v => v);
                  const handled = this.allOptions[detail.fieldCode].filter(i=>values.includes(i.value)).map(i=>i.label)
                  tempItem.config = {
                    type: "specified",
                    values: values
                  };
                  tempItem.display = `指定值：${handled.join(", ")}`;
                }
                break;
                
              case "custom":
              case "customize_sql_condition":
                if (detail.dataScopeOperator && detail.dataScopeValue) {
                  tempItem.config = {
                    type: detail.rowPermControlMethod,
                    operator: detail.dataScopeOperator,
                    value: detail.dataScopeValue
                  };
                  // 根据字段类型获取操作符映射
                  const availableOperators = this.getOperatorsByFieldType(detail.fieldCode);
                  const selectedOperator = availableOperators.find(op => op.code === detail.dataScopeOperator);
                  const operatorText = selectedOperator ? selectedOperator.name : detail.dataScopeOperator;
                  tempItem.display = `${operatorText}：${detail.dataScopeValue}`;
                }
                break;
            }
          }
        });
      }
    },

    // 初始化默认的临时权限选择状态
    initDefaultTempPermissionSelections() {
      if (this.entityPermPoints && this.entityPermPoints.rowPermPointList) {
        this.tempPermissionSelections = this.entityPermPoints.rowPermPointList.map((point, index) => {
          const fieldCode = point.entityField.fieldCode;
          const defaultMethod = point.rowPermControlType.rowPermControlMethods.sort(
            (a, b) => a.sortOrder - b.sortOrder
          )[0];

          return {
            index: index,
            fieldCode: fieldCode,
            fieldName: point.entityField.fieldName,
            entityField: point.entityField,
            rowPermControlType: point.rowPermControlType,
            selectedMethod: defaultMethod ? defaultMethod.code : "all",
            config: null,
            display: defaultMethod ? defaultMethod.description : "",
          };
        });
      }
    },

    // 生成列权限的显示名称
    generateColumnPermissionDisplayName(code) {
      const d = this.entityPermPoints && this.entityPermPoints.colPermPointList && this.entityPermPoints.colPermPointList.find(i=>{
        return i.entityField.fieldCode == code
      }) || {}
      return d && d.entityField && d.entityField.fieldName || ''
    },
    // 生成行权限的显示名称
    generateRowPermissionDisplayName(rowDataPermDetailList) {
      if (!rowDataPermDetailList 
        || rowDataPermDetailList.length === 0 
        
      ) {
        return "无条件";
      }

      return rowDataPermDetailList.map((detail) => {
        // 根据字段编码获取字段名称
        let fieldName = detail.fieldCode;
        if (this.entityPermPoints && this.entityPermPoints.rowPermPointList) {
          const permPoint = this.entityPermPoints.rowPermPointList.find(
            (point) => {return point.entityField.fieldCode === detail.fieldCode}
          );
          if (permPoint) {
            fieldName = permPoint.entityField.fieldName;
          }
        }

        // 根据控制方法类型生成描述
        let methodDesc = "";
        
        switch (detail.rowPermControlMethod) {
          case "all":
            methodDesc = "所有";
            break;
          case "appoint":
            methodDesc = "指定";
            break;
          case "custom":
          case "customize_sql_condition":
            methodDesc = "自定义";
            break;
          default:
            methodDesc = detail.rowPermControlMethod;
        }

        return `${fieldName}-${methodDesc}`;
      }).join("，");
    },

    // 授予全部权限
    handleGrantAllPermissions() {
      this.tempPermissionSelections.forEach((item) => {
        // 获取"所有"类型的控制方法
        const allMethod = item.rowPermControlType.rowPermControlMethods.find(
          (method) => method.code === "all"
        );

        if (allMethod) {
          item.selectedMethod = "all";
          item.config = null;
          item.display = allMethod.description || "所有数据";
        }
      });
      this.$message.success("已授予全部字段的所有权限");
    },

    // 范围类型变更
    handleRangeTypeChange(point, selectedCode) {
      const fieldCode = point.entityField
        ? point.entityField.fieldCode
        : point.fieldCode;

      // 找到tempPermissionSelections中对应的项
      const tempItem = this.tempPermissionSelections.find(
        (item) => item.fieldCode === fieldCode
      );
      if (!tempItem) return;

      // 找到选中的控制方法
      const selectedMethod =
        tempItem.rowPermControlType.rowPermControlMethods.find(
          (method) => method.code === selectedCode
        );

      // 更新临时选择状态
      tempItem.selectedMethod = selectedCode;
      tempItem.config = null;
      tempItem.display = selectedMethod ? selectedMethod.description : "";
    },

    // 统一的权限配置处理方法
    handleOpenPermissionConfig(point, methodCode,type) {
      const fieldCode = point.entityField
        ? point.entityField.fieldCode
        : point.fieldCode;
      this.currentConfigField = {
        ...point,
        fieldCode: fieldCode,
        type: type
      };
      if (methodCode === "appoint") {
        this.handleOpenSpecifiedConfig(point);
      } else if (methodCode === "custom" || methodCode === "customize_sql_condition") {
        this.handleOpenCustomConfig(point);
      }
    },

    // 打开指定范围配置
    async handleOpenSpecifiedConfig() {
      const tempItem = this.tempPermissionSelections.find(
        (item) => item.fieldCode === this.currentConfigField.fieldCode
      );
      this.specifiedValues = tempItem.config&&tempItem.config.values || [];

      try {
        this.currentFieldOptions = this.allOptions[this.currentConfigField.fieldCode]
        this.specifiedConfigVisible = true;
      } catch (error) {
        console.error("加载字段选项失败:", error);
        this.$message.error("加载字段选项失败");
      }
    },

    // 指定值变更
    handleSpecifiedValuesChange() {
      // 实时更新显示
      const fieldCode = this.currentConfigField.fieldCode;
      const tempItem = this.tempPermissionSelections.find(
        (item) => item.fieldCode === fieldCode
      );

      if (!tempItem) return;

      if (this.specifiedValues.length > 0) {
        const labels = this.specifiedValues.map((value) => {
          const option = this.currentFieldOptions.find(
            (opt) => opt.value === value
          );
          return option ? option.label : value;
        });
        const display = `指定值：${labels.join(", ")}`;

        // 更新临时显示状态
        tempItem.display = display;
      } else {
        tempItem.display = "";
      }
    },

    // 保存指定范围配置
    handleSaveSpecifiedConfig() {
      if (this.specifiedValues.length === 0) {
        this.$message.warning("请至少选择一个值");
        return;
      }

      const fieldCode = this.currentConfigField.fieldCode;
      const tempItem = this.tempPermissionSelections.find(
        (item) => item.fieldCode === fieldCode
      );

      if (!tempItem) return;

      const config = {
        type: "specified",
        values: [...this.specifiedValues],
      };

      // 更新显示文本
      const labels = this.specifiedValues.map((value) => {
        const option = this.currentFieldOptions.find(
          (opt) => opt.value === value
        );
        return option ? option.label : value;
      });
      const display = `指定值：${labels.join(", ")}`;

      // 更新临时选择状态
      tempItem.config = config;
      tempItem.display = display;

      this.specifiedConfigVisible = false;
      this.$message.success("指定范围配置成功");
    },

    // 打开自定义条件配置
    handleOpenCustomConfig(point) {
      // 查类型，选操作符
      this.customCondition = point && point.config
        ? { ...point.config }
        : { operator: "", value: "" };
      this.customConfigVisible = true;
    },

    // 保存自定义条件配置
    async handleSaveCustomConfig() {
      if (!this.customCondition.operator) {
        this.$message.warning("请选择条件");
        return;
      }

      if (!this.customCondition.value) {
        this.$message.warning("请输入条件值");
        return;
      }

      const fieldCode = this.currentConfigField.fieldCode;
      const tempItem = this.tempPermissionSelections.find(
        (item) => item.fieldCode === fieldCode
      );

      if (!tempItem) return;

      // 校验SQL条件
      this.customConfigSaving = true;
      try {
        const validationData = {
          entityFieldCode: fieldCode,
          operator: this.customCondition.operator,
          content: this.customCondition.value,
          entityCode: this.selectedAsset.code,
          fieldDataType: this.currentConfigField.type,
        };

        const validationResult = await rolePermissionApi.checkCustomSqlCondition(validationData);
        
        if (validationResult.code != '0') {
          this.$message.error(validationResult.message || "SQL条件校验失败，请检查输入的条件值");           
          this.customConfigSaving = false;
          return;
        }

        // 校验通过，保存配置
        const config = {
          type: "custom",
          operator: this.customCondition.operator,
          value: this.customCondition.value,
        };

        // 更新显示文本
        const availableOperators = this.getOperatorsByFieldType(fieldCode);
        const selectedOperator = availableOperators.find(op => op.code === this.customCondition.operator);
        const operatorText = selectedOperator ? selectedOperator.name : this.customCondition.operator;
        const display = `${operatorText}：${this.customCondition.value}`;

        // 更新临时选择状态
        tempItem.config = config;
        tempItem.display = display;

        this.customConfigVisible = false;
        this.customConfigSaving = false;
        this.$message.success("自定义条件配置成功");
        
      } catch (error) {
        console.error("校验SQL条件失败:", error);
        this.$message.error("校验SQL条件失败，请稍后重试");
      } finally {
      }
    },


    handleAssignRole() {
      this.dialogTableVisible = true
    },

    // 加载DataTable数据
    async loadData() {
      // 如果没有选中岗位，返回空数据
      const roleCode = this.$route.params.roleCode;
      const response = await getRolePostList(roleCode);
      if (response.data.code != '0') {
        this.$message.error(response.statusText|| response.data.message || '加载数据失败');
        return {
          data: [],
          total: 0
        };
      }
      const { data,records, total } = response.data;
      const roleList = data || records;
      
      // 设置默认选中
      this.roles = roleList;
      
      return {
        data: roleList,
        total: total || roleList.length
      };
      
    },
    // 关联
    async handlePostRoleRelation() {
      if (!this.selectedRoles.length) {
        return this.$message.error('请选择角色');
      }
      const response = await rolePostRelation(
        {
          "postCodes": this.selectedRoles.map(i=>i.postCode),
          "roleCode": this.$route.params.roleCode
        }
      )
      if (response.data.code != 0 || response.status != 200) {
        return this.$message.error(response.data.message || response.statusText || '关联失败');
      }
      this.$message.success('关联成功');
      this.$refs.dataTableRef.loadTableData();
      this.dialogTableVisible = false;
    },
    // 解除关联
    async handlePostRoleRelationDelete(row) {
      try {
        await this.$confirm('确认取消分配该角色吗?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        const response = await postRoleRelationDelete(
          {
            "postCode": row.postCode,
            "roleCode": this.$route.params.roleCode
          }
        )
        if (response.data.code != 0 || response.status != 200) {
          return this.$message.error(response.data.message || response.statusText || '取消分配失败');
        } 
        this.$message.success('取消分配成功');
        await this.$refs.dataTableRef.loadTableData();
        // this.selectedRoles = this.selectedRoles.filter(i=>i.roleCode != row.roleCode)
        // this.$refs.dialogDataTableRef.$refs.dataTable.toggleRowSelection(row)
        this.$refs.dialogDataTableRef.loadTableData()



      } catch (error) {
        console.log('取消分配失败:', error);
      }
    },
    // 处理选中变化
    handleSelectionChange(selection) {
      this.selectedRoles = selection;
    },
     // 弹窗数据加载
    async loadAssignRoleData(params={}) {
      const response = await getPostPage({...params,pageNum:1,pageSize:10000})
      if (response.status!= 200 && response.data.code != '0') {
        this.$message.error(response.data.message || response.statusText || '加载数据失败');
        return {
          data: [],
          total: 0
        };
      }

      const { data,records, total } = response.data;
      let roleList = data || records;
      if (params.postCode) {
        roleList = roleList.filter(i=>i.postCode.includes(params.postCode))
      }
      if (params.postName) {
        roleList = roleList.filter(i=>i.postName.includes(params.postName))
      }
      setTimeout(() => {
        this.roles.forEach(i=>{
          roleList.find(j=>j.postCode==i.postCode) && this.$refs.dialogDataTableRef.$refs.dataTable.toggleRowSelection(roleList.find(j=>j.postCode==i.postCode));
        })
      }, 100);
      let showdata = roleList.slice(params.pageIndex*params.pageSize - params.pageSize, params.pageIndex*params.pageSize)
      return {
        data:showdata,
        total: total || roleList.length
      };
    },
  },
};

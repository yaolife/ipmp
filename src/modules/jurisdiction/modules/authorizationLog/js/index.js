import DataTable from '@/modules/jurisdiction/components/DataTable.vue';

import { getAuthLogList, getEntityList, getRoleList } from '../api';

export default {
  name: 'AuthorizationLog',
  components: {
    DataTable,
  },
  data() {
    const permTypeMap = {
      'row': '行权限',
      'col': '列权限'
    }
    return {
      jsonContext: '',
      dialogVisible: false,
      roleList:[],
      searchConfig: [
        {
          label: '用户名',
          prop: 'operatorName',
          placeholder: '请输入',
        },
        {
          label: '工号',
          prop: 'operatorCode',
          placeholder: '请输入',
        },
        {
          label: '操作时间',
          prop: 'time',
          type: 'datetimerange',
          placeholder: '请输入',
          valueFormat: 'yyyy-MM-dd HH:mm:ss',
          clearable: true,
        },
        {
          label: '角色',
          prop: 'firstOperationObjCode',
          type: 'select',
          needRemote: true,
          queryKey: 'roleName',
          labelKey: 'roleName',
          valueKey: 'roleCode',
          api: getRoleList,
          options: []
        },
        {
          label: '实体',
          prop: 'secondOperationObjCode',
          type: 'select',
          needRemote: true,
          queryKey: 'entityName',
          labelKey: 'entityName',
          valueKey: 'entityCode',
          api: getEntityList,
          options: []
        },
        {
          label: '操作类型',
          prop: 'operationType',
          type: 'select',
          placeholder: '选择',
          options: [
            {
              name: '新增',
              value: 'create'
            },
            {
              name: '变更',
              value: 'update'
            },
            {
              name: '删除',
              value: 'delete'
            },
          ]
        },
        {
          label: '权限类型',
          prop: 'permType',
          type: 'select',
          placeholder: '请选择',
          options: [
            {
              name: '行权限',
              value: 'row'
            },
            {
              name: '列权限',
              value: 'col'
            },
          ]
        }
      ],
      tableColumns: [
        {
          prop: 'operatorName',
          label: '用户名',
          width: 200
        },
        {
          prop: 'operatorCode',
          label: '工号',
          width: 200,
        },
        {
          prop: 'operationTime',
          label: '操作时间',
          width: 200,
        },
        {
          prop: 'firstOperationObjName',
          label: '角色',
          width: 200,
        },
        {
          prop: 'secondOperationObjName',
          label: '实体',
          width: 200,
        },
        {
          prop: 'permType',
          label: '权限类型',
          width: 200,
          formatter: (val) => permTypeMap[val]
        },
        {
          prop: 'operationType',
          label: '操作类型',
          formatter: this.operationTypeFormatter
        },
        {
          prop: 'clientIp',
          label: '客户端IP'
        }
      ],
      operationConfig: {
        width: 120,
        actions: [
          {
            text: '查看',
            type: 'text',
            event: this.handleView
          },
        ]
      }
    }
  },
  methods: {
    operationTypeFormatter(value) {
      const valueMap = {
        'create': '新增',
        'delete': '删除',
        'update': '变更'
      }
      return valueMap[value];
    },

    handleCancel() {
      this.dialogVisible = false;
    },

    handleView(rowData) {
      this.dialogVisible = true;
      this.jsonContext = rowData.operationContext;
    },

    // 加载表格数据
    async loadTableData(params) {
      try {
        const payload = {
          ...params,
          startTime: new Date(params.beginTime).getTime(),
          endTime: new Date(params.endTime).getTime(),
          current: params.pageIndex,
          size: params.pageSize
        }
        payload.beginTime && delete payload.beginTime;
        payload.pageIndex && delete payload.pageIndex;
        payload.pageSize && delete payload.pageSize
        const result = await getAuthLogList(payload);
        const data = result.data || {};
        return {
          data: data.records || [],
          total: data.total || 0
        }
      } catch (err) {
        console.log('Failed to fetch:', err);
        return {
          data: [],
          total: 0
        }
      }
    },
    async loadRoleData(){
      const response = await getRoleList({pageNum:1,pageSize:10000});
      if(response.data.code === '0'){
        const roleList = response.data.records.map(item=>{
          return {label:item.roleName,value:item.roleCode};
        });
        const roleItem = this.searchConfig.find(item=>item.prop === 'firstOperationObjCode');
        roleItem.options = roleList;
      }
    },
    async loadEntityData(){
      const response = await getEntityList({});
      if(response.data.code === '0'){
        const entityList = response.data.data.map(item=>{
          return {label:item.entityName,value:item.entityCode};
        });
        const entityItem = this.searchConfig.find(item=>item.prop === 'secondOperationObjCode');
        entityItem.options = entityList;
      }
    }
  },
  mounted() {
    this.loadRoleData();
    this.loadEntityData();
  },
}

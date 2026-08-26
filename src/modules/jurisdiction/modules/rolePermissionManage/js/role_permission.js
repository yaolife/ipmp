import { rolePermissionApi } from "../api/index.js";

export default {
  name: "RolePermissionManage",
  data() {
    return {
      // 搜索配置
      searchConfig: [
        {
          prop: "roleName",
          label: "角色名称",
          type: "input",
          placeholder: "请输入角色名称",
        },
        {
          prop: "roleCode",
          label: "角色编码",
          type: "input",
          placeholder: "请输入角色编码",
        },
        {
          prop: "roleStatus",
          label: "状态",
          type: "select",
          placeholder: "请选择状态",
          options: [
            { label: "已启用", value: "1" },
            { label: "已停用", value: "0" },
          ],
        },
      ],

      // 表格列配置
      tableColumns: [
        {
          prop: "roleName",
          label: "角色名称",
          width: '300'
        },
        {
          prop: "roleCode",
          label: "角色编码",
          width: '300'
        },
        {
          prop: "roleStatus",
          label: "状态",
          formatter: (value) => {
            return value === "1" ? "已启用" : "已停用";
          },
          formatType: 'status',
          width: '150'
        },
        {
          prop: "roleDesc",
          label: "角色描述",
        },
      ],

      // 操作列配置
      operationConfig: {
        width: 150,
        actions: [
          {
            text: "授权",
            type: "text",
            event: this.handleAuthorize,
          },
        ],
      },
    };
  },

  methods: {
    // 加载数据的方法
    async loadData(params) {
      try {
        // 适配参数格式，DataTable传入的是page，接口需要pageNum
        const apiParams = {
          ...params,
          pageNum: params.page || 1
        }
        delete apiParams.page

        const result = await rolePermissionApi.getRoleInfoList(apiParams);

        // 适配返回数据格式，DataTable期望 { data: [], total: 0 }
        return {
          data: result.records || [],
          total: result.total || 0
        };
      } catch (error) {
        console.error("加载数据失败:", error);
        this.$message.error("加载数据失败");
        return {
          data: [],
          total: 0,
        };
      }
    },

    // 处理授权操作
    handleAuthorize(row) {
      // 跳转到角色权限详情页
      this.$router.push({
        name: "角色数据权限授权详情",
        params: { roleCode: row.roleCode },
      });
    },
  },
};

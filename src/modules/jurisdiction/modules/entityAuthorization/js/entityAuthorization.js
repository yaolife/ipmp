import { getPermedEntities, getRelatedRoles, getUnrelatedRoles } from "../api";
import DataTable from "@/modules/jurisdiction/components/DataTable.vue";

export default {
  name: "PositionPermissionManage",
  components: {
    DataTable
  },
  data() {
    return {
      showList: [],
      // 选中的实体code
      selectedAsset: "",
      // 搜索关键词
      searchKeyword: "",
      // 表格数据
      assetList: [],
      // 表格加载状态
      loading: false,
      // 表格列配置
      columns: [
        {
          prop: "name",
          label: "实体名称"
        },
        {
          prop: "code",
          label: "实体编码"
        }
      ],
      // 当前选中的实体
      currentEntity: null,
      // 当前激活的tab
      activeTab: "authorized",
      searchConfig: [
        {
          prop: "roleName",
          label: "角色名称",
          placeholder: "请输入"
        },
        {
          prop: "roleCode",
          label: "角色编码",
          placeholder: "请输入"
        },
        {
          prop: "roleStatus",
          label: "状态",
          type: "select",
          placeholder: "请选择",
          options: [
            {
              name: "已启用",
              value: "1"
            },
            {
              name: "已停用",
              value: "0"
            }
          ]
        }
      ],
      tableColumns: [
        {
          prop: "roleName",
          label: "角色名称"
        },
        {
          prop: "roleCode",
          label: "角色编码"
        },
        {
          prop: "roleStatus",
          label: "状态",
          formatter: value => {
            return value === "1" ? "已启用" : "已停用";
          }
        }
      ],
      // 操作列配置
      operationConfig: {
        width: 220,
        actions: [
          {
            text: "查看",
            type: "text",
            event: this.handleDetail
          }
        ]
      }
    };
  },

  watch: {
    currentEntity: {
      handler: function(newVal, oldVal) {
        this.$refs.dataTableRef && this.$refs.dataTableRef.loadTableData();
      }
    },
    activeTab: {
      handler: function(newVal, oldVal) {
        this.$refs.dataTableRef && this.$refs.dataTableRef.loadTableData();
      }
    }
  },

  created() {
    // 初始加载数据
    this.loadPositionList();
  },

  methods: {
    // 加载实体列表
    async loadPositionList() {
      this.loading = true;
      const response = await getPermedEntities();
      this.loading = false;
      if (response.status !== 200) {
        this.$message.error(response.statusText);
        return;
      }
      this.assetList = response.data.data.map(entity => ({
        id: entity.entityId,
        name: entity.entityName,
        code: entity.entityCode,
        type: "entity"
      }));
      this.showList = this.assetList;
      if (this.showList.length > 0) {
        this.selectedAsset = this.showList[0].code;
        this.currentEntity = this.showList[0].code;
      }
    },

    // 处理搜索
    handleSearch() {
      // 过滤实体列表
      this.showList = this.assetList.filter(entity => {
        return (
          entity.name.includes(this.searchKeyword.trim()) ||
          entity.code.includes(this.searchKeyword.trim())
        );
      });
    },

    // 处理行点击
    handleRowClick(row) {
      // 选中实体
      this.currentEntity = row.code;
    },

    // 处理查看详情
    handleDetail(row) {
      // 跳转到实体权限详情页
      this.$router.push({
        name: "角色数据权限授权详情",
        params: { roleCode: row.roleCode }
      });
    },

    // 加载DataTable数据
    // 切换tab
    handleTabClick(tab) {},

    async loadData(params) {
      // 如果没有选中实体，返回空数据
      if (!this.currentEntity) {
        return {
          data: [],
          total: 0
        };
      }

      let response = {};
      if (this.activeTab === "authorized") {
        response = await getRelatedRoles(this.currentEntity);
      } else {
        response = await getUnrelatedRoles(this.currentEntity);
      }
      if (response.data.code != "0") {
        this.$message.error(
          response.statusText || response.data.message || "加载数据失败"
        );
        return;
      }
      const { data, records, total } = response.data;
      let roleList = data || records;
      if (params.roleName) {
        roleList = roleList.filter(i => i.roleName.includes(params.roleName));
      }
      if (params.roleCode) {
        roleList = roleList.filter(i => i.roleCode.includes(params.roleCode));
      }
      if (params.roleStatus) {
        roleList = roleList.filter(i =>
          i.roleStatus.includes(params.roleStatus)
        );
      }
      let showdata = roleList.slice(
        params.pageIndex * params.pageSize - params.pageSize,
        params.pageIndex * params.pageSize
      );
      return {
        data: showdata,
        total: total || roleList.length
      };
    },
    handleAssetSelect(code) {
      this.selectedAsset = code;
      this.currentEntity = code;
    }
  }
};

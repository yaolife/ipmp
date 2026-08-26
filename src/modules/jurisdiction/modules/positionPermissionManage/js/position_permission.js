import {getPostPage, getPostRoleList,postRoleRelation,postRoleRelationDelete,getRoleList} from '../api'
import DataTable from '@/modules/jurisdiction/components/DataTable.vue';
import noDataImg from '@/assets/img/search-no-data.png';

export default {
  name: "PositionPermissionManage",
  components: {
    DataTable
  },
  data() {
    return {
      noDataImg,
      // 搜索关键词
      searchKeyword: '',
      // 表格数据
      positionList: [],
      // 表格加载状态
      loading: false,
      // 表格列配置
      columns: [
        {
          prop: 'postName',
          label: '岗位'
        },
        {
          prop: 'postCode',
          label: '编码'
        }
      ],
      // 分页配置
      pagination: {
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      // 当前选中的岗位
      currentPosition: null,
      // 已选中的角色
      selectedRoles: [],
      roles:[],
      tableColumns: [
        {
          prop: "roleName",
          label: "名称",
        },
        {
          prop: "roleCode",
          label: "编码",
        },
        {
          prop: "roleStatus",
          label: "状态",
          formatter: (value) => {
            return value === "1" ? "已启用" : "已停用";
          },
          formatType:'status'
        },
      ],
      // 操作列配置
      operationConfig: {
        width: 150,
        actions: [
          {
            text: '查看',
            type: 'text',
            event: this.handleDetail
          },
          {
            text: '取消分配',
            type: 'text',
            event: this.handlePostRoleRelationDelete
          }
        ]
      },

      // 弹窗
      dialogTableVisible: false,
      searchConfig:[
        {
          prop: "roleName",
          label: "角色名称",
          placeholder: '请输入',
        },
        {
          prop: "roleCode",
          label: "角色编码",
          placeholder: '请输入',
        },
        {
          prop: "roleStatus",
          label: "状态",
          type: "select",
          placeholder: '请选择',
          options: [
            {
              name: "已启用",
              value: "1"
            },
            {
              name: "已停用",
              value: "0"
            }
          ],
        },
      ],
    };
  },

  watch: {
    currentPosition: {
      handler: function (newVal, oldVal) {
        this.$refs.dataTableRef&& this.$refs.dataTableRef.loadTableData();
      }
    }
  },
  
  created() {
    // 初始加载数据
    this.loadPositionList();
  },
  
  methods: {
    // 加载岗位列表
    async loadPositionList() {
      this.loading = true;
      const response = await getPostPage({
        pageNum: this.pagination.currentPage,
        pageSize: this.pagination.pageSize,
        postName: this.searchKeyword,
      });
      this.loading = false;
      if (response.status !== 200) {
        this.$message.error(response.statusText);
        return;
      }
      this.positionList = response.data.records || [];
      this.pagination.total = response.data.total;
    },
    
    // 处理搜索
    handleSearch() {
      this.loadPositionList();
    },

    // 分页
    // 处理分页大小变化
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.loadPositionList()
    },
    // 处理当前页变化
    handleCurrentChange(page) {
      this.pagination.currentPage = page
      this.loadPositionList()
    },
    
    // 处理行点击
    handleRowClick(row) {
      // 选中岗位
      this.currentPosition = row.postCode;
      this.selectedRoles = []
    },

    // 处理查看详情
    handleDetail(row) {
      // 跳转到岗位权限详情页
      this.$router.push({
        name: '角色数据权限授权详情',
        params: { roleCode: row.roleCode }
      });
    },

    // 加载DataTable数据
    async loadData(params) {
      // 如果没有选中岗位，返回空数据
      if (!this.currentPosition) {
        return {
          data: [],
          total: 0
        };
      }

      const response = await getPostRoleList(this.currentPosition);
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

    handleAssignRole() {
      this.dialogTableVisible = true;
      this.$refs.dialogDataTableRef.reload();
    },

    // 弹窗数据加载
    async loadAssignRoleData(params={}) {
      const response = await getRoleList()
      if (response.status!= 200 && response.data.code != '0') {
        this.$message.error(response.data.message || response.statusText || '加载数据失败');
        return {
          data: [],
          total: 0
        };
      }

      const { data,records, total } = response.data;
      let roleList = data || records;
      if (params.roleName) {
        roleList = roleList.filter(i=>i.roleName.includes(params.roleName))
      }
      if (params.roleCode) {
        roleList = roleList.filter(i=>i.roleCode.includes(params.roleCode))
      }
      if (params.roleStatus) {
        roleList = roleList.filter(i=>i.roleStatus.includes(params.roleStatus))
      }
      setTimeout(() => {
        this.roles.forEach(i=>{
          roleList.find(j=>j.roleCode==i.roleCode) && this.$refs.dialogDataTableRef.$refs.dataTable.toggleRowSelection(roleList.find(j=>j.roleCode==i.roleCode));
        })
      }, 0);
      let showdata = roleList.slice(params.pageIndex*params.pageSize - params.pageSize, params.pageIndex*params.pageSize)
      return {
        data:showdata,
        total: total || roleList.length
      };
    },

    // 处理选中变化
    handleSelectionChange(selection) {
      this.selectedRoles = selection;
    },

    // 关联
    async handlePostRoleRelation() {
      if (!this.selectedRoles.length) {
        return this.$message.error('请选择角色');
      }
      const response = await postRoleRelation(
        {
          "postCode": this.currentPosition,
          "roleCodes": this.selectedRoles.map(i=>i.roleCode)
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
            "postCode": this.currentPosition,
            "roleCode": row.roleCode
          }
        )
        if (response.data.code != 0 || response.status != 200) {
          return this.$message.error(response.data.message || response.statusText || '取消分配失败');
        } 
        this.$message.success('取消分配成功');
        await this.$refs.dataTableRef.loadTableData();
        // console.log('...this.selectedRoles',this.selectedRoles)
        // this.selectedRoles = this.selectedRoles.filter(i=>i.roleCode != row.roleCode)
        // this.$refs.dialogDataTableRef.$refs.dataTable.toggleRowSelection(row)
        this.$refs.dialogDataTableRef.loadTableData()



      } catch (error) {
        console.log('取消分配失败:', error);
      }
    },
  }
};
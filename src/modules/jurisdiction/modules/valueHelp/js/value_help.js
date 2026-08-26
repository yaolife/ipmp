import request from '@/modules/jurisdiction/utils/request'
import { convertToCascaderData } from '@/modules/jurisdiction/utils/dataToCascader'
import { addValueField } from '@/modules/jurisdiction/utils/addValueField'
import MyJson from '@/modules/jurisdiction/components/MyJson.vue'
import DataTable from '@/modules/jurisdiction/components/DataTable.vue';
import {
  getBusinessComponentPage,
  deleteBusinessComponent,
  addBusinessComponent,
  updateBusinessComponent,
  getDictionaryType,
  getComInfo
} from '../api'

export default {
  components: {
    MyJson,
    DataTable
  },
  data() {
    return {
      // 加载状态
      loading: {
        tableData: false
      },
      searchConfig: [
        {
          label: '属性值名称',
          prop: 'compName',
          placeholder: '请输入',
        },
        {
          label: '属性值编码',
          prop: 'compCode',
          placeholder: '请输入',
        },
      ],
      tableColumns: [
        {
          prop: 'compName',
          label: '属性值名称',
        },
        {
          prop: 'compCode',
          label: '属性值编码',
        },
      ],
      operationConfig: {
        width: 220,
        actions: [
          {
            text: '修改',
            type: 'text',
            event: this.handleEdit
          },
          {
            text: '删除',
            type: 'text',
            event: this.handleDelete,
            color:'red'
          },
        ]
      },
      toolbarButtons:[{
        text:'新增',
        event:this.handleAdd
      }],
      // 查询条件
      searchForm: {
        compName: '',
        compCode: ''
      },

      // 分页参数
      pagination: {
        pageNum: 1,
        pageSize: 10,
        total: 0
      },

      // 表格数据
      tableData: [],

      // 弹窗相关
      isDisabled: false,
      dialogBtnLoading: false,
      dialogVisible: false,
      dialogTitle: '',
      dialogType: '', // 'add' | 'edit'
      currentRow: {},
      rules: {
        compName: [{ required: true, message: '请输入名称', trigger: 'blur' }],
        compCode: [{ required: true, message: '请输入编码', trigger: 'blur' }],
        dataSource: [{ required: true, message: '请选择数据来源', trigger: 'blur' }],
        dataUrl: [{ required: true, message: '请输入URL地址', trigger: 'blur' }],
        requestType: [{ required: true, message: '请选择请求方式', trigger: 'blur' }],
        viewContent: [{ required: true, message: '请选择显示值', trigger: 'blur' }],
        saveContent: [{ required: true, message: '请选择返回值', trigger: 'blur' }],
        dictCode: [{ required: true, message: '请选择字典类型', trigger: 'blur' }]
      },
      returnContextData: '{}',
      viewContentData: [], //显示值和返回值的数据
      dictionaryTypeData: [], //字典数据
      cascaderProps: {
        checkStrictly: true,    // 关键：父子节点不再互相关联，每一级都能单独选
        emitPath: false,        // 如只想拿当前节点 id，可再配这个
      }
    }
  },

  mounted() {
    this.loadTableData()
    this.getDictionaryTypeData()
  },

  methods: {
    async getDictionaryTypeData() {
      const response = await getDictionaryType()
      if (response.data.code == 0) {
        this.dictionaryTypeData = addValueField(response.data.data)
      }
    },

    // 组件接口测试
    async handleTest() {
      const { dataUrl, requestType, requestParams = '{}' } = this.currentRow
      if (!dataUrl) {
        return this.$message.warning('请输入URL地址')
      }
      if (!requestType) {
        return this.$message.warning('请选择请求方式')
      }
      const TYPE_MAP = {
        'GET': 'get',
        'POST': 'post'
      }

      let params;
      try {
        if (requestType === 'GET') {
          try {
            params = new URLSearchParams(JSON.parse(requestParams) || {})
          } catch (err) {
            const validJson = requestParams.replace(/(\w+):/g, '"$1":')
            params = new URLSearchParams(JSON.parse(validJson) || {})
          }
        }
        const response = await request[TYPE_MAP[requestType]](requestType === 'GET' ? `${dataUrl}?${params}` : dataUrl, requestType === 'POST' ? JSON.parse(requestParams) : null)
        if (response.data && response.data.code == 0) {
          const result = convertToCascaderData(response.data.data || response.data.records)
          this.returnContextData = JSON.stringify(response.data.data || response.data.records || {})
          this.viewContentData = result
          return
        }
        this.$message.error(response.data.message || '获取数据失败');
      } catch (err) {
        // this.$message.error('操作失败！')
      }
    },

    // 加载表格数据
    async loadTableData(filterParams) {
      if(filterParams){
        this.searchForm = filterParams;
      }
      this.loading.tableData = true
      const params = {
        compCode:this.searchForm.compCode,
        compName: this.searchForm.compName,
        current:this.searchForm.pageIndex,
        size:this.searchForm.pageSize
      }
      const response = await getBusinessComponentPage(params);
      this.loading.tableData = false;
      if (response.data.code == 0) {
        const data = response.data
        this.tableData = data.records || []
        this.pagination.total = data.total || 0
        return {
          data: data.records || [],
          total: data.total || 0
        }
      } else {
        this.$message.error(response.data.message || '获取数据失败')
      }
    },

    // 查询
    handleSearch() {
      this.pagination.pageNum = 1
      this.loadTableData()
    },

    // 重置
    handleReset() {
      this.searchForm = {
        compName: '',
        compCode: ''
      }
      this.pagination.pageNum = 1
      this.loadTableData()
    },

    // 分页变化
    handlePageChange(page) {
      this.pagination.pageNum = page
      this.loadTableData()
    },

    // 每页数量变化
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.pagination.pageNum = 1
      this.loadTableData()
    },

    // 新建
    handleAdd() {
      this.dialogType = 'add'
      this.dialogTitle = '新建属性值'
      this.currentRow = { dataSource: 'URL' }
      this.dialogVisible = true;
      this.isDisabled = false;
    },

    // 修改
    async handleEdit(row) {
      const { compOptions, dataSource, isUsed, compCode, ...others } = row
      const comConfig = JSON.parse(compOptions || '{}')
      const compInfoData = await getComInfo(compCode)
      if (dataSource === 'URL') {
        const { requestType, dataUrl, requestParams = '{}' } = comConfig

        const TYPE_MAP = {
          'GET': 'get',
          'POST': 'post'
        }
        const response = await request[TYPE_MAP[requestType]](dataUrl, JSON.parse(requestParams || '{}'))
        if (response.data.code == 0) {
          const result = convertToCascaderData(response.data.data || response.data.records)
          this.returnContextData = JSON.stringify(response.data.data || response.data.records || {})
          this.viewContentData = result
        }
      }
      this.isDisabled = compInfoData.data && compInfoData.data.data && compInfoData.data.data.used || false
      this.dialogType = 'edit'
      this.dialogTitle = '修改属性值'
      this.currentRow = {
        dataSource,
        ...others,
        ...comConfig,
        compCode,
        saveContent: comConfig.saveContent && comConfig.saveContent.split(','),
        viewContent: comConfig.viewContent && comConfig.viewContent.split(',')
      }
      this.dialogVisible = true
    },

    // 删除
    handleDelete(row) {
      this.$confirm(`确定删除${row.compName}？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const response = await deleteBusinessComponent(row.compCode)
          if (response.data.code == 0) {
            this.$message.success('删除成功')
            this.$refs.tableRef.reload();
          } else {
            this.$message.error(response.data.message || '删除失败')
          }
        } catch (error) {
          console.error('删除失败:', error)
          this.$message.error('删除失败')
        }
      }).catch(() => {
        // 用户取消删除
      })
    },

    // 关闭弹窗
    handleDialogClose() {
      this.dialogVisible = false
      this.currentRow = {}
      this.dialogType = 'add'
      this.returnContextData = ''
      this.viewContentData = []
    },

    async handleDialogConfirm() {
      const that = this;
  
      this.$refs.dialogFormRef.validate(async (valid) => {
        if (valid) {
          this.dialogBtnLoading = true;
          const {
            businessComponentId,
            compCode,
            compName,
            dataSource,
            saveContent,
            viewContent,
            dictCode,
            ...others
          } = this.currentRow;
          const compOptions = {
            ...others,
            dictCode,
            saveContent: saveContent && saveContent.join(','),
            viewContent: saveContent && viewContent.join(',')
          }
          const payload = {
            businessComponentId,
            compCode,
            compName,
            dataSource,
            compOptions: JSON.stringify(compOptions),
          }
          const response = this.dialogType === 'add' ? await addBusinessComponent(payload) : await updateBusinessComponent(payload)
          if (response.data && response.data.code == 0) {
            this.$refs.tableRef.reload();
            this.$message.success('操作成功')
           
            this.handleDialogClose();
            this.dialogBtnLoading = false
            return
          }
          this.$message.error(response.data.message || '系统错误，请稍后再试')
          this.dialogBtnLoading = false
        } else {
          this.$message.error('请检查表单填写是否正确')
        }
      })
    },
    dealResponse(response) {
      if (response.code == 0) {
        const result = convertToCascaderData(response.data || response.records || {})
        this.returnContextData = response.data || response.records || {}
        this.viewContentData = result
        return
      }
      this.returnContextData = {}
      this.viewContentData = {}
      this.$message.error('获取数据失败')
    }
  }
} 

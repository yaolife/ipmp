import breadcrumb from '@/components/common/breadcrumb'
import {Filters} from '@/assets/js/Utils';
import {throttle} from '@/utils/funcUtil'
import api from '../api'
import osUtil from "@/utils/osUtil";
import * as Utils from "@/utils/Utils";
import { getHeadersOptions } from "@/utils/funcUtil.js";
import queryForm from "@/components/common/queryForm";
import { calcHeight } from "@/utils/funcUtil";

export default {
  components: {
    breadcrumb,
    queryForm
  },
  data: function () {
    return {
      filters: Utils.Filters.splitTime,
      hasIcon: false,
      brand: [
        { name: 'sys.system_manage' },
        { name: 'hc.http_connector' }
      ],
      maxTreeHeight: 0,
      maxTableHeight: 0,
      maxRightHeight: 0,

      classId: '',
      isTreeCollapse: false,
      filterText: '',
      //分类列表
      classTreeList:[],
      //数据列表
      dataList: [],
      dataSelect: [],
      classMoveId: '',
      moveVisible: false,

      pageNumber: 1,
      pageSize: 10,
      pageTotal: 0,

      //搜索
      searchName: '',
      searchDomain: '',
      searchType: '',
      advShow: 0,

      //分类编辑
      editVisible: false,
      edit: {
        classId: '',
        className: '',
      },
      //引用详情
      relationId: '',
      relationData: [],
      relationLoading: false,
      relationVisible: false,
      relationTitle: '',
      relationCurrent: 1,
      relationSize: 10,
      relationTotal: 0,
      relationSearchParam: {
        formName: '',
        actionName: ''
      },
      //规则
      rules: {
        className: [
          { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' }
        ],
      },
      headersOptions: getHeadersOptions(),
      //搜索字段
      queryFields: [
        { name: 'searchName', label: '', labelKey: 'hc.http_name', value: '', type: 'input', display: true, order: 1 },
        { name: 'searchDomain', label: '', labelKey: 'hc.http_domain', value: '', type: 'input', display: true, order: 2 },
        { name: 'searchType', label: '', labelKey: 'hc.http_auth_type', value: '', type: 'select', display: true, order: 3, fieldMap: [
          { labelKey: 'hc.http_auth_type_0', value: "0" },
          { labelKey: 'hc.http_auth_type_1', value: "1" },
          { labelKey: 'hc.http_auth_type_2', value: "2" },
          { labelKey: 'hc.http_auth_type_3', value: "3" }
        ] }
      ],
      queryFields2: [
        { name: 'formName', label: '', labelKey: 'form.form_name', value: '', type: 'input', display: true, order: 1 },
        { name: 'actionName', label: '', labelKey: 'hc.http_action_name', value: '', type: 'input', display: true, order: 2 },
      ],
    }
  },
  computed: {
    computedTreeHeight(){
      return this.maxTreeHeight;
    },
    computedTableHeight(){
      return this.maxTableHeight;
    }
  },
  mounted() {
    this.initMaxHeight();
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
    //加载分类
    this.getClassList()
    //加载数据
    this.getDataList()
    //注册到全局以便子窗口调用
    window.getDataList = this.getDataList
  },
  beforeDestroy(){
    window.removeEventListener('resize', this.throttleFunc);
  },
  watch: {
    filterText(val) {
      //除去搜索条件前后空格内容
      this.filterText = this.filterText.trim();
      val = val.trim();
      this.$refs.classTree.filter(val)
    },
  },
  methods: {
    // 加载中
    setLoading() {
      return this.$loading({
        target: 'el-main',
        lock: true,
        text: '加载中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    },
    // 计算列表高度
    initMaxHeight(){
      calcHeight(this);
    },
    // 加载分类
    getClassList() {
      let _this = this
      const loading = _this.setLoading()
      _this.filterText = ''
      api.getClassAPI().then(res => {
        if(res.code === '0') {
          _this.classTreeList = res.data
          loading.close();
        } else {
          loading.close();
          _this.$message({type: 'error', message: res.msg})
        }
      }).catch((err)=>{
        loading.close()
        _this.$message({type: 'error', message: err.msg})
      })
    },
    // 过滤设置
    classFilter(value, data) {
      if (!value) return true
      return data.className.indexOf(value) !== -1
    },
    // 分类折叠
    classToggle(){
      this.isTreeCollapse = !this.isTreeCollapse;
    },
    // 点击列表
    classClick(data) {
      let _this = this
      _this.classId = data.classId
      _this.getDataList()
      _this.initMaxHeight()
    },
    // 处理节点字段过长
    ellipsis(value,len) {
      if(!value){
        return ''
      }
      if(value.length > len) {
        return value.slice(0,len) + "…"
      }
      return value
    },
    // 分类新增
    classAdd() {
      this.edit.classId = ''
      this.edit.className = ''
      this.editVisible = true
    },
    // 分类编辑
    classEdit() {
      if (!this.classId) {
        this.$message({type: 'error', message: this.$t('hc.http_class_select')})
        return
      }
      let classid = this.classId
      let item = this.classTreeList.find((item)=>{
        return item.classId == classid
      })
      this.edit.classId = item.classId
      this.edit.className = item.className
      this.editVisible = true
    },
    // 分类删除
    classDelete() {
      let _this = this
      if (!_this.classId) {
        _this.$message({type: 'error', message: _this.$t('hc.http_class_select')})
        return
      }
      _this.$confirm(_this.$t('cm.is_delete'), _this.$t('cm.tips'), {
        type: 'warning'
      }).then(()=>{
        let params = {
          classId: _this.classId
        }
        const loading = _this.setLoading()
        api.delClassAPI(params).then((res)=>{
          loading.close()
          if (res.code === '0') {
            this.classId = ''
            this.getClassList()
            _this.$message({type: 'success', message: _this.$t('cm.operator_success')})
          } else {
            _this.$message({type: 'error', message: res.msg})
          }
        }).catch((err)=>{
          loading.close()
          _this.$message({type: 'error', message: err.msg})
        })
      }).catch(()=>{
        //
      })
    },
    // 分类保存
    classSave() {
      let _this = this
      _this.$refs['editForm'].validate((valid) => {
        if (valid) {
          let params = {
            classId: _this.edit.classId,
            className: _this.edit.className
          }
          //console.log(params)
          const loading = _this.setLoading()
          api.setClassAPI(params).then((res)=>{
            loading.close()
            if (res.code === '0') {
              _this.edit.classId = ''
              _this.edit.className = ''
              _this.editVisible = false
              _this.classid = ''
              _this.$message({type: 'success', message: _this.$t('cm.operator_success')})
            } else {
              _this.$message({type: 'error', message: res.msg})
            }
            _this.getClassList()
          }).catch((err)=>{
            loading.close()
            _this.$message({type: 'error', message: err.msg})
          })
        }
      })
    },
    //修改分类
    classMove() {
      let _this = this
      if (_this.dataSelect.length < 1) {
        _this.$message({type: 'error', message: _this.$t('cm.pleaseSelect')})
        return
      }
      _this.moveVisible = true
    },
    //修改分类保存
    classMoveSubmit() {
      let _this = this
      if (!_this.classMoveId) {
        _this.$message({type: 'error', message: _this.$t('hc.http_class_select')})
        return
      }
      if (_this.dataSelect.length < 1) {
        _this.$message({type: 'error', message: _this.$t('cm.pleaseSelect')})
        return
      }
      let list = []
      _this.dataSelect.forEach((item) => {
        list.push(item.connectorId)
      })
      const loading = _this.setLoading()
      let params = {
        classId: _this.classMoveId,
        connectorIdList: list
      }
      api.moveClassAPI(params).then((res)=>{
        loading.close()
        if (res.code === '0') {
          _this.classMoveId = ''
          _this.moveVisible = false
          _this.multSelect = false
          _this.getDataList()
          _this.$message({type: 'success', message: _this.$t('cm.operator_success')})
        } else {
          _this.$message({type: 'error', message: res.msg})
        }
      }).catch((err)=> {
        loading.close()
        _this.$message({type: 'error', message: err.msg})
      })
    },
    //多选
    selectChange(val) {
      this.dataSelect = val
    },
    // 加载数据列表
    getDataList() {
      let _this = this
      let params = {
        classId: this.classId,
        pageNumber: this.pageNumber,
        pageSize: this.pageSize
      }
      const loading = _this.setLoading()
      _this.filterText = ''
      api.getListAPI(params).then(res => {
        //console.log(res.data)
        if(res.code === '0') {
          loading.close();
          _this.dataList = res.data.records
          _this.pageTotal = res.data.total
        } else {
          loading.close();
          _this.$message({type: 'error', message: res.msg})
        }
      }).catch((err)=>{
        loading.close()
        _this.$message({type: 'error', message: err.msg})
      })
    },
    // 数据搜索
    dataSearch(){
      let _this = this;
      let queryForm = this.$refs.queryForm.getQueryForm();
      let params = {
        classId: _this.classId,
        connectorName: queryForm.searchName,
        authType: queryForm.searchType,
        domain: queryForm.searchDomain,
        pageNumber: _this.pageNumber,
        pageSize: _this.pageSize
      }
      const loading = _this.setLoading()
      api.getSearchAPI(params).then(res => {
        loading.close();
        if(res.code === '0') {
          _this.dataList = res.data.records
          _this.pageTotal = res.data.total
        } else {
          _this.$message({type: 'error', message: res.msg})
        }
      }).catch((err)=>{
        loading.close()
        _this.$message({type: 'error', message: err.msg})
      })
    },
    // 重置查询
    dataReset(){
      this.searchName = ''
      this.searchDomain = ''
      this.searchType = ''
    },
    // 数据新增
    dataAdd() {
      if (!this.classId) {
        this.$message({type: 'error', message: this.$t('hc.http_class_select')})
        return
      }
      //打开页签
      this.openTab({
        path: "/httpConnector/edit",
        query: {
          classId: this.classId
        }
      });
    },
    // 数据编辑
    dataEdit(id) {
      //打开页签
      this.openTab({
        path: "/httpConnector/edit",
        query: {
          connectorId: id
        }
      });
    },
    // 数据删除
    dataDelete(id) {
      let _this = this
      _this.$confirm(_this.$t('cm.is_delete'), _this.$t('cm.tips'), {
        type: 'warning'
      }).then(() => {
        let params = {
          connectorId: id
        }
        const loading = _this.setLoading()
        api.delDetailAPI(params).then((res)=>{
          loading.close()
          if (res.code === '0') {
            _this.getDataList()
            _this.$message({type: 'success', message: _this.$t('cm.operator_success')})
          } else {
            _this.$message({type: 'warning', message: res.msg})
          }
        }).catch((err)=> {
          loading.close()
          _this.$message({type: 'error', message: err.msg})
        })
      }).catch(() => {

      })
    },
    //导入
    dataImport(file) {
      let formData = new FormData()
      formData.append('file', file.file)

      let _this = this
      const loading = _this.setLoading()
      api.importAPI(formData).then((res)=>{
        loading.close()
        if (res.code === '0') {
          _this.$message({type: 'success', message: _this.$t('cm.operator_success')})
          _this.classId = ''
          _this.$refs.classTree.setCurrentKey()
          _this.getDataList()
        } else {
          _this.$message({type: 'error', message: res.msg})
        }
      }).catch((err)=> {
        loading.close()
        _this.$message({type: 'error', message: err.msg})
      })
    },
    //导出
    dataExport() {
      let _this = this
      const loading = _this.setLoading()
      let params = {'responseType': 'blob'}
      api.exportAPI(params).then((res)=>{
        loading.close();
        let filename = '连接器.xls';
        if (window.navigator.msSaveBlob) {
          //IE浏览器
          window.navigator.msSaveOrOpenBlob(res, filename);
        } else {
          //标准浏览器
          let a = document.createElement("a");
          let url = window.URL.createObjectURL(
            new Blob([res], {
              type: ""
            })
          );
          a.href = url;
          a.download = filename;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      }).catch((err)=> {
        loading.close()
        _this.$message({type: 'error', message: err.msg})
      })
    },
    // 改变每页显示数
    pageSizeChange(size){
      let _this = this;
      _this.pageNumber = 1
      _this.pageSize = size
      _this.getDataList()
    },
    // 翻页
    pageNumberChange(current){
      let _this = this;
      _this.pageNumber = current
      _this.getDataList()
    },
    //更多
    moreCommand(command, row) {
      switch(command) {
        case 'relation':
          this.showRelation(row.connectorId, row.connectorName)
        break
        case 'log':
          this.$router.push(`/connectorLog?classId=${row.classId}&connectorId=${row.connectorId}`)
        break
      }
    },
    //引用详情
    showRelation(id, name) {
      this.relationVisible = true
      this.relationTitle = name
      this.relationId = id
      this.relationSearchParam = {
        formName: '',
        actionName: ''
      }
      this.getRelationList()
    },
    //获取引用列表
    getRelationList() {
      let _this = this
      _this.relationData = []
      let id = _this.relationId
      let params = {
        connectorId: id,
        pageNumber: _this.relationCurrent,
        pageSize: _this.relationSize,
      }
      //筛选条件
      if (this.relationSearchParam.formName) {
        params.formName = this.relationSearchParam.formName
      }
      if (this.relationSearchParam.actionName) {
        params.requestName = this.relationSearchParam.actionName
      }
      _this.relationLoading = true
      api.getRelationAPI(params).then((res)=>{
        _this.relationLoading = false
        if (res.code === '0') {
          _this.relationData = res.data.records
          _this.relationCurrent = res.data.current ? res.data.current : 1
          _this.relationSize = res.data.size ? res.data.size : 10
          _this.relationTotal = res.data.total ? res.data.total : 0
        } else {
          _this.$message({type: 'error', message: res.msg})
        }
      }).catch((err)=> {
        _this.relationLoading = false
        _this.$message({type: 'error', message: err.msg})
      })
    },
    //删除引用
    relationDelete(id) {
      let _this = this
      _this.$confirm(_this.$t('cm.is_delete'), _this.$t('cm.tips'), {
        type: 'warning'
      }).then(()=>{
        let params = {
          formId: id
        }
        const loading = _this.setLoading()
        api.delRelationAPI(params).then((res)=>{
          loading.close()
          if (res.code === '0') {
            _this.$message({type: 'success', message: _this.$t('cm.operator_success')})
          } else {
            _this.$message({type: 'error', message: res.msg})
          }
        }).catch((err)=> {
          loading.close()
          _this.$message({type: 'error', message: err.msg})
        })
      })
    },
    //引用每页条数
    relationChangeSize(pageDetailsSize) {
      this.relationSize = pageDetailsSize
      this.getRelationList()
    },
    //引用每页翻页
    relationChangeCurrent(pageDetailsCurrent) {
      this.relationCurrent = pageDetailsCurrent
      this.getRelationList()
    },
    //引用搜索
    relationSearch: function() {
      let queryForm = this.$refs.queryForm2.getQueryForm();
      this.relationSearchParam.formName = queryForm.formName;
      this.relationSearchParam.actionName = queryForm.actionName;
      this.getRelationList()
    },
    //引用搜索重置
    relationReset: function() {
      this.relationSearchParam.formName = ''
      this.relationSearchParam.actionName = ''
    },
  },
}

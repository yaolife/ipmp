import api from '../api'
import { Filters } from '@/assets/js/Utils';
import { throttle } from '@/utils/funcUtil'
import { calcHeight } from "@/utils/funcUtil";
import { throttle } from '../../../../utils/funcUtil';

export default {
  components: {
  },
  data: function () {
    return {
      selectnum: '0',
      hasIcon: false,
      isSelected: [],
      is_collapse: false,
      tableData: [],
      accTableData: [],
      objData: {
        id: ''
      },

      model: {
        interfaceId: '',
        interfaceType: '',
        businessClass: '',
        callDirection: '',
        enableFlag: '',
      },

      accountModel: {
        accountId: '',
        systemType: ''
      },

      delModel: {
        ids: ''
      },
      advSearch: 'tm.advance_search',

      flowVO: {
        id: '',
        interfaceId: '',
        interfaceType: '',
        businessClass: '',
        callDirection: '',
        interfaceContent: '',
        interfaceAddress: '',
        paramContent: '',
        returnContent: '',
        asynchronousFlag: 1,
        enableFlag: '',
        callBackInterfaceId: '',
        callBackInterfaceType: '',
        callBackBusinessClass: '',
        callBackCallDirection: '',
        callBackInterfaceContent: '',
        callBackInterfaceAddress: '',
        callBackParamContent: '',
        callBackReturnContent: '',
        accountId: '',
        enableFlagValue: false,
        saveAction: '',
      },

      currentPage: 1,
      current: 1,
      pageSize: 10,
      size: 10,
      total: 0,
      multipleSelection: [],
      show: false,
      loading: false,
      interfaceTypes: [
        { label: '中台', value: 1 },
        { label: 'HTTP', value: 2 },
        { label: 'webService', value: 3 }
      ],
      callDirections: [
        { label: 'CUD', value: 1 },
        { label: 'SAP', value: 2 },
        { label: '中台', value: 3 }
      ],

      asynchronousFlags: [
        { label: '同步', value: 1 },
        { label: '异步', value: 2 }
      ],
      accountStatuss: [
        { label: '启用', value: 1 },
        { label: '停用', value: 2 }
      ],
      systemTypes: [
        { label: 'EDM', value: 1 },
        { label: 'SAP', value: 2 }
      ],
      inputType: "password",
      eyeType: "eye",
      inputType1: "password",
      eyeType1: "eye",
      configflowDialogVisible: false,
      itemRules: {
        interfaceId: [
          { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' },
          { min: 1, max: 256, message: this.$t('sys.length_32'), trigger: 'blur' },
          { validator: this.validateDictCode, trigger: 'blur' }
        ],
        interfaceAddress: [
          { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' },
          { min: 1, max: 256, message: this.$t('sys.length_32'), trigger: 'blur' },
          { validator: this.validateDictCode, trigger: 'blur' }
        ],

        interfaceType: [
          { required: true, message: this.$t('sys.param_category_required'), trigger: 'change' }
        ],
        callDirection: [
          { required: true, message: this.$t('sys.param_category_required'), trigger: 'change' }
        ],

        callBackInterfaceId: [
          { validator: this.validateDictCode, trigger: 'blur' }
        ],
        callBackInterfaceAddress: [
          { validator: this.validateDictCode, trigger: 'blur' }
        ],

      },
      fullscreenLoading: false,
      addMainEntityVisible: false,
      tableRadio: '',
      values: true,
      mulSelect: [],
      maxTableHeight: 0,
    }
  },

  methods: {
    // 动态计算高度
    initMaxHeight() {
      calcHeight(this);
    },
    validateDictCode(rule, value, callback) {
      const reg = /^[a-zA-Z0-9\_\.]+$/g
      if (reg.test(value)) {
        callback()
      } else {
        callback(new Error(this.$t('sys.code_valid')))
      }
    },
    advanceSearch: function () {
      if (this.advSearch == "sys.advance_search") {
        this.model.interfaceId = ''
        this.advSearch = "sys.return";
      } else {
        this.model.interfaceId = ''
        this.advSearch = "sys.advance_search";
      }
      let timer = setTimeout(() => {
        this.initMaxHeight();
        clearTimeout(timer)
      }, 335)
    },
    //查看接口详情
    viewWorkFlowRule: function (param) {
      let _this = this
      _this.flowVO.interfaceId = param.interfaceId
      _this.flowVO.businessClass = param.businessClass
      _this.flowVO.interfaceType = param.interfaceType
      _this.flowVO.interfaceAddress = param.interfaceAddress
      _this.flowVO.callDirection = param.callDirection
      _this.flowVO.interfaceContent = param.interfaceContent
      _this.flowVO.paramContent = param.paramContent
      _this.flowVO.returnContent = param.returnContent
      _this.flowVO.asynchronousFlag = param.asynchronousFlag
      _this.flowVO.enableFlag = param.enableFlag
      _this.flowVO.callBackInterfaceId = param.callBackInterfaceId
      _this.flowVO.callBackInterfaceType = param.callBackInterfaceType
      _this.flowVO.callBackBusinessClass = param.callBackBusinessClass
      _this.flowVO.callBackInterfaceContent = param.callBackInterfaceContent
      _this.flowVO.callBackCallDirection = param.callBackCallDirection
      _this.flowVO.callBackInterfaceAddress = param.callBackInterfaceAddress
      _this.flowVO.callBackParamContent = param.callBackParamContent
      _this.flowVO.callBackReturnContent = param.callBackReturnContent
      _this.flowVO.saveAction = 'view',
        _this.configflowDialogVisible = true
    },

    asynchronousChange() {
      let _this = this
      _this.flowVO.callBackInterfaceId = ""
      _this.flowVO.callBackInterfaceType = ""
      _this.flowVO.callBackBusinessClass = ""
      _this.flowVO.callBackInterfaceContent = ""
      _this.flowVO.callBackCallDirection = ""
      _this.flowVO.callBackInterfaceAddress = ""
      _this.flowVO.callBackParamContent = ""
      _this.flowVO.callBackReturnContent = ""
    },
    //追加小画面
    addInterface() {
      this.configflowDialogVisible = true
      this.flowVO.saveAction = 'add';
    },
    // 更新小画面
    editClick(param) {
      this.configflowDialogVisible = true
      this.flowVO.saveAction = 'update';
      this.flowVO.id = param.id
      this.flowVO.interfaceId = param.interfaceId
      this.flowVO.businessClass = param.businessClass
      this.flowVO.interfaceType = param.interfaceType
      this.flowVO.interfaceAddress = param.interfaceAddress
      this.flowVO.callDirection = param.callDirection
      this.flowVO.interfaceContent = param.interfaceContent
      this.flowVO.paramContent = param.paramContent
      this.flowVO.returnContent = param.returnContent
      this.flowVO.asynchronousFlag = param.asynchronousFlag
      this.flowVO.enableFlag = param.enableFlag
      this.flowVO.callBackInterfaceId = param.callBackInterfaceId
      this.flowVO.callBackInterfaceType = param.callBackInterfaceType
      this.flowVO.callBackBusinessClass = param.callBackBusinessClass
      this.flowVO.callBackInterfaceContent = param.callBackInterfaceContent
      this.flowVO.callBackCallDirection = param.callBackCallDirection
      this.flowVO.callBackInterfaceAddress = param.callBackInterfaceAddress
      this.flowVO.callBackParamContent = param.callBackParamContent
      this.flowVO.callBackReturnContent = param.callBackReturnContent
      if (param.enableFlag === 1) {
        this.flowVO.enableFlagValue = true
      } else {
        this.flowVO.enableFlagValue = false
      }

    },

    //选中主实体提交
    saveAddAccount: function () {
      let _this = this
      if (_this.tableRadio == '') {
        this.$alert(this.$t('cm.pselect') + " " + this.$t('sys.add_account'), this.$t('cm.tips'));
      } else {
        _this.tableRadio.entityRelation = 0;
        _this.entityData = [];
        _this.entityData.push(_this.tableRadio);
        _this.addMainEntityVisible = false;
        _this.addMainEntityDisabled = true;
        _this.mainEntityName = _this.tableRadio.showEntityName + "-" + this.$t('dm.main_entity');
        _this.masterFieldOptions = [];//关联设置中的主实体下拉框重新赋值
        for (let j = 0; j < _this.tableRadio.children.length; j++) {
          if (_this.tableRadio.children[j].dbFieldId != '') {
            _this.masterFieldOptions.push(_this.tableRadio.children[j]);
          }
        }
      }
    },

    //用于全选操作
    selectChange: function (val) {
      this.mulSelect = val
      this.selectnum = val.length
    },

    //高级搜索
    commonSearch: function () {
      let _this = this;
      _this.model.businessClass = '';
      _this.model.callDirection = '';
      _this.model.interfaceType = '';
      _this.model.asynchronousFlag = '';

      let params = {
        current: 1,
        size: _this.size,
      }

      params = Object.assign(params, _this.model);
      // procTitle
      this.getFlowList(params);
    },

    //高级搜索
    search: function () {
      let _this = this;
      _this.model.interfaceId = '';
      let params = {
        current: 1,
        size: _this.size,
      }
      params = Object.assign(params, _this.model);
      // procTitle
      this.getFlowList(params);
    },


    //关闭小页面
    configFlowDialogHandleClose() {
      this.$refs['itemForm'].resetFields()
      this.clearflowVO()
      this.configflowDialogVisible = false
    },


    // 更多菜单事件
    moreCommandHandler(command) {
      let param = command.param
      switch (command.optFlag) {
        case 'interInface_start': this.saveStartClick(param); break;
        case 'account_setting': this.saveStartClick(param); break;
        default: break;
      }

    },
    beforeMoreCommandHandler(optFlag, param) {
      return {
        'optFlag': optFlag,
        'param': param
      }
    },
    //清空流程项目
    clearflowVO() {
      this.flowVO.id = ''
      this.flowVO.interfaceId = ''
      this.flowVO.interfaceType = ''
      this.flowVO.businessClass = ''
      this.flowVO.callDirection = ''
      this.flowVO.interfaceContent = ''
      this.flowVO.interfaceAddress = ''
      this.flowVO.paramContent = ''
      this.flowVO.returnContent = ''
      this.flowVO.asynchronousFlag = 1,
        this.flowVO.enableFlag = ''
      this.flowVO.callBackInterfaceId = ''
      this.flowVO.callBackInterfaceType = ''
      this.flowVO.callBackBusinessClass = ''
      this.flowVO.callBackCallDirection = ''
      this.flowVO.callBackInterfaceContent = ''
      this.flowVO.callBackInterfaceAddress = ''
      this.flowVO.callBackParamContent = ''
      this.flowVO.callBackReturnContent = ''
      this.flowVO.accountId = ''
      this.flowVO.enableFlagValue = false,
        this.flowVO.saveAction = ''
      this.$nextTick(() => {
        this.$refs.itemForm.resetFields()
      })

    },
    changeType: function () {
      this.inputType = this.inputType === 'password' ? 'text' : 'password';
      this.eyeType = this.eyeType === 'password' ? 'eye' : 'eye-open';
    },
    changeType1: function () {
      this.inputType1 = this.inputType1 === 'password' ? 'text' : 'password';
      this.eyeType1 = this.eyeType1 === 'password' ? 'eye' : 'eye-open';
    },
    //改变每页显示数
    handleSizeChange: function (size) {
      let params = {
        current: 1,
        size: size
      }
      this.size = size
      this.current = 1
      //params = Object.assign(params,this.searchParams);
      this.getFlowList(params);
    },

    //翻页
    handleCurrentChange: function (current) {
      let params = {
        current: current,
        size: this.size
      }
      this.current = current
      this.getFlowList(params);
    },

    // 流程的新增和编辑
    saveStartClick(row) {
      let _this = this
      let confirm = row.enableFlag === 2 ? _this.$t('sys.start_msg') : _this.$t('sys.off_msg')
      _this.$confirm(confirm, _this.$t('cm.tips'), {
        confirmButtonText: _this.$t('cm.confirm'),
        cancelButtonText: _this.$t('cm.cancel'),
        type: 'warning',
        cancelButtonClass: 'btn-second',
        confirmButtonClass: 'btn-default',
      }).then(() => {

        _this.flowVO.id = row.id
        _this.flowVO.interfaceId = row.interfaceId
        _this.flowVO.businessClass = row.businessClass
        _this.flowVO.interfaceType = row.interfaceType
        _this.flowVO.interfaceAddress = row.interfaceAddress
        _this.flowVO.callDirection = row.callDirection
        _this.flowVO.interfaceContent = row.interfaceContent
        _this.flowVO.paramContent = row.paramContent
        _this.flowVO.returnContent = row.returnContent
        _this.flowVO.asynchronousFlag = row.asynchronousFlag
        _this.flowVO.callBackInterfaceId = row.callBackInterfaceId
        _this.flowVO.callBackInterfaceType = row.callBackInterfaceType
        _this.flowVO.callBackBusinessClass = row.callBackBusinessClass
        _this.flowVO.callBackInterfaceContent = row.callBackInterfaceContent
        _this.flowVO.callBackCallDirection = row.callBackCallDirection
        _this.flowVO.callBackInterfaceAddress = row.callBackInterfaceAddress
        _this.flowVO.callBackParamContent = row.callBackParamContent
        _this.flowVO.callBackReturnContent = row.callBackReturnContent
        if (row.enableFlag === 1) {
          _this.flowVO.enableFlag = 2
        } else {
          _this.flowVO.enableFlag = 1
        }

        let param = _this.flowVO
        api.updateAPI(param).then(res => {
          if (res.code === '0') {
            _this.$message({ type: 'success', message: _this.$t('cm.update_succ') })
            let params = {
              current: 1,
              size: _this.size,
            }
            _this.getFlowList(params);
          } else {
            _this.$message({ type: 'error', message: res.msg })
          }
        })
      }).catch(() => {
        _this.$message({
          type: 'info',
          message: _this.$t('cm.update_cancel')
        })
      })
    },

    // 流程的新增和编辑
    saveFlowClick() {
      let _this = this
      _this.$refs['itemForm'].validate((valid) => {
        if (valid) {
          let confirm = _this.flowVO.saveAction === 'update' ? _this.$t('cm.is_update') : _this.$t('cm.is_save')
          _this.$confirm(confirm, _this.$t('cm.tips'), {
            confirmButtonText: _this.$t('cm.confirm'),
            cancelButtonText: _this.$t('cm.cancel'),
            type: 'warning',
            cancelButtonClass: 'btn-second',
            confirmButtonClass: 'btn-default',
          }).then(() => {
            if (_this.flowVO.enableFlagValue === true) {
              _this.flowVO.enableFlag = 1
            } else {
              _this.flowVO.enableFlag = 2
            }
            let param = _this.flowVO
            if (_this.flowVO.saveAction === 'update') {
              api.updateAPI(param).then(res => {
                if (res.code === '0') {
                  _this.$message({ type: 'success', message: _this.$t('cm.update_succ') })
                  _this.configFlowDialogHandleClose()
                  let params = {
                    current: 1,
                    size: _this.size,
                  }
                  _this.getFlowList(params);
                } else {
                  _this.$message({ type: 'error', message: res.msg })
                }
              })
            } else {
              api.saveAPI(param).then(res => {
                if (res.code === '0') {
                  _this.$message({ type: 'success', message: _this.$t('cm.savesuccess') })
                  _this.configFlowDialogHandleClose()
                  let params = {
                    current: 1,
                    size: _this.size,
                  }
                  _this.getFlowList(params);
                } else {
                  _this.$message({ type: 'error', message: res.msg })
                }
              })
            }
          }).catch(() => {
            let message = _this.saveAction === 'update' ? _this.$t('cm.update_cancel') : _this.$t('cm.save_cancel')
            _this.$message({
              type: 'info',
              message: message
            })
          })
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },

    delClick(row) {
      let _this = this;
      _this.$confirm(_this.$t('cm.is_delete'), _this.$t('cm.tips'), {
        type: 'warning',
        confirmButtonText: _this.$t('cm.confirm'),
        cancelButtonText: _this.$t('cm.cancel'),
        cancelButtonClass: 'btn-second',
        confirmButtonClass: 'btn-default',
      }).then(() => {
        let params = {};
        _this.delModel.ids = row.id;
        params = Object.assign(params, _this.delModel);
        api.deleteAPI(params).then((result) => {
          //console.log(result);
          if (result.code == "0") {
            let params = {
              current: 1,
              size: this.size,
            }
            _this.$message({
              message: result.msg,
              type: 'success'
            })
            _this.resetData();
            _this.getFlowList(params);

          } else {
            _this.$message({
              message: result.msg,
              type: 'warning'
            })
          }
        }).catch((err) => {
          _this.$message({
            message: err,
            type: 'warning'
          })
        });
      }).catch(() => {
        //取消操作
      });
    },


    handleSelectionChange: function (val) {
      this.multipleSelection = val;
      this.selectnum = val.length
    },


    //重置操作
    resetData: function () {
      this.model.interfaceId = '';
      this.model.interfaceType = '';
      this.model.businessClass = '';
      this.model.callDirection = '';
      this.model.enableFlag = '';
    },


    //获取列表
    getFlowList: function (params) {
      this.loading = true

      if (!params) {
        params = {
          current: this.current,
          size: this.size
        }
      }
      let _this = this;
      params = Object.assign(params, _this.model);
      api.pageListAPI(params).then(res => {
        this.loading = false
        if (res.code === '0') {
          _this.tableData = res.records
          _this.total = res.total
          _this.loading = false
        }
      })
    },

    //获取列表
    getAccountList: function () {
      this.values = false;
      this.loading = true
      let _this = this;
      let params = _this.accountModel
      api.pageAccountListAPI(params).then(res => {
        if (res.code === '0') {
          _this.accTableData = res.data
          _this.loading = false
        }
      })
    },

    //添加主实体
    addAccount: function (row) {
      this.resetDataAcc();
      this.addMainEntityVisible = true;
      this.flowVO.id = row.id
      this.flowVO.interfaceId = row.interfaceId
      this.flowVO.businessClass = row.businessClass
      this.flowVO.interfaceType = row.interfaceType
      this.flowVO.interfaceAddress = row.interfaceAddress
      this.flowVO.callDirection = row.callDirection
      this.flowVO.interfaceContent = row.interfaceContent
      this.flowVO.paramContent = row.paramContent
      this.flowVO.returnContent = row.returnContent
      this.flowVO.asynchronousFlag = row.asynchronousFlag
      this.flowVO.callBackInterfaceId = row.callBackInterfaceId
      this.flowVO.callBackInterfaceType = row.callBackInterfaceType
      this.flowVO.callBackBusinessClass = row.callBackBusinessClass
      this.flowVO.callBackInterfaceContent = row.callBackInterfaceContent
      this.flowVO.callBackCallDirection = row.callBackCallDirection
      this.flowVO.callBackInterfaceAddress = row.callBackInterfaceAddress
      this.flowVO.callBackParamContent = row.callBackParamContent
      this.flowVO.callBackReturnContent = row.callBackReturnContent
      this.flowVO.enableFlag = row.enableFlag

      this.getAccountList();
    },

    //重置数据
    resetDataAcc: function () {
      this.accountModel.accountId = '';
      this.accountModel.systemType = '';
    },

    //列表显示映射
    getSystemTypes(businessType) {
      let label = '';
      this.systemTypes.forEach((item) => {
        if (item.value == businessType) {
          label = item.label
        }
      })
      return label
    },

    //账户搜索
    searchAcc: function () {
      this.getAccountList();
    },
    accountIdUpdate() {
      let _this = this
      let objs = ""
      if (_this.mulSelect.length > 0) {
        for (let i = 0; i < _this.mulSelect.length; i++) {
          if (i === 0) {
            objs = _this.mulSelect[i].accountId
          } else {
            objs = objs + ',' + this.mulSelect[i].accountId
          }
        }
        let confirm = _this.$t('sys.account_setting')
        _this.$confirm(confirm, _this.$t('cm.tips'), {
          confirmButtonText: _this.$t('cm.confirm'),
          cancelButtonText: _this.$t('cm.cancel'),
          type: 'warning',
          cancelButtonClass: 'btn-second',
          confirmButtonClass: 'btn-default',
        }).then(() => {
          _this.flowVO.accountId = objs
          let param = _this.flowVO;
          api.updateAPI(param).then(res => {
            if (res.code === '0') {
              _this.$message({ type: 'success', message: _this.$t('cm.update_succ') })
              let params = {
                current: 1,
                size: _this.size,
              }
              _this.getFlowList(params);
              _this.addMainEntityVisible = false
            } else {
              _this.$message({ type: 'error', message: res.msg })
            }
          })
        }).catch(() => {
          _this.$message({
            type: 'info',
            message: _this.$t('cm.update_cancel')
          })
        })
      }
    },
  },

  mounted() {
    let params = {
      current: 1,
      size: 10,
    }
    this.getFlowList(params);
    this.initMaxHeight();
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
  },
  computed: {
    getInterfaceTypes() {
      return (bdType) => {
        let item = this.interfaceTypes.find(p => p.value === bdType)
        if (item) {
          return item.label
        }
      }
    },
    getCallDirections() {
      return (bdType) => {
        let item = this.callDirections.find(p => p.value === bdType)
        if (item) {
          return item.label
        }
      }
    },
    getAsynchronousFlags() {
      return (bdType) => {
        let item = this.asynchronousFlags.find(p => p.value === bdType)
        if (item) {
          return item.label
        }
      }
    },
    getAccountStatuss() {
      return (bdType) => {
        let item = this.accountStatuss.find(p => p.value === bdType)
        if (item) {
          return item.label
        }
      }
    },
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.throttleFunc);
  },
}

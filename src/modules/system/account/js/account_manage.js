import api from '../api'
import {Filters} from '@/assets/js/Utils';
import {throttle} from '@/utils/funcUtil'
import { calcHeight } from "@/utils/funcUtil";

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
      objData: {
        id: ''
      },

      model: {
        accountId: '',
        systemType: '',
      },

      delModel: {
        ids: ''
      },

      flowVO: {
        id: '',
        accountId: '',
        accountPw: '',
        systemType: '',
        accountPw1: '',
        accountContent: '',
        accountStatus: '',
        accountStatusValue: false,
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
      systemTypes: [
        {label:'EDM', value:1},
        {label:'SAP', value:2}
      ],
      accountStatuss: [
        {label:'启用', value:1},
        {label:'停用', value:2}
      ],
      inputType:"password",
      eyeType:"eye",
      inputType1:"password",
      eyeType1:"eye",
      configflowDialogVisible: false,
      itemRules: {
        accountId: [
          { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' },
          { min: 1, max: 64, message: this.$t('sys.length_32'), trigger: 'blur' },
          { validator: this.validateDictCode, trigger: 'blur' }
        ],
        accountPw: [
          { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' },
          { min: 1, max: 32, message: this.$t('sys.length_32'), trigger: 'blur' },
          { validator: this.validateDictCode, trigger: 'blur' }
        ],
        accountPw1: [
          { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' },
          { min: 1, max: 32, message: this.$t('sys.length_32'), trigger: 'blur' },
          { validator: this.validateDictCode, trigger: 'blur' }
        ],
        systemType: [
          {required: true, message: this.$t('sys.param_category_required'), trigger: 'change'}
        ],
      },
      fullscreenLoading: false,
      maxTableHeight: 0,
    }
  },

  methods: {
  // 动态计算高度
  initMaxHeight(){
    calcHeight(this);
  },
	validateDictCode(rule, value, callback) {
    const reg = /^[a-zA-Z0-9-\_]+$/g
    if(reg.test(value)) {
      callback()
    }else {
      callback(new Error(this.$t('sys.code_valid')))
    }
  },
    //追加小画面
	addAccount() {
	  this.configflowDialogVisible = true
	  this.flowVO.saveAction = 'add';
    },
    // 更新小画面
    editClick(row) {
	  this.configflowDialogVisible = true
	  this.flowVO.saveAction = 'update';
	  this.flowVO.id = row.id;
	  this.flowVO.accountId = row.accountId;
	  this.flowVO.accountPw = row.accountPw;
	  this.flowVO.systemType = row.systemType;
	  this.flowVO.accountPw1 = row.accountPw;
	  this.flowVO.accountContent = row.accountContent;
	  if (row.accountStatus === 1) {
		  this.flowVO.accountStatusValue = true
	  } else {
		  this.flowVO.accountStatusValue = false
	  }

    },
    //关闭小页面
    configFlowDialogHandleClose() {
      this.$refs['itemForm'].resetFields()
      this.clearflowVO()
      this.configflowDialogVisible = false

    },
    //清空流程项目
    clearflowVO() {
      this.flowVO.saveAction = ''
      this.flowVO.accountId = ''
      this.flowVO.accountPw = ''
      this.flowVO.accountPw1 = ''
      this.flowVO.systemType = ''
      this.flowVO.accountContent = ''
      this.flowVO.accountStatus = ''
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
      let confirm = row.accountStatus === '2'?_this.$t('sys.start_msg'):_this.$t('sys.off_msg')
      _this.$confirm(confirm, _this.$t('cm.tips'), {
        confirmButtonText: _this.$t('cm.confirm'),
        cancelButtonText: _this.$t('cm.cancel'),
        type: 'warning',
        cancelButtonClass: 'btn-second',
        confirmButtonClass: 'btn-default',
      }).then(() => {

		    _this.flowVO.id = row.id
		    _this.flowVO.accountContent = row.accountContent
		    _this.flowVO.accountId = row.accountId
	        _this.flowVO.accountPw = row.accountPw
	        _this.flowVO.systemType = row.systemType
		    if (row.accountStatus === 1) {
          _this.flowVO.accountStatus = 2
        } else {
          _this.flowVO.accountStatus = 1
        }
        let param = _this.flowVO
        api.updateAPI(param).then(res => {
          if(res.code === '0') {
            _this.$message({ type: 'success', message: _this.$t('cm.update_succ')})
            let params = {
              current: 1,
              size: _this.size,
            }
				    _this.getFlowList(params);
          }else {
            _this.$message({ type: 'error', message: res.msg})
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
          if (_this.flowVO.accountPw !== _this.flowVO.accountPw1) {
            _this.$alert(_this.$t('sys.field_valid_tip'), _this.$t('cm.warning'))
            return
          }
          let confirm = _this.flowVO.saveAction === 'update'?_this.$t('cm.is_update'):_this.$t('cm.is_save')
          _this.$confirm(confirm, _this.$t('cm.tips'), {
            confirmButtonText: _this.$t('cm.confirm'),
            cancelButtonText: _this.$t('cm.cancel'),
            type: 'warning',
            cancelButtonClass: 'btn-second',
            confirmButtonClass: 'btn-default',
          }).then(() => {
            if (_this.flowVO.accountStatusValue === true) {
              _this.flowVO.accountStatus = 1
            } else {
              _this.flowVO.accountStatus = 2
            }
            let param = _this.flowVO
            if(_this.flowVO.saveAction === 'update') {
              api.updateAPI(param).then(res => {
                if(res.code === '0') {
                  _this.$message({ type: 'success', message: _this.$t('cm.update_succ')})
                  _this.configFlowDialogHandleClose()
                  let params = {
                    current: 1,
                    size: _this.size,
                  }
                 _this.getFlowList(params);
                  }else {
                    _this.$message({ type: 'error', message: res.msg})
                  }
                })
              } else {
                api.saveAPI(param).then(res => {
                  if(res.code === '0') {
                    _this.$message({ type: 'success', message: _this.$t('cm.savesuccess')})
                    _this.configFlowDialogHandleClose()
                    let params = {
                      current: 1,
                      size: _this.size
                    }
                   _this.getFlowList(params);
                  }else {
                    _this.$message({ type: 'error', message: res.msg})
                  }

                })
              }

            }).catch(() => {
              let message = _this.saveAction === 'update'?_this.$t('cm.update_cancel'):_this.$t('cm.save_cancel')
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

    //普通搜索
    search: function () {
      let _this = this;
      let params = {
        current: 1,
        size: _this.size,
      }
      params = Object.assign(params, this.model);
      this.getFlowList(params);
    },
    //重置操作
    resetData: function () {
      this.model.accountId = '';
      this.model.systemType = '';
    },


    //获取列表
    getFlowList: function (params) {
      this.values = false
      this.loading = true
      if (!params) {
        params = {
          current: this.current,
          size: this.size
        }
      }
      let _this = this;
      params = Object.assign(params,_this.model);
      api.pageListAPI(params).then(res => {
        this.loading = false
        if (res.code === '0') {
          _this.tableData = res.records
          _this.total = res.total
        }
      })
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
  beforeDestroy(){
    window.removeEventListener('resize', this.throttleFunc);
  },

}

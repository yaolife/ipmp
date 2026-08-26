  import funManageApi from '../api/appApi'
  import Bus from '../../../../../src/bus'
  import breadcrumb from '@/components/common/breadcrumb'
  import { throttle } from "@/utils/funcUtil";
  import { calcHeight } from "@/utils/funcUtil";
  import queryForm from "@/components/common/queryForm";

  export default {
    name: 'functionManage',
    components: {
      breadcrumb,
      queryForm
    },
    data: function() {
      let colNameValidate = (rule, value, callback) => {
        let reg = /^[a-zA-Z0-9\u4e00-\u9fa5-\_]+$/g
        if (!value) {
          callback(new Error(this.$t('cm.tiprequired')))
        } else {
          if (!reg.test(value)) {
            callback(new Error(this.$t('dataAuth.name_valid')))
          } else {
            callback()
          }
        }
      };
      let colUrlValidate = (rule, value, callback) => {
        let reg = /^[\-_a-zA-Z0-9-/]+$/
        if (!value) {
          callback(new Error(this.$t('auto.tiprequired')))
        } else {
          if (!reg.test(value)) {
            callback(new Error(this.$t('dataAuth.url_valid')))
          } else {
            callback()
          }
        }
      };
      return {
        brand: [
          { name: 'dataAuth.auth_manage' },
          { name: 'dataAuth.functionmanage' }
        ],
        fullscreenLoading: false,
        hasIcon: false,
        // 树
        options: {
          children: 'children',
          label: 'name'
        },
        funcTreeData: [],
        treeExpandedKeys: [],
        currentNodeKey: '',
        menuTypeIsShow: true, // 菜单类型是否显示，true：显示 false：隐藏
        selected: '',
        addCount: 0,
        addType: false,
        dataById: null,
        //编辑弹框
        showDialog: false,
        // 表单
        functionModel: {
          functionId: '',
          functionName: '',
          functionDesc: '',
          functionUrl: '',
          iconClass: '',
          functionDataTable: '',
          functionCode: '',
          displaySeq: 1,
          functionType: '0',
          isAuthReq: '1',
          logFlag: '0',
          state: '1',
          parentName: '',
          universalFunc: [],
          supFuncId: '',
          menuType: '0', // 菜单类型是PC端还是移动端
          //functionNameField1:'',
        },
        operator: '',
        iconData: [],
        ruleValidate: {
          functionName: [
            { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' },
            { required: true, validator: colNameValidate, trigger: "blur" }
          ],
          functionCode: [
            { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' }
          ],
          functionType: [
            { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' }
          ],
          state: [
            { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' },
          ]
        },
        appList: this.getAppList(),
        appModel: {
          appId: ''
        },
        showFunc: false,
        treeDatas: [],

        //复制应用
        showCopyFunc: false,
        copyFromAppId: '',  //来源应用id
        copyFromAppName: '',  //来源应用id
        copyToAppId: '',    //目标应用id
        copyToAppName: '',  //目标应用名称
        maxTreeHeight: 0,
        maxTableHeight: 0,
        //搜索字段
        queryFields: [
          { name: 'functionName', label: '', labelKey: 'dataAuth.functionname', value: '', type: 'input', display: true, order: 1 },
          { name: 'functionState', label: '', labelKey: 'dataAuth.functionstatus', value: '', type: 'select', display: true, order: 2, fieldMap: [
            { label: '可用', value: 1 },
            { label: '不可用', value: 0 },
          ] },
        ],
      }
    },
    computed: {
      //
    },
    watch: {
      filterText(val) {
        this.$refs.functionTree.filter(val);
      }
    },
    mounted: function() {
      setTimeout(() => {
        this.initMaxHeight();
        // throttleFunc记录当前的节流方法，用于在页面销毁时释放
        this.throttleFunc = throttle(this.initMaxHeight, 500);
        window.addEventListener("resize", this.throttleFunc);
        this.getTreeData()
      }, 100)
    },
    beforeDestroy() {
      window.addEventListener("resize", this.throttleFunc);
    },
    methods: {
      // 动态计算高度
      initMaxHeight() {
        calcHeight(this, 5);
      },
      filterNode(value, data) {
        if (!value) return true;
        return data.name.indexOf(value) !== -1;
      },
      //获取菜单
      getTreeData() {
        let that = this
        let appId = this.appModel.appId
        if (appId) {
          const loading = that.$loading();
          funManageApi.getSynchroFunctionTree(appId).then(function(response) {
            loading.close();
            let data = response.data
            that.funcTreeData = response.data
          })
          .catch(function(err) {
            loading.close();
          })
        }
      },
      getAppList() {
        funManageApi.getAppList().then((response) => {
          this.appList = response.data.data
          if (this.appList.length > 0) {
            //默认显示第一个应用
            this.appModel.appId = this.appList[0].appId;
            this.appChange();
            this.$nextTick(() => {
              this.initMaxHeight();
            })
          }
        })
      },
      appChange: function() {
        let appId = this.appModel.appId
        if (!appId) {
          return
        }
        this.showFunc = true
        this.$nextTick(() => {
          this.getTreeData()
        })
      },
      appClear: function() {
        this.showFunc = false
      },
      functionChange: function() {
        // 菜单类型
        if (this.functionModel.functionType === '0' || this.functionModel.functionType === '3') {
          this.menuTypeIsShow = true
          if (this.functionModel.menuType === null || this.functionModel.menuType === '') {
            this.functionModel.menuType = '0'
          }
        } else {
          this.menuTypeIsShow = false
        }
      },
      //搜索
      search: function() {
        let queryForm = this.$refs.queryForm.getQueryForm();
        this.appModel.functionName = queryForm.functionName;
        this.appModel.functionName = queryForm.functionName;
        this.getTreeData();
      },
      // 清空表单
      clearModel: function() {
        this.functionModel = {
          functionId: '',
          functionName: '',
          functionDesc: '',
          functionUrl: '',
          iconClass: '',
          functionDataTable: '',
          functionCode: '',
          displaySeq: 1,
          functionType: '0',
          logFlag: '0',
          state: '1',
          parentName: '',
          universalFunc: [],
          supFuncId: '',
          menuType: '0',
          isAuthReq: '0',
          parentName: ''
        }
      },
      // 添加一级菜单
      addFirstFunc: function() {
        let that = this;
        that.clearModel();
        that.operator = 'add';
        this.functionModel.supFuncId = '****';
        this.functionModel.parentName = '根菜单';
        that.showDialog = true;
      },
      // 添加子菜单
      addFunc: function(row) {
        let that = this;
        that.clearModel();
        that.operator = 'add';
        if (row.name) {
          this.functionModel.supFuncId = row.id;
          this.functionModel.parentName = row.name;
        } else {
          this.functionModel.supFuncId = '****';
          this.functionModel.parentName = '根菜单';
        }
        that.showDialog = true;
      },
      // 编辑菜单
      editFunc: function(row) {
        let that = this;
        that.clearModel();
        that.operator = 'update';
        const loading = this.$loading();
        funManageApi.getFunction(row.id).then(function(response) {
          loading.close();
          let data = response.data
          that.functionModel.functionId = data.functionId
          that.functionModel.functionName = data.functionName
          that.functionModel.functionDesc = data.functionDesc
          that.functionModel.functionUrl = data.functionUrl
          that.functionModel.iconClass = data.iconClass
          that.functionModel.functionDataTable = data.functionDataTable
          that.functionModel.functionCode = data.functionCode
          that.functionModel.displaySeq = parseInt(data.displaySeq)
          that.functionModel.functionType = data.functionType
          that.functionModel.menuType = data.menuType
          that.functionModel.logFlag = data.logFlag
          that.functionModel.state = data.state
          that.showDialog = true;
          if (row.pId === '****') {
            that.functionModel.parentName = '根菜单';
          } else {
            funManageApi.getFunction(row.pId).then(function(response) {
              that.functionModel.parentName = response.data.functionName;
            })
          }
        }).catch(() => {
          loading.close();
        })
      },
      // 删除菜单
      delFunc: function(data) {
        let that = this
        let confirm = that.$t('dataAuth.ifdelete')
        if (data.isParent === true) {
          that.$message.error(that.$t('dataAuth.cannotdelnonleaf')) // 异步有子节点的节点物理删除
          return
        }
        that.$confirm(confirm, that.$t('cm.tips'), {
          confirmButtonText: that.$t('cm.confirm'),
          cancelButtonText: that.$t('cm.cancel'),
          cancelButtonClass: 'cud__button--reset',
          confirmButtonClass: 'cud__button--search',
          type: 'warning'
        }).then(() => {
          funManageApi.delFunction(data.id).then(function(response) {
            if (response.data.code !== '0') {
              that.$message.error(that.$t('dataAuth.deletefail'));
            } else {
              that.getTreeData()
              that.$message({
                message: that.$t('dataAuth.deletesuccess'),
                type: 'success'
              });
            }
          }).catch(function(error) {

          })
        }).catch(() => {
          let message = that.$t('dataAuth.deletecancel')
          that.$message({
            type: 'info',
            message: message
          });
        });
      },
      // 保存菜单
      handleSubmit: function() {
        let that = this
        // 数据传递
        this.$refs['functionForm'].validate(function(valid) {
          if (valid) {
            // 保存时，如果菜单类型隐藏，则菜单类型字段保存为空值
            if (!that.menuTypeIsShow) {
              that.functionModel.menuType = ''
            }
            let appId = that.appModel.appId
            if (appId && appId !== '') {
              that.functionModel.appId = appId
            }
            const loading = that.$loading();
            funManageApi.saveFunInfo(that.operator, that.functionModel).then(function(response) {
              loading.close();
              if (response.data.code !== '0') {
                that.$message.error(response.data.msg);
              } else {
                that.$message({
                  type: 'success',
                  message: that.$t('dataAuth.savesuccess')
                });
                that.showDialog = false;
                that.getTreeData();
              }
            }).catch(function(error) {
              loading.close();
            })
          } else {
            that.$message.error(that.$t('dataAuth.verifefail'))
          }
        })
      },
      //复制应用
      copyFunc() {
        let _this = this;
        _this.showCopyFunc = true;
        // funManageApi.getDemoApp().then((res) => {
        //   if (res.data.code === "0" && res.data.data) {
        //     _this.copyFromAppId = res.data.data;
        //     let copyFromApp = _this.appList.find((item) => {
        //       return item.appId == _this.copyFromAppId;
        //     })
        //     _this.copyFromAppName = copyFromApp.appName;
        //   } else {
        //     _this.$message({message: '请求应用信息失败！', type: 'error'});
        //     return;
        //   }
        // });
        let selectedApp = _this.appList.find((item) => {
          return item.appId == _this.appModel.appId;
        });
        if (!selectedApp) return;
        _this.copyToAppId = selectedApp.appId;
        _this.copyToAppName = selectedApp.appName;
      },
      //提交
      copyFuncSubmit() {
        if (this.copyFromAppId === "") {
          this.$message({message: '请选择来源应用！', type: 'error'});
          return;
        }
        let _this = this;
        _this.$confirm('确认要复制吗？').then(() => {
          let param = {
            sourceAppId: _this.copyFromAppId,
            targetAppId: _this.copyToAppId
          }
          funManageApi.copyAppFunc(param).then((res) => {
            if (res.data.code === "0") {
              _this.$message({message: '操作成功！', type: 'success'});
              _this.copyFuncClose();
              _this.appChange();
            } else {
              _this.$message({message: res.data.msg, type: 'error'});
            }
          }).catch(() => {
            _this.$message({message: '操作失败！', type: 'error'});
          });
        }).catch(() => {
          console.log('cancel');
        });
      },
      //关闭
      copyFuncClose() {
        this.showCopyFunc = false;
        this.copyFromAppId = '';
      },
    }
  }

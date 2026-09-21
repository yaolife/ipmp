import api from "../../api";
import draggable from 'vuedraggable'
import wfColFlowRuleAPI from '../../wfCollectionComponent/api/index'
// 路由配置Dialog
export default {
  name: "rule-binding",
  props: {
    "ruleFunType": Number
  },
  components: {draggable},
  data() {
    return {
      //表单主键
      formId: '',
      dialogVisible: false,
      rowItem: {},
      //参数信息
      roleParam: [],
      //规则选项下拉框
      options: [],
      //规则主键ID
      wfRuleMasterId: '',
      //已绑定规则
      wfRuleDetailId: '',
      //数据模型数据
      modelTreeData: [],
      //数据模型数据结构
      defaultModelProps: {
        type: 'dbType',
        label: 'label',
        children: 'children'
      },
      //流程模型数据结构
      defaultFlowProps: {
        workFlowInfoType: 'workFlowInfoType',
        workFlowInfoName: 'workFlowInfoName',
        children: 'children'
      },
      workFlowRuleDetail: {
        funcList: [],
        ruleParamList: [],
        wfParamList: []
      },
      //条件公式
      expression: '',
      // 公式说明
      ruleDescribe: '',
      //规则名称
      ruleName: '',
      //获取数组下标
      inputIndex: '',
      //是否点击标识
      focusFlag: false,
      //树结构转List
      paramTreeToList: [],
      id: 1,
      //调用地方标识
      dialogType: '',
      //表单绑定规则ID
      formControlId: ''
    }
  },
  mounted() {
    //获取数据模型树结构数据
    this.getTreeList();
  },
  computed: {},
  methods: {
    //开始拖拽事件
    onStart() {
      this.drag = true;
    },
    //拖拽结束事件
    onEnd(oldIndex, newIndex) {
      console.info(oldIndex)
      console.info(newIndex)
      this.drag = false;
    },


    //绑定规则
    getBindingRule: function (row) {

      //获取规则信息下拉框
      this.getRuleList();
      let _this = this;
      //根据规则ID查询规则详情（回显适用）
      // if (row.actRouteConditionId !== "" || row.actPartScTypeRuleId !== '') {

      //   let param = {
      //     wfRuleDetailId: ''
      //   }
      //   if (_this.dialogType === 'SCTab') {
      //     _this.wfRuleDetailId = row.actPartScTypeRuleId
      //     param.wfRuleDetailId = row.actPartScTypeRuleId

      //   } else {
      //     _this.wfRuleDetailId = row.actRouteConditionId
      //     param.wfRuleDetailId = row.actRouteConditionId
      //   }
      //   api.queryDataDetailInfo(param).then(res => {
      //     if (res.code === "0") {
      //       if (res.data !== null) {
      //         _this.wfRuleMasterId = res.data.wfRuleMasterId;
      //         _this.roleParam = [];
      //         _this.roleParam = JSON.parse(res.data.wfBindingField).ruleParamList;
      //         _this.workFlowRuleDetail.wfParamList = JSON.parse(res.data.wfBindingField).wfParamList;
      //         _this.workFlowRuleDetail.funcList = JSON.parse(res.data.wfBindingField).funcList;
      //         _this.options.forEach(i => {
      //           if (res.data.wfRuleMasterId === i.id) {
      //             _this.expression = i.ruleExpression;
      //           }
      //         })
      //         _this.roleParam.forEach(i => {
      //           _this.paramTreeToList.forEach(j => {
      //             if (i.mockCode === j.paramCode) {
      //               i.bindingParam = {
      //                 paramCode: j.paramCode,
      //                 dataType: j.dataType,
      //                 paramName: j.paramName
      //               };
      //             }
      //           })
      //         })
      //       }
      //     } else {
      //       _this.$message({type: 'error', message: res.msg})
      //     }
      //   })
      // }
    },
    handleClick(tab, event) {
      console.log(tab, event);
    },
    //获取数据模型树结构数据
    getTreeList() {
      let _this = this;
      let param = {
        formId: _this.formId
      }
      api.queryDataModel(param).then(res => {
        if (res.data !== null) {
          //更改树结构信息
          let modelTreeData = [];
          if(res.data.entity && res.data.readonly) {
            modelTreeData.push(res.data.entity)
            modelTreeData.push(res.data.readonly[0])
            _this.changeModelTreeStr(modelTreeData)
            _this.modelTreeData = modelTreeData
            //更改树结构为List
            _this.changeTreeToList(_this.modelTreeData);
          }
        }
      })
    },
    //更改树结构为List
    changeTreeToList(data) {
      let _this = this;
      for (let i = 0; i < data.length; i++) {
        if (data[i] !== undefined) {
          if (data[i].workFlowInfoName) {
            let param = {
              paramCode: data[i].workFlowInfoCode,
              paramName: data[i].label,
              dataType: data[i].type,
            }
            _this.paramTreeToList.push(param);
          }
          if (data[i].fieldCode && data[i].fieldCode !== null) {
            let param = {
              paramCode: data[i].fieldCode,
              paramName: data[i].label,
              dataType: data[i].dbType,
            }
            _this.paramTreeToList.push(param);
          }
          if (data[i].children) {
            this.changeTreeToList(data[i].children)
          }
        }
      }
    },
    //更改树结构信息
    changeModelTreeStr(data) {
      for (let i = 0; i < data.length; i++) {
        if (data[i] !== undefined) {
          if (data[i].controlLabel !== null) {
            data[i].isDraggable = true;
            data[i].label = data[i].controlLabel;
          } else {
            if (data[i].entityDescribe && data[i].entityDescribe !== null) {
              data[i].isDraggable = false;
              data[i].label = data[i].entityDescribe;
            } else {
              data[i].label = data[i].readonlyName;
            }
          }
          if (data[i].children.length !== 0) {
            this.changeModelTreeStr(data[i].children)
          }
        }
      }
    },
    //字段参数点击
    modelDataClick(data) {
      let _this = this;
      if (_this.focusFlag) {
        if (data.dbFieldId) {
          _this.roleParam[_this.inputIndex].bindingParam.paramName = data.dbFieldName;
          _this.roleParam[_this.inputIndex].bindingParam.paramCode = data.fieldCode;
          _this.roleParam[_this.inputIndex].bindingParam.dataType = data.dbType;
        } else {
          _this.roleParam[_this.inputIndex].bindingParam.paramName = data.fieldName;
          _this.roleParam[_this.inputIndex].bindingParam.paramCode = data.fieldCode;
          _this.roleParam[_this.inputIndex].bindingParam.dataType = data.dbType;
        }
      } else {
        _this.$message.warning(_this.$t('wm.select_field'))
      }
    },
    //获取规则下拉
    getRuleList() {
      let _this = this;
      let params = {
        "ruleFunType": _this.ruleFunType,
        "ruleStatus": 1
      }
      if (this.$route.query.processColleId !== undefined) {
        params.processColleId = this.$route.query.processColleId;
        wfColFlowRuleAPI.getAllProcColleRule(params).then(res => {
          _this.options = res.data
        });
      } else {
        api.getRuleListAPI(params).then(res => {
          _this.options = res.data
        })
      }
    },
    //规则下拉改变
    selectChange(data) {
      let _this = this;
      _this.options.forEach(i => {
        if (data === i.wfRuleMasterId) {
          console.info(i)
          _this.expression = i.ruleExpression;
          _this.ruleDescribe = i.ruleExpression;
          _this.ruleName = i.ruleName;
          _this.roleParam = [];
          _this.roleParam = JSON.parse(i.ruleParams).ruleParamList;
          _this.workFlowRuleDetail.wfParamList = JSON.parse(i.ruleParams).wfParamList;
          _this.workFlowRuleDetail.funcList = JSON.parse(i.ruleParams).funcList;
        }
      })
      if (_this.roleParam !== undefined) {
        _this.roleParam.forEach(i => {
          _this.$set(i, 'bindingParam', {"paramCode": "", "dataType": '', "paramName": ''});
        })
      }
    },
    handleDelete(index, row) {
      // console.log(index, row);
    },
    //节点开始拖拽时触发(可以加校验防止顶点被拖拽)
    handleDragStart(node, event) {
    },
    //节点结束拖拽时触发
    handleDragend(draggingNode, endNode, position, event) {
      let _this = this;
      console.info(draggingNode)
      console.info(_this.roleParam)
      let param = {
        mockCode:'',
        mockName:'',
        mockType:'',
        bindingParam: {
          paramCode: draggingNode.data.fieldCode,
          dataType: draggingNode.data.dbType,
          paramName: draggingNode.data.label
        }
      }
      // _this.roleParam.push(param)
    },
    allowDrop(draggingNode, dropNode, type) {
      return false;
    },
    //删除选中字段
    // delParam(data, index) {
    //   let _this = this;
    //   _this.roleParam[index].bindingParam = '';
    // },
    //添加新规则
    addRuleClick() {
      this.$router.push("/workflow_rule_add")
    },
    //路由配置提交
    routerSubmit() {
      let _this = this;
      let flag = true;
      if(_this.roleParam){
        _this.roleParam.forEach(i => {
          if (i.bindingParam.paramCode !== '') {
            let param = {
              mockCode: i.bindingParam.paramCode,
              mockType: i.mockType,
              mockName: i.mockName
            }
            _this.workFlowRuleDetail.ruleParamList.push(param)
            flag = true;
          } else {
            flag = false;
          }
        })
      }
      let param = {
        wfRuleMasterId: _this.wfRuleMasterId,
        wfRuleDetailId: _this.wfRuleDetailId,
        workFlowRuleDetailList: JSON.stringify(_this.workFlowRuleDetail)
      }
      if (flag) {
        api.routerSubmit(param).then(res => {
          if (res.code === "0") {
            if (_this.dialogType === 'SCTab') {
              let param = {
                actPartScTypeRuleId: res.data,
                actPartScTypeRuleContext: _this.ruleDescribe
              }
              _this.$emit("bindingRouteDataSc", param)
            } else if (_this.dialogType === 'routeBinding'){
              _this.rowItem.actRouteConditionId = res.data
              _this.rowItem.actRouteConditionContent = _this.ruleDescribe
              _this.rowItem.ruleName = _this.ruleName
              _this.$emit("bindingRouteData", _this.rowItem)
            } else if (_this.dialogType === 'dynamicTab' ) {
              _this.rowItem.actRouteConditionId = res.data
              _this.rowItem.actRouteConditionContent = _this.ruleDescribe
              _this.rowItem.ruleName = _this.ruleName
              _this.$emit("bindingRouteDataDynamic", _this.rowItem)
            } else if (_this.dialogType === 'currencyTab') {
              _this.rowItem.actRouteConditionId = res.data
              _this.rowItem.actRouteConditionContent = _this.ruleDescribe
              _this.rowItem.ruleName = _this.ruleName
              _this.$emit("bindingRouteDataCurrency", _this.rowItem)
            } else if (_this.dialogType === 'actConfigBind') {
              _this.rowItem.actRouteConditionId = res.data
              _this.rowItem.actRouteConditionContent = _this.ruleDescribe
              _this.rowItem.ruleName = _this.ruleName
              _this.$emit("bindingRuleData", _this.rowItem)
            } else {
              let param = {
                formControlRuleId: res.data,
                formControlRuleContent: _this.ruleDescribe,
                formControlId: _this.formControlId
              }
              _this.$emit("bindingFormControl", param)
            }
            _this.dialogVisible = false
            _this.$message({type: 'success', message: res.msg})
            _this.roleParam = [];
            _this.expression = '';
            _this.ruleDescribe = '';
            _this.wfRuleMasterId = '';
            _this.workFlowRuleDetail.funcList = [];
            _this.workFlowRuleDetail.ruleParamList = [];
            _this.workFlowRuleDetail.wfParamList = [];
          } else {
            _this.$message({type: 'error', message: res.msg})
          }
        })
      } else {
        _this.$message.warning(_this.$t('wm.bind_all_data'))
      }
    },
    clearBinding(data) {
      let _this = this;
      _this.roleParam[data].bindingParam.paramCode = ''
      _this.roleParam[data].bindingParam.paramName = ''
      _this.roleParam[data].bindingParam.dataType = ''
    },
    cancelRouter() {
      let _this = this;
      _this.dialogVisible = false
      _this.wfRuleMasterId = '';
      _this.roleParam = [];
      _this.expression = '';
      _this.ruleDescribe = '';
      _this.focusFlag = false;
      if (_this.dialogType === "formControlsBinding") {
        let param = {
          formControlRuleContent: _this.ruleDescribe,
          formControlId: _this.formControlId
        }
        _this.$emit("bindingFormControl", param)
      }
    },
    //获取输入框焦点
    inputFocus(data) {
      let _this = this;
      _this.focusFlag = true;
      _this.inputIndex = data
    }
  },
  watch: {
    formId: {
      handler(newValue, oldValue) {
        let param = {
          formId: newValue
        }
        api.queryDataModel(param).then(res => {
          if (res.data !== null) {
            //更改树结构信息
            let modelTreeData = [];
            modelTreeData.push(res.data.entity)
            if (res.data.readonly.length !== 0) {
              modelTreeData.push(res.data.readonly[0])
            }
            this.changeModelTreeStr(modelTreeData)
            this.modelTreeData = modelTreeData
            //更改树结构为List
            this.changeTreeToList(this.modelTreeData);
          }
        })
      }
    }
  }
}


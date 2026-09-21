<template>
  <div class="cud-commom-form-style">
    <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div class="cud__scroll--div" v-loading.fullscreen.lock="fullscreenLoading">
      <!-- <el-row v-if="multiApp">
      <el-col :span="24" class="select-bgc">
        <label class="cud__label">{{$t('dataAuth.selectapplication')}}：</label>
        <el-select size="small" v-model="appModel.appId" @change="appChange" @clear="appClear" style="width:200px" clearable filterable>
          <el-option v-for="app in appList" :value="app.appId" :key="app.appId" :label="app.appName"></el-option>
        </el-select>
      </el-col>
    </el-row> -->
      <el-row>
        <el-col :span="8">
          <el-card>
            <div class="cud__tree--left" :style="{ height: maxTableHeight + 'px' }">
              <el-form>
                <el-col :span="24" class="select-bgc">
                  <!-- <label class="cud__label">{{$t('dataAuth.selectapplication')}}：</label> -->
                  <el-form-item :label="$t('dataAuth.selectapplication')" label-width="90px">
                    <el-select size="small" v-model="appModel.appId" @change="appChange" @clear="appClear" clearable
                      filterable>
                      <el-option v-for="app in appList" :value="app.appId" :key="app.appId" :label="app.appName">
                      </el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-button class="cud__button--search" size="small" type="primary" @click="addFirstFunc" v-if="hasPermission('function_manage_add')">
                  {{$t('dataAuth.addfirstlevel')}}
                </el-button>
                <el-button class="cud__button--search" size="small" @click="copyFunc" v-if="hasPermission('function_manage_add')">
                  复制应用功能
                </el-button>
                <el-row style="margin:10px 0" v-if="!multiApp || showFunc">
                  <el-col :span="24">
                    <el-form-item :label="$t('dataAuth.queryCon')" label-width="90px">
                      <el-input size="small" :placeholder="$t('dataAuth.pleaseEnter')" v-model="filterText">
                        <!-- <el-button type="primary" size="small" slot="append">{{$t('cm.search')}}</el-button> -->
                      </el-input>
                    </el-form-item>
                  </el-col>
                </el-row>
              </el-form>
              <div class="cud__tree-overflow" id="left">
                <el-tree ref="functionTree" :filter-node-method="filterNode" :props="options" highlight-current
                  :data="funcTreeData" :current-node-key="currentNodeKey" node-key="id"
                  :default-expanded-keys="treeExpandedKeys" :expand-on-click-node="false" @node-click="onSelectTree">
                  <span class="custom-tree-node" slot-scope="{ node, data }">
                    <span>{{node.label}}</span>
                    <el-dropdown>
                      <span class="el-dropdown-link">
                        <i class="el-icon el-icon-more"></i>
                      </span>
                      <el-dropdown-menu slot="dropdown">
                        <el-dropdown-item v-if="data.type==='0' && hasPermission('function_manage_add')" @click.native="addFunc(node, data)">{{$t('cm.add')}}
                        </el-dropdown-item>
                        <el-dropdown-item @click.native="delFunc(node, data)" v-if="hasPermission('function_manage_del')">{{$t('cm.delete')}}</el-dropdown-item>
                      </el-dropdown-menu>
                    </el-dropdown>
                  </span>
                </el-tree>
              </div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="16">
          <el-card>
            <div class="cud__tree--right right" :style="{ height: maxTableHeight + 'px' }">
              <div class="cud__tree-overflow" id="right">
                <el-form ref="functionForm" :model="functionModel" label-width="150px" :rules="ruleValidate" :disabled="disabled">
                  <el-row>
                    <el-col :span="19" class="cud__col20">
                      <el-form-item :label="$t('dataAuth.functionname')" prop="functionName">
                        <!-- <el-input size="small" v-if="flag === 'zh-CN'" v-model="functionModel.functionName" :maxlength="50" :placeholder="$t('dataAuth.pleaseEnter')" clearable></el-input>
                        <el-input size="small" v-if="flag === 'en-US'" v-model="functionModel.functionNameField1" :maxlength="50" :placeholder="$t('dataAuth.pleaseEnter')" clearable></el-input> -->
                        <el-input size="small" v-model="functionModel[currentfiled]" :maxlength="50"
                          :placeholder="$t('dataAuth.pleaseEnter')" clearable></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="3" class="cud__col20">
                      <!--el-button size="small" @click="clickDialog()" style="margin: 3px;padding: 9px;">{{$t('dataAuth.languageSet')}}</el-button-->
                      <el-dialog :title="$t('dataAuth.setting')" :visible.sync="dialogFormVisible">
                        <el-form v-for="(item,index) in langList" :key="index">
                          <el-form-item :label="item.langName" :label-width="formLabelWidth">
                            <!-- <el-input v-model="item.langDefaultValue" ></el-input> -->
                            <el-input v-model="localeValMap[item.langFieldMapping]"></el-input>
                          </el-form-item>
                        </el-form>
                        <div slot="footer" class="dialog-footer">
                          <el-button @click="clearDialog(langList)">{{$t('cm.reset')}}</el-button>
                          <el-button type="primary" @click="saveDialog(langList)">{{$t('cm.save')}}</el-button>
                        </div>
                      </el-dialog>
                    </el-col>
                    <el-col :span="22" class="cud__col20">
                      <el-form-item :label="$t('dataAuth.functiondescript')" prop="functionDesc">
                        <el-input size="small" v-model="functionModel.functionDesc" :maxlength="256"
                          :placeholder="$t('dataAuth.pleaseEnter')" clearable></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="22" style="position: relative;" class="cud__col20">
                      <el-form-item :label="$t('dataAuth.functionCode')" prop="functionCode">
                        <el-input size="small" v-model="functionModel.functionCode" :maxlength="50"
                          :placeholder="$t('dataAuth.pleaseEnter')" clearable></el-input>
                      </el-form-item>
                      <div class="tipText" style="bottom: -15px;">需要进行权限过滤模块需要配置此功能编码，且需保证唯一</div>
                    </el-col>
                    <el-col :span="22" class="cud__col20">
                      <el-form-item :label="$t('dataAuth.urladdress')">
                        <el-input size="small" type="url" v-model="functionModel.functionUrl" :maxlength="100"
                          :placeholder="$t('dataAuth.pleaseEnter')" clearable></el-input>
                      </el-form-item>
                      <div class="tipText" style="bottom: -15px;">需要进行权限过滤的接口需要配置此后端访问地址</div>
                    </el-col>
                    <el-col :span="22" class="cud__col20" style="position: relative;">
                      <el-form-item :label="$t('dataAuth.expandFields')" prop="iconClass">
                        <el-input size="small" v-model="functionModel.iconClass" :maxlength="256"
                          :placeholder="$t('dataAuth.pleaseEnter')" clearable></el-input>
                      </el-form-item>
                      <div class="tipText" style="bottom: -15px;">
                        配置系统菜单图表、显示所需必要属性,例：{"icon":"#icon-icon_menu_setting_nor","resource":"systemManage"}</div>
                    </el-col>
                    <el-col :span="22" class="cud__col20" style="position: relative;">
                      <el-form-item :label="$t('dataAuth.functionDataTable')" prop="functionDataTable">
                        <el-input size="small" v-model="functionModel.functionDataTable" :maxlength="100"
                          :placeholder="$t('dataAuth.pleaseEnter')" clearable></el-input>
                      </el-form-item>
                      <div class="tipText" style="bottom: -15px;">配置功能模块数据过滤主表名称(数据库物理表名称，用于配置数据规则时进行合法性校验)</div>
                    </el-col>
                    <el-col :span="22" class="cud__col20">
                      <el-form-item :label="$t('dataAuth.nodesorting')" prop="displaySeq">
                        <el-input-number size="small" :max="1000" :min="1" v-model="functionModel.displaySeq">
                        </el-input-number>
                      </el-form-item>
                    </el-col>
                    <el-col :span="22" style="position: relative;" class="cud__col20">
                      <el-form-item :label="$t('dataAuth.isAuthReq')">
                        <el-radio-group size="small" v-model="functionModel.isAuthReq">
                          <el-radio label="1">是</el-radio>
                          <el-radio label="0">否</el-radio>
                        </el-radio-group>
                      </el-form-item>
                      <div class="tipText" style="bottom: -10px;">勾选是，则该功能菜单为用户默认系统功能，即不需要进行系统授权便可以使用的功能模块，勾选否则相反</div>
                    </el-col>
                    <el-col :span="22" class="cud__col20">
                      <el-form-item :label="$t('dataAuth.functiontype')" prop="functionType">
                        <el-select size="small" v-model="functionModel.functionType" @change="functionChange">
                          <el-option value="0" :label="$t('dataAuth.menulocal')"></el-option>
                          <el-option value="1" :label="$t('dataAuth.button')"></el-option>
                          <el-option value="2" :label="$t('dataAuth.webservice')"></el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="22" class="cud__col20">
                      <el-form-item :label="$t('dataAuth.menutype')" prop="menuType" v-show="menuTypeIsShow">
                        <el-select size="small" v-model="functionModel.menuType">
                          <el-option value="0" :label="$t('dataAuth.pc')"></el-option>
                          <el-option value="1" :label="$t('dataAuth.mobile')"></el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <!-- <el-col :span="22" class="cud__col20">
                    <el-form-item :label="$t('dataAuth.log')" prop="logFlag">
                      <el-select size="small" v-model="functionModel.logFlag" >
                        <el-option value="0" :label="$t('dataAuth.no')"></el-option>
                        <el-option value="1" :label="$t('dataAuth.yes')"></el-option>
                      </el-select>
                    </el-form-item>
                  </el-col> -->
                    <el-col :span="22" class="cud__col20">
                      <el-form-item :label="$t('dataAuth.functionstatus')" prop="state">
                        <el-select size="small" v-model="functionModel.state">
                          <el-option value="1" :label="$t('dataAuth.available')"></el-option>
                          <el-option value="0" :label="$t('dataAuth.notavailable')"></el-option>
                        </el-select>
                      </el-form-item>
                    </el-col>
                    <el-col :span="22" class="cud__col20">
                      <el-form-item :label="$t('dataAuth.superiornode')" prop="parentName">
                        <el-input size="small" v-model="functionModel.parentName" disabled></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="22" class="cud__col20">
                      <el-form-item :label="$t('dataAuth.universalFunc')" v-if="ifMenu">
                        <el-checkbox-group size="small" v-model="functionModel.universalFunc">
                          <el-checkbox label="add">{{$t('dataAuth.universalAdd')}}</el-checkbox>
                          <el-checkbox label="update">{{$t('dataAuth.universalUpdate')}}</el-checkbox>
                          <el-checkbox label="delete">{{$t('dataAuth.universalDel')}}</el-checkbox>
                          <el-checkbox label="query">{{$t('dataAuth.universalQuery')}}</el-checkbox>
                          <el-checkbox label="import">{{$t('dataAuth.universalImport')}}</el-checkbox>
                          <el-checkbox label="export">{{$t('dataAuth.universalExport')}}</el-checkbox>
                        </el-checkbox-group>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-row>
                    <el-col>&nbsp;</el-col>
                  </el-row>
                </el-form>
              </div>
              <div class="right_float" v-if="hasPermission('function_manage_add') || hasPermission('function_manage_edit')">
                <el-button class="cud__button--search" size="small" type="primary"@click="handleSubmit('functionForm')">{{$t('cm.save')}}</el-button>
                <el-button class="cud__button--reset" size="small" @click="handleReset('functionForm')">{{$t('cm.reset')}}</el-button>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-dialog :visible.sync="showCopyFunc" :title="$t('dataAuth.selectapplication')" width="600px">
        <div>
          <el-form label-position="left" label-width="180px">
            <el-form-item :label="$t('dataAuth.copyFromApp') + ':'">
              <el-select v-model="copyFromAppId" size="small">
                <!-- <el-option :label="copyFromAppName" :value="copyFromAppId"></el-option> -->
                <el-option v-for="item in appList" :key="item.appId" :label="item.appName" :value="item.appId"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item :label="$t('dataAuth.copyToApp') + ':'">
              <el-select v-model="copyToAppId" size="small" disabled>
                <el-option :label="copyToAppName" :value="copyToAppId"></el-option>
              </el-select>
            </el-form-item>
            <p><span style="color: red">注意：复制功能会完全覆盖现有应用的功能菜单！</span></p>
          </el-form>
        </div>
        <div slot="footer" align="center">
          <el-button size="small" type="primary" @click="copyFuncSubmit">{{$t('cm.commit')}}</el-button>
          <el-button size="small" @click="copyFuncClose">{{$t('cm.cancel')}}</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>
<script>
  import funManageApi from '../api/appApi'
  import Bus from '../../../../../src/bus'
  import breadcrumb from '@/components/common/breadcrumb'
  import { throttle } from "@/utils/funcUtil";
  import { calcHeight } from "@/utils/funcUtil";
  export default {
    name: 'functionManage',
    components: {
      breadcrumb,
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
          funDescription: [
            { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' }
          ],
          functionUrl: [
            { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' },
            { required: true, validator: colUrlValidate, trigger: "blur" }
          ],
          functionCode: [
            { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' }
          ],
          displaySeq: [{
            required: true,
            type: 'number',
            message: this.$t('cm.tiprequired'),
            trigger: 'blur',
            transform: function(value) {
              if (value === '' || value === null) {
                return false
              }
              return Number(value)
            }
          }]
        },
        appList: this.getAppList(),
        appModel: {
          appId: ''
        },
        showFunc: false,
        treeDatas: [],
        //国际化操作
        langType: false, //false为新增，true为编辑
        flag: '', //functionName 中英文标识符
        dialogFormVisible: false, //弹出框状态
        formLabelWidth: '120px',
        localeValMap: {},
        langList: [],
        currentfiled: 'functionName',
        currentFiledVal: '',
        currentLocale: sessionStorage.getItem("locale"),
        // 过滤树菜单
        filterText: '',
        disabled: true,

        //复制应用
        showCopyFunc: false,
        copyFromAppId: '',  //来源应用id
        copyFromAppName: '',  //来源应用id
        copyToAppId: '',    //目标应用id
        copyToAppName: '',  //目标应用名称
        maxTreeHeight: 0,
        maxTableHeight: 0,
      }
    },
    computed: {
      multiApp() {
        return true;
        // if (this.$store.state.lightAuth.ifMultiApp === '1') {
        //   return true
        // } else {
        //   return false
        // }
      },
      ifMenu() {
        let aa = this.functionModel.functionType;
        let bb = this.functionModel.functionId;
        if ((this.functionModel.functionType === '0') ||
          (this.functionModel.functionType === '0' && bb.startsWith('newId')) ||
          this.functionModel.functionId === 'undefined') {
          return true
        } else {
          return false
        }
      }

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
        this.getLangList();
        Bus.$on('en-US', (val) => {
          this.getTreeDatas()
        });
      }, 100)
    },
    beforeDestroy() {
      window.addEventListener("resize", this.throttleFunc);
    },
    created: function() {
      if (!this.multiApp) {
        this.getTreeDatas()
      }
      this.flag = sessionStorage.getItem("locale");
    },
    methods: {
      // 动态计算高度
      initMaxHeight() {
        calcHeight(this, -60);
      },
      filterNode(value, data) {
        if (!value) return true;
        return data.name.indexOf(value) !== -1;
      },
      getTreeDatas() {
        let that = this
        if (this.multiApp) {
          let appId = this.appModel.appId
          if (appId) {
            const loading = that.$loading();
            funManageApi.getSynchroFunctionTree(appId).then(function(response) {
              loading.close();
              let data = response.data
              that.funcTreeData = response.data
              that.$nextTick(() => {
                that.$refs['functionTree'].setCurrentKey(that.currentNodeKey)
              })
            })
            .catch(function(err) {
              loading.close();
            })
          }
        } else {
          funManageApi.getSynchroFunctionTree().then(function(response) {
            let data = response.data
            that.funcTreeData = response.data
            that.$nextTick(() => {
              that.$refs['functionTree'].setCurrentKey(that.currentNodeKey)
            })
          })
        }
      },
      getAppList() {
        funManageApi.getAppList().then((response) => {
          this.appList = response.data.data
          // let appItem = this.appList.find(item => {
          //   return item.appCode === 'BP'
          // })
          // //console.log(this.appList)
          // this.appModel.appId = appItem.appId
          // this.appChange()
          if (this.appList.length > 0) {
            //默认显示第一个应用
            this.appModel.appId = this.appList[0].appId;
            this.appChange();
          }
        })
      },
      appChange: function() {
        let appId = this.appModel.appId
        if (!appId) {
          return
        }
        this.showFunc = true
        this.handleReset()
        this.$nextTick(() => {
          this.getTreeDatas()
        })
      },
      appClear: function() {
        this.handleReset()
        this.showFunc = false
      },
      //  添加一级菜单
      addFirstFunc: function() {
        let that = this;
        that.disabled = false
        let addCount = this.addCount++
        let newNode = {
          name: '增加功能' + addCount,
          pId: '****',
          editType: 'add',
          id: 'newId' + addCount,
          nameField1: 'NewMenu' + addCount
        }
        // if (sessionStorage.getItem("locale") === 'en-US') {
        //   newNode.name = newNode.nameField1
        // }
        this.getLangList();
        newNode.name = this.currentFiledVal;
        this.funcTreeData.push(newNode)
        this.$nextTick(function() {
          that.$refs['functionTree'].setCurrentNode(newNode)
          let node = that.$refs['functionTree'].getNode(newNode.id);
          that.onSelectTree(newNode, node)
        })
      },
      // 添加方法
      addFunc: function(node, data) {
        let that = this;
        if (data.editType === 'add') {
          this.$message.error(this.$t('dataAuth.savenodeaddchild'))
          return
        }
        if (data.type === '1') {
          this.$message.error(this.$t('dataAuth.savenodeaddchild'))
          return
        }
        let addCount = this.addCount++
        let newNode = {
          name: '增加功能' + addCount,
          pId: data.id,
          editType: 'add',
          id: 'newId' + addCount,
          nameField1: 'NewMenu' + addCount
        }
        // if (sessionStorage.getItem("locale") === 'en-US') {
        //   newNode.name = newNode.nameField1
        // }
        this.getLangList();
        newNode.name = this.currentFiledVal;
        if (!data.children) {
          this.$set(data, 'children', []);
        }
        data.children.push(newNode);

        this.$nextTick(function() {
          that.$refs['functionTree'].setCurrentNode(newNode)
          let node = that.$refs['functionTree'].getNode(newNode.id);
          that.treeExpandedKeys.push(data.id)
          that.onSelectTree(newNode, node)
        })
      },
      // 点击树节点
      onSelectTree: function(treeNodeData, treeNode) {
        let that = this
        that.disabled = false
        that.functionModel.functionNameField1 = ''
        let localeList = this.$store.state.lightAuth.langConfig;
        this.$refs['functionForm'].resetFields()
        let parentNode = this.getParentNode(treeNode);
        if (parentNode && parentNode.id && parentNode.id != '****') {
          this.functionModel.parentName = parentNode.data.name
          this.functionModel.supFuncId = parentNode.data.id
        } else if (parentNode && parentNode.id && parentNode.id === '****') {
          this.functionModel.parentName = '顶级'
          this.functionModel.supFuncId = '****'
        } else {
          this.$message.error(this.$t('dataAuth.failparentnode'))
        }
        this.getLangList();
        // 父级data
        // 新增节点
        this.flag = sessionStorage.getItem("locale");
        if (treeNodeData.editType === 'add') {
          this.functionModel.functionId = treeNodeData.id
          // this.functionModel.functionName = treeNodeData.name
          this.functionModel.menuType = '0'
          this.functionModel.functionType = '0'
          this.functionModel.iconClass = ''
          this.functionDataTable = ''
          this.functionModel.functionCode = ''
          this.functionModel.functionUrl = ''
          this.menuTypeIsShow = true
          this.functionModel.state = '1'
          this.functionModel.logFlag = '0'
          this.langType = false;
          // this.functionModel.functionNameField1 = treeNodeData.nameField1
          this.functionModel[this.currentfiled] = this.currentFiledVal
          this.functionModel.universalFunc = []
          // 不是新增节点
        } else {
          const loading = that.$loading();
          funManageApi.getFunction(treeNodeData.id).then(function(response) {
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
            that.functionModel.isAuthReq = data.isAuthReq
            // that.functionModel.functionNameField1 = data.functionNameField1
            that.functionModel[that.currentfiled] = data[that.currentfiled]
            that.functionModel.universalFunc = []
            for (var i = 0; i < localeList.length; i++) {
              that.localeValMap[localeList[i].langFieldMapping] = data[localeList[i].langFieldMapping];
            }
            that.langType = true;
            that.functionChange()
          }).catch(function(error) {
            loading.close();
          })
        }
      },
      // 获取父节点
      getParentNode: function(treeNode) {
        let datas = this.orgTreedata
        let pid = treeNode.data.pId
        if (pid === '****') {
          return { id: '****' }
        }
        return treeNode.parent
      },
      // 删除功能
      delFunc: function(node, data) {
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
          if (data.editType && data.editType === 'add') {
            that.$refs.functionTree.remove(data.id)
            that.clearModel()
          } else {
            funManageApi.delFunction(data.id).then(function(response) {
              if (response.data.code !== '0') {
                that.$message.error(that.$t('dataAuth.deletefail'));
              } else {
                that.$refs.functionTree.remove(data.id)
                that.clearModel()
                that.getTreeDatas()
                that.$message({
                  message: that.$t('dataAuth.deletesuccess'),
                  type: 'success'
                });
              }
            }).catch(function(error) {

            })
          }
        }).catch(() => {
          let message = that.$t('dataAuth.deletecancel')
          that.$message({
            type: 'info',
            message: message
          });
        });
      },
      handleSubmit: function(name) {
        let that = this
        let selected = this.$refs['functionTree'].getCurrentNode()
        if (!selected) {
          this.$message.error(that.$t('dataAuth.selectnode'))
          return false
        }
        // 数据传递
        this.$refs[name].validate(function(valid) {
          if (valid) {
            if (selected.editType === 'add') { // 新增
              that.operator = 'add'
            } else { // 更新
              that.operator = 'update'
            }
            // 保存时，如果菜单类型隐藏，则菜单类型字段保存为空值
            if (!that.menuTypeIsShow) {
              that.functionModel.menuType = ''
            }
            if (that.multiApp) {
              let appId = that.appModel.appId
              if (appId && appId !== '') {
                that.functionModel.appId = appId
              }
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
                let nodeId = response.data.data
                that.getTreeDatas()
                that.treeExpandedKeys = [];
                that.treeExpandedKeys.push(that.functionModel.supFuncId)
                that.currentNodeKey = nodeId
              }
            }).catch(function(error) {
              loading.close();
            })
          } else {
            that.$message.error(that.$t('dataAuth.verifefail'))
          }
        })
      },
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
          menuType: '0'
        }
      },
      handleReset: function(name) {
        this.functionModel.functionName = ''
        this.functionModel.functionName = ''
        this.functionModel.functionDesc = ''
        this.functionModel.functionUrl = ''
        this.functionModel.iconClass = ''
        this.functionModel.functionDataTable = ''
        this.functionModel.functionCode = ''
        this.functionModel.displaySeq = 1
        this.functionModel.functionType = '0'
        this.functionModel.logFlag = '0'
        this.functionModel.state = '1'
        this.functionModel.supFuncId = ''
        this.functionModel.menuType = '0'
        if (this.multiApp) {
          this.functionModel.appId = this.appModel.appId
        }
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
      clickDialog: function() {
        this.dialogFormVisible = true;
        this.langList = this.getLangList();
      },
      //获取其他语言
      getLangList: function() {
        let localeList = this.$store.state.lightAuth.langConfig;
        var currentLocale = sessionStorage.getItem("locale");
        var locales = [];
        for (var i = 0; i < localeList.length; i++) {
          if (!this.localeValMap[localeList[i].langFieldMapping]) {
            this.$set(this.localeValMap, localeList[i].langFieldMapping, localeList[i].langDefaultValue)
          }
          if (localeList[i].langCode != currentLocale) {
            locales.push(localeList[i]);
            if (!this.langType) {
              this.localeValMap[localeList[i].langFieldMapping] = localeList[i].langDefaultValue;
            }
          } else {
            this.currentfiled = localeList[i].langFieldMapping;
            this.currentFiledVal = localeList[i].langDefaultValue;
          }
        }
        // if (this.langType){
        //   for(var i = 0; i< locales.length; i++ ) {
        //   this.localeValMap[localeList[i].langFieldMapping] = this.localeValMap[localeList[i].langFieldMapping]
        //   // this.functionModel[localeList[i].langFieldMapping];

        //     //   if(locales[i].langFieldMapping === 'functionNameField1' && this.functionModel.functionNameField1) {
        //     //     locales[i].langDefaultValue = this.functionModel.functionNameField1
        //     // }else if(locales[i].langFieldMapping === 'functionName' && this.functionModel.functionName) {
        //     //     locales[i].langDefaultValue = this.functionModel.functionName
        //     // }
        //   }
        // }
        // Object.assign(this.functionModel, this.localeValMap);
        return locales
      },
      //保存其他语言
      saveDialog: function(langList) {
        this.dialogFormVisible = false;
        this.langType = true;
        var currentLocale = sessionStorage.getItem("locale");
        for (var i = 0; i < langList.length; i++) {
          this.functionModel[langList[i].langFieldMapping] = this.localeValMap[langList[i].langFieldMapping]
        }
      },
      //重置语言配置
      clearDialog: function(langList) {
        // this.dialogFormVisible = false;
        for (var i = 0; i < langList.length; i++) {
          this.localeValMap[langList[i].langFieldMapping] = '';
        }
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
</script>
<style lang="less" scoped>
  .tipText {
    padding-left: 150px;
    font-size: 12px;
    color: #999999;
  }

  .cud__tree--left,
  .cud__tree--right {
    padding: 10px 0;
  }

  .cud__button--search {
    margin: 10px;
  }

  .select-bgc {
    padding: 10px 0;
  }

  .custom-tree-node {
    display: flex;
    flex: 1;
    flex-direction: row;
    justify-content: space-between;
    padding-right: 10px;
  }

  .right {
    position: relative;
  }
  .right_float {
    position: absolute;
    z-index: 2;
    bottom: 0;
    width: 100%;
    height: 60px;
    background: #FFF;
    text-align: center
  }
</style>

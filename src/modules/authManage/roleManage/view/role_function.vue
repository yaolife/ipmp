<template>
  <el-dialog :visible.sync="modelIsOpen" v-if="modelIsOpen" :title="title" width="800" v-loading="loading">
    <el-form ref="form" :model="form" label-width="120px" label-position="left">
      <el-row>
        <!-- <el-col :span="12">
          <el-form-item label="角色组">
            <el-input v-model="form.roleGroup" size="small" placeholder="请输入角色组"></el-input>
          </el-form-item>
        </el-col> -->
        <el-col :span="12">
          <el-form-item label="角色名称">
            <el-input v-model="form.roleName" size="small" placeholder="请输入角色名称" disabled></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="角色代码">
            <el-input v-model="form.roleCode" size="small" placeholder="请输入角色代码" disabled></el-input>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="12">
          <el-form-item :label="$t('dataAuth.selectapplication')">
            <el-select size="small" v-model="form.appId" @change="appChange" @clear="appClear" clearable>
              <el-option v-for="app in appList" :value="app.appId" :key="app.appId" :label="app.appName"></el-option>
            </el-select>
          </el-form-item>
        </el-col> -->
        <!-- <el-col :span="12">
          <el-form-item label="所属应用">
            <el-select size="small" v-model="form.appId" @change="appChange" @clear="appClear" disabled clearable>
              <el-option v-for="app in appList" :value="app.appId" :key="app.appId" :label="app.appName"></el-option>
            </el-select>
          </el-form-item>
        </el-col> -->
      </el-row>
      <el-row>
        <el-col :span="12">
          <el-form-item label="功能名称">
            <el-input v-model="form.applyName" size="small" placeholder="请输入功能名称"></el-input>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="功能代码">
            <el-input v-model="form.applyCode" size="small" placeholder="请输入功能代码"></el-input>
          </el-form-item>
        </el-col>
        <!-- <el-col :span="8" align="right">
          <el-button size="small" @click="find()">{{$t("cm.query")}}</el-button>
          <el-button size="small" @click="resetForm()">{{ $t("cm.reset") }}</el-button>
        </el-col> -->
      </el-row>
      <!-- <el-row>
        <el-col>
          <el-form-item label="授权功能按钮">
            <el-checkbox-group v-model="form.authFunction">
              <el-checkbox label="新增"></el-checkbox>
              <el-checkbox label="修改"></el-checkbox>
              <el-checkbox label="删除"></el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-col>
      </el-row> -->
      <!-- <el-row>
        <el-col>
          <el-form-item label="功能授权维度">
            <el-radio-group v-model="form.objectType">
              <el-radio label="按功能角色授权"></el-radio>
              <el-radio label="按功能角色组授权"></el-radio>
            </el-radio-group>
          </el-form-item>
        </el-col>
      </el-row> -->
      <!--el-row>
          <el-radio-group v-model="selectTreeNode" @change="chengeTreeNodeData">
            <el-radio :label="0">全选</el-radio>
            <el-radio :label="1">全不选</el-radio>
        </el-radio-group>
      </el-row-->
    </el-form>
    <div style="height: 400px; overflow: scroll;">
      <el-tree ref="rolePrivilegeTree" node-key="id" :props="options" :data="rolePrivilegeTreeData"
        :filter-node-method="filterNode" :default-checked-keys="treeValue" show-checkbox :check-strictly="true" @check-change="checkChange">
      </el-tree>
    </div>
    <div slot="footer" class="dialog-footer" align="center">
      <el-button class="cud__button--reset" size="small" @click="close">{{ $t("cm.close") }}</el-button>
      <el-button class="cud__button--search" size="small" type="primary" @click="handleSubmit">{{ $t("cm.commit") }}</el-button>
    </div>
  </el-dialog>
</template>
<script>
  import rolesApi from "../api/appApi";

  export default {
    name: "configRoleFunction",
    props: {
      appList: {
        type: Array
      }
    },
    data: function() {
      return {
        modelIsOpen: false,
        treeValue: [],
        options: {
          children: "children",
          label: "name",
        },
        title: "",
        roleId: "",
        authType: "",
        showPrivilege: false,
        rolePrivilegeTreeData: [],
        rolePrivilegeLoad: false,
        form: {
          appId: '',
          roleName: '',
          roleGroup: '',
          applyName: "",
          applyCode: "",
          authFunction: [],
          objectType: "按功能角色授权",
        },
        //appList: [],
        selectTreeNode: 1,
        loading: false,
      };
    },
    computed: {
      multiApp() {
        return true;
        // if (this.$store.state.lightAuth.ifMultiApp === "1") {
        //   return true;
        // } else {
        //   return false;
        // }
      },
      applyName() {
        return this.form.applyName;
      },
      applyCode() {
        return this.form.applyCode;
      },
      authFunction() {
        return this.form.authFunction;
      },
    },
    watch: {
      modelIsOpen: function(val) {
        if (val) {
          // this.reset();
          this.query();
          // if(this.form.authFunction){
          //   this.form.authFunction = ""
          //   setTimeout(()=>{
          //   this.form.authFunction = '新增'
          //   },3000)
          // }else{
          //   setTimeout(()=>{
          //   this.form.authFunction = '新增'
          //   },3000)
          // }
        }
      },
      applyName(val) {
        this.$refs["rolePrivilegeTree"].filter(val);
      },
      applyCode(val) {
        this.$refs["rolePrivilegeTree"].filter(val);
      },
      authFunction(val) {
        this.$refs["rolePrivilegeTree"].filter(val);
      },
    },
    methods: {
      currUserAppList() {
        rolesApi.currUserAppList().then((res) => {
          this.appList = res.data.data;
          // let appItem = this.appList.find(item => {
          //   return item.appCode === 'BP'
          // })
          // this.form.appId = appItem.appId
        });
      },
      find() {
        this.currUserAppList()
        console.log(this.rolePrivilegeTreeData)
      },
      resetForm() {
        this.form.applyName = "";
        this.form.applyCode = "";
      },
      filterNode(value, data) {
        if (!value) return true;
        return data.name.indexOf(value) !== -1;
      },
      query: function() {
        // 判断多应用
        let param;
        if (this.multiApp) {
          param = {
            roleId: this.roleId,
            authType: this.authType,
            appId: this.form.appId,
          };
        } else {
          param = { roleId: this.roleId, authType: this.authType };
        }
        //设置标志，不自动勾选子级
        this.rolePrivilegeLoad = true;
        this.loading = true;
        rolesApi.rolePrivilege(param)
          .then((res) => {
            let data = res.data;
            this.rolePrivilegeTreeData = data;
            // this.chengeTreeNodeData()
            //每一项加选中
            rolesApi
              .rolePrivilegeChecks(param)
              .then((res) => {
                this.loading = false;
                let data = res.data;
                if (data.code === "0") {
                  if (data.data) {
                    let checkData = data.data;
                    checkData.forEach((i, n) => {
                      let node = this.$refs["rolePrivilegeTree"].getNode(i);
                      if (node && node != null) {
                        this.$refs["rolePrivilegeTree"].setChecked(node, true);
                      }
                    });
                    setTimeout(() => {
                      //可以自动勾选子级
                      this.rolePrivilegeLoad = false;
                    }, 200);
                  }
                } else {
                  this.$message.error(that.$t("dataAuth.faileobtain"));
                }
              })
              .catch(function(error) {
                this.loading = false;
              });
          })
          .catch(function(error) {
            this.loading = false;
          });
      },
      reset: function() {
        // this.treeValue = [];
      },
      handleSubmit: function() {
        let that = this;
        let choose = this.$refs["rolePrivilegeTree"].getCheckedNodes(false, true);
        let ids = "";
        for (let i = 0; i < choose.length; i++) {
          ids += choose[i].id + ",";
        }
        if (ids.length > 0) {
          ids = ids.substring(0, ids.length - 1);
        }
        let authType = "0";
        if (this.authType === "1") {
          authType = "1";
        }

        let objectType;
        if (that.form.objectType) {
          if (that.form.objectType === "按功能角色授权") {
            objectType = "1";
          } else if (that.form.objectType === "按功能角色组授权") {
            objectType = "2";
          }
        }
        // 判断多应用
        let params;
        if (this.multiApp) {
          let appId = this.form.appId;
          params = {
            ids: ids,
            roleId: this.roleId,
            authType: authType,
            appId: appId,
            objectType: objectType,
          };
        } else {
          params = {
            ids: ids,
            roleId: this.roleId,
            authType: authType,
            objectType: objectType,
          };
        }
        rolesApi
          .saveRolePrivilege(params)
          .then(function(res) {
            if (res.data.code === "0") {
              that.$message({
                message: res.data.msg,
                type: "success",
              });
              that.modelIsOpen = false;
            } else {
              that.$message.error(that.$t("dataAuth.authorexception"));
            }
          })
          .catch(function(error) {});
      },
      close: function() {
        // this.$confirm('取消相应的数据授权', this.$t("cm.tips"), {
        //   type: "warning",
        //   confirmButtonText: this.$t("cm.confirm"),
        //   cancelButtonText: this.$t("cm.cancel"),
        //   cancelButtonClass: "cud__button--reset",
        //   confirmButtonClass: "cud__button--search"
        // }).then(() => {
          this.modelIsOpen = false;
        // }).catch(error => {
        //   console.log(error)
        // });

      },
      appClear: function() {
        this.tableShow = false;
      },
      appChange() {
        this.query()
      },
      chengeTreeNodeData() {
        if (this.selectTreeNode === 1) {
          this.$refs.rolePrivilegeTree.setCheckedKeys([]);
        } else {
          this.rolePrivilegeTreeData.map(item => {
            this.treeValue.push(item.id)
          })
        }
      },
      //遍历勾选所有后代
      checkAllChildren(node, value) {
        node.children.map((item) => {
          if (value === true) {
            this.$refs.rolePrivilegeTree.setChecked(item.id, true);
          } else {
            this.$refs.rolePrivilegeTree.setChecked(item.id, false);
          }
          if (item.children) {
            this.checkAllChildren(item, value);
          }
        })
      },
      //节点点击事件
      checkChange(node, value, indeterminate) {
        if (this.rolePrivilegeLoad) {
          //第一次加载时不对children进行操作
          this.rolePrivilegeLoad = false;
          return;
        }
        if (node.children) {
          //二级
          // node.children.map((item) => {
          //   if (value === true) {
          //     this.$refs.rolePrivilegeTree.setChecked(item.id, true);
          //   } else {
          //     this.$refs.rolePrivilegeTree.setChecked(item.id, false);
          //   }
          // })
          //勾选所有后代
          this.checkAllChildren(node, value);
        }
      },
    },
  };
</script>

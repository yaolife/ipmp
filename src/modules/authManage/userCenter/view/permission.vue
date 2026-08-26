<template>
  <div class="cud-commom-form-style">
    <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div class="cud__scroll--div">
      <el-card>
       <!-- <el-row>
          <el-col :span="12">
            <el-form label-width="200px" label-position="left">
              <el-form-item label="请选择查询的应用:">
                <el-select v-model="appSelected" size="small" @change="appChange">
                  <el-option v-for="app in appList" :key="app.appId" :label="app.appName" :value="app.appId">
                    {{app.appName}}
                  </el-option>
                </el-select>
              </el-form-item>
            </el-form>
          </el-col>
        </el-row> -->
        <el-row style="padding-top: 20px;">
          <el-col :span="24">
            <el-table :data="menuData" :tree-props="{ children: 'children', hasChildren: true }" :height="maxTableHeight" ref="menuTable" row-key="menuId" :empty-text="$t('cm.nodata')">
              <el-table-column prop="menuName" label="功能名称" min-width="200" align="left">
                <template slot-scope="scope">
                  <span style="padding-left: 30px;">{{scope.row.menuName}}</span>
                </template>
              </el-table-column>
              <el-table-column prop="menuCode" label="功能编码" min-width="200"></el-table-column>
              <el-table-column prop="menuType" label="功能类型" min-width="200">
                <template slot-scope="scope">
                  <span v-if="scope.row.menuType === '0'">菜单</span>
                  <span v-if="scope.row.menuType === '1'">按钮</span>
                </template>
              </el-table-column>
              <el-table-column prop="menuType" label="功能状态">
                <template slot-scope="scope">可用</template>
              </el-table-column>
            </el-table>
          </el-col>
        </el-row>
      </el-card>
    </div>
  </div>
</template>

<script>
  import api from "../api/index";
  import { throttle } from "@/utils/funcUtil";
  import breadcrumb from "@/components/common/breadcrumb";
  import { calcHeight } from "@/utils/funcUtil";

  export default {
    components: {
      breadcrumb
    },
    data() {
      return {
        hasIcon: false,
        brand: [{ name: "dataAuth.user_manage" }, { name: "权限查询" }],
        maxTableHeight: 0,
        menuData: [],
        appList: [],
        appSelected: '',
      }
    },
    mounted() {
      //查询应用列表
      //this.getAppList();
      //查询权限
      this.getAppPermission();
      //设置表格高度
      this.initMaxHeight();
      // throttleFunc记录当前的节流方法，用于在页面销毁时释放
      this.throttleFunc = throttle(this.initMaxHeight, 500);
      window.addEventListener("resize", this.throttleFunc);
    },
    beforeDestroy() {
      window.addEventListener("resize", this.throttleFunc);
    },
    methods: {
      // 动态计算高度
      initMaxHeight() {
        calcHeight(this, -90);
      },
      //查询应用列表
      getAppList() {
        const loading = this.$loading();
        let _this = this;
        let params = {
          isQueryAll: true,
          pageSize: 100,
          pageIndex: 0,
        }
        api.getAppList(params).then(res => {
          loading.close();
          if (res.data.code === "0") {
            _this.appList = res.data.data;
            _this.appSelected = _this.appList[0].appId;
            _this.appChange();
          } else {
            _this.$message.error(res.data.msg);
          }
        }).catch((res) => {
          loading.close();
        });
      },
      //切换应用
      appChange() {
        this.getAppPermission();
      },
      //查询当前用户权限
      getAppPermission() {
        const loading = this.$loading();
        let _this = this;
        let params = { applicationId: _this.appSelected };
        api.getAppPermission(params).then(res => {
          loading.close();
          if (res.data.code === "0") {
            _this.menuData = res.data.data;
          } else {
            _this.menuData = [];
            //_this.$message.error(res.data.msg);
          }
        }).catch((res) => {
          loading.close();
        });
      },
    }
  };
</script>
<style lang="less" scoped>
  // @import "src/assets/css/style";
  /deep/.el-table .el-table__expand-icon {
    // top: 0px !important;
  }
</style>

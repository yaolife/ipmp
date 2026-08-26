<!--
 * @Author: [P631038]杨旭
 * @LastEditors: [P631038]杨旭
 * @Description: 
-->
<template>
  <div>
    <el-button type="text" @click="openDialog">点击打开 Dialog</el-button>
    <el-dialog
      title="提示"
      :visible.sync="dialogVisible"
      width="60%"
      center
      :fullscreen="isfullscreen"
    >
      <!-- 头部插槽 -->
      <template slot="title">
        <span class="el-dialog__title">请选择</span>
        <vxe-button
          style="margin-right: 20px; margin-top: 8px; color: #a3a3a3"
          :icon="isfullscreen ? 'vxe-icon-zoom-in' : 'vxe-icon-fullscreen'"
          @click="isfullscreen = !isfullscreen"
          mode="text"
        ></vxe-button>
      </template>

      <el-row>
        <el-col :span="14" class="left-main">
          <!-- 左侧主体 -->
          <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="最近" name="1">
              <div class="pd-16">最近</div>
            </el-tab-pane>
            <el-tab-pane label="组织架构" name="2">
              <div class="pd-16" v-loading="loading">
                <el-input
                  style="margin-bottom: 10px"
                  placeholder="请输入姓名/首字母/全拼/姓名拼音/工号"
                  v-model="leftInput"
                  size="small"
                  @input="search"
                  @blur="handleBlur"
                >
                  <i slot="prefix" class="el-input__icon el-icon-search"></i>
                </el-input>
                <div
                  style="
                    height: 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: start;
                  "
                >
                  <transition name="el-fade-in">
                    <span
                      v-if="isShow"
                      style="
                        float: left;
                        margin-top: -2px;
                        color: #f56c6c;
                        font-size: 12px;
                        line-height: 1;
                      "
                      >{{ tipText }}</span
                    >
                    <span v-else style="margin-top：-5px">{{
                      activeName === "4" ? "待选人员" : "组织"
                    }}</span>
                  </transition>
                  <div v-if="leftList.length > 0" style="margin-top: -5px">
                    <el-tooltip
                      content="选择当页"
                      placement="top"
                      effect="light"
                    >
                      <img
                        style="cursor: pointer"
                        :src="require('@/assets/img/selectAll.svg')"
                        width="16px"
                        @click="selectAll"
                      />
                    </el-tooltip>
                    <el-tooltip
                      content="取消当页"
                      placement="top"
                      effect="light"
                    >
                      <img
                        style="margin-left: 6px; cursor: pointer"
                        :src="require('@/assets/img/deselectAll.svg')"
                        width="16px"
                        @click="deselectAll"
                      />
                    </el-tooltip>
                  </div>
                </div>
                <!-- list -->
                <el-row>
                  <el-col :span="12" style="height: 374px; overflow: auto">
                    <el-tree
                      :data="data"
                      :props="defaultProps"
                      @node-expand="getOrgTreeForHr"
                      :filter-node-method="filterNode"
                      highlight-current
                      expand-on-click-node
                      :show-checkbox="false"
                      check-strictly
                      ref="tree"
                      :lazy="true"
                      node-key="id"
                    >
                      <span
                        slot-scope="{ node }"
                        class="orgTree showName"
                        :title="node.label"
                        v-text="node.label"
                      ></span>
                    </el-tree>
                  </el-col>
                  <el-col :span="12" style="height: 374px; overflow: auto">
                    <div v-if="leftList.length > 0" class="left-content">
                      <div
                        class="content-css"
                        v-for="(item, index) in leftList"
                        :key="index"
                        @click="leftClick(item, index)"
                      >
                        <div class="name-css">{{ item.userName }}</div>
                        <div class="dept-css">
                          {{ item.workDeptName }}
                        </div>
                        <i
                          v-if="item.selected"
                          class="el-icon-circle-check icon-css-2"
                        ></i>
                        <i
                          v-else
                          class="el-icon-circle-check-outline icon-css"
                        ></i>
                      </div>
                    </div>

                    <div v-else class="left-content">
                      <div class="img-css1">
                        <img
                          :src="require('@/assets/img/empty.png')"
                          width="140"
                          height="140"
                          alt=""
                        />
                        <div>暂无数据</div>
                      </div>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </el-tab-pane>
            <el-tab-pane label="同部门" name="3">
              <div class="pd-16">同部门</div>
            </el-tab-pane>
            <el-tab-pane label="所有人" name="4">
              <div class="pd-16" v-loading="loading">
                <el-input
                  style="margin-bottom: 10px"
                  placeholder="请输入姓名/首字母/全拼/姓名拼音/工号"
                  v-model="leftInput"
                  size="small"
                  @input="search"
                  @blur="handleBlur"
                >
                  <i slot="prefix" class="el-input__icon el-icon-search"></i>
                </el-input>
                <div
                  style="
                    height: 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: start;
                  "
                >
                  <transition name="el-fade-in">
                    <span
                      v-if="isShow"
                      style="
                        float: left;
                        margin-top: -2px;
                        color: #f56c6c;
                        font-size: 12px;
                        line-height: 1;
                      "
                      >{{ tipText }}</span
                    >
                    <span v-else style="margin-top：-5px">{{
                      "待选人员"
                    }}</span>
                  </transition>
                  <div v-if="leftList.length > 0" style="margin-top: -5px">
                    <el-tooltip
                      content="选择当页"
                      placement="top"
                      effect="light"
                    >
                      <img
                        style="cursor: pointer"
                        :src="require('@/assets/img/selectAll.svg')"
                        width="16px"
                        @click="selectAll"
                      />
                    </el-tooltip>
                    <el-tooltip
                      content="取消当页"
                      placement="top"
                      effect="light"
                    >
                      <img
                        style="margin-left: 6px; cursor: pointer"
                        :src="require('@/assets/img/deselectAll.svg')"
                        width="16px"
                        @click="deselectAll"
                      />
                    </el-tooltip>
                  </div>
                </div>
                <!-- list -->
                <div v-if="leftList.length > 0" class="left-content">
                  <div
                    class="content-css"
                    v-for="(item, index) in leftList"
                    :key="index"
                    @click="leftClick(item, index)"
                  >
                    <div class="name-css">{{ item.userName }}</div>
                    <div class="dept-css">
                      {{ item.dept }}
                    </div>
                    <i
                      v-if="item.selected"
                      class="el-icon-circle-check icon-css-2"
                    ></i>
                    <i v-else class="el-icon-circle-check-outline icon-css"></i>
                  </div>
                </div>

                <div v-else class="left-content">
                  <div class="img-css1">
                    <img
                      :src="require('@/assets/img/empty.png')"
                      width="140"
                      height="140"
                      alt=""
                    />
                    <div>暂无数据</div>
                  </div>
                </div>
              </div>
            </el-tab-pane>
            <el-tab-pane label="群组" name="5">
              <div class="pd-16">群组</div>
            </el-tab-pane>
          </el-tabs>
        </el-col>
        <!-- 右侧主体 -->
        <el-col :span="10" class="right-main">
          <div>
            <el-input
              style="margin-bottom: 10px"
              placeholder="请输入关键词"
              v-model="rightInput"
              size="small"
              @input="handleRightSearch"
            >
              <i slot="prefix" class="el-input__icon el-icon-search"></i>
            </el-input>
            <div
              v-if="rightInput && searchResults.length > 0"
              style="height: 445px; overflow: auto"
            >
              <div
                class="content-css"
                v-for="(item, index) in searchResults"
                :key="index"
                @click="rightClick(item, index)"
              >
                <div class="name-css">{{ item.userName }}</div>
                <div class="dept-css">
                  {{ item.dept }}
                </div>
                <i class="el-icon-circle-close icon-css"></i>
              </div>
            </div>

            <div
              v-else-if="rightList.length > 0 && rightInput == ''"
              style="height: 445px; overflow: auto"
            >
              <div
                class="content-css"
                v-for="(item, index) in rightList"
                :key="index"
                @click="rightClick(item, index)"
              >
                <div class="name-css">{{ item.userName }}</div>
                <div class="dept-css">
                  {{ item.dept }}
                </div>
                <i class="el-icon-circle-close icon-css"></i>
              </div>
            </div>

            <div v-else class="img-css">
              <img
                :src="require('@/assets/img/empty.png')"
                width="140"
                height="140"
                alt=""
              />
              <div>暂无已选数据</div>
              <div v-if="!rightInput">请从左侧选择需要添加的内容</div>
            </div>
          </div>
        </el-col>
      </el-row>

      <!-- 底部插槽 -->
      <span slot="footer" class="dialog-footer">
        <el-row>
          <el-col :span="14" class="footer-col">
            <el-pagination
              small
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="currentPage"
              :page-sizes="[10, 20, 50, 100]"
              :page-size="10"
              :pager-count="5"
              layout="total,prev,pager, next,sizes"
              :total="total"
            >
            </el-pagination>
          </el-col>
          <el-col :span="10" style="text-align: right">
            <el-button @click="handleClear">清空已选</el-button>
            <el-button type="primary" @click="dialogVisible = false">{{
              `确认( ${rightList.length} )`
            }}</el-button>
          </el-col>
        </el-row>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from "@/components/cudCommPersonComponent/common";
export default {
  components: {},
  props: {
    showDialog1: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      dialogVisible: false,
      isfullscreen: false, // 弹出框全屏
      activeName: "4", // 当前标签页的下标
      leftInput: "",
      rightInput: "",
      pageNum: 1,
      pageSize: 10,
      currentPage: 1,
      total: 0,
      loading: false,
      leftList: [],
      rightList: [],
      searchResults: [],
      isShow: false,
      tipText: "查询参数不能少于3个字符、中文不能小于2个字符",
      deptNo: "00888888",
      keyword: "",
      leftLoading: false,
      data: [],
      defaultProps: {
        children: "children",
        label: "label",
      },
      leftUserList: [],
      clickTree: "",
    };
  },
  watch: {
    showDialog1: {
      handler(val) {
        if (val) {
          this.dialogVisible = val;
        }
      },
    },
  },
  mounted() {
    this.syncSelectionToLeft();

    // this.data = this.getOrgTreeForHr();
  },
  methods: {
    openDialog() {
      this.dialogVisible = true;
      this.data = this.getOrgTreeForHr();
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    createData(data) {
      let arr = [];
      data.forEach((item) => {
        arr.push({
          userName: item.empName,
          userId: item.empId,
          dept: item.workDeptNamePath,
          workDeptName: item.workDeptName,
          userPhone: item.mobilePhone1,
          selected: false,
        });
      });
      this.leftList = arr;
    },
    getOrgTreeForHr(data, node, cur) {
      let param = { orgId: this.deptNo, keyword: this.keyword };
      let status = 0;
      if (data) {
        //点击树节点时
        param = {
          orgId: data.id,
          keyword: this.keyword,
          pageNum: this.currentPage,
          pageSize: this.pageSize,
        };
        this.clickTree = data.id;
        status = 1;
        this.leftLoading = true;
        api.getStaffsByOrgId(param).then((res) => {
          this.leftLoading = false;
          this.total = res.data.total;
          this.currentPage = res.data.current;
          this.leftUserList = res.data.data;

          console.log("[ 111111111111111111 ]-421", res.data.data);
          this.createData(this.leftUserList);
        });

        api.getOrgTreeForOrgWidget(param).then((res) => {
          const totalData = res.data.data;

          console.log("[ 2222222222222222 ]-428", totalData);
          let arr = [];
          if (totalData && status == 0) {
            for (let i = 0; i < totalData.length; i++) {
              arr.push({
                id: totalData[i].deptNo,
                label: totalData[i].orgName,
                children: [],
                deptIdPath: totalData[i].deptIdPath,
              });
            }
            this.data = arr;
          }
        });
      } else {
        //第一次加载时
        api.getOrgTreeForOrgWidget(param).then((res) => {
          const totalData = res.data.data;
          let arr = [];
          if (totalData && status == 0) {
            for (let i = 0; i < totalData.length; i++) {
              arr.push({
                id: totalData[i].deptNo,
                label: totalData[i].orgName,
                children: [],
                deptIdPath: totalData[i].deptIdPath,
              });
            }

            this.data = arr;
          }
        });
      }
    },

    handleClick(tab, event) {
      console.log(tab, event);
    },
    handleSizeChange(val) {
      console.log(`每页 ${val} 条`);
      this.pageSize = val;
      this.search(this.leftInput);
    },
    handleCurrentChange(val) {
      console.log(`当前页: ${val}`);

      console.log("[ this.activeName ]-489", this.activeName);
      if (this.activeName === "4") {
        this.pageNum = val;
        this.search(this.leftInput);
      } else if (this.activeName === "2") {
        this.pageNum = val;
        this.orgSearch("");
      }
    },
    /** 左侧列表的点击事件 */
    leftClick(item, index) {
      console.log("[ item,index ]-150", item, index);
      item.selected = !item.selected;
      if (item.selected) {
        // 如果选中，添加到右侧列表
        this.rightList.push(item);
      } else {
        // 如果取消选中，从右侧列表中移除
        this.rightClick(item);
      }
    },
    /** 右侧列表的点击事件 */
    rightClick(item, index) {
      this.rightList = this.rightList.filter(
        (rightItem) => rightItem.userId !== item.userId
      );
      // 在左侧列表中取消选中状态
      const leftItem = this.leftList.find(
        (leftItem) => leftItem.userId === item.userId
      );
      if (leftItem) {
        leftItem.selected = false;
      }
    },
    // 全选
    selectAll() {
      this.leftList.forEach((item) => {
        if (!item.selected) {
          item.selected = true;
          this.rightList.push(item);
        }
      });
    },
    // 取消全选
    deselectAll() {
      this.leftList.forEach((item) => {
        if (item.selected) {
          item.selected = false;
        }
      });
      this.rightList = [];
    },
    // 将右侧选中状态同步到左侧列表
    syncSelectionToLeft() {
      this.leftList.forEach((item) => {
        item.selected = false;
      });

      this.rightList.forEach((rightItem) => {
        const leftItem = this.leftList.find(
          (item) => item.userId === rightItem.userId
        );
        if (leftItem) {
          leftItem.selected = true;
        }
      });
    },
    // 右侧模糊搜索
    handleRightSearch() {
      if (this.rightInput.trim() === "") {
        this.searchResults = [];
        return;
      }

      const query = this.rightInput.toLowerCase();
      this.searchResults = this.rightList.filter(
        (item) =>
          item.userName.toLowerCase().includes(query) ||
          item.userId.toLowerCase().includes(query)
      );
    },
    /** 清空已选 */
    handleClear() {
      this.rightList = [];
      this.leftList.forEach((item) => {
        item.selected = false;
      });
    },
    search(val) {
      if (val == "" || this.leftList == []) {
        this.isShow = false;
        this.leftList = [];
        return;
      }
      if ((/[\u4e00-\u9fa5]/.test(val) && val.length >= 2) || val.length >= 3) {
        this.isShow = false;
        if (val !== "") {
          this.loading = true;
          let timer = setTimeout(() => {
            api
              .getStaffsByOrgId({
                orgId: this.clickTree || "00888888",
                keyword: val,
                pageNum: this.pageNum,
                pageSize: this.pageSize,
              })
              .then((res) => {
                let arr = [];
                let { code, data, total } = res.data;
                if (code == "0" || code == "200") {
                  this.loading = false;
                  data.forEach((item) => {
                    arr.push({
                      userName: item.empName,
                      userId: item.empId,
                      dept: item.workDeptNamePath,
                      workDeptName: item.workDeptName,
                      userPhone: item.mobilePhone1,
                      selected: false,
                    });
                  });
                  this.leftList = arr;
                  this.total = total;
                  this.$nextTick(() => {
                    this.syncSelectionToLeft();
                    this.activeName = "4";
                  });
                }
              })
              .catch((err) => {
                this.loading = false;
              });
            clearTimeout(timer);
          }, 500);
        }
      } else {
        this.tipText = /[\u4e00-\u9fa5]/.test(val)
          ? this.$t("查询参数不能少于3个字符、中文不能小于2个字符")
          : this.$t("查询参数不能少于3个字符");
        this.leftList = [];
        this.isShow = true;
      }
    },
    orgSearch() {
      api
        .getStaffsByOrgId({
          orgId: this.clickTree || "00888888",
          keyword: "",
          pageNum: this.pageNum,
          pageSize: this.pageSize,
        })
        .then((res) => {
          let arr = [];
          let { code, data, total } = res.data;
          if (code == "0" || code == "200") {
            this.loading = false;
            data.forEach((item) => {
              arr.push({
                userName: item.empName,
                userId: item.empId,
                dept: item.workDeptNamePath,
                workDeptName: item.workDeptName,
                userPhone: item.mobilePhone1,
                selected: false,
              });
            });
            this.leftList = arr;
            this.total = total;
            this.$nextTick(() => {
              this.syncSelectionToLeft();
            });
          }
        })
        .catch((err) => {
          this.loading = false;
        });
    },
    /** 失焦事件 */
    handleBlur() {
      this.isShow = false;
    },
  },
};
</script>
<style lang="less" scoped>
/deep/.el-dialog__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #999999;
  line-height: 38px;
  background: #f0f1f4;
}
/deep/.el-dialog--center .el-dialog__body {
  padding: 0;
}
/deep/.el-tabs {
  margin: 0 !important;
}
/deep/.el-tabs__item {
  color: #a5a5a5;
}
/deep/.el-tabs__nav {
  padding-left: 16px;
}
/deep/.el-tabs__active-bar {
  margin-left: 15px;
}
.pd-16 {
  padding: 10px 12px;
}
.left-main {
  height: 500px;
  position: relative;
}
.left-content {
  height: 372px;
  overflow: auto;
}
.right-main {
  border-left: 1px solid #e4e7ed;
  height: 500px;
  border-bottom: 1px solid #e4e7ed;
  padding: 10px 12px;
}
.content-css {
  position: relative;
  height: 40px;
  padding: 8px 10px;
  border-bottom: 1px dashed #d8d3d3;
  cursor: pointer;
}
:hover.content-css {
  position: relative;
  height: 40px;
  padding: 8px 10px;
  border-bottom: 1px dashed #d8d3d3;
  background-color: #f0f1f4;
  cursor: pointer;
}

.name-css {
  color: #5d5d5e;
}
.dept-css {
  font-size: 12px;
  color: #a3a3a5;
  white-space: nowrap;
  max-width: 95%;
  overflow: hidden;
  text-overflow: ellipsis;
}
.icon-css {
  color: rgb(168, 169, 171);
  position: absolute;
  font-size: 16px;
  right: 10px;
  top: 23px;
  cursor: pointer;
}
.icon-css-2 {
  color: #0775db;
  position: absolute;
  font-size: 16px;
  right: 10px;
  top: 23px;
  cursor: pointer;
}
.footer-col {
  position: relative;
  display: flex;
}
.footer-col::after {
  content: "";
  position: absolute;
  height: 53px;
  top: -11px;
  right: -3.5px;
  border-right: 1px solid #e4e7ed;
}
.img-css {
  height: 345px;
  overflow: auto;
  text-align: center;
  margin-top: 78px;
  color: #bbb;
}
.img-css1 {
  height: 270px;
  overflow: auto;
  text-align: center;
  margin-top: 76px;
  color: #bbb;
}
.showName {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;
  height: 34px;
  line-height: 34px;
}
/deep/.el-icon-circle-check:before {
  content: "\e639" !important;
}
/deep/.el-pagination--small button,
/deep/.el-pagination--small span:not([class*="suffix"]) {
  font-size: 12px;
  color: #a3a3a5;
  height: 22px;
  line-height: 20px;
}
/deep/.el-pagination .el-select .el-input .el-input__inner {
  height: 24px;
}
/deep/.el-dialog__footer {
  padding: 10px 15px 10px;
}
</style>
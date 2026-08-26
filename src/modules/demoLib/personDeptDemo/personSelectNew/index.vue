<!--
 * @Author: [P631038]杨旭
 * @LastEditors: [P631038]杨旭
 * @Description: 
-->
<template>
  <div>
    <!-- v-if="dialogVisible" -->
    <el-dialog
      title="提示"
      :visible.sync="dialogVisible"
      width="60%"
      center
      :fullscreen="isfullscreen"
      @close="closeDialog"
    >
      <!-- 头部插槽 -->
      <template slot="title">
        <span class="el-dialog__title">{{
          !multiple ? "请选择(单选)" : "请选择(多选)"
        }}</span>
        <vxe-button
          style="margin-right: 20px; margin-top: 8px; color: #a3a3a3"
          :icon="isfullscreen ? 'vxe-icon-zoom-in' : 'vxe-icon-fullscreen'"
          @click="isfullscreen = !isfullscreen"
          mode="text"
        ></vxe-button>
      </template>
      <el-col
        :span="14"
        class="left-main"
        :style="{
          borderBottom: activeName == '2' ? '1px solid #e4e7ed' : 'none'
        }"
      >
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <!-- <el-tab-pane label="最近" name="1">
            <tab1
              v-if="activeName == '1' && dialogVisible"
              ref="tab1"
              :multiple="multiple"
              @leftClick="leftClick"
              @setTotal="setTotal"
              @selectAll="selectAll"
              @deselectAll="deselectAll"
              @syncSelectionToLeft="syncSelectionToLeft"
            />
          </el-tab-pane> -->
          <el-tab-pane label="组织架构" name="2">
            <tab2
              v-if="activeName == '2' && dialogVisible"
              ref="tab2"
              :multiple="multiple"
              @leftClick="leftClick"
              @setTotal="setTotal"
              @selectAll="selectAll"
              @deselectAll="deselectAll"
              @syncSelectionToLeft="syncSelectionToLeft"
            />
          </el-tab-pane>
          <el-tab-pane label="同部门" name="3">
            <tab3
              v-if="activeName == '3' && dialogVisible"
              ref="tab3"
              :multiple="multiple"
              @leftClick="leftClick"
              @setTotal="setTotal"
              @selectAll="selectAll"
              @deselectAll="deselectAll"
              @syncSelectionToLeft="syncSelectionToLeft"
            />
          </el-tab-pane>
          <el-tab-pane label="所有人" name="4">
            <tab4
              v-if="activeName == '4' && dialogVisible"
              ref="tab4"
              :multiple="multiple"
              @leftClick="leftClick"
              @setTotal="setTotal"
              @selectAll="selectAll"
              @deselectAll="deselectAll"
              @syncSelectionToLeft="syncSelectionToLeft"
            />
          </el-tab-pane>
          <el-tab-pane label="群组" name="5">
            <tab5
              v-if="activeName == '5' && dialogVisible"
              ref="tab5"
              :multiple="multiple"
              @leftClick="leftClick"
              @setTotal="setTotal"
              @selectAll="selectAll"
              @deselectAll="deselectAll"
              @syncSelectionToLeft="syncSelectionToLeft"
            />
          </el-tab-pane>
        </el-tabs>
        <!-- <tab5 v-if="activeNum == 5" ref="tab5" @tabClick="tabClick" /> -->
      </el-col>
      <!-- 右侧主体 -->
      <el-col :span="10" class="right-main">
        <div v-if="!multiple" style="margin-left: 10px; margin-bottom: 10px">
          已选列表
        </div>
        <div>
          <el-input
            v-if="multiple"
            style="margin-bottom: 10px"
            placeholder="请输入关键词"
            v-model="rightInput"
            size="small"
            clearable
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
                {{ item.workDeptNamePath }}
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
                {{ item.workDeptNamePath }}
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

      <!-- 底部插槽 -->
      <span slot="footer" class="dialog-footer">
        <el-row>
          <el-col
            v-if="activeName !== '5' && activeName !== '4'"
            :span="14"
            class="footer-col"
          >
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
          <el-col v-else :span="14" style="height: 26px">{{ " " }}</el-col>
          <el-col :span="10" style="text-align: right">
            <el-button @click="handleClear">清空已选</el-button>
            <el-button type="primary" @click="onSubmit">{{
              `确认( ${rightList.length} )`
            }}</el-button>
          </el-col>
        </el-row>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import tab1 from "./components/tab1.vue";
import tab2 from "./components/tab2.vue";
import tab3 from "./components/tab3.vue";
import tab4 from "./components/tab4.vue";
import tab5 from "./components/tab5.vue";
import api from "@/components/cudCommPersonComponent/common";
export default {
  components: {
    tab1,
    tab2,
    tab3,
    tab4,
    tab5
  },
  props: {
    showDialog: {
      type: Boolean,
      default: false
    },
    initUserId: {
      type: String,
      default: ""
    },
    multiple: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      dialogVisible: false,
      isfullscreen: false, // 弹出框全屏
      pageNum: 1,
      pageSize: 10,
      currentPage: 1,
      total: 0,
      loading: false,
      isShow: false,
      activeName: "4", // 当前标签页的下标
      rightInput: "",
      rightList: [],
      searchResults: []
    };
  },
  watch: {
    showDialog: {
      handler(val) {
        if (val) {
          this.dialogVisible = val;
          this.$nextTick(() => {
            this.handleClear();
            if (this.initUserId) {
              this.isEdit(this.initUserId);
            }
          });
        }
      }
    }
    // initUserId(newVal) {
    //   if (newVal) {
    //     this.isEdit(newVal);
    //   }
    // },
  },

  created() {},
  mounted() {
    // if (this.initUserId) {
    //   this.isEdit(this.initUserId);
    // }
  },
  methods: {
    isEdit(ids) {
      const params = {
        userId: ids
      };
      api.getStaffTysInfos(params).then(res => {
        let data = res.data.data;
        this.rightList = data;
        this.$refs[`tab4`].getHistoryUser();
      });
    },
    handleClick(tab, event) {
      console.log(tab, event);
      this.$emit("tabClick", this.activeName);
      this.total = 0;
    },
    onSubmit() {
      if (this.rightList && this.rightList.length > 0) {
        if (this.rightList.length > 10) {
          let list = JSON.parse(JSON.stringify(this.rightList));
          list.splice(0, 10);
          api.userRecord(list).then(res => {});
        } else {
          api.userRecord(this.rightList).then(res => {});
        }
      }
      this.$emit("submitList", this.rightList);
      this.dialogVisible = false;
      // 最近人员添加
    },

    setTotal(total) {
      this.total = total;
    },
    handleSizeChange(val) {
      this.$refs[`tab${this.activeName}`].handleSizeChange(val);
    },
    handleCurrentChange(val) {
      this.$refs[`tab${this.activeName}`].handleCurrentChange(val);
    },
    /** 清空已选 */
    handleClear() {
      this.rightList = [];
      this.rightInput = "";
      this.$refs[`tab${this.activeName}`].handleClear();
    },
    closeDialog() {
      console.log("[ this.dialogVisible ]-785", this.dialogVisible);
      this.currentPage = 1;
      this.total = 0;
      this.pageSize = 10;
      this.activeName = "4";
      this.dialogVisible = false;
      this.$emit("close");
    },
    /** 左侧列表的点击事件 */
    leftClick(item, leftList) {
      if (!this.multiple) {
        leftList.forEach(listItem => {
          listItem.selected = false;
        });
        item.selected = true;
        this.rightList = [item];
      } else {
        item.selected = !item.selected;
        if (item.selected) {
          this.rightList.push(item);
        } else {
          this.rightClick(item);
        }
      }
    },
    /** 右侧列表的点击事件 */
    rightClick(item, index) {
      this.rightInput = "";
      this.rightList = this.rightList.filter(
        rightItem => rightItem.userId !== item.userId
      );
      this.$refs[`tab${this.activeName}`].rightClick(item);
    },
    // 右侧模糊搜索
    handleRightSearch() {
      if (this.rightInput.trim() === "") {
        this.searchResults = [];
        return;
      }
      const query = this.rightInput.toLowerCase();
      this.searchResults = this.rightList.filter(
        item =>
          item.userName.toLowerCase().includes(query) ||
          item.userId.toLowerCase().includes(query)
      );
    },
    selectAll(list) {
      // 去重
      const arr1 = list;
      const arr2 = this.rightList;
      const idSet = new Set([...arr1, ...arr2].map(item => item.userId));
      const result = Array.from(idSet).map(userId =>
        [...arr1, ...arr2].find(item => item.userId === userId)
      );
      console.log(result);
      this.rightList = result;
    },
    deselectAll(list) {
      const filteredRight = this.rightList.filter(
        rightItem =>
          !list.some(leftItem => leftItem.userId === rightItem.userId)
      );
      this.rightList = filteredRight;
    },
    // 将右侧选中状态同步到左侧列表
    syncSelectionToLeft(leftList) {
      console.log("[ 2222 ]-360", leftList);
      leftList.forEach(item => {
        item.selected = false;
      });

      console.log("[ 33 ]-365", this.rightList);
      this.rightList.forEach(rightItem => {
        const leftItem = leftList.find(
          item => item.userId === rightItem.userId
        );
        if (leftItem) {
          leftItem.selected = true;
        }
      });
      this.$refs[`tab${this.activeName}`].setLeftList(leftList);
    }
  }
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
// /deep/.el-icon-circle-check:before {
//   content: "\e639" !important;
// }
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
/deep/.el-pagination--small .el-pager li {
  line-height: 20px;
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
/deep/ .el-input__suffix {
  margin-right: 0px !important;
}
</style>

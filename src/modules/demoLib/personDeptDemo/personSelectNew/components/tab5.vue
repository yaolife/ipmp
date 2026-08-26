<!--
 * @Author: [P631038]杨旭
 * @LastEditors: [P631038]杨旭
 * @Description: 
-->
<template>
  <div>
    <el-row>
      <!-- 左侧主体 -->
      <div v-loading="loading">
        <div class="pd-16">
          <el-input
            placeholder="请输入姓名/工号 ( 仅搜索群组内的人员 )"
            v-model="leftInput"
            size="small"
            clearable
            @blur="handleBlur"
            @input="handleLeftSearch"
          >
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
        </div>
        <el-row
          style="
            border-top: 1px solid #e4e7ed;
            border-bottom: 1px solid #e4e7ed;
          "
        >
          <el-col :span="12" style="height: 406px; overflow: auto">
            <div class="header-title">
              <span>我的群组</span>
              <!-- <span class="font-css" @click="createGroup"
                ><i class="el-icon-plus i-css"></i>新建</span
              > -->
            </div>

            <div>
              <div v-for="(item, index) in data" :key="index">
                <div
                  :class="activeIndex === index ? 'left-group1' : 'left-group'"
                  @click="leftGroupClick(item, index)"
                >
                  <img
                    style="margin-left: 6px; margin-right: 6px; cursor: pointer"
                    :src="require('@/assets/img/qunzu.svg')"
                    width="18px"
                  />
                  <span>{{ item.groupName }}({{ item.groupUserCount }})</span>
                </div>
              </div>
            </div>
          </el-col>
          <el-col
            v-loading="loading1"
            :span="12"
            style="
              height: 406px;
              overflow: auto;
              border-left: 1px solid rgb(228, 231, 237);
            "
          >
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: start;
                margin: 5px 10px;
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
                <span v-else style="margin-top：-5px">{{ "待选人员" }}</span>
              </transition>
              <div v-if="leftList.length > 0 && multiple">
                <el-tooltip content="选择当页" placement="top" effect="light">
                  <img
                    style="cursor: pointer"
                    :src="require('@/assets/img/selectAll.svg')"
                    width="16px"
                    @click="selectAll"
                  />
                </el-tooltip>
                <el-tooltip content="取消当页" placement="top" effect="light">
                  <img
                    style="margin-left: 6px; cursor: pointer"
                    :src="require('@/assets/img/deselectAll.svg')"
                    width="16px"
                    @click="deselectAll"
                  />
                </el-tooltip>
              </div>
            </div>

            <div
              v-if="leftInput && searchResults.length > 0"
              class="left-content"
            >
              <div
                class="content-css"
                v-for="(item, index) in searchResults"
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
                <i v-else class="el-icon-circle-check-outline icon-css"></i>
              </div>
            </div>

            <div
              v-else-if="leftList.length > 0 && leftInput == ''"
              class="left-content"
            >
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
          </el-col>
        </el-row>
      </div>
    </el-row>
    <el-dialog
      title="提示"
      :visible.sync="dialogGroupVisible"
      width="60%"
      center
      append-to-body
    >
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogGroupVisible = false">取 消</el-button>
        <el-button type="primary" @click="dialogGroupVisible = false"
          >确 定</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from "../api";
// import groupManage from "@@/workflow/wfGroup/group_manage.vue";
export default {
  props: {
    multiple: {
      type: Boolean,
      default: false
    }
  },
  components: {},
  data() {
    return {
      dialogVisible: false,
      isfullscreen: false, // 弹出框全屏
      activeIndex: 0,
      activeName: "2", // 当前标签页的下标
      leftInput: "",
      rightInput: "",
      pageNum: 1,
      pageSize: 10,
      currentPage: 1,
      total: 0,
      loading: false,
      loading1: false,
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
        label: "label"
      },
      leftUserList: [],
      clickTree: "",
      dialogGroupVisible: false,
      searchResults: []
    };
  },
  watch: {
    // leftInput(nv) {
    //   let _that = this;
    //   if (_that.flag) {
    //     window.clearTimeout(_that.flag);
    //     _that.flag = false;
    //   }
    //   if (nv == "") {
    //     _that.isShow = true;
    //     return;
    //   }
    //   if ((/[\u4e00-\u9fa5]/.test(nv) && nv.length >= 2) || nv.length >= 3) {
    //     _that.isShow = false;
    //     _that.flag = window.setTimeout(function () {
    //       _that.search(nv);
    //       clearTimeout(_that.flag);
    //     }, 700);
    //   } else {
    //     //提示输入三个字符以上查询内容
    //     _that.tipText = /[\u4e00-\u9fa5]/.test(nv)
    //       ? _that.$t("cm.tipText")
    //       : _that.$t("cm.tipText1");
    //     _that.isShow = true;
    //   }
    // },
  },
  mounted() {
    this.syncSelectionToLeft();
    this.initData();
  },
  methods: {
    initData() {
      this.loading = true;
      const params = {
        groupDesc: "",
        groupName: "",
        pageIndex: 1,
        searchType: "0",
        size: 100
      };
      api.getEntityAllByPage(params).then(res => {
        if (res.data.code === "0") {
          this.loading = false;
          this.data = res.data.records;
        }
      });
    },
    handleLeftSearch() {
      if (this.leftInput.trim() === "") {
        this.searchResults = [];
        return;
      }
      const query = this.leftInput.toLowerCase();
      this.searchResults = this.leftList.filter(
        item =>
          item.userName.toLowerCase().includes(query) ||
          item.userId.toLowerCase().includes(query)
      );
    },
    /** 创建群组 */
    createGroup() {
      this.dialogGroupVisible = true;
    },

    leftGroupClick(item, index) {
      this.leftInput = "";
      this.activeIndex = index;
      this.loading1 = true;
      api.getGroupUserList(item.groupId).then(res => {
        let data = res.data.data;
        data.forEach(item => {
          item.selected = false;
        });
        this.leftList = data;
        this.loading1 = false;
        this.$nextTick(() => {
          this.syncSelectionToLeft();
        });
      });
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.initData(this.leftInput);
    },
    handleCurrentChange(val) {
      this.pageNum = val;
      this.initData(this.leftInput);
    },
    setLeftList(leftList) {
      this.leftList = leftList;
    },
    /** 左侧列表的点击事件 */
    leftClick(item, index) {
      this.$emit("leftClick", item, this.leftList);
    },
    /** 右侧列表的点击事件 */
    rightClick(item, index) {
      // 在左侧列表中取消选中状态
      const leftItem = this.leftList.find(
        leftItem => leftItem.userId === item.userId
      );
      if (leftItem) {
        leftItem.selected = false;
      }
    },
    // 全选
    selectAll() {
      this.leftList.forEach(item => {
        if (!item.selected) {
          item.selected = true;
          this.rightList.push(item);
        }
      });
      this.$emit("selectAll", this.rightList);
    },
    // 取消全选
    deselectAll() {
      this.leftList.forEach(item => {
        if (item.selected) {
          item.selected = false;
        }
      });
      this.rightList = [];
      this.$emit("deselectAll", this.leftList);
    },
    // 将右侧选中状态同步到左侧列表
    syncSelectionToLeft() {
      this.$emit("syncSelectionToLeft", this.leftList);
    },

    /** 清空已选 */
    handleClear() {
      this.rightList = [];
      this.leftList.forEach(item => {
        item.selected = false;
      });
      // this.leftList = [];
      // this.leftInput = "";
      this.isShow = false;
    },
    /** 搜索事件 */
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
          //   let timer = setTimeout(() => {
          api
            .getStaffsByOrgId({
              orgId: this.clickTree || "00888888",
              keyword: val,
              pageNum: this.pageNum,
              pageSize: this.pageSize
            })
            .then(res => {
              let arr = [];
              let { code, data, total } = res.data;
              if (code == "0" || code == "200") {
                this.loading = false;
                data.forEach(item => {
                  arr.push({
                    userName: item.empName,
                    userId: item.empId,
                    workDeptNamePath: item.workDeptNamePath,
                    workDeptName: item.workDeptName,
                    userPhone: item.mobilePhone1,
                    selected: false
                  });
                });
                this.leftList = arr;
                this.total = total;
                this.$emit("setTotal", total);
                this.$nextTick(() => {
                  this.syncSelectionToLeft();
                });
              }
            })
            .catch(err => {
              this.loading = false;
            });
          //     clearTimeout(timer);
          //   }, 500);
        }
      } else {
        this.tipText = /[\u4e00-\u9fa5]/.test(val)
          ? this.$t("查询参数不能少于3个字符、中文不能小于2个字符")
          : this.$t("查询参数不能少于3个字符");
        this.leftList = [];
        this.isShow = true;
      }
    },

    /** 失焦事件 */
    handleBlur() {
      this.isShow = false;
    }
  }
};
</script>
<style lang="less" scoped>
.pd-16 {
  padding: 10px 12px;
}
.left-main {
  height: 500px;
  position: relative;
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
.header-title {
  margin: 5px 10px;
  display: flex;
  justify-content: space-between;
}
.font-css {
  color: #0775db;
  cursor: pointer;
}
.i-css {
  font-size: 12px;
  margin-right: 4px;
}
.left-group {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  border-bottom: 1px dashed #d8d3d3;
}
.left-group1 {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  border-bottom: 1px dashed #d8d3d3;
  background: #f0f1f4;
  cursor: pointer;
}
:hover.left-group {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  border-bottom: 1px dashed #d8d3d3;
  background: #f0f1f4;
  cursor: pointer;
}
</style>

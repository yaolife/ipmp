<!--
 * @Author: [P631038]杨旭
 * @LastEditors: [P631038]杨旭
 * @Description: 
-->
<template>
  <div>
    <el-row>
      <!-- 左侧主体 -->
      <div class="pd-16" v-loading="loading">
        <el-input
          style="margin-bottom: 10px"
          placeholder="请输入姓名/首字母/全拼/姓名拼音/工号"
          v-model="leftInput"
          size="small"
          clearable
          @blur="handleBlur"
        >
          <!-- @input="search" -->
          <i slot="prefix" class="el-input__icon el-icon-search"></i>
        </el-input>
        <div
          style="
            height: 24px;
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-left: 10px;
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
              leftInput ? "待选人员" : "最近选择的人员"
            }}</span>
          </transition>
          <div v-if="leftList.length > 0 && multiple" style="margin-top: -5px">
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
        <!-- list -->
        <div v-if="leftList.length > 0" class="left-content">
          <div
            class="content-css"
            v-for="(item, index) in leftList"
            :key="index"
            @click="leftClick(item, index)"
          >
            <div class="name-css">{{ item.userName }}</div>
            <el-tooltip
              class="item"
              effect="dark"
              :content="item.workDeptNamePath"
              placement="right"
              :open-delay="1500"
            >
              <div class="dept-css">
                {{ item.workDeptNamePath }}
              </div>
            </el-tooltip>
            <i v-if="item.selected" class="el-icon-circle-check icon-css-2"></i>
            <i v-else class="el-icon-circle-check-outline icon-css"></i>
          </div>
          <div v-if="!leftInput" class="clearHistory" @click="clearHistory">
            清空选择记录
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
    </el-row>
  </div>
</template>

<script>
import api from "../api";
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
      isShow: false,
      tipText: "查询参数不能少于3个字符、中文不能小于2个字符",
      deptNo: "00888888",
      keyword: "",
      flag: false
    };
  },
  watch: {
    leftInput(nv) {
      let _that = this;
      if (_that.flag) {
        window.clearTimeout(_that.flag);
        _that.flag = false;
      }
      if (nv == "") {
        this.getHistoryUser();
        _that.isShow = false;
        return;
      }
      if ((/[\u4e00-\u9fa5]/.test(nv) && nv.length >= 2) || nv.length >= 3) {
        _that.isShow = false;
        _that.flag = window.setTimeout(function() {
          _that.search(nv);
          clearTimeout(_that.flag);
        }, 700);
      } else {
        //提示输入三个字符以上查询内容
        _that.tipText = /[\u4e00-\u9fa5]/.test(nv)
          ? _that.$t("cm.tipText")
          : _that.$t("cm.tipText1");
        _that.isShow = true;
        _that.leftList = [];
        _that.$emit("setTotal", 0);
      }
    }
  },
  mounted() {
    this.syncSelectionToLeft();
    this.getHistoryUser();
  },
  methods: {
    // 获取最近选择的用户
    getHistoryUser() {
      let timer = setTimeout(() => {
        api.userGetRecentHistory({}).then(res => {
          if (res.data.code == 0) {
            let data = res.data.data;
            data.forEach(item => {
              item.selected = false;
            });
            this.leftList = data;
            this.total = this.leftList.length;
            this.$emit("setTotal", this.leftList.length);
            this.$nextTick(() => {
              this.syncSelectionToLeft();
            });
          }
        });
        clearTimeout(timer);
      }, 200);
    },
    // 清空最近已选记录
    clearHistory() {
      this.$confirm(
        "此操作将会删除最近选择过的10个人员记录, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(() => {
          api.userHistoryClear({}).then(res => {});
          this.$message({
            type: "success",
            message: "删除成功!"
          });
          this.leftList = [];
          this.$emit("setTotal", 0);
        })
        .catch(() => {});
    },
    /** 左侧列表的点击事件 */
    leftClick(item, index) {
      this.$emit("leftClick", item, this.leftList);
    },
    rightClick(item) {
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
      // this.$emit("setTotal", 0);
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
    },
    handleSizeChange(val) {
      console.log("[ size ]-325", val);
      this.pageSize = val;
      this.getHistoryUser();
    },
    handleCurrentChange(val) {
      this.pageNum = val;
      this.getHistoryUser();
    },
    setLeftList(leftList) {
      this.leftList = leftList;
    }
  }
};
</script>
<style lang="less" scoped>
.pd-16 {
    padding: 10px 12px 11px;
    border-bottom: 1px solid #e4e7ed;
}

.left-content {
  height: 372px;
  overflow: auto;
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

/deep/.el-icon-circle-check:before {
  content: "\e639" !important;
}
.clearHistory {
  text-align: center;
  color: #a3a3a5;
  cursor: pointer;
  margin-top: 10px;
}
:hover.clearHistory {
  text-align: center;
  color: #0775db;
  cursor: pointer;
  margin-top: 10px;
}
</style>

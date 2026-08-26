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
            placeholder="请输入组织名称/编码"
            v-model="leftInput"
            size="small"
            @blur="handleBlur"
            clearable
          >
            <!-- @input="search" -->
            <i slot="prefix" class="el-input__icon el-icon-search"></i>
          </el-input>
        </div>
        <!-- <div
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
            <span v-else style="margin-top：-5px">{{ " " }}</span>
          </transition>
          <div v-if="leftList.length > 0" style="margin-top: -5px">
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
        </div> -->
        <!-- list -->
        <el-row style="border-top: 1px solid #e4e7ed">
          <el-col :span="12" style="height: 406px; overflow: auto">
            <div style="margin: 5px 10px">组织</div>
            <el-tree
              ref="tree"
              :data="data"
              :props="defaultProps"
              :filter-node-method="filterNode"
              highlight-current
              expand-on-click-node
              :show-checkbox="false"
              check-strictly
              node-key="deptNo"
              lazy
              :load="loadNode"
              @node-click="getOrgTreeForHr"
            >
              <!-- @node-expand="getOrgTreeForHr" -->
              <!-- <span
                slot-scope="{ node }"
                class="orgTree showName"
                :title="node.label"
                v-text="node.label"
              >
              </span> -->

              <span slot-scope="{ node, data }" class="orgTree showName">
                <i class="custom-icon" :class="getIcon(node, data)"></i>
                <span>{{ node.label }}</span>
              </span>
            </el-tree>
          </el-col>
          <el-col
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
                <!-- <span
                  v-if="isShow"
                  style="
                    float: left;
                    margin-top: -2px;
                    color: #f56c6c;
                    font-size: 12px;
                    line-height: 1;
                  "
                  >{{ tipText }}</span
                > -->
                <span style="margin-top：-5px">{{ "待选人员" }}</span>
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
              v-if="leftList.length > 0"
              v-loading="leftLoading"
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
      activeName: "2", // 当前标签页的下标
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
        isLeaf: "isLeaf"
      },
      leftUserList: [],
      clickTree: ""
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
        this.loadRootNodes();
        _that.isShow = true;
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
      }
    }
  },
  mounted() {
    this.syncSelectionToLeft();
    // this.data = this.getOrgTreeForHr();
  },
  methods: {
    // 懒加载节点
    async loadNode(node, resolve) {
      try {
        let nodes = [];

        console.log("[ node ]-259", node);
        if (node.level === 0) {
          // 加载根节点
          await this.loadRootNodes();
        } else {
          // 加载子节点
          nodes = await this.loadChildNodes(node.data.id);
        }
        // 处理叶子节点标识
        const processedNodes = this.processLeafNodes(nodes);
        // 返回数据
        resolve(processedNodes);
      } catch (error) {
        console.error("加载节点失败:", error);
        resolve([]);
      }
    },
    // 加载根节点
    async loadRootNodes() {
      return new Promise(resolve => {
        let param = { orgId: this.deptNo, keyword: this.leftInput };
        let status = 0;
        api.getOrgTreeForOrgWidget(param).then(res => {
          const totalData = res.data.data;
          let arr = [];
          if (totalData && status == 0) {
            for (let i = 0; i < totalData.length; i++) {
              arr.push({
                id: totalData[i].deptNo,
                label: totalData[i].orgName,
                children: [],
                deptIdPath: totalData[i].deptIdPath,
                isLeaf: totalData[i].isLeaf
              });
            }
          }
          this.data = arr;
          resolve(arr);
        });
      });
    },

    // 加载子节点
    async loadChildNodes(parentId) {
      return new Promise(resolve => {
        let param = { orgId: parentId, keyword: this.leftInput };
        // let param = { orgId: this.deptNo, keyword: this.keyword };
        let status = 0;

        api.getOrgTreeForOrgWidget(param).then(res => {
          const totalData = res.data.data;
          let arr = [];
          if (totalData && status == 0) {
            for (let i = 0; i < totalData.length; i++) {
              arr.push({
                id: totalData[i].deptNo,
                label: totalData[i].orgName,
                children: [],
                deptIdPath: totalData[i].deptIdPath,
                isLeaf: totalData[i].isLeaf
              });
            }
          }
          resolve(arr);
        });
      });
    },
    // 处理叶子节点标识
    processLeafNodes(nodes) {
      // return nodes.map((node) => {
      //   if (node.isLeaf) {
      //     return { ...node, isLeaf: true };
      //   }
      // });
      return nodes;
    },

    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    initData(val) {
      api
        .getStaffsByOrgId({
          orgId: this.clickTree || "00888888",
          keyword: "",
          // keyword: val,
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
    },
    createData(data) {
      let arr = [];
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
      this.$nextTick(() => {
        this.syncSelectionToLeft();
      });
    },
    getOrgTreeForHr(data, node, cur) {
      console.log("[ data ]-394", data);
      // console.log("节点数据:", data);
      // console.log("是否为叶子节点:", node.isLeaf);
      // return;
      let param = { orgId: this.deptNo, keyword: this.leftInput };
      let status = 0;
      if (data) {
        //点击树节点时
        param = {
          orgId: data.id,
          keyword: "",
          pageNum: this.currentPage,
          pageSize: this.pageSize
        };
        this.clickTree = data.id;
        status = 1;
        this.leftLoading = true;

        api.getStaffsByOrgId(param).then(res => {
          this.leftLoading = false;
          this.total = res.data.total;
          this.$emit("setTotal", this.total);
          this.currentPage = res.data.current;
          this.leftUserList = res.data.data;
          this.createData(this.leftUserList);
        });

        // api.getOrgTreeForOrgWidget(param).then((res) => {
        //   const totalData = res.data.data;
        //   let arr = [];
        //   if (totalData && status == 0) {
        //     for (let i = 0; i < totalData.length; i++) {
        //       arr.push({
        //         id: totalData[i].deptNo,
        //         label: totalData[i].orgName,
        //         children: [],
        //         deptIdPath: totalData[i].deptIdPath,
        //       });
        //     }
        //     this.data = arr;
        //   } else {
        //     if (data.children.length == 0) {
        //       let childrenArr = [];
        //       for (let i = 0; i < totalData.length; i++) {
        //         if (data.id == totalData[i].parentOrgId) {
        //           data.children.push({
        //             id: totalData[i].deptNo,
        //             label: totalData[i].orgName,
        //             children: [],
        //             deptIdPath: totalData[i].deptIdPath,
        //           });
        //         }
        //       }
        //     }
        //   }
        // });
      } else {
        //第一次加载时
        // api.getOrgTreeForOrgWidget(param).then((res) => {
        //   const totalData = res.data.data;
        //   let arr = [];
        //   if (totalData && status == 0) {
        //     for (let i = 0; i < totalData.length; i++) {
        //       arr.push({
        //         id: totalData[i].deptNo,
        //         label: totalData[i].orgName,
        //         children: [],
        //         deptIdPath: totalData[i].deptIdPath,
        //       });
        //     }
        //     this.data = arr;
        //   }
        // });
      }
    },
    handleClick(tab, event) {
      console.log(tab, event);
      this.$emit("tabClick", this.activeName);
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.initData();
    },
    handleCurrentChange(val) {
      this.pageNum = val;
      this.initData();
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
          const params = {
            keyword: this.leftInput
          };
          api.getOrgByKeyWord(params).then(res => {
            this.loading = false;
            const totalData = res.data.data;
            let arr = [];
            if (totalData) {
              for (let i = 0; i < totalData.length; i++) {
                arr.push({
                  id: totalData[i].deptNo,
                  label: totalData[i].deptName,
                  children: [],
                  deptIdPath: totalData[i].deptNamePath,
                  isLeaf: true
                });
              }
            }
            this.data = arr;
          });

          // api
          //   .getStaffsByOrgId({
          //     orgId: this.clickTree || "00888888",
          //     keyword: val,
          //     pageNum: this.pageNum,
          //     pageSize: this.pageSize,
          //   })
          //   .then((res) => {
          //     let arr = [];
          //     let { code, data, total } = res.data;
          //     if (code == "0" || code == "200") {
          //       this.loading = false;
          //       data.forEach((item) => {
          //         arr.push({
          //           userName: item.empName,
          //           userId: item.empId,
          //           workDeptNamePath: item.workDeptNamePath,
          //           workDeptName: item.workDeptName,
          //           userPhone: item.mobilePhone1,
          //           selected: false,
          //         });
          //       });
          //       this.leftList = arr;
          //       this.total = total;
          //       this.$emit("setTotal", total);
          //       this.$nextTick(() => {
          //         this.syncSelectionToLeft();
          //       });
          //     }
          //   })
          //   .catch((err) => {
          //     this.loading = false;
          //   });
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
    getIcon(node, data) {
      // 方式1：根据数据类型返回不同的图标类
      if (!data.isLeaf) {
        return node.expanded ? "el-icon-folder-opened" : "el-icon-folder";
      } else {
        return "el-icon-document";
      }
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
.left-content {
  // height: 372px;
  // overflow: auto;
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
</style>

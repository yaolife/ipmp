<template>
  <div v-if="display" class="orgselect" ref="dmCom">
    <el-row v-if="!easySearch">
      <el-col :span="24" style="position: relative">
        <el-select
          :class="multiple ? 'customSelect' : '' "
          ref="personnel"
          :disabled="detail"
          v-model="personList"
          filterable
          remote
          reserve-keyword
          clearable
          :placeholder="placeholder"
          :remote-method="remoteMethod"
          :loading="loading"
          :loading-text="'搜索中,请稍后...'"
          size="small"
          :multiple="multiple"
          :popper-append-to-body="isFullscreen"
          @change="handleChange"
          @clear="handleClear"
          @blur="handleBlur"
          @visible-change="visibleChange"
        >
          <el-option
            v-for="item in options4"
            :key="item.userId"
            :label="item.userName"
            :value="item.userName"
          >
            <el-row>
              <el-col :span="20">
                <div style="margin-left: 10px; height: 20px">
                  {{ item.userName }}
                </div>
                <div
                  :class="
                    checkData.includes(item.userId)
                      ? 'dept-css-active'
                      : 'dept-css'
                  "
                >
                  {{ item.workDeptName || "暂无部门" }}
                </div>
              </el-col>
              <el-col :span="4">
                <div
                  v-if="checkData.includes(item.userId)"
                  style="line-height: 54px"
                >
                  <i style="font-weight: 700" class="el-icon-check"></i>
                </div>
              </el-col>
            </el-row>
          </el-option>
        </el-select>
        <transition name="el-fade-in">
          <span
            v-if="isShow"
            style="
              float: left;
              margin-top: 5px;
              color: #f56c6c;
              font-size: 12px;
              line-height: 1;
            "
            >{{ tipText }}</span
          >
        </transition>
        <el-button
          size="small"
          type="primary"
          :disabled="detail"
          @click="openDialog"
          v-if="!detail"
          class="previewBtn"
        >
          <span class="el-icon-plus"></span>
        </el-button>
        <personDialog
          :showDialog="showDialog"
          :initUserId="changeUserId"
          :multiple="multiple"
          @close="showDialog = false"
          @submitList="submitList"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import api from "./api.js";
import personDialog from "./index";
export default {
  name: "PersonSelect",
  props: {
    easySearch: { type: Boolean },
    change: { type: Function },
    display: { type: Boolean, default: true },
    multiple: { type: Boolean, default: false },
    value: {
      type: Object | String,
      default() {
        return {
          userId: "",
          userName: "",
          // userPhone: "",
        };
      },
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    placeholder: {
      type: String,
      default() {
        return this.$t("el.select.placeholder");
      },
    },
    isFullscreen: {
      type: Boolean,
      default: false,
    },
    detail: { type: Boolean, default: false },
  },
  components: {
    personDialog,
  },

  data() {
    return {
      // userPhone: "",
      currentValue: "",
      src: "",
      visible: false,
      showDialog: false,
      readonly: true,
      toBody: true,
      size: "small",
      title: this.multiple
        ? this.$t("el.select.placeholder")
        : this.$t("el.select.placeholder"),
      selected: [],
      initUserId: "",
      options4: [],
      personList: [],
      list: [],
      loading: false,
      isShow: false,
      checkData: [],
      listNew: [],
      newArr: [],
      tipText: "查询参数不能少于3个字符、中文不能小于2个字符",
      userInfo: {},
      lists: [],
      userIdArr: [],
      showDialog: false,
      changeUserId: "",
      flag: false,
    };
  },
  watch: {
    value: {
      immediate: true,
      handler(n, o) {
        if (n != null && n.userName != null) {
          if (n.userName == "") {
            this.personList = [];
            this.initUserId = "";
            this.checkData = "";
            return;
          }
          // 单选
          if (!this.multiple) {
            this.$nextTick(() => {
              this.personList = [n.userName];
            });
          } else {
            this.personList = n.userName.split(",");
            this.userInfo = n;
            this.flag = false;
          }
          this.checkData = n.userId;
          this.initUserId = n.userId;
        }
      },
      deep: true,
    },
  },
  mounted() {},
  computed: {},
  methods: {
    // 打开弹出框
    openDialog() {
      this.showDialog = true;
      this.changeUserId = this.initUserId;
    },
    /** 弹出框提交值 */
    submitList(list) {

      console.log('[ list ]-204', list)
      if (list && list.length == 0) {
        let commitUserData = {
          userName: "",
          userId: "",
        };
        this.$emit("input", commitUserData);
        this.$emit("change", commitUserData);
      } else {
        let result = this.extractUserData(list);
        this.personList = result.userName;
        result.userName.forEach((row) => {
          if (!this.personList.includes(row)) {
            this.personList.push(row);
          }
        });
        let commitUserData = {
          userName: result.userName.join(","),
          userId: result.userId.join(","),
        };
        this.$emit("input", commitUserData);
        this.$emit("change", commitUserData);
      }
    },
    extractUserData(userList) {
      if (!userList || !Array.isArray(userList) || userList.length === 0) {
        return {
          userName: "",
          userId: "",
        };
      }
      const userNames = userList.map((user) => user.userName);
      const userIds = userList.map((user) => user.userId);
      return {
        userName: userNames,
        userId: userIds,
      };
    },
    /** 清空输入框,重置 */
    clear() {
      this.$emit("input", "");
      this.$set(this, "personList", []);
      this.initUserId = "";
    },
    remoteMethod(nv) {
      let _that = this;
      if (_that.flag) {
        window.clearTimeout(_that.flag);
        _that.flag = false;
      }
      if (nv == "") {
        _that.isShow = true;
        return;
      }
      if ((/[\u4e00-\u9fa5]/.test(nv) && nv.length >= 2) || nv.length >= 3) {
        _that.isShow = false;
        _that.flag = window.setTimeout(function () {
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
    },
    /** 选人接口调用 */
    search(query) {
      if (query == "" && this.options4 == []) {
        this.isShow = true;
        return;
      }
      if (
        (/[\u4e00-\u9fa5]/.test(query) && query.length >= 2) ||
        query.length >= 3
      ) {
        this.isShow = false;
        if (query !== "") {
          this.loading = true;
          let timer = setTimeout(() => {
            api
              .getStaffsByOrgId({
                orgId: "00888888",
                keyword: query,
              })
              .then((res) => {
                let arr = [];
                let { code, data } = res.data;
                if (code == "0" || code == "200") {
                  this.loading = false;
                  data.forEach((item) => {
                    arr.push({
                      userName: item.empName,
                      userId: item.empId,
                      // dept: item.workDeptName,
                      // userPhone: item.mobilePhone1,
                      workDeptNamePath: item.workDeptNamePath,
                      workDeptName: item.workDeptName,
                      selected: false,
                    });
                  });
                  this.options4 = arr;
                }
              })
              .catch((err) => {
                this.loading = false;
              });
            clearTimeout(timer);
          }, 200);
        } else {
          this.options4 = [];
        }
      } else {
        this.tipText = /[\u4e00-\u9fa5]/.test(query)
          ? this.$t("查询参数不能少于3个字符、中文不能小于2个字符")
          : this.$t("查询参数不能少于3个字符");
        this.isShow = true;
      }
    },
    /** 失焦事件 */
    handleBlur() {
      this.isShow = false;
    },
    /** 显示隐藏事件 */
    visibleChange() {
      this.isShow = false;
    },
    /** 清除事件 */
    handleClear() {
      this.$emit("clear");
    },
    /** 选人组件改变时 */
    handleChange(val) {
      console.log("[ val ]-290", val);
      this.$refs.personnel.query = "";
      // 已选的数据
      this.checkData = val;
      // 单选
      if (!this.multiple) {
        let list = "";
        list = this.options4.filter((row) => {
          return row.userName === val;
        });
        this.getPersonList(list);
      } else {
        // 多选
        let lists = [];
        this.options4.forEach((item) => {
          val.forEach((item1) => {
            if (item.userName === item1) {
              this.lists.push(item);
            }
          });
        });

        console.log("[ this.lists ]-312", this.lists);
        this.getPersonList(this.lists);
      }
    },
    // /** 选人数据结构重组 */
    // getPersonList(val) {
    //   let commitUserData = {
    //     userId: [],
    //     userName: [],
    //     userPhone: [],
    //     dept: [],
    //   };
    //   let newVal = [];
    //   let newValTwo = [];
    //   if (this.multiple) {
    //     const map = new Map();
    //     newVal = val.filter(
    //       (v) => !map.has(v.userName) && map.set(v.userName, 1)
    //     );
    //     newVal.forEach((row) => {
    //       this.personList.forEach((row1) => {
    //         if (row.userName === row1) {
    //           newValTwo.push(row);
    //         }
    //       });
    //     });
    //     newValTwo.forEach((item) => {
    //       commitUserData.userId.push(item.userId);
    //       commitUserData.userName.push(item.userName);
    //       commitUserData.userPhone.push(item.userPhone);
    //       commitUserData.dept.push(item.dept);
    //     });
    //     let personListNew = [];
    //     personListNew = Array.from(new Set(...[this.personList]));
    //     commitUserData.userName = personListNew;
    //   } else {
    //     val.forEach((item) => {
    //       commitUserData.userId.push(item.userId);
    //       commitUserData.userName.push(item.userName);
    //       commitUserData.userPhone.push(item.userPhone);
    //       commitUserData.dept.push(item.dept);
    //     });
    //   }
    //   commitUserData.userId = commitUserData.userId.join(",");
    //   commitUserData.userName = commitUserData.userName.join(",");
    //   commitUserData.userPhone = commitUserData.userPhone.join(",");
    //   commitUserData.dept = commitUserData.dept.join(",");
    //   //回显时,默认的参数赋值
    //   if (this.multiple) {
    //     this.personList.forEach((i) => {
    //       if (
    //         this.userInfo &&
    //         this.userInfo.userName &&
    //         this.userInfo.userName.split(",").includes(i)
    //       ) {
    //         let r = /\[(.+?)]/g;
    //         let newArray = i.match(r);
    //         commitUserData.userId = `${
    //           commitUserData.userId
    //             ? commitUserData.userId + ","
    //             : commitUserData.userId
    //         }${newArray[0].replace(/\[|]/g, "")}`;
    //       }
    //     });
    //     commitUserData.userId = this.getUserId(commitUserData.userId);
    //   }
    //   this.$emit("input", commitUserData);
    //   this.$emit("change", commitUserData);
    // },

    // /** 获取全部userID 然后去重 */
    // getUserId(ids) {
    //   let idArr = [];
    //   let idArrNew = [];
    //   let idArrTwoNew = [];
    //   idArr = ids.split(",");
    //   idArr.forEach((item) => {
    //     this.personList.forEach((item1) => {
    //       if (item1.includes(item)) {
    //         this.userIdArr.push(item);
    //       }
    //     });
    //   });
    //   idArrNew = Array.from(new Set(...[this.userIdArr]));
    //   idArrNew.forEach((i) => {
    //     this.personList.forEach((j) => {
    //       if (j.includes(i)) {
    //         idArrTwoNew.push(i);
    //       }
    //     });
    //   });
    //   return idArrTwoNew.join(",");
    // },

    getPersonList(val) {
      // 初始化返回数据结构
      const commitUserData = {
        userId: [],
        userName: [],
        // userPhone: [],
        // dept: [],
      };

      // 使用Set进行去重
      const uniqueVal = this.multiple
        ? this.deduplicateUsers(val, "userName")
        : val;

      // 数据结构整理
      this.processUserData(uniqueVal, commitUserData, this.multiple);

      // 处理数组转字符串
      this.convertArraysToStrings(commitUserData);

      if (this.multiple) {
        this.handleMultipleSelection(commitUserData);
      }

      this.$emit("input", commitUserData);
      this.$emit("change", commitUserData);
    },

    /** 数据去重 */
    deduplicateUsers(users, key) {
      const seen = new Set();
      return users.filter((user) => {
        const identifier = `${user[key]}_${user.userId}`;
        if (seen.has(identifier)) {
          return false;
        }
        seen.add(identifier);
        return true;
      });
    },

    /** 数据结构整理 */
    processUserData(sourceData, targetData, isMultiple) {
      if (isMultiple) {
        const personSet = new Set(this.personList);
        sourceData.forEach((user) => {
          if (personSet.has(user.userName)) {
            targetData.userId.push(user.userId);
            targetData.userName.push(user.userName);
            // targetData.userPhone.push(user.userPhone);
            // targetData.dept.push(user.dept);
          }
        });

        targetData.userName = this.personList;
      } else {
        sourceData.forEach((user) => {
          targetData.userId.push(user.userId);
          targetData.userName.push(user.userName);
          // targetData.userPhone.push(user.userPhone);
          // targetData.dept.push(user.dept);
        });
      }
    },

    /** 将数组字段转换为逗号分隔的字符串 */
    convertArraysToStrings(data) {
      Object.keys(data).forEach((key) => {
        if (Array.isArray(data[key])) {
          data[key] = data[key].join(",");
        }
      });
    },

    /** 处理多选模式下的特殊逻辑 */
    handleMultipleSelection(commitUserData) {
      if (!this.userInfo.userName) return;
      const userNames = this.userInfo.userName.split(",");
      const matchedUsers = [];
      this.personList.forEach((personName) => {
        if (userNames.includes(personName)) {
          const idMatch = personName.match(/\[([^\]]+)\]/);
          if (idMatch && idMatch[1]) {
            matchedUsers.push(idMatch[1]);
          }
        }
      });

      if (matchedUsers.length > 0) {
        const existingIds = commitUserData.userId
          ? commitUserData.userId.split(",")
          : [];
        const allIds = [...new Set([...existingIds, ...matchedUsers])]; // 使用Set去重 [8](@ref)
        commitUserData.userId = this.getUserId(allIds.join(","));
      }
    },

    getUserId(ids) {
      if (!ids) return "";
      const idArr = ids.split(",");
      const uniqueIds = [];
      const idSet = new Set();
      idArr.forEach((id) => {
        if (!idSet.has(id)) {
          idSet.add(id);
          uniqueIds.push(id);
        }
      });
      const validIds = uniqueIds.filter((id) =>
        this.personList.some((person) => person.includes(id))
      );
      return validIds.join(",");
    },
  },
};
</script>

<style lang="less" scoped>
.el-form-item--small .el-form-item__content,
.el-form-item--small .el-form-item__label {
  line-height: 26px !important;
}
.orgselect .previewBtn {
  margin: 0;
  padding: 0 10px;
  position: absolute;
  right: 1px;
  top: 0px;
  border: none;
  color: #fff !important;
  height: 32px !important;
  display: flex;
  align-items: center;
  justify-content: center;
}
/deep/ .el-input-group__append {
  display: contents;
}
/deep/ .el-dialog__header {
  text-align: left !important;
}

/deep/ .el-input__suffix {
  margin-right: 32px !important;
}
.dept-css {
  margin-left: 10px;
  color: #8492a6;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dept-css-active {
  margin-left: 10px;
  color: #8492a6;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/deep/ .el-select__tags-text {
  width: 93%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
/deep/ .customSelect .el-input__suffix {
  margin-right: 32px !important;
  position: absolute;
  top: 14px;
  right: -26px;
}

</style>

<template>
  <div class="cgn-asc-person-select">
    <!-- input输入框模式 -->
    <el-input
      v-if="mode == 'input'"
      :value="userModelDesc"
      :title="userModelDesc"
      :readonly="true"
      :disabled="true"
      :placeholder="$t('cm.pleaseSelect')"
    >
      <el-button
        size="small"
        type="primary"
        class="el-button--half"
        v-if="!inputDisabled"
        slot="append"
        icon="el-icon-plus"
        @click="onOpenSelectDialog"
      ></el-button>
    </el-input>
    <!-- tag标签模式 -->
    <div v-if="multiple && mode == 'tag'" class="user-tag-group">
      <!-- 用于触发表单验证 -->
      <el-input
        v-show="false"
        :value="userModelDesc"
        :disabled="true"
      ></el-input>

      <!-- 标签列表 -->
      <draggable
        style="display: inline-block"
        v-model="userModel"
        :group="{ name: 'tag' }"
        ghost-class="ghost"
        handle=".user-tag"
        :setData="() => {}"
      >
        <el-tag
          v-for="(user, userIndex) in userModel"
          :key="user[userProps.userId]"
          effect="plain"
          :closable="userModel.length > 1 && !disabledDelUser"
          class="user-tag"
          @close="onRemoveUserTag(userIndex)"
        >
          <el-checkbox v-if="userCheck" v-model="user.check"></el-checkbox>
          <span v-if="approvalMode === 0 && userModel.length > 1">{{
            `${userIndex + 1}、`
          }}</span
          >[{{ user[userProps.userId] }}]{{ user[userProps.userName] }}
        </el-tag>
      </draggable>
      <el-button
        style="position: relative; top: -0.5px"
        v-if="!disabledAddUser"
        icon="el-icon-plus"
        size="small"
        class="user-tag-add"
        @click="onOpenSelectDialog"
      >
        {{ $t("cgnCommon.add") }}
      </el-button>
    </div>

    <!-- 选择弹窗 -->
    <el-drawer
      class="task-dialog task-submit-dialog body-scroll-dialog"
      title=""
      :withHeader="false"
      :visible="selectDialog.visible"
      append-to-body
      :size="isbottomDialog ? '585px' : '800px'"
      :direction="isbottomDialog ? 'btt' : 'rtl'"
      destroy-on-close
      :close-on-press-escape="false"
      :wrapperClosable="false"
    >
      <!-- direction="rtl" -->
      <!-- size="800px" -->
      <div class="cud-inter-define-title">
        <span
          ><img
            src="@/assets/lib/img/drawersubmit.png"
            class="cud-define-pic"
          /><span class="cud-define-text">{{
            $t("el.select.placeholder")
          }}</span></span
        >
        <i
          class="el-icon-close cud-interdrawer-close"
          @click="selectDialog.visible = false"
        ></i>
      </div>
      <!--中台选人-->
      <!-- <cgn-asc-base
        :width="'100%'"
        :height="550"
        :src="selectDialog.src"
        :selected="selectDialog.selected"
        @handle="handleMessage"
      ></cgn-asc-base> -->
      <!--授权系统选人-->
      <div class="perComponent" style="text-align: center">
        <div v-if="!this.multiple">
          <cud-custom-person-single
            ref="perComponent"
            :IDS="selectDialog.selectedIds"
            v-if="customComponentsCheck('CudCustomPersonSingle')"
          ></cud-custom-person-single>
          <cud-commm-per-a-single
            ref="perComponent"
            :IDS="selectDialog.selectedIds"
            v-else
          ></cud-commm-per-a-single>
        </div>
        <div v-else>
          <cud-custom-person-multiple
            ref="perComponent"
            :IDS="selectDialog.selectedIds"
            v-if="customComponentsCheck('CudCustomPersonMultiple')"
          ></cud-custom-person-multiple>
          <cud-commm-per-m-single
            ref="perComponent"
            :IDS="selectDialog.selectedIds"
            v-else
          ></cud-commm-per-m-single>
        </div>
        <div style="padding-top: 10px">
          <el-button size="small" type="primary" @click="perSelectSubmit">{{
            $t("cm.confirm2")
          }}</el-button>
          <el-button size="small" @click="perSelectClose">{{
            $t("cm.cancel")
          }}</el-button>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import * as Utils from "@@/utils/Utils";
import CgnAscBase from "./CgnAscBase";
import Vue from "vue";
import draggable from "vuedraggable";
import CudCommmPerASingle from "@/components/cudCommPersonComponent/asingle";
import CudCommmPerMSingle from "@/components/cudCommPersonComponent/msingle";
export default {
  name: "CgnAscPersonSelect",
  components: { CgnAscBase, CudCommmPerASingle, CudCommmPerMSingle, draggable },
  inject: {
    elForm: { default: "" }, // 祖父级注入参数
  },
  props: {
    ascUrl: { type: String, default: "" }, // 中台选人控件地址
    value: { type: [Array, Object] }, // 选中值
    multiple: { type: Boolean, default: false }, // 是否多选
    isbottomDialog: { type: Boolean, default: false }, // 是否多选
    mode: { type: String, default: "input" }, // 模式。input-输入框，tag-标签
    props: {
      type: Object,
      default() {
        return {};
      },
    }, // 选中值属性
    disabledAddUser: { type: Boolean, default: false }, // 是否禁止添加人
    disabledDelUser: { type: Boolean, default: false }, // 是否禁止是否禁止删除人
    userCheck: { type: Boolean, default: false }, // 是否会签负责人可以勾选
    approvalMode: { type: Number }, // 顺序审批
  },
  data() {
    return {
      userModel: this.value || (this.multiple ? [] : {}), // 用户数据（单选时为对象，多选时为数组）
      userProps: {
        userId: this.props.userId || "userId",
        userName: this.props.userName || "userName",
      },
      selectDialog: {
        // 选择弹窗
        visible: false,
        src: "", // iframe Url
        selected: [], // 默认选中值
        selectedIds: "", //选中id列表
      },
      delegationFlag: "",
    };
  },
  watch: {
    /**
     * 子组件修改数据的时候回传到父组件
     */
    userModel() {
      this.$emit("input", this.userModel);
    },
  },
  computed: {
    /**
     * 判断输入框是否禁用
     */
    inputDisabled() {
      return this.disabled || (this.elForm || {}).disabled;
    },

    /**
     * 用户数据展示
     */
    userModelDesc() {
      return this.getUserModelDesc(this.userModel, this.userProps);
    },
  },
  methods: {
    // 检查是否注册了自定义选人选部门组件（通过main.js/formViewIndex.js注册）
    // name: 选人CudCustomPersonSingle CudCustomPersonMultiple / 选部门CudCustomOrganization
    customComponentsCheck(name) {
      let components = this.$root.$options.components;
      for (let component in components) {
        if (component === name) {
          return true;
        }
      }
      return false;
    },
    /**
     * 获取用户数据显示
     */
    getUserModelDesc(userModel, userProps) {
      let userDescArr = [];
      if (userModel instanceof Array) {
        for (let i = 0; i < userModel.length; i++) {
          if (
            userModel[i][userProps.userName].indexOf(
              userModel[i][userProps.userId]
            ) > -1
          ) {
            userDescArr.push(userModel[i][userProps.userName]);
          } else {
            userDescArr.push(
              "[" +
                userModel[i][userProps.userId] +
                "]" +
                userModel[i][userProps.userName]
            );
          }
        }
      } else if (userModel[userProps.userId]) {
        if (
          userModel[userProps.userName].indexOf(userModel[userProps.userId]) >
          -1
        ) {
          userDescArr.push(userModel[userProps.userName]);
        } else {
          userDescArr.push(
            "[" +
              userModel[userProps.userId] +
              "]" +
              userModel[userProps.userName]
          );
        }
      }
      return userDescArr.join(",");
    },
    /**
     * 处理弹窗回传消息
     */
    handleMessage(data) {
      if (data instanceof Array && data.length >= 2) {
        this.userModel = [];
        // data = ["userId_1,userId_2,...", "userName_1,userName_2,..."]
        let userIdArr = data[0] ? data[0].split(";") : [];
        let userNameArr = data[1] ? data[1].split(";") : [];
        let tempUserIds = []; // 用于去重
        for (let j = 0; j < this.userModel.length; j++) {
          const user = this.userModel[j];
          tempUserIds.push(user.userID);
        }
        // 从回传消息中分解出用户数据
        if (this.userModel instanceof Array) {
          for (let i = 0; i < userIdArr.length; i++) {
            let userId = userIdArr[i];
            let userName = userNameArr[i];
            if (tempUserIds.indexOf(userId) < 0) {
              tempUserIds.push(userId);

              let newUser = {};
              newUser[this.userProps.userId] = userId;
              newUser[this.userProps.userName] = userName;
              newUser.check = false;
              this.userModel.push(newUser);
            }
          }
        } else {
          this.userModel[this.userProps.userId] =
            userIdArr.length > 0 ? userIdArr[0] : "";
          this.userModel[this.userProps.userName] =
            userNameArr.length > 0 ? userNameArr[0] : "";
          this.userModel.check = false;
        }
        // 回调选中值事件
        this.$emit("change", this.userModel);
        // 关闭弹窗
        this.selectDialog.visible = false;
      } else {
        // 关闭弹窗(data="close"或其他)
        this.selectDialog.visible = false;
      }
    },

    /**
     * 获取Iframe访问Url
     * @return {string}
     */
    getAscBaseSrc() {
      let user = "";
      if (this.userModel.length > 0) {
        user = "&IDS=";
        for (let i = 0; i < this.userModel.length; i++) {
          if (i === 0) {
            user = user + this.userModel[i].userID;
          } else {
            user = user + "," + this.userModel[i].userID;
          }
        }
      }
      let page = this.multiple
        ? "/personwidget.html"
        : "/singlepersonwidget.html";
      let withAppCode = "appCode=" + Vue.prototype.$AppCode;
      let sourceUrl = "sourceUrl=" + Vue.prototype.$DomainPath;
      let withLanguage = Utils.isEnLanguage(this.$i18n)
        ? "lang=en_US"
        : "lang=zh_CN";
      let withTime = "time=" + new Date().getTime();
      let baseSrc =
        `${this.ascUrl}${page}?${withAppCode}&${withLanguage}&${withTime}&${sourceUrl}` +
        user;
      return baseSrc;
    },

    clear() {
      this.userModel = {};
    },

    /**
     * 移出用户标签
     */
    onRemoveUserTag(userIndex) {
      this.$delete(this.userModel, userIndex);
      this.$emit("change", this.userModel);
    },

    /**
     * 打开选择弹窗
     */
    onOpenSelectDialog() {
      // 从用户数据中分解出用户工号列表
      let userIds = [];
      if (this.userModel instanceof Array) {
        for (let i = 0; i < this.userModel.length; i++) {
          userIds.push(this.userModel[i][this.userProps.userId]);
        }
      } else {
        userIds.push(this.userModel[this.userProps.userId]);
      }
      this.selectDialog.selectedIds = userIds.join(",");
      // 设置选择弹窗默认选中值
      if (this.multiple) {
        this.selectDialog.selected = ["", "", "", "", "", userIds.join(",")];
      } else {
        let selected = userIds.length > 0 ? userIds[0] : "";
        this.selectDialog.selected = ["", "", "", "", "", selected];
      }
      this.selectDialog.src = this.getAscBaseSrc();
      this.selectDialog.visible = true;
    },
    //选人确认
    perSelectSubmit() {
      this.userModel = [];
      let selectedUser = this.$refs.perComponent.getData();
      if (selectedUser[1]) {
        let userData1 = selectedUser[1][0].split(";");
        let userData2 = selectedUser[1][1].split(";");
        userData1.forEach((item, index) => {
          let newUser = {};
          newUser[this.userProps.userId] = userData1[index];
          newUser[this.userProps.userName] = userData2[index];
          newUser.check = false;
          this.userModel.push(newUser);
        });
      }

      this.$emit("change", this.userModel);
      this.selectDialog.visible = false;
    },
    //选人关闭
    perSelectClose() {
      this.selectDialog.visible = false;
    },
  },
};
</script>

<style lang="less" scoped>
/deep/.el-icon-close {
  top: 1px;
}
// @import "src/assets/css/style";
.cgn-asc-person-select {
  /** 用户标签组 **/
  .user-tag-group {
    margin-bottom: -4px;

    .user-tag {
      margin-right: 10px;
      margin-bottom: 5px;
    }
    .user-tag-add {
      margin-bottom: 4px;
      margin-left: 0px;
      vertical-align: bottom;
      padding-top: 9px;
    }
  }
}
</style>

<template>
  <div>
    <!-- <el-button type="primary" size="small" @click="showDialog = true">{{
      title || "打开弹窗"
    }}</el-button> -->

    <el-input
      :value="currentUser"
      :title="currentUser"
      :readonly="true"
      :disabled="true"
      :placeholder="$t('cm.pleaseSelect')"
    >
      <el-button
        size="small"
        type="primary"
        class="el-button--half"
        slot="append"
        icon="el-icon-plus"
        @click="showDialog = true"
      ></el-button>
    </el-input>
    <div class="wfCommPersonComponentDialog">
      <el-dialog
        width="60%"
        :visible.sync="showDialog"
        v-if="showDialog"
        custom-class="process-creator-dialog"
        :modal="false"
        :destory-on-close="true"
        :title="$t('el.select.placeholder')"
        :close-on-click-modal="false"
        :append-to-body="true"
        v-dragMove="{
          DragButton: '.el-dialog__header',
          DragWindow: '.el-dialog',
        }"
      >
        <div class="el-dialog-div">
          <div v-if="personOrDept">
            <!-- 选人( 多选组件 ) -->
            <msingle
              v-if="multiple"
              ref="userComponent"
              :IDS="initUserId"
              :showCheckBox="showCheckbox"
              :appCode="appCode"
              :lang="lang"
              :init-org-id="initOrgId"
            ></msingle>
            <!-- 选人( 单选组件 ) -->
            <asingle
              v-if="!multiple"
              ref="userComponent"
              :IDS="initUserId"
              :showCheckBox="showCheckbox"
              :appCode="appCode"
              :lang="lang"
              :init-org-id="initOrgId"
            ></asingle>
          </div>

          <!-- 选部门 -->
          <div v-else-if="!personOrDept">
            <cud-commm-org-component
              ref="orgComponent"
              :showCheckBox="orgShowCheckbox"
              :appCode="appCode"
              :lang="lang"
              :initOrgId="initOrgId"
            ></cud-commm-org-component>
          </div>
        </div>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button size="small" @click="closeCreatorFunc">{{
            $t("cm.cancel")
          }}</el-button>
          <el-button size="small" type="primary" @click="commitCreatorFunc">{{
            $t("cm.commit")
          }}</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
import asingle from "./asingle.vue";
import msingle from "./msingle.vue";
import cudCommmOrgComponent from "./organization.vue";
export default {
  name: "wfCommPersonComponent",
  props: {
    // 是否多选
    multiple: {
      type: Boolean,
      default: true,
    },
    personOrDept: {
      type: Boolean,
      default: true, 
    },

    orgShowCheckbox: {
      type: Boolean,
      default: true,
    },
    showCheckbox: {
      type: Boolean,
      default: true,
    },
    initOrgId: {
      type: String,
      default: "00888888",
    },
    initUserId: {
      type: String,
      default: "",
    },
    initUser: {
      type: String,
      default: "",
    },
    title: {
      type: String,
      default: "",
    },
  },
  components: {
    msingle,
    cudCommmOrgComponent,
    asingle,
  },
  data() {
    return {
      IDS: "", // 回显人员
      buttonGroup: false,
      appCode: "cud",
      lang: "zh_CN",
      showDialog: false,
      currentValue: "",
      currentUser: "",
    };
  },
  computed: {},
  watch: {
    initUser: {
      handler(val) {
        this.currentUser = val;
      },
    },
  },
  mounted() {},
  methods: {
    // 获取组件的数据方法
    commitCreatorFunc() {
      let map = new Map();
      if (this.personOrDept === true) {
        let commitUserData = {
          userId: "",
          userName: "",
          userPhone: "",
          dept: "",
        };
        let userData = this.$refs.userComponent.getData();
        if (userData) {
          if (userData && userData.length > 0) {
            // 判断用户信息是否为空，不为空才插入数据
            if (
              userData[1] &&
              userData[1].length === 2 &&
              userData[1][0] !== ""
            ) {
              this.currentValue = `[${userData[1][0]}]${userData[1][1]}`;
              commitUserData.userId = userData[1][0];
              commitUserData.userName = `[${userData[1][0]}]${userData[1][1]}`;
              commitUserData.userPhone = userData[7];
              commitUserData.dept = userData[5];

              const ids = userData[1][0];
              const names = userData[1][1];
              const idArray = ids.split(";");
              const nameArray = names.split(";");
              const result = idArray.map((id, index) => ({
                userName: nameArray[index],
                userID: id,
              }));

              let userNo = [];
              let userName = [];
              userNo = this.currentValue
                .substring(1, 1000)
                .split("]")[0]
                .split(";");
              userName = this.currentValue
                .substring(1, 1000)
                .split("]")[1]
                .split(";");
              let drr = userNo.map((el, index) => {
                return { el, ...userName[index] };
              });

              let arr = [];
              drr.forEach((item) => {
                arr.push(
                  `[${item.el}]${item[0]}${item[1]}${item[2] || ""}${
                    item[3] || ""
                  }`
                );
              });
              this.currentUser = arr.join(",");
              this.$emit("callback", result);
              // let data = {
              //   userName: arr,
              //   userId: commitUserData.userId,
              // };
              // this.$emit("callback", data);
              this.showDialog = false;
            }
          }
        }
      }
      if (this.personOrDept === false) {
        let orgData = this.$refs.orgComponent.getData();
        map.set("orgData", orgData);
        this.$emit("callback", map);
      }
    },
    // 关闭弹出框
    closeCreatorFunc() {
      this.showDialog = false;
    },
  },
};
</script>
<style lang="less" scoped>
</style>

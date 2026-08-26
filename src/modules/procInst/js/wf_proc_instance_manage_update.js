import breadcrumb from "@/components/common/breadcrumb";
import api from "../api";
// import wfCommPersonComponent from "@@/components/cudCommPersonComponent/wfCommPersonComponent";
// import personSelect from "@@/components/easy-cud-person-select";
export default {
  components: {
    breadcrumb,
    api,
    // personSelect
  },
  props: {
    isCreate: [Boolean, String],
    formCates: Array
  },
  watch: {
    isCreate: function (newData, oldData) {
      if (newData && newData.length !== 0) {
        this.isCreate_ = newData;
      }
    }
  },
  mounted() {
    let _this = this;
    let queryObject = this.$route.query;
    console.log(queryObject, 'queryObject==========')
    //对象属性拷贝的方式，防止vue动态绑定失效
    this.RespProcInstDto = Object.assign(this.RespProcInstDto, queryObject);
    this.RespProcInstDto.startUser =
    {
      userName: "[" +
        this.RespProcInstDto.startUserId +
        "]" + this.RespProcInstDto.startUserName,
      userId: this.RespProcInstDto.startUserId
    }
    this.RespProcInstDto.startDept =
      "[" +
      this.RespProcInstDto.startDeptId +
      "]" +
      this.RespProcInstDto.startDeptName;
    this.createUser =
      "[" +
      this.RespProcInstDto.creatorId +
      "]" +
      this.RespProcInstDto.creatorName;
    this.resUpdateProcInstDto.startUserId = this.RespProcInstDto.startUserId;
    this.resUpdateProcInstDto.startDeptId = this.RespProcInstDto.startDeptId;
    _this.values = false;
  },

  data() {
    return {
      hasIcon: false,
      brand: [
        { name: "wm.workflow_manage" },
        { name: "wm.proc_instance_manage" },
        { name: "cm.update" }
      ],
      isCopy_: this.isCopy,
      formId_: this.formId,
      isCreate_: this.isCreate,
      startUser: "",
      createUser: "",
      startDept: "",
      RespProcInstDto: {
        startUser: "",
        startDept: "",
        procName: "",
        processId: "",
        appCode: "",
        processCode: "",
        id: "",
        appId: "",
        procModelId: "",
        priority: 0,
        procSubject: "",
        startUserId: "",
        startUserName: "",
        startDeptId: "",
        startDeptName: "",
        startDeptpath: "",
        startTime: "",
        endTime: "",
        procInstExtend01: "",
        procInstExtend02: "",
        procInstExtend03: "",
        procInstExtend04: "",
        procInstExtend05: "",
        status: 0,
        parentProcInstId: "",
        sourceProcInstId: "",
        creatorId: "",
        creatorName: "",
        createTime: "",
        updaterId: "",
        updaterName: "",
        updateTime: "",
        tenantId: "",
        timeStamp: "",
        rev: 0,
        readOnly: true
      },
      options: [
        { value: "0", label: "低" },
        { value: "1", label: "中" },
        { value: "2", label: "高" }
      ],
      resUpdateProcInstDto: {
        procInsID: "",
        priority: "",
        procSubject: "",
        startUserId: "",
        startUserName: "",
        startDeptId: "",
        startDeptName: "",
        startDeptPath: ""
      },
      formCateList: [],
      dataModels: [],
      formBasicSettingRules: {
        procSubject: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: ["blur", "change"]
          }
        ],
        startUser: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: ["blur", "change"]
          }
        ],
        startDept: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: ["blur", "change"]
          }
        ]
      },
      loading: false,
      fullscreenLoading: false,
      list: [],
      showSelectUser: false,
      selectUserTitle: "",
      isUserMultiple: false,
      initUserId: "",
      selectUserRef: "",
      showOrgTab: false,
      showUserTab: false
    };
  },
  methods: {
    showSelectUserDialog(ref) {
      this.selectUserRef = ref;
      this.$refs[ref].blur();
      if (ref === "startUserInput") {
        this.initUserId = this.resUpdateProcInstDto.startUserId;
        this.selectUserTitle = "wm.start_user";
        this.isUserMultiple = false;
        this.showUserTab = true;
        this.showOrgTab = false;
      } else if (ref === "startDeptInput") {
        this.initUserId = this.resUpdateProcInstDto.startDeptId;
        this.selectUserTitle = "wm.start_dept";
        this.isUserMultiple = false;
        this.showUserTab = false;
        this.showOrgTab = true;
      }
      this.showSelectUser = true;
    },

    closeSelectUserDialog() {
      this.showSelectUser = false;
      this.initUserId = "";
      this.$refs.selectUser.init();
    },

    //选人选组织控件提交
    commitSelectUser() {
      let actParticipantData = this.$refs.selectUser.getData();
      if (this.selectUserRef === "startUserInput") {
        this.RespProcInstDto.startUser = "";
        this.resUpdateProcInstDto.startUserId = "";
      } else if (this.selectUserRef === "startDeptInput") {
        this.RespProcInstDto.startDept = "";
        this.resUpdateProcInstDto.startDeptId = "";
      }
      if (actParticipantData) {
        let userData = actParticipantData.get("userData");
        let orgData = actParticipantData.get("orgData");
        if (userData && userData.length === 8) {
          // 判断用户信息是否为空，不为空才插入数据
          if (
            userData[1] &&
            userData[1].length === 2 &&
            userData[1][0] !== ""
          ) {
            let userDataIdsStr = userData[1][0];
            let userDataNamesStr = userData[1][1];
            let userDataIds = userDataIdsStr.split(";");
            let userDataNames = userDataNamesStr.split(";");
            let ids = "";
            let users = "";
            let userNames = "";
            for (let i = 0; i < userDataIds.length; i++) {
              ids += (i === 0 ? "" : ",") + userDataIds[i];
              users +=
                (i === 0 ? "" : ",") +
                "[" +
                userDataIds[i] +
                "]" +
                userDataNames[i];
              userNames += (i === 0 ? "" : ",") + userDataNames[i];
            }
            if (this.selectUserRef === "startUserInput") {
              this.RespProcInstDto.startUser = users;
              this.resUpdateProcInstDto.startUserId = ids;
            }
            this.initUserId = ids;
          }
        }
        if (orgData && orgData.length > 0) {
          if (orgData[1] && orgData[1].length === 8 && orgData[1][2] !== "") {
            if (this.selectUserRef === "startDeptInput") {
              this.RespProcInstDto.startDept = `[${orgData[1][1]}]${orgData[1][5]}`;
              this.resUpdateProcInstDto.startDeptId = orgData[1][1];
            }
          }
        }
      }
      this.closeSelectUserDialog();
    },
    //返回
    back: function () {
      //关闭页签
      this.closeTab();
    },
    // 最后的提交
    update: function () {
      let _this = this;
      _this.$refs["formBasicSetting"].validate(valid => {
        if (valid) {


          console.log('[this.RespProcInstDto.startUser  ]', this.RespProcInstDto.startUser)
          if (!(typeof (this.RespProcInstDto.startUser) === 'string')) {

            this.resUpdateProcInstDto.startUserName = this.RespProcInstDto.startUser.userName.split(']')[1]
            this.resUpdateProcInstDto.startUserId = this.RespProcInstDto.startUser.userId
          }
          // this.resUpdateProcInstDto.startUserName = this.RespProcInstDto.startUser.substr(
          //   this.RespProcInstDto.startUser.indexOf("]") + 1,
          //   this.RespProcInstDto.startUser.length
          // );
          this.resUpdateProcInstDto.startDeptName = this.RespProcInstDto.startDept.substr(
            this.RespProcInstDto.startDept.indexOf("]") + 1,
            this.RespProcInstDto.startDept.length
          );
          this.resUpdateProcInstDto.priority = this.RespProcInstDto.priority;
          this.resUpdateProcInstDto.procInsID = this.RespProcInstDto.id;
          this.resUpdateProcInstDto.procSubject = this.RespProcInstDto.procSubject;
          let updateDto = this.resUpdateProcInstDto;
          updateDto.reqProcInstDto = this.RespProcInstDto;
          if (!(typeof (this.RespProcInstDto.startUser) === 'string')) {
            updateDto.reqProcInstDto.startUserId = this.RespProcInstDto.startUser.userId
            updateDto.reqProcInstDto.startUserName = this.RespProcInstDto.startUser.userName.split(']')[1]
            updateDto.reqProcInstDto.startUser = this.RespProcInstDto.startUser.userName
          }
          _this.fullscreenLoading = true;
          api.updateProcInstAPI(updateDto).then(res => {
            _this.fullscreenLoading = false;
            if (res.code === "0") {
              _this.$message({
                message: this.$t("cm.savesuccess"),
                type: "success"
              });
              //等提示框弹出后再关闭窗口
              let timer = setTimeout(() => {
                clearTimeout(timer)
                if (window.opener && window.opener.queryProcInstList) {
                  window.opener.queryProcInstList();
                  window.opener.queryProcInstList = null;
                } else if (window.queryProcInstList) {
                  window.queryProcInstList();
                }
                //关闭页签
                this.closeTab();
              }, 500);
            } else {
              _this.$message({ message: res.msg, type: "warning" });
            }
          });
        }
      });
    }
  }
};

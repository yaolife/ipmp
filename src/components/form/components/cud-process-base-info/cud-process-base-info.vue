<template>
  <!-- 流程基本信息 -->
  <div class="base-info" ref="dmCom" style="width: 100%">
    <avue-form
      ref="form"
      @change="changeVal"
      v-model="model"
      :option="option"
    ></avue-form>
  </div>
</template>

<script>
import osUtil from "@/utils/osUtil";
import { Filters } from "@/utils/Utils";
import { setTimeout } from "timers";
export default {
  name: "ProcessBaseInfo",
  inject: ["completeInit", "getInitState"],
  props: {
    prop: { type: String },
    ruleMap: { type: Object },
    value: {
      type: Object,
      default: () => {
        return {
          workTheme: "",
          processName: "",
          priority: "0",
          createUser: "",
          createDateTime: "",
          currentLink: "",
        };
      },
    },
    rowSpan: { type: Number, default: 6 },
    workThemeCanEdit: { type: Boolean, default: true },
    showDept: { type: Boolean, default: false },
    showPhone: { type: Boolean, default: false },
    detail: { type: Boolean, default: false },
    baseinfo: {
      type: Object,
      default: () => {
        return {
          workTheme: "（系统自动生成）",
          processName: "（提交时自动生成）",
          priority: "0",
          createUser: "（提交时自动生成）",
          createDateTime: "（提交时自动生成）",
          currentLink: "（提交时自动生成）",
        };
      },
    },
  },
  data() {
    return {
      option: {
        submitBtn: false,
        emptyBtn: false,
        column: [
          {
            detail: !this.workThemeCanEdit,
            modelType: "common",
            type: "input",
            name: "单行文本",
            label: this.$t("cudComponents.work_theme"),
            span: this.rowSpan,
            size: "small",
            display: true,
            placeholder: "请填写字段输入提示",
            fieldColumn: ["workTheme"],
            prop: "workTheme",
            value: this.baseinfo.workTheme,
            tip: this.baseinfo.workTheme,
          },
          {
            modelType: "common",
            type: "input",
            detail: true,
            name: "单行文本",
            label: this.$t("cudComponents.proc_name"),
            span: this.rowSpan,
            size: "small",
            display: true,
            events: [],
            fieldColumn: ["processName"],
            prop: "processName",
            placeholder: "（提交时自动生成）",

            value: Filters.processName(
              this.baseinfo,
              this.$i18n,
              "processName",
              "processNameEn"
            ),
          },
          {
            detail: !this.workThemeCanEdit,
            modelType: "common",
            type: "select",
            name: "下拉选择器",
            label: this.$t("cudComponents.priority"),

            dicData: [
              {
                label: this.$t("cudComponents.low"),
                value: "0",
              },
              {
                label: this.$t("cudComponents.middle"),
                value: "1",
              },
              {
                label: this.$t("cudComponents.high"),
                value: "2",
              },
            ],
            cascaderItem: [],
            span: this.rowSpan,
            size: "small",
            display: true,
            props: {
              label: "label",
              value: "value",
            },
            events: [],
            fieldColumn: ["priority"],
            prop: "priority",
            value: this.baseinfo.priority ? this.baseinfo.priority : "0",
          },
          {
            modelType: "common",
            type: "input",
            detail: true,
            name: "单行文本",
            label: this.$t("cudComponents.start_user"),
            span: this.rowSpan,
            size: "small",
            display: true,
            events: [],
            fieldColumn: ["createUser"],
            prop: "createUser",
            placeholder: "（提交时自动生成）",
            value: Filters.processName(
              this.baseinfo,
              this.$i18n,
              "createUser",
              "createUserEn"
            ),
          },
          {
            modelType: "common",
            type: "input",
            name: "文本组件",
            label: this.$t("cudComponents.start_time"),
            detail: true,
            span: this.rowSpan,
            size: "small",
            display: true,
            events: [],
            fieldColumn: ["createDateTime"],
            prop: "createDateTime",
            placeholder: "（提交时自动生成）",
            value: this.baseinfo.createDateTime
              ? this.baseinfo.createDateTime
              : Filters.timeFormat(new Date(), "yyyy-MM-dd HH:mm:ss"),
          },
          {
            modelType: "common",
            type: "input",
            detail: true,
            name: "单行文本",
            label: this.$t("cudComponents.current_link"),
            span: this.rowSpan,
            size: "small",
            display: true,
            events: [],
            fieldColumn: ["currentLink"],
            prop: "currentLink",
            value: Filters.processName(
              this.baseinfo,
              this.$i18n,
              "currentLink",
              "currentLinkEn"
            ),
          },
          // 发起部门
          // {
          //   modelType: "common",
          //   type: "input",
          //   detail: true,
          //   name: "单行文本",
          //   label: "发起部门",
          //   span: this.rowSpan,
          //   size: "small",
          //   display: true,
          //   events: [],
          //   fieldColumn: ["deptName"],
          //   prop: "deptName",
          //   value: Filters.processName(
          //     this.baseinfo,
          //     this.$i18n,
          //     "deptName",
          //     "deptNameEn"
          //   )
          // },
          // // 手机号
          // {
          //   modelType: "common",
          //   type: "input",
          //   detail: true,
          //   name: "单行文本",
          //   label: "手机号",
          //   span: this.rowSpan,
          //   size: "small",
          //   display: true,
          //   events: [],
          //   fieldColumn: ["createUserPhone"],
          //   prop: "createUserPhone",
          //   value: Filters.processName(
          //     this.baseinfo,
          //     this.$i18n,
          //     "createUserPhone",
          //     "createUserPhoneEn"
          //   )
          // }
        ],
        detail: this.detail,
      },
      model: {},
      newValue: null,
      oldValue: null,
    };
  },
  created() {
    var _this = this;
    if (_this.ruleMap) {
      let keys = Object.keys(_this.ruleMap);
      if (_this.ruleMap && keys.length > 0) {
        for (let rule in keys) {
          for (let index in _this.option.column) {
            if (_this.option.column[index].prop === keys[rule]) {
              // console.log('value:', _this.ruleMap[keys[rule]]);
              if (_this.ruleMap[keys[rule]] === 1) {
                //显示
                _this.option.column[index].display = true;
              } else if (
                _this.ruleMap[keys[rule]] === 2 ||
                _this.ruleMap[keys[rule]] === 5
              ) {
                //隐藏,敏感
                _this.option.column[index].display = false;
              } else if (_this.ruleMap[keys[rule]] === 3) {
                //只读
                _this.option.column[index].detail = true;
              } else if (_this.ruleMap[keys[rule]] === 4) {
                //可编辑
                if (_this.option.column[index].prop === "processName") {
                  _this.option.column[index].detail = false;
                }
              }
            }
          }
        }
      }
    }
    if (_this.value && _this.value.workTheme.length > 0) {
      _this.model = _this.value;
    }
  },
  mounted() {
    // 加载完成
    if (this.completeInit) {
      this.completeInit(this.prop);
    }

    let flag = false;
    this.option.column.forEach((item) => {
      if (item.display === true) {
        flag = true;
      }
    });
    // 是否显示部门
    if (this.showDept) {
      this.option.column.push({
        modelType: "common",
        type: "input",
        detail: true,
        name: "单行文本",
        label: "发起部门",
        span: this.rowSpan,
        size: "small",
        display: true,
        events: [],
        fieldColumn: ["deptName"],
        prop: "deptName",
        value: Filters.processName(
          this.baseinfo,
          this.$i18n,
          "deptName",
          "deptNameEn"
        ),
      });
    }
    // 是否显示手机号
    if (this.showPhone) {
      this.option.column.push({
        modelType: "common",
        type: "input",
        detail: true,
        name: "单行文本",
        label: "手机号",
        span: this.rowSpan,
        size: "small",
        display: true,
        events: [],
        fieldColumn: ["createUserPhone"],
        prop: "createUserPhone",
        value: Filters.processName(
          this.baseinfo,
          this.$i18n,
          "createUserPhone",
          "createUserPhoneEn"
        ),
      });
    }
    // setTimeout(() => {
    //   document.getElementsByClassName(
    //     "base-info"
    //   )[0].parentElement.parentElement.parentElement.style.padding = "0";
    //   document.getElementsByClassName(
    //     "base-info"
    //   )[0].parentElement.parentElement.parentElement.parentElement.style.cssText =
    //     "padding-left:0;padding-right:0";
    //   document.getElementsByClassName(
    //     "base-info"
    //   )[0].parentElement.parentElement.parentElement.parentElement.style.paddingLeft =
    //     "0";
    //   document.getElementsByClassName(
    //     "base-info"
    //   )[0].parentElement.parentElement.parentElement.parentElement.style.paddingRight =
    //     "0";
    //   console.log(
    //     document.getElementsByClassName("base-info")[0].parentElement
    //       .parentElement.parentElement.parentElement,
    //     "--------------"
    //   );
    // }, 300);

    let i = 0;
    let _timer = setInterval(() => {
      i++;
      if (i === 3) {
        clearInterval(_timer);
      }
      if (
        this.newValue != undefined &&
        this.newValue != null &&
        Object.keys(this.oldValue).length > 0
      ) {
        clearInterval(_timer);
        this.$emit("input", this.newValue);
      }
    }, 1000);
    if (!flag) {
      let dm = [...document.getElementsByClassName("cud-avue-title")];
      dm.forEach((item) => {
        if (item.innerText === "流程基本信息") {
          item.parentNode.parentElement.parentElement.parentElement.parentElement.style.display =
            "none";
          document.getElementsByClassName(
            "cud-cgn-task-center"
          )[0].firstElementChild.style.marginTop = "0px";
        }
      });
    } else {
      if (osUtil.getBrowserInfo().browser.indexOf("IE") === 0) {
        this.$refs.dmCom.parentNode.removeAttribute("disabled");
        this.$refs.form.$refs.workTheme[0].$el.parentNode.removeAttribute(
          "disabled"
        );
      }
    }
  },
  computed: {
    procItem() {
      return JSON.parse(sessionStorage.getItem("procItem"));
    },
    i18nLocale() {
      return this.$i18n.locale;
    },
  },
  watch: {
    model: {
      handler(n, o) {
        this.newValue = n;
        this.oldValue = o;
      },
      deep: true,
    },
    value: {
      handler(n, o) {
        this.model = n;
        let procItem = JSON.parse(sessionStorage.getItem("procItem"));
        if (procItem && procItem.procInstStatus == 2) {
          this.model.currentLink = procItem.actName + "( 流程已结束 )";
        }
      },
      deep: true,
    },
    workThemeCanEdit: {
      handler(n, o) {
        this.option.column.forEach((item) => {
          if (item.prop === "workTheme") {
            item.detail = !n;
          }
        });
      },
    },
    i18nLocale: {
      handler(n, o) {
        this.option = {
          submitBtn: false,
          emptyBtn: false,
          column: [
            {
              detail: !this.workThemeCanEdit,
              modelType: "common",
              type: "input",
              name: "单行文本",
              label: this.$t("cudComponents.work_theme"),
              span: 12,
              display: true,
              placeholder: "请填写字段输入提示",
              fieldColumn: ["workTheme"],
              prop: "workTheme",
              value: this.baseinfo.workTheme,
            },
            {
              modelType: "common",
              type: "input",
              detail: true,
              name: "单行文本",
              label: this.$t("cudComponents.proc_name"),
              span: 12,
              display: true,
              events: [],
              fieldColumn: ["processName"],
              prop: "processName",
              placeholder: "（提交时自动生成）",
              value: Filters.processName(
                this.baseinfo,
                this.$i18n,
                "processName",
                "processNameEn"
              ),
            },
            {
              modelType: "common",
              type: "select",
              name: "下拉选择器",
              label: this.$t("cudComponents.priority"),
              dicData: [
                {
                  label: this.$t("cudComponents.low"),
                  value: "0",
                },
                {
                  label: this.$t("cudComponents.middle"),
                  value: "1",
                },
                {
                  label: this.$t("cudComponents.high"),
                  value: "2",
                },
              ],
              cascaderItem: [],
              span: 12,
              display: true,
              props: {
                label: "label",
                value: "value",
              },
              events: [],
              fieldColumn: ["priority"],
              prop: "priority",
              value: this.baseinfo.priority ? this.baseinfo.priority : "0",
            },
            {
              modelType: "common",
              type: "input",
              detail: true,
              name: "单行文本",
              label: this.$t("cudComponents.start_user"),
              span: 12,
              display: true,
              events: [],
              fieldColumn: ["createUser"],
              prop: "createUser",
              placeholder: "（提交时自动生成）",
              value: Filters.processName(
                this.baseinfo,
                this.$i18n,
                "createUser",
                "createUserEn"
              ),
            },
            {
              modelType: "common",
              type: "input",
              name: "文本组件",
              label: this.$t("cudComponents.start_time"),
              detail: true,
              span: 12,
              display: true,
              events: [],
              fieldColumn: ["createDateTime"],
              prop: "createDateTime",
              placeholder: "（提交时自动生成）",
              value: this.baseinfo.createDateTime
                ? this.baseinfo.createDateTime
                : Filters.timeFormat(new Date(), "yyyy-MM-dd HH:mm:ss"),
            },
            {
              modelType: "common",
              type: "input",
              detail: true,
              name: "单行文本",
              label: this.$t("cudComponents.current_link"),
              span: 12,
              display: true,
              events: [],
              fieldColumn: ["currentLink"],
              prop: "currentLink",
              value: Filters.processName(
                this.baseinfo,
                this.$i18n,
                "currentLink",
                "currentLinkEn"
              ),
            },
            // 发起部门
            // {
            //   modelType: "common",
            //   type: "input",
            //   detail: true,
            //   name: "单行文本",
            //   label: "发起部门",
            //   span: 12,
            //   display: true,
            //   events: [],
            //   fieldColumn: ["deptName"],
            //   prop: "deptName",
            //   value: Filters.processName(
            //     this.baseinfo,
            //     this.$i18n,
            //     "deptName",
            //     "deptNameEn"
            //   )
            // },
            // // 手机号
            // {
            //   modelType: "common",
            //   type: "input",
            //   detail: true,
            //   name: "单行文本",
            //   label: "手机号",
            //   span: 12,
            //   display: true,
            //   events: [],
            //   fieldColumn: ["createUserPhone"],
            //   prop: "createUserPhone",
            //   value: Filters.processName(
            //     this.baseinfo,
            //     this.$i18n,
            //     "createUserPhone",
            //     "createUserPhoneEn"
            //   )
            // }
          ],
          detail: this.detail,
        };
        //刷新页面数据多语言才生效
        // window.location.reload();
      },
    },
  },
  methods: {
    changeVal(n) {
      this.$emit("input", n);
    },
  },
};
</script>

<style scoped lang="less">
/deep/ .el-collapse-item {
  box-shadow: none !important;
}
/deep/ .el-form-item__content {
  margin-left: 140px !important;
}
/deep/ .avue-group .el-form-item {
  margin-bottom: 0 !important;
}
/deep/ .avue-group--header .avue-form__group--flex {
  padding-top: 0px;
  margin-left: -15px;
  margin-right: -15px;
}
</style>

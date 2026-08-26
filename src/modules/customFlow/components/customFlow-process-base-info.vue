<template>
  <div class="base-info" ref="dmCom" style="width: 100%;">
    <avue-form ref="form" v-model="model" :option="option"></avue-form>
  </div>
</template>

<script> 
import { Filters } from "@/utils/Utils"; 
export default {
  name: "ProcessBaseInfo", 
  props: {
    prop: { type: String }, 
    // 数据绑定
    value: {
      type: Object,
      default: () => {
        return {
          // 工作主题
          workTheme: "",
          // 流程名称
          processName: "",
          // 优先级
          priority: "0",
          // 发起人
          createUser: "",
          // 发起时间
          createDateTime: "",
          // 当前环节
          currentLink: ""
        };
      }
    },
    // 栅格占据的列数	
    rowSpan: { type: Number, default: 12 },
    // 工作主题是否可以编辑
    workThemeCanEdit: { type: Boolean, default: true },
    // 全部只读
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
          currentLink: "（提交时自动生成）"
        };
      }
    }
  },
  data() {
    return {
      option: {  
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
            tip:this.baseinfo.workTheme,
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
            )
          },
          {
            modelType: "common",
            type: "select",
            name: "下拉选择器",
            label: this.$t("cudComponents.priority"),

            dicData: [
              {
                label: this.$t("cudComponents.low"),
                value: "0"
              },
              {
                label: this.$t("cudComponents.middle"),
                value: "1"
              },
              {
                label: this.$t("cudComponents.high"),
                value: "2"
              }
            ],
            cascaderItem: [],
            span: this.rowSpan,
            size: "small",
            display: true,
            props: {
              label: "label",
              value: "value"
            },
            events: [],
            fieldColumn: ["priority"],
            prop: "priority",
            value: this.baseinfo.priority ? this.baseinfo.priority : "0"
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
            )
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
              : Filters.timeFormat(new Date(), "yyyy-MM-dd HH:mm:ss")
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
            )
          }
        ],
        detail: this.detail
      },
      model: {}
    };
  },  
  watch: {
    model: {
      handler(n, o) {
        if (n != undefined && n != null && Object.keys(o).length > 0) {
          this.$emit("input", n);
        }
      },
      deep: true
    },
    value: {
      handler(n, o) {
        this.model = n;
      },
      deep: true
    }, 
    i18nLocale: {
      handler(n, o) {
        this.option = {  
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
              value: this.baseinfo.workTheme
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
              )
            },
            {
              modelType: "common",
              type: "select",
              name: "下拉选择器",
              label: this.$t("cudComponents.priority"),
              dicData: [
                {
                  label: this.$t("cudComponents.low"),
                  value: "0"
                },
                {
                  label: this.$t("cudComponents.middle"),
                  value: "1"
                },
                {
                  label: this.$t("cudComponents.high"),
                  value: "2"
                }
              ],
              cascaderItem: [],
              span: 12,
              display: true,
              props: {
                label: "label",
                value: "value"
              },
              events: [],
              fieldColumn: ["priority"],
              prop: "priority",
              value: this.baseinfo.priority ? this.baseinfo.priority : "0"
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
              )
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
                : Filters.timeFormat(new Date(), "yyyy-MM-dd HH:mm:ss")
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
              )
            }
          ],
          detail: this.detail
        };
      }
    }
  },
  computed: {
    i18nLocale() {
      return this.$i18n.locale;
    }
  },
  methods: {}
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
</style>

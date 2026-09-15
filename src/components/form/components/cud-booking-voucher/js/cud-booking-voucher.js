import FsscApplyCompany from "../../../widget/cud-fssc-apply-company.vue";
import api from "@/components/form/api/appApi";
import Bus from "../../../../../bus";
import osUtil from "@/utils/osUtil";
export default {
  name: "BookingVoucher",
  components: { FsscApplyCompany },
  // set自定义校验的方法
  inject: ["setCustomRule"],
  props: [
    "prop",
    "dataModel",
    "display",
    "procDefName",
    "procActName",
    "isShowProcInfo",
    "businessCategoryCtrl",
    "businessSubCategoryCtrl",
    "companyCodeCtrl",
    "copyBtnCtrl",
    "delBtnCtrl",
    "headerTextCtrl",
    "voucherNoCtrl",
    "addItemCtrl",
    "delItemCtrl",
    "lendDirectionCtrl",
    "accountCodeCtrl",
    "amountCtrl",
    "lineItemTextCtrl"
  ],
  data() {
    return {
      bookingVoucherLoading: false,
      voucherFormData: {
        businessCategory: "",
        businessSubCategory: "",
        voucherData: []
      },

      businessCategory: "",
      businessSubCategory: "",
      voucherHeaderDtos: [],
      voucherContentDtos: [],
      deleteAry: [], // 删除数组
      borrowLendData: [
        {
          value: "01",
          label: "借"
        },
        {
          value: "02",
          label: "贷"
        }
      ],
      formRules: {
        businessCategory: [
          { required: true, message: "大分类必填", trigger: "change" }
        ],
        businessSubCategory: [
          { required: true, message: "小分类必填", trigger: "change" }
        ]
      },
      timeoutID: ""
    };
  },

  watch: {
    // voucherData
    voucherFormData: {
      handler(n, o) {
        let voucherHeaders = [];
        let voucherContents = [];
        for (const voucher of this.voucherFormData.voucherData) {
          voucherHeaders.push(voucher.formData);
          for (const content of voucher.tableData) {
            voucherContents.push(content);
          }
        }
        let data = {
          businessCategory: this.voucherFormData.businessCategory,
          businessSubCategory: this.voucherFormData.businessSubCategory,
          voucherHeaderDtos: voucherHeaders,
          voucherContentDtos: voucherContents
        };

        if (this.timeoutID) {
          clearTimeout(this.timeoutID);
        }
        this.timeoutID = setTimeout(() => {
          this.$emit("input", data);
        }, 500);
      },
      deep: true
    }
  },

  mounted() {
    if (osUtil.getBrowserInfo().browser.indexOf("IE") === 0) {
      this.$refs.dmCom.parentNode.removeAttribute("disabled");
    }
    let n = this.dataModel;
    if (n != undefined && n != null) {
      this.businessCategory = n.businessCategory;
      this.businessSubCategory = n.businessSubCategory;
      this.voucherHeaderDtos = n.voucherHeaderDtos;
      this.voucherContentDtos = n.voucherContentDtos;
      this.voucherFormData.businessCategory = n.businessCategory;
      this.voucherFormData.businessSubCategory = n.businessSubCategory;
    }
    this.dataInit();

    // 注册表单提交校验方法
    if (this.setCustomRule) {
      //需要标签页切换时，需要提供prop属性
      this.setCustomRule(this.formValidate, this.prop);
    }

    // 订阅总线事件
    Bus.$off("businessCategoryDemo");
    Bus.$on("businessCategoryDemo", data => {
      let businessCategory = data;
      // this.dataInit();
    });
  },

  computed: {},

  methods: {
    // 大分类变化传值(发布总线事件)
    categoryChange(value) {
      Bus.$emit("businessCategoryDemo", value);
    },

    /**
     * 表单提交校验方法
     */
    formValidate(callback) {
      if (this.$refs["voucherForm"] && this.display == true) {
        this.$refs.voucherForm.validate(valid => {
          if (valid) {
            let validResult = this.detailValidate();
            callback(validResult);
          } else {
            this.$message({
              type: "warning",
              message: "校验失败,请检查页面输入项"
            });
            callback(false);
          }
        });
      }

      callback(true);
    },

    /**
     * 表格明细校验
     */
    detailValidate(callback) {
      let value = true;
      let message = "";
      let on = "第";
      let headLine = "个";
      let line = "行";
      let empty = "为空;";

      for (let i = 0; i < this.voucherFormData.voucherData.length; i++) {
        let voucher = this.voucherFormData.voucherData[i];

        if (!voucher.formData.companyCode) {
          value = false;
          message =
            message +
            on +
            (parseInt(i) + 1) +
            headLine +
            "凭证的公司代码" +
            empty;
        }

        if (!voucher.formData.headerText) {
          value = false;
          message =
            message +
            on +
            (parseInt(i) + 1) +
            headLine +
            "凭证的抬头文本" +
            empty;
        }

        if (!voucher.formData.voucherNo) {
          value = false;
          message =
            message +
            on +
            (parseInt(i) + 1) +
            headLine +
            "凭证的凭证编号" +
            empty;
        }

        for (let j = 0; j < voucher.tableData.length; j++) {
          let tableData = voucher.tableData[j];
          if (!tableData.lendDirection) {
            value = false;
            message =
              message +
              on +
              (parseInt(i) + 1) +
              headLine +
              "凭证的" +
              on +
              (parseInt(j) + 1) +
              line +
              "的借/贷" +
              empty;
          }
          if (!tableData.accountCode) {
            value = false;
            message =
              message +
              on +
              (parseInt(i) + 1) +
              headLine +
              "凭证的" +
              on +
              (parseInt(j) + 1) +
              line +
              "的记账码" +
              empty;
          }
          if (!tableData.amount) {
            value = false;
            message =
              message +
              on +
              (parseInt(i) + 1) +
              headLine +
              "凭证的" +
              on +
              (parseInt(j) + 1) +
              line +
              "的金额" +
              empty;
          }
          if (!tableData.lineItemText) {
            value = false;
            message =
              message +
              on +
              (parseInt(i) + 1) +
              headLine +
              "凭证的" +
              on +
              (parseInt(j) + 1) +
              line +
              "的行项目文本" +
              empty;
          }
        }
      }

      if (!value) {
        let timer = setTimeout(() => {
          this.$message({ type: "warning", message: message });
          clearTimeout(timer)
        }, 10);
      }
      return value;
    },

    // 凭证分录表格的行新
    addTableRow(item, index) {
      item.tableData.splice(index + 1, 0, {
        voucherItemId: "",
        voucherHeadId: item.formData.voucherHeadId,
        lendDirection: "",
        accountCode: "",
        amount: 0,
        lineItemText: ""
      });
    },

    // 凭证分录表格的行删除
    removeTableRow(tableData, index) {
      if (tableData.length <= 1) {
        this.$message({ type: "warning", message: "最后一行不允许删除" });
        return;
      }

      if (tableData[index].voucherItemId) {
        this.deleteAry.push(tableData[index]);
      }
      tableData.splice(index, 1);
    },

    // 复制新增一个凭证
    copyVoucher(index) {
      let _this = this;
      let params = _this.voucherFormData.voucherData[index];
      _this.bookingVoucherLoading = true;
      api
        .copyVoucherAPI(params)
        .then(res => {
          if (res.code === "0") {
            let resultData = res.data;
            _this.voucherFormData.voucherData.push(resultData);
          } else {
            _this.$message.error(res.msg);
          }
          _this.bookingVoucherLoading = false;
        })
        .catch(error => {
          this.$message({ type: "error", message: error });
          _this.bookingVoucherLoading = false;
        });
    },

    // 删除凭证头
    delVoucher(index) {
      let _this = this;
      if (_this.voucherFormData.voucherData.length <= 1) {
        _this.$message({ type: "warning", message: "至少需要一个凭证" });
        return;
      }
      _this
        .$confirm("确定取消凭证", "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        })
        .then(() => {
          _this.voucherFormData.voucherData.splice(index, 1);
        });
    },

    // 页面数据初始化，主要是将后台获取的数据，整理成页面显示的结构
    dataInit() {
      if (this.voucherHeaderDtos && this.voucherHeaderDtos.length > 0) {
        for (let i = 0; i < this.voucherHeaderDtos.length; i++) {
          let tempData = {
            formData: this.voucherHeaderDtos[i],
            tableData: []
          };
          for (let j = 0; j < this.voucherContentDtos.length; j++) {
            if (
              this.voucherHeaderDtos[i].voucherHeadId ==
              this.voucherContentDtos[j].voucherHeadId
            ) {
              tempData.tableData.push(this.voucherContentDtos[j]);
            }
          }
          this.voucherFormData.voucherData.push(tempData);
        }
      } else {
        let tempData = {
          formData: {},
          tableData: [{}]
        };
        this.voucherFormData.voucherData.push(tempData);
      }
    }
  },
  beforeDestroy() {
    Bus.$off("businessCategoryDemo");
  }
};

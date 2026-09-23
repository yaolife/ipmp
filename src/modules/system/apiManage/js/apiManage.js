import breadcrumb from "@/components/common/breadcrumb";

import queryForm from "@/components/common/queryForm";

import { throttle } from "@/utils/funcUtil";

import { calcHeight } from "@/utils/funcUtil";

import { hasPermission } from "@/permission/btn";

import apiLog from "../page/apiLog.vue";

import api from "../api/api.js";

export default {
  components: {
    breadcrumb,

    queryForm,

    apiLog
  },

  data: function() {
    return {
      hasIcon: false,

      brand: [{ name: "lang.log_manage" }, { name: "lang.log_list" }],

      tableData: [],

      activeLevel: "",

      detailVisible: false,

      currentRow: {},

      queryFields: [
        {
          name: "queryKey",

          label: "",

          labelKey: "关键词查询",

          value: "",

          type: "input",

          display: true,

          order: 1
        },

        {
          name: "relevanceSystem",

          label: "",

          labelKey: "关联系统",

          value: "",

          type: "select",

          display: true,

          order: 2,

          fieldMap: [
            {
              label: "在线监测平台",
              labelKey: "在线监测平台",
              value: "在线监测平台"
            },

            { label: "IOTDB系统", labelKey: "IOTDB系统", value: "IOTDB系统" },

            { label: "SAP系统", labelKey: "SAP系统", value: "SAP系统" },

            { label: "Idoc系统", labelKey: "Idoc系统", value: "Idoc系统" }
          ]
        },

        {
          name: "interfaceStatus",

          label: "",

          labelKey: "接口状态",

          value: "",

          type: "select",

          display: true,

          order: 3,

          fieldMap: [
            { label: "正常", labelKey: "0", value: "0" },

            { label: "告警", labelKey: "1", value: "1" },

            { label: "异常", labelKey: "2", value: "2" },

            { label: "停用", labelKey: "3", value: "3" }
          ]
        }
      ],

      currentNo: 1,

      sizeNo: 10,

      total: 0,

      multipleSelection: [],

      tableLoading: false,

      maxTableHeight: 0,

      editDialogVisible: false,

      buttonLoading: false,

      dialogType: "add", // 对话框类型(add-新增, edit-编辑)

      editForm: {
        // 编辑表单数据

        id: "",

        relevanceSystem: "", //关联系统

        interfaceNameCh: "",

        interfaceNameEn: "",

        downInterfaceUrl: "",

        isEnable: true,

        isMonitor: "", //是否监测

        checkFrequency: "",

        frequencyCron: "",

        remark: ""
      },

      // 下拉选项

      monitorOptions: [
        { label: "是", value: "0" },

        { label: "否", value: "1" }
      ],

      intervalOptions: [
        { label: "3", value: "3" },

        { label: "5", value: "5" },

        { label: "10", value: "10" },

        { label: "20", value: "20" },

        { label: "30", value: "30" },

        { label: "40", value: "40" },

        { label: "60", value: "60" }
      ],

      editRules: {
        // 关联系统

        relevanceSystem: [
          { required: true, message: "请输入关联系统", trigger: "blur" }
        ],

        // 接口名(英文)

        interfaceNameEn: [
          { required: true, message: "请输入接口名(英文)", trigger: "blur" }
        ],

        // 接口名(中文)

        interfaceNameCh: [
          { required: true, message: "请输入接口名(中文)", trigger: "blur" }
        ],

        // 接口URL

        downInterfaceUrl: [
          { required: true, message: "请输入接口URL", trigger: "blur" }
        ]
      }
    };
  },

  computed: {
    computedTableHeight() {
      return this.maxTableHeight;
    },

    dialogTitle() {
      return this.dialogType === "add" ? "新增接口信息" : "编辑接口信息";
    }
  },

  methods: {
    fetchData() {
      this.tableLoading = true;

      this.tableData = [];

      // 直接调用封装好的方法，自动合并表单参数+分页参数

      const fullQueryParams = this.buildFullQueryParams();

      api
        .getFaceInfoListAPI(fullQueryParams)

        .then(result => {
          if (result.data.code === "0") {
            this.tableData = result.data.data.records;

            this.total = result.data.data.total;
          } else {
            this.tableData = [];

            this.total = 0;

            this.$message.error(result.data.msg || "获取数据失败");
          }
        })

        .catch(error => {
          this.$message.error("请求失败，请稍后重试");
        })

        .finally(() => {
          // 无论成功失败都关闭loading，避免之前代码里提前置为false的bug

          this.tableLoading = false;
        });
    },

    // 单独封装的公共参数组装方法

    buildFullQueryParams() {
      // 1. 先获取查询表单的所有筛选条件

      const formParams = this.$refs.queryForm
        ? this.$refs.queryForm.getQueryForm()
        : {};

      // 2. 自动拼接分页参数，和你后端MyBatis-Plus的分页参数命名完全对齐

      const pageParams = {
        pageNum: this.currentNo, // 当前页码

        pageSize: this.sizeNo // 每页条数
      };

      // 3. 兼容全环境实现：合并对象+自动过滤空值，完全替代Object.fromEntries写法

      const mergedParams = { ...formParams, ...pageParams };

      const filteredParams = {};

      Object.keys(mergedParams).forEach(key => {
        const value = mergedParams[key];

        // 和原来的过滤规则完全一致：空字符串、null、undefined全部排除

        if (value !== "" && value !== null && value !== undefined) {
          filteredParams[key] = value;
        }
      });

      return filteredParams;
    },

    toPercentNumMs(num) {
      if (!num) {
        return "0ms";
      }

      // 处理非数字输入

      if (typeof num !== "number" || isNaN(num)) {
        return num + "ms";
      }

      // 转换为百分比并保留两位小

      return num.toFixed(0) + "ms";
    },

    setCronParams() {
      //0 */3 * * * ? 根据频率修改定时任务的cron 也支持自定义定时时间。

      if (!!this.editForm.checkFrequency) {
        this.editForm.frequencyCron =
          "0 */" + this.editForm.checkFrequency + " * * * ?";
      }
    },

    setUserName(row) {
      let userNo = !!row.createNo ? row.createNo : "-";

      let userName = !!row.createUser ? row.createUser : "";

      let user = "[" + userNo + "]" + userName;

      // 把拼接后字符串里的 [-] 替换为空格

      user = user.replace("[-]", " ");

      return user;
    },

    initMaxHeight() {
      calcHeight(this);
    },

    indexMethod(index) {
      return (this.currentNo - 1) * this.sizeNo + index + 1;
    },

    getStatusIcon(value) {
      //interfaceStatus

      //("接口实时状态-正常0-告警1-异常2 -停用3 默认正常")

      switch (value) {
        case "0":
          return "green";

        case "1":
          return "orange";

        case "2":
          return "red";

        case "3":
          return "gray";

        default:
          return "green";
      }
    },

    //日志详情：跳转子组件apiLog并传参

    toLogDetail(row) {
      if (this.$refs.apiLogRef) {
        this.$refs.apiLogRef.show(row);
      }
    },

    handleSelectionChange(val) {
      this.multipleSelection = val;
    },

    handleSizeChange(size) {
      this.sizeNo = size;

      this.currentNo = 1;

      this.fetchData();
    },

    handleCurrentChange(current) {
      this.currentNo = current;

      this.fetchData();
    },

    getQueryParams() {
      const queryForm = this.$refs.queryForm
        ? this.$refs.queryForm.getQueryForm()
        : {};

      return {
        keyword: (queryForm.keyword || "").trim(),

        level: this.activeLevel || "",

        module: queryForm.module || ""
      };
    },

    search() {
      this.currentNo = 1;

      this.fetchData();
    },

    /**

     * 关闭对话框

     */

    dialogClose() {
      this.editDialogVisible = false;

      this.$refs.editForm.resetFields();
    },

    /**

     * 点击编辑按钮

     */

    onClickEdit(row) {
      this.dialogType = "edit";

      this.editForm = {
        id: row.id,

        relevanceSystem: row.relevanceSystem,

        interfaceNameCh: row.interfaceNameCh,

        interfaceNameEn: row.interfaceNameEn,

        downInterfaceUrl: row.downInterfaceUrl,

        isEnable: row.isEnable === "0",

        isMonitor: row.isMonitor,

        checkFrequency: row.checkFrequency,

        frequencyCron: row.frequencyCron,

        remark: row.remark
      };

      this.editDialogVisible = true;
    },

    /** 新增 */

    handleAdd() {
      this.dialogType = "add";

      this.dialogTitle = "新增接口信息";

      this.resetForm();

      this.editDialogVisible = true;
    },

    /** 重置表单 */

    resetForm() {
      this.editForm = {
        id: "",

        relevanceSystem: "", //关联系统

        interfaceNameCh: "",

        interfaceNameEn: "",

        downInterfaceUrl: "",

        isEnable: true, //是否启用

        isMonitor: "", //是否监测

        checkFrequency: "",

        frequencyCron: "",

        remark: ""
      };
    },

    /**

     * 点击删除按钮

     */

    onClickDelete(row) {
      this.$confirm(
        `请确认是否删除？`,

        "提示",

        {
          confirmButtonText: "确定",

          cancelButtonText: "取消",

          type: "warning"
        }
      )
        .then(() => {
          api
            .deleteFaceInfoAPI(row)
            .then(response => {
              if (response.data.code === "0") {
                this.$message.success("删除成功");

                this.fetchData(); // 刷新列表
              } else {
                this.$message.error("删除失败：" + response.data.msg);
              }
            })
            .catch(error => {
              this.$message.error("操作失败");
            });
        })
        .catch(() => {
          // 取消删除
        });
    },

    onClickAddModify() {
      if (!!this.editForm.id && this.editForm.id != "") {
        this.onClickModify();
      } else {
        this.onClickAdd();
      }
    },

    /**

     * 点击确认新增按钮

     */

    onClickAdd() {
      // 再做校验

      this.$refs.editForm.validate(valid => {
        console.log("表单校验结果：", valid); // 看一眼是否通过

        if (valid) {
          this.buttonLoading = true;

          let param = { ...this.editForm };

          param.isEnable = param.isEnable ? "0" : "1";

          api
            .saveFaceInfoAPI(param)
            .then(response => {
              this.buttonLoading = false;

              if (response.data.code === "0") {
                this.$message.success("新增成功");

                this.editDialogVisible = false;

                this.fetchData();
              } else {
                this.$message.error(response.data.msg || "操作失败");
              }
            })
            .catch(error => {
              this.buttonLoading = false;

              this.$message.error("服务异常");

              console.error(error);
            });
        } else {
          // 校验不通过也给提示，不让你觉得没反应

          this.$message.warning("请检查表单填写是否完整");
        }
      });
    },

    /**

     * 点击确认修改按钮

     */

    onClickModify() {
      // 再做校验

      this.$refs.editForm.validate(valid => {
        console.log("表单校验结果：", valid); // 看一眼是否通过

        if (valid) {
          let param = { ...this.editForm };

          param.isEnable = param.isEnable ? "0" : "1";

          api
            .modifyFaceInfoAPI(param)
            .then(response => {
              if (response.data.code === "0") {
                this.$message.success("修改成功");

                this.editDialogVisible = false;

                this.fetchData();
              } else {
                this.$message.error(response.data.msg || "操作失败");
              }
            })
            .catch(error => {
              this.$message.error("服务异常");

              console.error(error);
            });
        } else {
          // 校验不通过也给提示，不让你觉得没反应

          this.$message.warning("请检查表单填写是否完整");
        }
      });
    },

    //是否显示按钮

    showBtn(btn) {
      return hasPermission(btn);
    }
  },

  mounted() {
    this.initMaxHeight();

    this.throttleFunc = throttle(this.initMaxHeight, 500);

    window.addEventListener("resize", this.throttleFunc);

    this.fetchData();
  },

  beforeDestroy() {
    window.removeEventListener("resize", this.throttleFunc);
  }
};

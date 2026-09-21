import breadcrumb from "@/components/common/breadcrumb";
import queryForm from "@/components/common/queryForm";
import { throttle } from "@/utils/funcUtil";
import { calcHeight } from "@/utils/funcUtil";
import { hasPermission } from "@/permission/btn";

import api from "../api";

export default {
  name: "FupportInfo",
  components: {
    breadcrumb,
    queryForm
  },
  data: function () {
    return {
      hasIcon: false,
      brand: [
        { name: "资产管理" },
        { name: "支吊架数据库" }
      ],
      tableData: [],
      queryFields: [
        {
          name: "unitNumber",
          label: "机组号",
          labelKey: "机组号",
          value: "",
          type: "input",
          display: true,
          order: 1,
          placeholder: "请输入"
        },
        {
          name: "hangerNo",
          label: "支吊架编号",
          labelKey: "支吊架编号",
          value: "",
          type: "input",
          display: true,
          order: 2,
          placeholder: "请输入"
        },
        {
          name: "nuclearIslandConventionalIsland",
          label: "核岛/常规岛",
          labelKey: "核岛/常规岛",
          value: "",
          type: "input",
          display: true,
          order: 3,
          placeholder: "请输入"
        },
        {
          name: "systemNumber",
          label: "系统编号",
          labelKey: "系统编号",
          value: "",
          type: "input",
          display: true,
          order: 4,
          placeholder: "多个系统号之间用逗号分隔"
        },
        {
          name: "supportHangerClassification",
          label: "支吊架分类",
          labelKey: "支吊架分类",
          value: "",
          type: "select",
          display: true,
          order: 5,
          placeholder: "请选择",
          fieldMap: [
            { label: "支吊架", value: "支吊架" },
            { label: "弹簧支吊架", value: "弹簧支吊架" },
            { label: "阻尼器", value: "阻尼器" }
          ]
        },
        {
          name: "hangerType",
          label: "支吊架类型",
          labelKey: "支吊架类型",
          value: "",
          type: "input",
          display: true,
          order: 6,
          placeholder: "多个支吊架类型之间用逗号分隔"
        },
        {
          name: "installationArea",
          label: "安全区域",
          labelKey: "安全区域",
          value: "",
          type: "input",
          display: true,
          order: 7,
          placeholder: "请输入"
        },
        {
          name: "roomNumber",
          label: "房间号",
          labelKey: "房间号",
          value: "",
          type: "input",
          display: true,
          order: 8,
          placeholder: "请输入"
        },
        {
          name: "functionalModel",
          label: "功能件型号",
          labelKey: "功能件型号",
          value: "",
          type: "input",
          display: true,
          order: 9,
          placeholder: "请输入"
        },
        {
          name: "rccmGradeSupportHanger",
          label: "支吊架RCCM",
          labelKey: "支吊架RCCM",
          value: "",
          type: "input",
          display: true,
          order: 10,
          placeholder: "请输入"
        },
        {
          name: "numberFunctionalParts",
          label: "功能件数量",
          labelKey: "功能件数量",
          value: "",
          type: "input",
          display: true,
          order: 11,
          placeholder: "请输入"
        },
        {
          name: "manufacturerName",
          label: "制造商名称",
          labelKey: "制造商名称",
          value: "",
          type: "input",
          display: true,
          order: 12,
          placeholder: "请输入"
        },
        {
          name: "pipelineNominalDiameterStart",
          label: "管线公称直径-起始",
          labelKey: "管线公称直径",
          value: "",
          type: "input",
          display: true,
          order: 13,
          placeholder: "请输入"
        },
        {
          name: "pipelineNominalDiameterEnd",
          label: "管线公称直径-结束",
          labelKey: "管线公称直径",
          value: "",
          type: "input",
          display: true,
          order: 14,
          placeholder: "请输入"
        },
        {
          name: "pipeCenterElevationStart",
          label: "管道中心标高-起始",
          labelKey: "管道中心标高",
          value: "",
          type: "input",
          display: true,
          order: 15,
          placeholder: "请输入"
        },
        {
          name: "pipeCenterElevationEnd",
          label: "管道中心标高-结束",
          labelKey: "管道中心标高",
          value: "",
          type: "input",
          display: true,
          order: 16,
          placeholder: "请输入"
        },
        {
          name: "iwerk",
          label: "工厂",
          labelKey: "工厂",
          value: "",
          type: "input",
          display: true,
          order: 17,
          placeholder: "请输入"
        }
      ],
      currentNo: 1,
      sizeNo: 10,
      total: 0,
      multipleSelection: [],
      selectedIds: null,
      tableLoading: false,
      maxTableHeight: 0,
      triggerLoading: false,
      reportLoading: false,
      deleteLoading: false
    };
  },
  computed: {
    computedTableHeight() {
      return this.maxTableHeight;
    }
  },

  methods: {
    initMaxHeight() {
      calcHeight(this);
    },
    indexMethod(index) {
      return (this.currentNo - 1) * this.sizeNo + index + 1;
    },
    handleSelectionChange(val) {
      this.multipleSelection = val || [];
      // 空选中场景兼容，确保最终拼接结果不会出现异常
      if (this.multipleSelection.length === 0) {
        this.selectedIds = '';
        return;
      }
      // 过滤掉选中行里id为空的脏数据，拼接出纯正常逗号分隔ID串
      this.selectedIds = this.multipleSelection
        .filter(item => item.id != null && item.id !== '')
        .map(item => item.id)
        .join(',');
      console.log("当前这里的选中数据集:" + this.selectedIds);
    },
    handleSizeChange(sizeNo) {
      this.sizeNo = sizeNo;
      this.currentNo = 1;
      this.fetchData();
    },
    handleCurrentChange(currentNo) {
      this.currentNo = currentNo;
      this.fetchData();
    },
    getQueryParams() {
      const queryForm = this.$refs.queryForm
        ? this.$refs.queryForm.getQueryForm()
        : {};
      return {
        keyword: (queryForm.keyword || "").trim(),
        type: queryForm.type || ""
      };
    },
    search() {
      this.currentNo = 1;
      this.fetchData();
    },
    loadListOnEnter() {
      if (this._enterListScheduled) return;
      this._enterListScheduled = true;
      this.$nextTick(() => {
        this._enterListScheduled = false;
        this.fetchData();
      });
    },
    fetchData() {
      this.tableLoading = true;
      this.tableData = [];
      // 直接调用封装好的方法，自动合并表单参数+分页参数
      const fullQueryParams = this.buildFullQueryParams();
      api.getFupportListAPI(fullQueryParams)
        .then(result => {
          if (result.data.code === '0') {
            this.tableData = result.data.data.records;
            this.total = result.data.data.total;
          } else {
            this.tableData = [];
            this.total = 0;
            this.$message.error(result.data.msg || '获取数据失败');
          }
        })
        .catch(error => {
          this.$message.error('请求失败，请稍后重试');
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
        pageNum: this.currentNo,  // 当前页码
        pageSize: this.sizeNo       // 每页条数
      };

      // 3. 兼容全环境实现：合并对象+自动过滤空值，完全替代Object.fromEntries写法
      const mergedParams = {...formParams, ...pageParams};
      const filteredParams = {};
      Object.keys(mergedParams).forEach(key => {
        const value = mergedParams[key];
        // 和原来的过滤规则完全一致：空字符串、null、undefined全部排除
        if (value !== '' && value !== null && value !== undefined) {
          filteredParams[key] = value;
        }
      });
      return filteredParams;
    },

    // 跳转新增页面
    goAdd() {
      this.$router.push({
        path: '/hangerDetail',
        query: {
          pageType: 'add'
        }
      })
    },

    // 跳转编辑页面
    goEdit(row) {
      this.$router.push({
        path: '/hangerDetail',
        query: {
          pageType: 'edit',
          id: row.id
        }
      })
    },

    // 跳转查看详情页面（点击支吊架编号链接触发）
    goFupportDetail(row) {
      this.$router.push({
        path: '/hangerDetail',
        query: {
          pageType: 'view',
          id: row.id
        }
      })
    },

    // 你之前列表里的更新、查看操作按钮也可以直接复用这三个方法
    viewRow(row) {
      this.goFupportDetail(row)
    },

    updateRow(row) {
      this.goEdit(row)
    },

    exportFupport(){
      this.exportFupportBatch(this.selectedIds);
    },
    handleMore(command, row) {
      if (command === "export") {
        //导出
        this.exportFupportBatch(row.id);
        return;
      }
      if (command === "delete") {
        this.delFupportInfo(row);
      }
    },

    delFupportInfo(row) {
      //删除
      this.$confirm(this.$t("cm.delete") + " 支吊架编号为：" + row.hangerNo + " ?", this.$t("cm.tips"), {
        confirmButtonText: this.$t("cm.confirm"),
        cancelButtonText: this.$t("cm.cancel"),
        type: "warning"
      })
        .then(() => {
          this.deleteFupportInfo(row.id)
        })
        .catch(() => {
        });
    },
    downloadImportTemplate() {
      api.downloadImportTemplateApi().then((result)=>{
        let blob = new Blob([result.data], {type: "application/vnd.ms-excel"});
        if ('download' in document.createElement('a')) {
          const link = document.createElement("a");
          link.style.display = "none";
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "支吊架数据导入模板.xlsx");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          navigator.msSaveBlob(blob, "支吊架数据导入模板.xlsx");
        }
        this.$message({
          message: "下载导入模板成功!",
          type: 'success',
        });
      }).catch((err) => {
        console.log("导出EXCEL异常：" + err);
      });
    },

    //是否显示按钮
    showBtn(btn) {
      return hasPermission(btn);
    },

    //批量导出
    exportFupportBatch(ids) {
      this.reportLoading = true;
      api.exportFupportApi({ids: ids}).then((result)=>{
        let blob = new Blob([result.data], {type: "application/vnd.ms-excel"});
        if ('download' in document.createElement('a')) {
          const link = document.createElement("a");
          link.style.display = "none";
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "支吊架数据.xlsx");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          navigator.msSaveBlob(blob, "支吊架数据.xlsx");
        }
        this.$message({
          message: "支吊架数据导出成功!",
          type: 'success',
        });
        this.reportLoading = false;
      }).catch((err) => {
        console.log("导出EXCEL异常：" + err);
        this.reportLoading = false;
      });
    },
    deleteFupportInfoBatch() {
      if (!this.selectedIds || this.selectedIds.length === 0) {
        this.$message.warning('请选择至少一条数据!');
        return;
      }
      // 弹出二次确认对话框，提示用户删除操作不可恢复
      this.$confirm('此操作将永久删除选中的支吊架数据，删除后无法恢复，是否继续？', '删除确认', {
        confirmButtonText: '确定删除',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        // 用户点击确认后执行删除接口调用
        this.deleteLoading = true;
        this.deleteFupportInfo(this.selectedIds);
      }).catch(() => {
        // 用户点击取消的提示，不执行删除逻辑
        this.$message.info('已取消删除操作');
      });
    },
    //删除支吊架信息数据
    deleteFupportInfo(ids) {
      api.deleteFupportInfoApi({ids: ids})
        .then(result => {
          this.deleteLoading = false;
          if (result.data.code === '0') {
            this.$message.success('操作成功');
          } else {
            this.$message.error(result.data.msg || '操作失败');
          }
        }).catch(error => {
        this.$message.error('请求失败，请稍后重试');
      }).finally(() => {
        // 无论成功失败都刷新列表
        this.fetchData();
      });
    },
    triggerImport() {
      this.$refs.importInput && this.$refs.importInput.click();
    },

    onImportFile(e) {
      // 1. 基础文件非空校验
      const file = e.target.files && e.target.files[0];
      if (!file) {
        this.$message.warning("请先选择要导入的Excel文件");
        e.target.value = "";
        return;
      }

      // 2. 强制校验文件格式，只允许上传xlsx/xls格式Excel
      const allowedExtensions = ['.xlsx', '.xls'];
      const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
      if (!allowedExtensions.includes(fileExtension)) {
        this.$message.error("导入文件格式错误，请上传后缀为.xlsx或.xls的Excel文件");
        e.target.value = "";
        return;
      }

      // 3. 限制文件大小，最大50MB
      const maxSize = 50 * 1024 * 1024;
      if (file.size > maxSize) {
        this.$message.error("导入文件大小不能超过50MB，请拆分文件后重新上传");
        e.target.value = "";
        return;
      }

      // 4. 构造FormData上传对象
      const formData = new FormData();
      formData.append('file', file);
      this.triggerLoading = true;

      api.importFupportApi(formData)
        .then(result => {
          this.triggerLoading = false;
          if (result.data.code === '0') {
            this.$message.success(result.data.msg);
          } else {
            const errContent = result.data.msg || '导入失败，请检查文件内容';
            this.$alert(errContent, '导入校验不通过', {
              confirmButtonText: '我知道了',
              customStyle: 'max-height: 300px;overflow-y: auto;white-space: pre-line;'
            });
          }
        })
        .catch(error => {
          this.triggerLoading = false;
          let errMsg = '请求失败，请稍后重试';
          if (error.response) {
            const httpCode = error.response.status;
            if (httpCode === 413) errMsg = "上传文件过大，请拆分后重新导入";
            else if (httpCode === 500) errMsg = "服务器处理文件异常，请检查文件格式";
            else if (httpCode === 401 || httpCode === 403) errMsg = "登录已过期或无导入权限，请重新登录";
            else errMsg = `请求错误，错误码：${httpCode}`;
          } else if (error.message.includes('timeout')) {
            errMsg = "导入已超过5分钟限制，请拆分文件重试";
          }
          this.$alert(errMsg, '导入失败', {
            confirmButtonText: '我知道了',
            customStyle: 'max-height: 300px;overflow-y: auto;'
          });
        })
        .finally(() => {
          this.fetchData();
          e.target.value = "";
        });
    }
  },

  mounted() {
    this.initMaxHeight();
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
    this.$root.$on('refreshFupportList', () => {
      // 直接调用你原有的列表查询方法，自动刷新数据
      this.fetchData();
    })
    this.loadListOnEnter();
  },
  activated() {
    this.loadListOnEnter();
    this.initMaxHeight();
  },
  // 页面销毁时注销事件监听，避免内存泄漏
  beforeDestroy() {
    window.removeEventListener("resize", this.throttleFunc);
    this.$root.$off('refreshFupportList');
  }
};

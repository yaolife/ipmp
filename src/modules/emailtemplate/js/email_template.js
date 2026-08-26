import breadcrumb from "@/components/common/breadcrumb";
import api from "../api";
import * as funcUtil from "@/utils/funcUtil";
import queryForm from "@/components/common/queryForm";
import { calcHeight } from "@/utils/funcUtil";
import screenfull from 'screenfull/dist/screenfull.js';
import TableWithToolbar from '@/components/common/TableWithToolbar.vue';

export default {
  components: {
    breadcrumb,
    queryForm,
    TableWithToolbar
  },
  data() {
    return {
      columns: [
        { field: 'templateCode', title: '模板编码' },
        { field: 'templateName', title: '模板名称' },
        {
          field: 'templateStatus',
          title: '模板状态',
          formatter: this.templateStatusFormat
        },
        {
          field: 'templateType',
          title: '模板类型',
          formatter: this.templateTypeFormat
        },
        { field: 'createUserName', title: '创建人' },
        { field: 'createDate', title: '创建时间' },
        { field: 'updateBy', title: '更新人' },
        {
          field: 'updateDate',
          title: '更新时间',
          sortable: true
        },
        {
          field: 'operation',
          title: '操作',
          width: 200,
          slotName: 'operation'
        }
      ],
      searchModel: {
        actName: "",
        procName: ""
      },
      tableToolbar: {
        refresh: true,
        zoom: true,
        custom: true,
        slots: {
          buttons: 'toolbar_buttons'
        }
      },
      isFullscreen: false,
      loading: false,
      templateCode: "",
      detailData: [],
      detailLoading: false,
      detailTotal: 0,
      pageDetailsCurrent: 1,
      formDetailDialogVisible: false,
      filters: funcUtil.splitTime,
      selectnum: "0",
      hasIcon: false,
      brand: [{ name: "tm.template_manage" }, { name: "tm.email_template" }],
      advSearch: "cm.unfold",
      iconArrow: "el-icon-arrow-down",
      commonTemplateName: "",
      commonTemplateNameDisabled: false,
      isSelected: [],
      is_collapse: false,
      dialogDetails: false,
      tableData: [],
      objData: {
        id: ""
      },
      objeDataToDetails: {
        templateCode: "",
        templateContent: ""
      },
      templateCode: "",
      templateName: "",
      templateStatus: "",
      templateType: "",
      createDate: null,
      currentPage: 1,
      pageSize: 10,
      total: 0,
      multipleSelection: [],
      show: false,
      maxTableHeight: 0,
      pageDetailsSize: 10,
      detailCurrent: 1,
      //搜索字段
      queryFields: [
        { name: 'templateName', label: '', labelKey: 'tm.template_name', value: '', type: 'input', display: true, order: 1 },
        { name: 'templateCode', label: '', labelKey: 'tm.template_code', value: '', type: 'input', display: true, order: 2 },
        { name: 'createDate', label: '', labelKey: 'tm.create_date', value: '', type: 'dateRange', relation: 'createDateEnd', display: true, order: 2 },
        {
          name: 'templateStatus', label: '', labelKey: 'tm.templateStatus', value: '', type: 'select', display: true, order: 2, fieldMap: [
            { labelKey: "tm.disable", value: "0" },
            { labelKey: "tm.available", value: "1" }
          ]
        },
        {
          name: 'templateType', label: '', labelKey: 'tm.templateType', value: '', type: 'select', display: true, order: 2, fieldMap: [
            { labelKey: "tm.private", value: "0" },
            { labelKey: "tm.public", value: "1" },
          ]
        },
      ],
      queryFields2: [
        { name: 'procName', label: '流程名称', labelKey: '', value: '', type: 'input', display: true, order: 1 },
        { name: 'actName', label: '环节名称', labelKey: '', value: '', type: 'input', display: true, order: 2 },
      ],
    };
  },
  methods: {

    handleFullscreenChange() {
      this.isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
    },
    // 表格工具栏-刷新
    refresh() {
      this.search()
    },

    // // 表格工具栏-全屏
    // async toggleFullscreen() {
    //   if (screenfull.isEnabled) {
    //     screenfull.toggle(this.$refs.tableContainer);
    //   }
    // },


    htmlUnEscape: function (str) { //反转义
      var unescapes = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&Tab;': " "
      },
        reEscapedHtml = new RegExp(/&(?:amp|lt|gt|quot|#39|Tab);/g);
      return (str && reEscapedHtml.test(str)) ? str.replace(reEscapedHtml, function (entity) {
        return unescapes[entity];
      }) : (str || '')
    },
    // 动态计算高度
    initMaxHeight() {
      calcHeight(this, 115);
    },
    checkSelected: function (val) {
      //val 为更新后的值
      if (val == true) {
        let rows = this.tableData;
        rows.forEach(row => {
          this.$refs.multipleSelection.toggleRowSelection(row, true);
        });
      } else {
        this.$refs.multipleSelection.clearSelection();
      }
    },
    //高级搜索展开
    advanceSearch: function (val) {
      let _this = this;
      _this.commonTemplateName = "";
      _this.commonTemplateNameDisabled = !!val;
      _this.advSearch = val ? "cm.fold" : "cm.unfold";
      _this.iconArrow = val ? "el-icon-arrow-up" : "el-icon-arrow-down";
      let timer = setTimeout(() => {
        _this.initMaxHeight();
        clearTimeout(timer)
      }, 335);
    },
    addEmailTemplate: function () {
      //打开页签
      this.openTab({
        path: '/email_template/add',
        query: {}
      });
    },
    showDetails: function (row) {
      this.objeDataToDetails.templateContent = row.templateContent;
      this.objeDataToDetails.templateCode = row.templateCode;
      this.dialogDetails = true;
    },
    openDetail: function (row, event) {
      this.objeDataToDetails.templateContent = row.templateContent;
      this.objeDataToDetails.templateCode = row.templateCode;
      this.dialogDetails = true;
    },
    editTemplate: function (row) {
      this.objData.id = row.id;
      // this.$router.push({path:'/email_template/edit',query:{id:this.objData.id}});
      // 编辑浏览器窗口
      // window.open(
      //   `/#/email_template/edit?id=${this.objData.id}`
      // );
      this.openTab({
        path: '/email_template/edit',
        query: {
          id: this.objData.id
        }
      });
    },
    //每页条目数变化
    handleSizeChange(pageSize) {
      let params = {
        queryPaging: {
          pageIndex: this.currentPage,
          pageSize: pageSize
        },
        templateCode: this.templateCode,
        templateName: this.templateName,
        templateStatus: this.templateStatus,
        templateType: this.templateType,
        createDate: this.createDate ? this.createDate[0] + " 00:00:00" : "",
        createDateEnd: this.createDate ? this.createDate[1] + " 23:59:59" : ""
      };
      this.currentPage = 1;
      this.pageSize = pageSize;
      this.showEmailTemplateList(params);
    },
    //点击页数进行翻页
    handleCurrentChange(currentPage) {
      let params = {
        queryPaging: {
          pageIndex: currentPage,
          pageSize: this.pageSize
        },
        templateCode: this.templateCode,
        templateName: this.templateName,
        templateStatus: this.templateStatus,
        templateType: this.templateType,
        createDate: this.createDate ? this.createDate[0] + " 00:00:00" : "",
        createDateEnd: this.createDate ? this.createDate[1] + " 23:59:59" : ""
      };
      this.showEmailTemplateList(params);
    },
    //上一页
    prePage: function (currentPage) {
      let params = {
        queryPaging: {
          pageIndex: currentPage,
          pageSize: this.pageSize
        },
        templateCode: this.templateCode,
        templateName: this.templateName,
        templateStatus: this.templateStatus,
        templateType: this.templateType,
        createDate: this.createDate ? this.createDate[0] + " 00:00:00" : "",
        createDateEnd: this.createDate ? this.createDate[1] + " 23:59:59" : ""
      };
      this.showEmailTemplateList(params);
    },
    nextPage: function (currentPage) {
      let params = {
        queryPaging: {
          pageIndex: currentPage,
          pageSize: this.pageSize
        },
        templateCode: this.templateCode,
        templateName: this.templateName,
        templateStatus: this.templateStatus,
        templateType: this.templateType,
        createDate: this.createDate ? this.createDate[0] + " 00:00:00" : "",
        createDateEnd: this.createDate ? this.createDate[1] + " 23:59:59" : ""
      };
      this.showEmailTemplateList(params);
    },
    delClick(row) {
      let _this = this;
      _this
        .$confirm(_this.$t("tm.delete_tips"), _this.$t("tm.tips"), {
          type: "warning",
          confirmButtonText: _this.$t("cm.confirm"),
          cancelButtonText: _this.$t("cm.cancel"),
          cancelButtonClass: "btn-second",
          confirmButtonClass: "btn-default"
        })
        .then(() => {
          //let params = [row.id];
          let id = row.id;
          let params = { ids: id };
          api
            .deleteEmailTemplate(params)
            .then(result => {
              if (result.data.code == "0") {
                let params = {
                  queryPaging: {
                    pageIndex: 1,
                    pageSize: this.pageSize
                  }
                };
                _this.$message({
                  message: _this.$t("dict.deletesuccess"),
                  type: "success"
                });
                _this.resetData();
                _this.showEmailTemplateList(params);
              } else {
                _this.$message({
                  message: result.data.msg,
                  type: "warning"
                });
              }
            })
            .catch(err => {
              _this.$message({
                message: err,
                type: "warning"
              });
            });
        })
        .catch(() => {
          //取消操作
        });
    },
    closeComponent3() {
      this.dialogDetails = false;
    },
    batchDel: function (rows) {
      //进行批量删除操作
      let _this = this;
      if (_this.multipleSelection.length > 0) {
        _this
          .$confirm(this.$t("tm.delete_batch"), _this.$t("tm.tips"), {
            type: "warning",
            confirmButtonText: _this.$t("cm.confirm"),
            cancelButtonText: _this.$t("cm.cancel"),
            cancelButtonClass: "btn-second",
            confirmButtonClass: "btn-default"
          })
          .then(() => {
            /*let params = [];
          for(var i = 0; i < this.multipleSelection.length; i++){
            params.push(this.multipleSelection[i].id);
          }*/
            let ids = "";
            for (var i = 0; i < _this.multipleSelection.length; i++) {
              ids = ids + _this.multipleSelection[i].id;
              if (i != _this.multipleSelection.length - 1) {
                ids = ids + ",";
              }
            }
            let params = { ids: ids };
            api
              .deleteEmailTemplate(params)
              .then(result => {
                if (result.data.code == "0") {
                  let params = {
                    queryPaging: {
                      pageIndex: 1,
                      pageSize: _this.pageSize
                    }
                  };
                  _this.$message({
                    message: _this.$t("dict.deletesuccess"),
                    type: "success"
                  });
                  _this.resetData();
                  _this.showEmailTemplateList(params);
                } else {
                  _this.$message({
                    message: result.data.msg,
                    type: "warning"
                  });
                }
              })
              .catch(err => {
                _this.$message({
                  message: err,
                  type: "warning"
                });
              });
          })
          .catch(() => {
            //取消操作
          });
      } else {
        _this.$message({
          message: "tm.no_any_selected",
          type: "warning"
        });
      }
    },

    //高级搜索
    commonSearch: function () {
      let _this = this;
      let params = {
        queryPaging: {
          pageIndex: 1,
          pageSize: this.pageSize
        },
        templateName: _this.commonTemplateName
      };
      this.showEmailTemplateList(params);
    },
    //普通搜索
    search() {
      let _this = this;
      let queryForm = this.$refs.queryForm.getQueryForm();
      let params = {
        queryPaging: {
          pageIndex: 1,
          pageSize: this.pageSize
        },
        templateCode: queryForm.templateCode,
        templateName: queryForm.templateName,
        templateStatus: queryForm.templateStatus,
        templateType: queryForm.templateType,
        createDate: queryForm.createDate,
        createDateEnd: queryForm.createDateEnd
      };
      this.showEmailTemplateList(params);
    },
    //重置操作
    resetData: function () {
      this.templateCode = "";
      this.templateName = "";
      this.templateStatus = "";
      this.templateType = "";
      this.createDate = null;
    },
    showEmailTemplateList: function (params) {
      var _this = this;
      this.loading = true
      api
        .getEmailTemplateList(params)
        .then(result => {

          if (result.data.code == "0") {
            var data = result.data.data;
            _this.tableData = data.resultData;
            _this.pageSize = data.pageSize;
            _this.pageIndex = data.pageIndex;
            _this.total = data.totalCount;
            this.loading = false
          } else {
            _this.$message({
              message: result.data.msg,
              type: "warning"
            });
            this.loading = false
          }
        })
        .catch(err => {
          _this.$message({
            message: err,
            type: "warning"
          });
        });
    },
    dataFormat: function (time) {
      let date = new Date(time.createDate);
      let month = date.getMonth() + 1;
      let str =
        date.getFullYear() +
        "-" +
        month +
        "-" +
        date.getDate() +
        " " +
        date.getHours() +
        ":" +
        date.getMinutes() +
        ":" +
        date.getSeconds();
      return str;
    },
    formatDate(row, column) {
      let value = row[column.property];
      if (null == value) {
        return null;
      }
      return this.formatWithSeperator(value, "-", ":");
    },
    formatWithSeperator(datetime, dateSeprator, timeSeprator) {
      if (datetime != null) {
        let dateMat = null;
        dateMat = new Date(datetime);
        if (!dateMat.getFullYear()) {
          dateMat = new Date(datetime.replace(/-/g, "/"));
        }
        const year = dateMat.getFullYear();
        const month =
          dateMat.getMonth() + 1 < 10
            ? "0" + (dateMat.getMonth() + 1)
            : dateMat.getMonth() + 1;
        const day =
          dateMat.getDate() < 10 ? "0" + dateMat.getDate() : dateMat.getDate();
        const hh =
          dateMat.getHours() < 10
            ? "0" + dateMat.getHours()
            : dateMat.getHours();
        const mm =
          dateMat.getMinutes() < 10
            ? "0" + dateMat.getMinutes()
            : dateMat.getMinutes();
        const ss =
          dateMat.getSeconds() < 10
            ? "0" + dateMat.getSeconds()
            : dateMat.getSeconds();
        const timeFormat =
          year +
          dateSeprator +
          month +
          dateSeprator +
          day +
          " " +
          hh +
          timeSeprator +
          mm +
          timeSeprator +
          ss;
        return timeFormat;
      }
    },
    templateStatusFormat(status) {
      if (status.row.templateStatus == "0") {
        return "禁用";
      } else if (status.row.templateStatus == "1") {
        return "可用";
      } else if (status.row.templateStatus == "2") {
        return "已删除";
      } else {
        return status.row.templateStatus;
      }
    },
    templateTypeFormat(status) {
      if (status.row.templateType == "0") {
        return "私有";
      } else if (status.row.templateType == "1") {
        return "公共";
      } else {
        return status.row.templateType;
      }
    },
    dateGet(param) {
      if (param) {
        let day = new Date(param);
        let year = day.getFullYear();
        let month = day.getMonth() + 1;
        let date = day.getDate();
        let condate = year + "-" + month + "-" + date;
        return condate;
      } else {
        return "";
      }
    },
    exportEmailTemplate(row) {
      let blob = new Blob([row.templateContent], { type: "application/html" });
      if ("msSaveOrOpenBlob" in navigator) {
        window.navigator.msSaveOrOpenBlob(
          blob,
          `${row.templateName}(${row.templateCode}).html`
        );
      }
      let downloadElement = document.createElement("a");
      let href = window.URL.createObjectURL(blob); // 创建下载的链接
      downloadElement.href = href;
      downloadElement.download = `${row.templateName}(${row.templateCode}).html`; // 下载后文件名
      document.body.appendChild(downloadElement);
      downloadElement.click(); // 点击下载
      document.body.removeChild(downloadElement); // 下载完成移除元素
      window.URL.revokeObjectURL(href); // 释放掉blob对象
    },
    selectAll(val) {
      if (!val.length && !this.tableData.length) {
        this.$refs.xTable1.clearSelection();
      }
    },
    selectAllEvent({ checked, records }) {
      this.multipleSelection = records
      this.selectnum = records.length
      console.log(checked ? '所有勾选事件' : '所有取消事件', records)
    },
    selectChangeEvent({ checked, records }) {
      console.log(checked ? '勾选事件' : '取消事件', records)
      this.multipleSelection = records
      this.selectnum = records.length
    },

    //引用详情每页翻页
    detailChangeCurrentPage(pageDetailsCurrent) {
      this.pageDetailsCurrent = pageDetailsCurrent
      let param = {
        pageNumber: this.pageDetailsCurrent,
        pageSize: this.pageDetailsSize,
        templateCode: this.templateCode,
      };
      this.getRelationUnionIdType(param);
    },
    //引用详情每页条数
    detailChangeSize(pageDetailsSize) {
      this.pageDetailsSize = pageDetailsSize
      let param = {
        pageNumber: this.pageDetailsCurrent,
        pageSize: this.pageDetailsSize,
        templateCode: this.templateCode,
      };
      this.getRelationUnionIdType(param);
    },
    getRelationUnionIdType(param) {
      let _this = this;
      api.queryTemplateRelation(param).then(res => {
        if (res.status === 200) {
          _this.detailData = res.data.data.records;
          _this.detailTotal = res.data.data.total;
        } else {
          _this.$message({ type: "error", message: res.data.data.msg });
        }
      });
    },
    //打开引用详情
    formDetail(row) {
      this.templateCode = row.templateCode
      let param = {
        pageNumber: this.pageDetailsCurrent,
        pageSize: this.pageDetailsSize,
        templateCode: row.templateCode,
      };
      this.getRelationUnionIdType(param);
      this.formDetailDialogVisible = true;
    },
    //关闭引用详情弹窗
    formDetailDialogHandleClose() {
      this.pageDetailsCurrent = 1;
      this.pageDetailsSize = 10;
      this.formDetailDialogVisible = false;
    },
    beforeMoreCommandHandler(optFlag, param) {
      return {
        optFlag: optFlag,
        param: param
      };
    },
    // 更多菜单事件
    moreCommandHandler(command) {

      console.log('[ 222 ]-667', command)
      let param = command.param;
      switch (command.optFlag) {
        case "showDetails":
          this.showDetails(param);
          break;
        case "exportEmailTemplate":
          this.exportEmailTemplate(param);
          break;
        case "formDetail":
          this.formDetail(param);
          break;
        default:
          break;
      }
    },
    searchDetails() {
      let queryForm = this.$refs.queryForm2.getQueryForm();
      this.searchModel.procName = queryForm.procName;
      this.searchModel.actName = queryForm.actName;
      let param = {
        actName: this.searchModel.actName,
        procName: this.searchModel.procName,
        pageNumber: this.pageDetailsCurrent,
        pageSize: this.pageDetailsSize,
        templateCode: this.templateCode,
      };
      this.getRelationUnionIdType(param);
    },
    resetDetails() {
      this.searchModel.actName = ""
      this.searchModel.procName = ""
    }
  },
  computed: {
    templateStatusOptions: function () {
      return [
        {
          label: this.$t("tm.disable"),
          value: 0
        },
        {
          label: this.$t("tm.available"),
          value: 1
        }
      ];
    },
    templateTypeOptions: function () {
      return [
        {
          label: this.$t("tm.private"),
          value: 0
        },
        {
          label: this.$t("tm.public"),
          value: 1
        }
      ];
    },
    computedTableHeight() {
      return this.maxTableHeight;
    }
  },
  created() {
    this.templateStatus = "";

  },
  mounted() {
    let params = {
      queryPaging: {
        pageIndex: this.currentPage,
        pageSize: this.pageSize
      }
    };
    this.showEmailTemplateList(params);
    this.initMaxHeight();
    var that = this;
    this.messageFunc = function (e) {
      if (e.data == 'fushEmailData') {
        if (that.commonTemplateNameDisabled) {
          that.search();
        } else {
          that.commonSearch();
        }
      }
    }
    if (screenfull.isEnabled) {
      screenfull.on('change', () => {
        this.isFullScreen = screenfull.isFullscreen;
      });
    }
    window.addEventListener('message', this.messageFunc);
    // 监听全屏变化事件
    document.addEventListener('fullscreenchange', this.handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', this.handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', this.handleFullscreenChange);
  },
  beforeDestroy() {
    window.removeEventListener('message', this.messageFunc);
    // // 移除事件监听
    document.removeEventListener('fullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('webkitfullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('mozfullscreenchange', this.handleFullscreenChange);
    document.removeEventListener('MSFullscreenChange', this.handleFullscreenChange);
  },
};

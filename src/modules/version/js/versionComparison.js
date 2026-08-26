import breadcrumb from "@/components/common/breadcrumb";
import api from "../api";
import { calcHeight } from "@/utils/funcUtil";
import detail from "../components/detail.vue";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import dict from "@/mixins/dict";

export default {
  components: {
    breadcrumb,
    detail
  },
  mixins: [dict],
  data() {
    return {
      title: "",
      name: "",
      loading: false,
      exportLoading: false,
      versionList: [],
      upgradePathList: [],
      impactTypeList: [],
      versionCompareList: [],
      orgVersion: "", //原始版本
      targetVersion: "", //目标版本
      hasIcon: false,
      brand: [{ name: "tm.template_manage" }, { name: "tm.email_template" }],
      advSearch: "cm.unfold",
      iconArrow: "el-icon-arrow-down",
      tableData: []
    };
  },
  methods: {
    //每页条目数变化
    handleSizeChange(item, val) {
      item.pageDto.currentPage = 1;
      item.pageDto.pageSize = val;
      this.showversionComparisonList(item);
    },
    //点击页数进行翻页
    handleCurrentChange(item, val) {
      item.pageDto.currentPage = val;
      this.showversionComparisonList(item);
    },
    //上一页
    prePage: function(item, val) {
      item.pageDto.currentPage = val;
      this.showversionComparisonList(item);
    },
    nextPage: function(item, val) {
      item.pageDto.currentPage = val;
      this.showversionComparisonList(item);
    },
    showversionComparisonList: function(item) {
      var _this = this;
      let params = {
        ids: item.adjustIds,
        currentPage: item.pageDto.currentPage,
        pageSize: item.pageDto.pageSize
      };
      this.loading = true;
      api
        .getVersionCompare(params)
        .then(result => {
          if (result.data.code == "1") {
            var data = result.data;
            item.pageDto = data.pageDto;
            item.adjustDetails = data.result;
            this.loading = false;
          } else {
            _this.$message({
              message: result.data.msg,
              type: "warning"
            });
            this.loading = false;
          }
        })
        .catch(err => {
          _this.$message({
            message: err,
            type: "warning"
          });
        });
      this.loading = false;
    },
    handleDetail(name, title) {
      this.name = name;
      this.title = title;
      this.$refs.detailRef.visible = true;
    },
    getoperation(name, type) {
      let str = "";
      if (type === "回退") {
        str = `将以下操作进行回退：${name}`;
      } else {
        str = name;
      }
      return str;
    },
    getType(item, type) {
      let str = item;
      this.impactTypeList.forEach(i => {
        if (i.value === item) {
          if (type === "回退") {
            str = `回退：${i.label}`;
          } else {
            str = i.label;
          }
        }
      });
      return str;
    },
    exportExcel() {
      if (this.versionCompareList.length === 0) {
        this.$message({
          message: "无导出文件",
          type: "warning"
        });
      } else {
        var _this = this;
        let params = this.versionCompareList.map(item => {
          return {
            adjustIds: item.adjustIds,
            total: item.pageDto.total,
            operation: item.operation,
            orgVersion: item.orgVersion,
            targetVersion: item.targetVersion
          };
        });
        this.exportLoading = true;
        api
          .exportVersionComByPage(params)
          .then(result => {
            if (result.data.code == "0") {
              _this.exportLoading = false;
              _this.exportExcelOk(result.data.data);
            } else {
              _this.exportLoading = false;
              _this.$message({
                message: result.data.data,
                type: "warning"
              });
            }
          })
          .catch(err => {
            _this.exportLoading = false;
            _this.$message({
              message: err,
              type: "warning"
            });
          });
      }
    },
    exportExcelOk(data) {
      // 创建工作簿
      const wb = XLSX.utils.book_new();
      data.forEach(item => {
        let titleList = [
          "步骤",
          `${item.operation}操作指引`,
          "影响说明",
          `${item.operation}操作类别`,
          "预估涉及代码量",
          "调整条目",
          "调整资源",
          "负责人"
        ];
        let fieldList = [
          "index",
          "operation",
          "influenceItem",
          "type",
          "codeNumber",
          "describe",
          "linkResources",
          "president"
        ];
        let arr = [];
        arr.push(titleList);
        item.data.forEach((i, index) => {
          let newArr = [];
          fieldList.forEach((j, inx) => {
            if (inx === 0) {
              newArr.push(index + 1);
            } else {
              if (j === "type") {
                newArr.push(this.getType(i[j], item.operation));
              } else if (j === "operation") {
                newArr.push(this.getoperation(i[j], item.operation));
              } else {
                newArr.push(i[j]);
              }
            }
          });
          arr.push(newArr);
        });
        let ws_data = arr;
        let ws = XLSX.utils.aoa_to_sheet(ws_data);
        // 设置列宽，例如设置第一列为50宽度单位
        ws["!cols"] = [
          { wch: 5 },
          { wch: 20 },
          { wch: 20 },
          { wch: 20 },
          { wch: 20 },
          { wch: 20 },
          { wch: 50 },
          { wch: 50 }
        ];
        XLSX.utils.book_append_sheet(
          wb,
          ws,
          `从${item.orgVersion}版本 ${item.operation}至 ${item.targetVersion}版本`
        );
      });
      const wbout = XLSX.write(wb, {
        bookType: "xlsx",
        type: "binary"
      });
      // 创建一个Blob对象并指定类型为application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8
      const blob = new Blob([this.s2ab(wbout)], {
        type:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8"
      });
      // 使用file-saver保存文件
      saveAs(blob, `${this.orgVersion}-${this.targetVersion}版本比对.xlsx`);
    },
    s2ab(s) {
      // 将字符串转换为ArrayBuffer对象，用于Blob对象创建
      const buf = new ArrayBuffer(s.length);
      const view = new Uint8Array(buf);
      for (let i = 0; i < s.length; i++) {
        view[i] = s.charCodeAt(i) & 0xff;
      }
      return buf;
    },
    upgradePath() {
      var _this = this;
      let params = {
        orgVersion: this.orgVersion,
        targetVersion: this.targetVersion
      };
      params.projectId = this.$route.query.id || "";
      api
        .upgradePath(params)
        .then(result => {
          if (result.data.code == "0") {
            this.upgradePathList = result.data.data;
          }
          // else {
          //   _this.$message({
          //     message: result.data.msg,
          //     type: "warning"
          //   });
          // }
        })
        .catch(err => {
          _this.$message({
            message: 'cuo',
            type: "warning"
          });
        });
    },
    versionCompare() {
      var _this = this;
      let params = {
        orgVersion: this.orgVersion,
        targetVersion: this.targetVersion
      };
      params.projectId = this.$route.query.id || "";
      api
        .versionCompare(params)
        .then(result => {
          if (result.data.code == "0") {
            this.versionCompareList = result.data.data;
          } else {
            _this.$message({
              message: result.data.message,
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
    },
    async handleComparison() {
      if (!this.orgVersion || !this.targetVersion) {
        this.upgradePathList = [];
        this.versionCompareList = [];
        this.$message({
          message: "原始版本和目标版本均不能为空！",
          type: "warning"
        });
      } else {
        await this.upgradePath();
        await this.versionCompare();
      }
    },
    getVersions() {
      let _this = this;
      let params = {
        projectId: this.$route.query.id
      };
      api
        .getVersions(params)
        .then(result => {
          if (result.data.code !== "1") {
            let arr = result.data.records.map(item => {
              return {
                label: item,
                value: item
              };
            });
            this.versionList = [...arr];
          }
        })
        .catch(err => {
          _this.$message({
            message: err,
            type: "warning"
          });
        });
    },
    //重置操作
    handleReset: function() {
      this.orgVersion = "";
      this.targetVersion = "";
      this.handleComparison();
    }
  },
  computed: {
    computedTableHeight() {
      return this.maxTableHeight;
    }
  },
  created() {},
  mounted() {
    this.getVersions();
    this.dictTreeItem("impactType").then(res => {
      this.impactTypeList = res;
    });
  }
};

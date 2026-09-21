<template>
  <div class="cud-commom-form-style">
    <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div class="cud__scroll--div">
      <el-card>
        <table>
          <tr>
            <th contenteditable="true">Header 1</th>
            <th contenteditable="true">Header 2</th>
            <th contenteditable="true">Header 3</th>
          </tr>
          <tr>
            <td contenteditable="true">Cell 1</td>
            <td contenteditable="true">Cell 2</td>
            <td contenteditable="true">Cell 3</td>
          </tr>
          <tr>
            <td contenteditable="true">Cell 4</td>
            <td contenteditable="true">Cell 5</td>
            <td contenteditable="true">
              Cell 6
              <el-image
                v-if="img"
                ref="previewImg"
                style="display: inherit; cursor: zoom-in"
                :src="img"
                :preview-src-list="srcList"
                width="80"
                height="50"
                @click="clickPreview"
              >
              </el-image>
            </td>
          </tr>
        </table>
        <div>
          <el-button
            style="margin-top: 20px"
            v-if="!img"
            type="primary"
            :disabled="detail"
            @click="handleDialogVisible"
            >插入手写签名</el-button
          >
          <div v-else style="display: flex; align-items: center">
            <el-button
              style="margin-top: 20px"
              :disabled="detail"
              v-if="isDetail"
              @click="handleDialogVisible"
              >签名</el-button
            >
          </div>
          <!-- 签名弹窗 -->
          <el-dialog
            title="签名"
            :visible.sync="dialogVisible"
            width="650px"
            :append-to-body="true"
          >
            <avue-sign ref="sign"></avue-sign>

            <span slot="footer" class="dialog-footer" center>
              <el-button @click="dialogVisible = false">取 消</el-button>
              <el-button @click="handleClear">清空</el-button>
              <el-button type="primary" @click="handleSubmit">确 定</el-button>
            </span>
          </el-dialog>
        </div>

          <!-- @load="iframeLoad" -->
        <iframe
          frameborder="0"
          ref="ascframe"
          :height="500"
          src="http://10.103.7.15:3000/login"
          :width="500"
          scrolling="auto"
        ></iframe>

        <!-- <query-form
          :queryFormId="'email_template'"
          :queryFields="queryFields"
          :loading="loading"
          @resize="initMaxHeight"
          @submit="search"
          ref="queryForm"
          class="cud-commom-form-search"
        >
        </query-form> -->
      </el-card>
      <el-card>
        <!-- <div class="cud__tree--right">
          <div class="table-button">
            <el-button type="primary" size="small" @click="handleAdd">{{
              "新增"
            }}</el-button>
            <el-button
              size="small"
              @click="handleDel(tableData)"
              :disabled="selectnum == '0'"
              >{{ "删除" }}</el-button
            >
          </div>
          <div
            class="cud__table--list"
            :style="{ height: computedTableHeight + 'px' }"
          >
            <el-table
              :data="tableData"
              ref="multipleSelection"
              border
              stripe
              @select-all="selectAll"
              @selection-change="handleSelectionChange"
              v-loading="loading"
              :max-height="computedTableHeight"
              highlight-current-row
              header-row-class-name="cud-office-table-header"
              :default-sort="{ prop: 'updateDate', order: 'descending' }"
              class="cud-office-table"
            >
              <el-table-column
                align="center"
                type="selection"
                width="55"
              ></el-table-column>
              <el-table-column
                min-width="120"
                show-overflow-tooltip
                align="left"
                prop="DEFECT_TRACK_CODE"
                label="缺陷跟踪单编码"
              ></el-table-column>
              <el-table-column
                min-width="120"
                show-overflow-tooltip
                align="left"
                prop="NG_NOTICE_NO"
                label="NG通知单"
              ></el-table-column>
              <el-table-column
                min-width="120"
                show-overflow-tooltip
                align="left"
                prop=" MINOR_DEFECT_TYPE"
                label="小缺陷类型"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="POWER_PLANT"
                label="电厂"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="UNIT_NO"
                label="机组号"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="SYSTEM_CODE"
                label="系统代码"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="TITLE"
                label="标题"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="DESCRIPTION"
                label="描述"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="DESCRIPTION"
                label="描述"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                min-width="120"
                align="left"
                prop="PROBLEM_ATTR_TAG"
                label="问题属性标签"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="RESPONSIBLE_PERSON"
                label="责任人"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="RESPONSIBLE_DEPT"
                label="责任部门"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="TRACK_FREQUENCY"
                label="跟踪频率"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                min-width="120"
                align="left"
                prop="DEFECT_TRACK_STATUS"
                label="缺陷跟踪单状态"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                min-width="120"
                align="left"
                prop="DEFECT_TRACK_STATUS"
                label="缺陷跟踪单状态"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="PROBLEM_TAG"
                label="问题标签"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="WORK_ORDER_NO"
                label="工单号"
              ></el-table-column>
              <el-table-column
                min-width="120"
                show-overflow-tooltip
                align="left"
                prop="ENTRY_USER_NO"
                label="录入人工号"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                min-width="120"
                align="left"
                prop="ENTRY_USER_NAME"
                label="录入人姓名"
              ></el-table-column>
              <el-table-column
                min-width="120"
                show-overflow-tooltip
                align="left"
                prop="ENTRY_TIME"
                label="录入时间"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="REMARKS"
                label="备注"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                align="left"
                prop="FUNCTION_LOCATION"
                label="功能位置"
              ></el-table-column>
              <el-table-column
                show-overflow-tooltip
                min-width="120"
                align="left"
                prop="WORK_ORDER_USER_STATUS"
                label="工单用户状态"
              ></el-table-column>

       

              <el-table-column
                align="center"
                :label="$t('tm.operate')"
                width="120"
                fixed="right"
              >
                <template slot-scope="scope">
                  <el-button
                    @click="onEdit(scope.row)"
                    type="text"
                    size="small"
                    class="cud-common-operate-edit"
                    >{{ $t("tm.modify") }}</el-button
                  >
                  <el-button
                    @click="onDel(scope.row)"
                    type="text"
                    size="small"
                    class="cud-common-operate-delete"
                    >{{ $t("tm.delete") }}</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </div>
          <el-row>
            <div class="cud-special-pagination cud-special-pagination-button">
              <el-pagination
                popper-class="cud-pager-dropdown"
                class="cud__page float-right"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                @prev-click="prePage"
                @next-click="nextPage"
                :current-page="currentPage"
                :page-sizes="[10, 20, 30, 40]"
                :page-size="pageSize"
                layout="total,sizes, prev, pager, next"
                :total="total"
                :pager-count="5"
                :disabled="loading"
              >
              </el-pagination>
            </div>
          </el-row>
        </div> -->
      </el-card>

      <div></div>
    </div>
  </div>
</template>

<script>
import breadcrumb from "@/components/common/breadcrumb";
import api from "./api";
import * as funcUtil from "@/utils/funcUtil";
import queryForm from "@/components/common/queryForm";
import { calcHeight } from "@/utils/funcUtil";

export default {
  components: {
    breadcrumb,
    queryForm,
  },
  data() {
    return {
      searchModel: {
        actName: "",
        procName: "",
      },
      img: "",
      dialogVisible: false,
      srcList: [],
      imgUrl: "",
      isDetail: false,

      templateCode: "",

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

      detail:false,
      tableData: [
        {
          DEFECT_TRACK_CODE: "111",
          NG_NOTICE_NO: "222",
          MINOR_DEFECT_TYPE: "333",
        },
        {
          DEFECT_TRACK_CODE: "111",
          NG_NOTICE_NO: "222",
          MINOR_DEFECT_TYPE: "333",
        },
      ],
      objData: {
        id: "",
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
        {
          name: "DEFECT_TRACK_CODE",
          label: "缺陷跟踪单",
          labelKey: "",
          value: "",
          type: "input",
          display: true,
          order: 1,
        },
        {
          name: "NG_NOTICE_NO",
          label: "NG通知单",
          labelKey: "tm.",
          value: "",
          type: "input",
          display: true,
          order: 2,
        },
        {
          name: "MINOR_DEFECT_TYPE",
          label: "小缺陷类型",
          labelKey: "",
          value: "",
          type: "input",
          display: true,
          order: 2,
        },
      ],
    };
  },
  computed: {
    computedTableHeight() {
      return this.maxTableHeight;
    },
  },
  watch: {
    value: {
      handler(val, o) {
        if (val != null && val != undefined) {
          this.img = val ? JSON.parse(val) : "";
        }
      },
    },
  },
  created() {
    this.templateStatus = "";
  },
  mounted() {
    if (this.detail) {
      this.isDetail = false;
    } else {
      this.isDetail = true;
    }
    if (this.$route && this.$route.query && this.$route.query.action) {
      if (this.$route.query.action === "3") {
        this.isDetail = false;
      } else {
        this.isDetail = true;
      }
    }

    let params = {
      queryPaging: {
        pageIndex: this.currentPage,
        pageSize: this.pageSize,
      },
    };
    // this.initData();
    this.initMaxHeight();
  },

  methods: {
    /** 签名弹窗 */
    handleDialogVisible() {
      this.dialogVisible = true;
    },
    /** 生成图片 */
    handleSubmit() {
      this.img = this.$refs.sign.submit(80, 50);
      this.dialogVisible = false;
      this.$emit("input", JSON.stringify(this.img));
    },
    /** 清空 */
    handleClear() {
      this.$refs.sign.clear();
      this.img = "";
      this.srcList = [];
    },
    /** 点击图片预览 */
    clickPreview() {
      this.srcList = [this.img];
      /** showViewer,解决点击2次才出弹出框问题 */
      this.$refs.previewImg.showViewer = true;
    },
    /** 初始化数据 */
    initData(params) {
      var _this = this;
      this.loading = true;
      api
        .getEmailTemplateList(params)
        .then((result) => {
          if (result.data.code == "0") {
            var data = result.data.data;
            _this.tableData = data.resultData;
            _this.pageSize = data.pageSize;
            _this.pageIndex = data.pageIndex;
            _this.total = data.totalCount;
            this.loading = false;
          } else {
            _this.$message({
              message: result.data.msg,
              type: "warning",
            });
            this.loading = false;
          }
        })
        .catch((err) => {
          _this.$message({
            message: err,
            type: "warning",
          });
        });
    },
    // 动态计算高度
    initMaxHeight() {
      calcHeight(this);
    },

    //高级搜索展开
    advanceSearch(val) {
      let _this = this;
      console.log("advanceSearch --- ", val);
      _this.commonTemplateName = "";
      _this.commonTemplateNameDisabled = !!val;
      _this.advSearch = val ? "cm.fold" : "cm.unfold";
      _this.iconArrow = val ? "el-icon-arrow-up" : "el-icon-arrow-down";
      let timer = setTimeout(() => {
        _this.initMaxHeight();
        clearTimeout(timer);
      }, 335);
    },
    /** 新增 */
    handleAdd: function () {
      this.openTab({
        path: "/email_template/add",
        query: {},
      });
    },

    /** 编辑 */
    onEdit(row) {
      this.objData.id = row.id;
      this.openTab({
        path: "/email_template/edit",
        query: {
          id: this.objData.id,
        },
      });
    },
    // 每页条目数变化
    handleSizeChange(pageSize) {
      let params = {
        queryPaging: {
          pageIndex: this.currentPage,
          pageSize: pageSize,
        },
        templateCode: this.templateCode,
        templateName: this.templateName,
        templateStatus: this.templateStatus,
        templateType: this.templateType,
        createDate: this.createDate ? this.createDate[0] + " 00:00:00" : "",
        createDateEnd: this.createDate ? this.createDate[1] + " 23:59:59" : "",
      };
      this.currentPage = 1;
      this.pageSize = pageSize;
      this.initData(params);
    },
    /** 点击页数进行翻页 */
    handleCurrentChange(currentPage) {
      let params = {
        queryPaging: {
          pageIndex: currentPage,
          pageSize: this.pageSize,
        },
        templateCode: this.templateCode,
        templateName: this.templateName,
        templateStatus: this.templateStatus,
        templateType: this.templateType,
        createDate: this.createDate ? this.createDate[0] + " 00:00:00" : "",
        createDateEnd: this.createDate ? this.createDate[1] + " 23:59:59" : "",
      };
      this.initData(params);
    },
    /** 上一页 */
    prePage: function (currentPage) {
      let params = {
        queryPaging: {
          pageIndex: currentPage,
          pageSize: this.pageSize,
        },
        templateCode: this.templateCode,
        templateName: this.templateName,
        templateStatus: this.templateStatus,
        templateType: this.templateType,
        createDate: this.createDate ? this.createDate[0] + " 00:00:00" : "",
        createDateEnd: this.createDate ? this.createDate[1] + " 23:59:59" : "",
      };
      this.initData(params);
    },
    /** 下一页 */
    nextPage: function (currentPage) {
      let params = {
        queryPaging: {
          pageIndex: currentPage,
          pageSize: this.pageSize,
        },
        templateCode: this.templateCode,
        templateName: this.templateName,
        templateStatus: this.templateStatus,
        templateType: this.templateType,
        createDate: this.createDate ? this.createDate[0] + " 00:00:00" : "",
        createDateEnd: this.createDate ? this.createDate[1] + " 23:59:59" : "",
      };
      this.initData(params);
    },
    /** 删除 */
    onDel(row) {
      let _this = this;
      _this
        .$confirm(_this.$t("tm.delete_tips"), _this.$t("tm.tips"), {
          type: "warning",
          confirmButtonText: _this.$t("cm.confirm"),
          cancelButtonText: _this.$t("cm.cancel"),
          cancelButtonClass: "btn-second",
          confirmButtonClass: "btn-default",
        })
        .then(() => {
          //let params = [row.id];
          let id = row.id;
          let params = { ids: id };
          api
            .deleteEmailTemplate(params)
            .then((result) => {
              //console.log(result);
              if (result.data.code == "0") {
                let params = {
                  queryPaging: {
                    pageIndex: 1,
                    pageSize: this.pageSize,
                  },
                };
                _this.$message({
                  message: _this.$t("dict.deletesuccess"),
                  type: "success",
                });
                _this.resetData();
                _this.initData(params);
              } else {
                _this.$message({
                  message: result.data.msg,
                  type: "warning",
                });
              }
            })
            .catch((err) => {
              _this.$message({
                message: err,
                type: "warning",
              });
            });
        })
        .catch(() => {
          //取消操作
        });
    },
    /** 批量删除 */
    handleDel(rows) {
      let _this = this;
      if (_this.multipleSelection.length > 0) {
        _this
          .$confirm(this.$t("tm.delete_batch"), _this.$t("tm.tips"), {
            type: "warning",
            confirmButtonText: _this.$t("cm.confirm"),
            cancelButtonText: _this.$t("cm.cancel"),
            cancelButtonClass: "btn-second",
            confirmButtonClass: "btn-default",
          })
          .then(() => {
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
              .then((result) => {
                //console.log(result);
                if (result.data.code == "0") {
                  let params = {
                    queryPaging: {
                      pageIndex: 1,
                      pageSize: _this.pageSize,
                    },
                  };
                  _this.$message({
                    message: _this.$t("dict.deletesuccess"),
                    type: "success",
                  });
                  _this.resetData();
                  _this.initData(params);
                } else {
                  _this.$message({
                    message: result.data.msg,
                    type: "warning",
                  });
                }
              })
              .catch((err) => {
                _this.$message({
                  message: err,
                  type: "warning",
                });
              });
          })
          .catch(() => {
            //取消操作
          });
      } else {
        _this.$message({
          message: "tm.no_any_selected",
          type: "warning",
        });
      }
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
      this.selectnum = val.length;
    },
    //高级搜索
    commonSearch() {
      let _this = this;
      let params = {
        queryPaging: {
          pageIndex: 1,
          pageSize: this.pageSize,
        },
        templateName: _this.commonTemplateName,
      };
      this.initData(params);
    },
    //普通搜索
    search() {
      let _this = this;
      let queryForm = this.$refs.queryForm.getQueryForm();
      let params = {
        queryPaging: {
          pageIndex: 1,
          pageSize: this.pageSize,
        },
        templateCode: queryForm.templateCode,
        templateName: queryForm.templateName,
        templateStatus: queryForm.templateStatus,
        templateType: queryForm.templateType,
        createDate: queryForm.createDate,
        createDateEnd: queryForm.createDateEnd,
      };
      this.initData(params);
    },
    //重置操作
    resetData() {
      this.templateCode = "";
      this.templateName = "";
      this.templateStatus = "";
      this.templateType = "";
      this.createDate = null;
    },

    selectAll(val) {
      if (!val.length && !this.tableData.length) {
        this.$refs.multipleSelection.clearSelection();
      }
    },
  },
};
</script>
<style lang="less" scoped>
/deep/ .el-card__body {
  padding: 15px 15px 0;
}
table,
th,
td {
  border: 1px solid black;
  border-collapse: collapse;
}
th,
td {
  padding: 10px;
  text-align: center;
}
</style>

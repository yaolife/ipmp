<template>
  <div>
    <div class="brand" v-if="isShowBrand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div
      :class="isShowBrand ? 'container container-top' : ''"
      :style="isShowBrand ? 'padding-bottom:15px' : ''"
    >
      <el-row class="table-body">
        <!-- row-style="height:50px;" header-row-style="height:50px;"  -->
        <el-table
          :style="isShowBrand ? 'margin-top:15px;margin-bottom:15px;' : ''"
          :data="flowLog"
          class="no_line"
          fixed
          ref="flowLogTable"
        >
          <el-table-column
            prop="processLogDTO.actName"
            :label="$t('pw.actor_name')"
          ></el-table-column>
          <el-table-column :label="$t('pw.deal_man')">
            <template slot-scope="scope">
              {{
                "[" +
                  scope.row.processLogDTO.approverAccount +
                  "]" +
                  scope.row.processLogDTO.approverChsName
              }}
            </template>
          </el-table-column>
          <el-table-column
            :formatter="transTime"
            prop="processLogDTO.finishDate"
            :label="$t('pw.deal_time')"
          ></el-table-column>
          <el-table-column
            prop="processLogDTO.comment"
            :label="$t('pw.deal_suggest')"
          ></el-table-column>
        </el-table>
      </el-row>

      <el-row class="table-bottom">
        <!-- 翻页 
                        current-page 表示当前页
                        page-size 表示一页显示的条数
                        page-count 表示总页数
                        total 表示总条数
                -->
        <el-pagination popper-class="cud-pager-dropdown"
          ref="pager"
          @size-change="selectPageSize"
          @current-change="selectPage"
          @prev-click="lastPage"
          @next-click="nextPage"
          :current-page="currentPage"
          :page-sizes="[10, 20, 30, 40]"
          :page-size="pageSize"
          :pager-count="5"
          layout="total,sizes, prev, pager, next"
          :total="total"
        >
        </el-pagination>
      </el-row>

      <el-row>
        <div style="text-align: center">
          <el-button
            v-if="isShowBrand"
            class="btn-second"
            size="small"
            @click="back"
            style="display: inline-block"
            >返回</el-button
          >
        </div>
      </el-row>
    </div>
  </div>
</template>

<script>
import { mixinsComp } from "@/mixins/index";
import breadcrumb from "./breadcrumb";

import { getProcInsTrace } from "@/api/api.js";
export default {
  mixins: [mixinsComp],
  components: { breadcrumb },
  props: ["showBrand", "tableData", "procInsId"],
  data() {
    return {
      mixinsCmptCode: "flowlog",
      mixinsCmptName: "流程日志列表",
      brand: [{ name: "lang.logList" }],
      hasIcon: false,
      flowLog: [],
      isShowBrand: this.showBrand,
      currentPage: 1,
      pageSize: 10,
      total: 0
    };
  },
  methods: {
    back: function() {
      this.$router.push("need_deal_task");
    },

    showLogList: function(params) {
      let _this = this;
      _this.flowLog = [];
      getProcInsTrace(params)
        .then(result => {
          //console.log(result);
          if (result.status == "200" && result.data.code == "0") {
            let data = result.data.data;
            // console.log(data);
            data = data.data;
            let dataList = data.ProcessTraces;

            _this.flowLog.push(...dataList);
            let pageObj = data.Paging;
            _this.currentPage = pageObj.startPage;
            _this.pageSize = pageObj.pageSize;
            _this.total = pageObj.totalCount;
          }
        })
        .catch(err => {});
    },
    selectPageSize: function(pageSize) {
      let params = {
        pageIndex: this.currentPage,
        pageSize: (this.pageSize = pageSize),
        t: Math.random(),
        procInsId: this.$route.query.obj.procInstID
      };
      this.showLogList(params);
    },
    selectPage: function(nowPage) {
      let params = {
        pageIndex: (this.currentPage = nowPage),
        pageSize: this.pageSize,
        t: Math.random(),
        procInsId: this.$route.query.obj.procInstID
      };
      this.showLogList(params);
    },
    lastPage: function(nowPage) {
      let params = {
        pageIndex: (this.currentPage = this.currentPage - 1),
        pageSize: this.pageSize,
        t: Math.random(),
        procInsId: this.$route.query.obj.procInstID
      };
      this.showLogList(params);
    },
    nextPage: function(nowPage) {
      let params = {
        pageIndex: (this.currentPage = this.currentPage + 1),
        pageSize: this.pageSize,
        t: Math.random(),
        procInsId: this.$route.query.obj.procInstID
      };
      this.showLogList(params);
    },
    transTime: function(row, col, val) {
      //对时间进行处理

      if (val == "0001-01-01T00:00:00") {
        return "未处理";
      } else {
        return val;
      }
    }
  },
  mounted() {
    if (typeof this.showBrand == "undefined") {
      this.isShowBrand = true;

      let params = {
        pageIndex: this.currentPage,
        pageSize: this.pageSize,
        t: Math.random(),
        procInsId: this.$route.query.obj.procInstID
      };
      //console.log();
      this.showLogList(params);
    } else {
      let params = {
        pageIndex: this.currentPage,
        pageSize: this.pageSize,
        t: Math.random(),
        procInsId: this.procInsId
      };
      this.showLogList(params);
    }

    if (typeof this.tableData != "undefined") {
      this.flowLog = this.tableData;
    }
  }
};
</script>

<style></style>

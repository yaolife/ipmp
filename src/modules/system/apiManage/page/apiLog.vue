<template>
  <el-dialog
    :visible.sync="apiLogVisible"
    :destroy-on-close="true"
    :title="interfaceTitle"
    :close-on-click-modal="false"
    :append-to-body="true"
    width="80%"
    @close="resetSearchForm"
    custom-class="log-dialog"
  >
    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-form :model="searchForm" size="small" inline>
        <el-form-item>
          <el-input
            v-model="searchForm.queryKey"
            placeholder="请输入入参参数查询"
            prefix-icon="el-icon-search"
            class="search-input"
          />
        </el-form-item>
        <el-form-item label="响应状态">
          <el-select v-model="searchForm.responseStatus" placeholder="请选择">
            <el-option label="成功" value="SUCCESS" />
            <el-option label="失败" value="ERROR" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间">
          <el-date-picker
            v-model="searchForm.requestTimeStart"
            type="date"
            format="MM-dd"
            value-format="yyyy-MM-dd"
            placeholder="选择日期"
            class="date-picker"
          />
        </el-form-item>
        <el-form-item label="结束时间">
          <el-date-picker
            v-model="searchForm.requestTimeEnd"
            type="date"
            format="MM-dd"
            value-format="yyyy-MM-dd"
            placeholder="选择日期"
            class="date-picker"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="small" @click="handleSearch"
            >搜索</el-button
          >
          <el-button type="default" size="small" @click="resetSearchForm"
            >重置</el-button
          >
        </el-form-item>
      </el-form>
    </div>

    <!-- 表格区域 -->
    <div class="table-container">
      <el-table
        :data="apiLogList"
        border
        v-loading="loading"
        ref="dataTable"
        style="width: 100%"
        :height="420"
        size="small"
        :header-cell-style="{ background: '#f5f7fa' }"
      >
        <!-- <el-table-column type="selection" width="55" align="center" /> -->
        <el-table-column type="index" label="序号" width="60" align="center" />
        <el-table-column
          label="请求时间"
          prop="requestTime"
          align="center"
          width="150"
        />

        <el-table-column
          label="响应状态"
          prop="responseStatus"
          align="center"
          width="80"
        >
          <template slot-scope="scope">
            <el-tag type="success" size="mini"
                    v-if="scope.row.responseStatus === 'SUCCESS'"
                    style="color: green;"
            >成功</el-tag>
            <el-tag type="error" size="mini" style="color: orangered;" v-else>失败</el-tag>
          </template>
        </el-table-column>

        <el-table-column
          label="请求ip"
          prop="requestIp"
          align="center"
          width="150"
        />
        <el-table-column
          label="入参参数"
          prop="methodArgs"
          align="center"
          show-overflow-tooltip
        />
        <el-table-column
          label="响应消息"
          prop="responseMsg"
          align="center"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>{{(!scope.row.responseMsg?"/":scope.row.responseMsg)}} </span>
          </template>
        </el-table-column>

        <el-table-column
          label="响应数据"
          prop="responseData"
          align="center"
          show-overflow-tooltip
        >
          <template slot-scope="scope">
            <span>{{(!scope.row.responseData?"/":scope.row.responseData)}} </span>
          </template>
        </el-table-column>

        <el-table-column
          label="响应耗时"
          prop="costTime"
          align="center"
          width="100"
        >
          <template slot-scope="scope">
            <span>{{toPercentNumMs(scope.row.costTime)}}</span>
          </template>
        </el-table-column>

        <el-table-column
          align="center"
          prop="operUser"
          label="操作用户"
          width="180"
        ></el-table-column>

      </el-table>
    </div>

    <!-- 分页区域 -->
    <div class="pagination-container">
      <el-pagination
        popper-class="cud-pager-dropdown"
        layout="total, sizes, prev, pager, next"
        :current-page="searchForm.pageNum"
        :page-sizes="[10, 20, 30, 40]"
        :page-size="searchForm.pageSize"
        :total="total"
        :disabled="loading"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      ></el-pagination>
    </div>
  </el-dialog>
</template>

<script>
import api from "../api/api.js";

export default {
  data() {
    return {
      interfaceTitle: "接口日志详情",
      apiLogVisible: false,
      loading: false,
      searchForm: {
        interfaceNameEn: "",
        callType: "",
        queryKey: "",
        responseStatus: "",
        requestTimeStart: "",
        requestTimeEnd: "",
        pageNum: 1,
        pageSize: 10
      },
      apiLogList: [],
      total: 0
    };
  },
  methods: {
    show(row) {
      this.apiLogVisible = true;
      this.searchForm.interfaceNameEn = row.interfaceNameEn;
      this.searchForm.callType = row.relevanceSystem;
      this.searchForm.pageNum = 1;
      this.interfaceTitle = "【" + row.relevanceSystem + "-" + row.interfaceNameCh + "】日志详情";
      this.$nextTick(() => {
        this.initLogInfoList();
      });
    },
    toPercentNumMs(num) {
      if (!num) {
        return "0ms";
      }
      if (typeof num !== "number" || isNaN(num)) {
        return num + "ms";
      }
      return num.toFixed(0) + "ms";
    },
    initLogInfoList() {
      this.loading = true;
      api.getApiLogListAPI(this.searchForm).then((result) => {
        if (result.data.code == "0") {
          this.apiLogList = result.data.data.records || [];
          this.total = result.data.data.total || 0;
        } else {
          this.apiLogList = [];
          this.total = 0;
          this.$message.error("数据加载失败" + (result.data.msg || ""));
        }
        this.loading = false;
      }).catch((error) => {
        console.error("初始化表格数据失败：", error);
        this.loading = false;
        this.$message.error("数据加载失败，请稍后重试");
      });
    },
    handleSearch() {
      this.searchForm.pageNum = 1;
      this.initLogInfoList();
    },
    handleSizeChange(size) {
      this.searchForm.pageSize = size;
      this.searchForm.pageNum = 1;
      this.initLogInfoList();
    },
    handleCurrentChange(current) {
      this.searchForm.pageNum = current;
      this.initLogInfoList();
    },
    resetSearchForm() {
      this.searchForm.queryKey = "";
      this.searchForm.responseStatus = "";
      this.searchForm.requestTimeStart = "";
      this.searchForm.requestTimeEnd = "";
      this.searchForm.pageNum = 1;
      this.searchForm.pageSize = 10;
      if (this.apiLogVisible) {
        this.handleSearch();
      }
    }
  }
};
</script>

<style scoped lang="less">
/* 弹窗样式 */
.log-dialog {
  /deep/ .el-dialog__title {
    font-size: 14px;
    font-weight: 500;
  }
  /deep/ .el-dialog__body {
    padding: 10px 20px;
  }
}

/* 搜索栏 */
.search-bar {
  margin-bottom: 15px;
  /deep/ .el-form-item {
    margin-right: 10px;
    margin-bottom: 0;
  }
  .search-input {
    width: 180px;
  }
  .date-picker {
    width: 120px;
  }
}

/* 表格容器 */
.table-container {
  /deep/ .el-table {
    --el-table-row-hover-bg-color: #f5f7fa;
  }
  /deep/ .el-table th {
    font-weight: 500;
    color: #666;
  }
}

/* 分页区域 */
.pagination-container {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 15px;
  .total-count {
    margin-right: 20px;
    font-size: 12px;
    color: #666;
  }
}
</style>

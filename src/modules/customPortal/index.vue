<template>
  <div class="custom-portal">
    <div class="custom-portal-container">
      <!-- <div class="page-title">页面管理</div> -->
      <el-card>
        <!-- 搜索区域 -->
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="页面名称：">
            <el-input
              v-model="searchForm.pageName"
              placeholder="请输入页面名称"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item v-if="false" label="页面类型">
            <el-select
              v-model="searchForm.pageType"
              placeholder="请选择页面类型"
              clearable
            >
              <el-option
                v-for="item in pageTypeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              >
              </el-option>
            </el-select>
          </el-form-item>
          <el-form-item v-if="false" label="路由路径">
            <el-input
              v-model="searchForm.routePath"
              placeholder="请输入路由路径"
              clearable
            ></el-input>
          </el-form-item>
          <el-form-item style="float: right">
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </el-card>
      <el-card class="card-box">
        <!-- 操作按钮区域 -->
        <div class="operation-bar">
          <el-button size="small" type="primary" @click="handleCreate">
            <i class="el-icon-plus"></i> 创建
          </el-button>
          <el-upload
            class="import-upload"
            action=""
            :show-file-list="false"
            accept=".zip"
            :http-request="handUpLoad"
          >
            <el-button size="small">
              <i class="el-icon-download"></i> 导入
            </el-button>
          </el-upload>
          <el-button
            size="small"
            :disabled="!selectedRows.length"
            @click="handleExport"
          >
            <i class="el-icon-download"></i> 导出
          </el-button>
          <el-button
            size="small"
            @click="handlePublishBatch"
            :disabled="!selectedRows.length"
          >
            <i class="el-icon-upload"></i> 发布
          </el-button>
          <el-button
            size="small"
            @click="handleDeleteBatch"
            :disabled="checkdelete()"
          >
            <i class="el-icon-delete"></i> 删除
          </el-button>
        </div>

        <!-- 表格区域 -->
        <el-table
          v-loading="loading"
          :data="tableData"
          border
          stripe
          style="width: 100%"
          height="calc(100% - 136px)"
          @selection-change="handleSelectionChange"
        >
          <el-table-column type="selection" width="55"> </el-table-column>
          <el-table-column
            prop="pageName"
            label="页面名称"
            show-overflow-tooltip
          >
            <template slot-scope="scope">
              <span>{{ scope.row.pageName }}</span>
            </template>
          </el-table-column>
          <el-table-column v-if="false" prop="type" label="页面类型">
            <template slot-scope="scope">
              <el-tag
                v-if="scope.row.type"
                :type="getPageTypeTag(scope.row.type)"
              >
                {{ getPageTypeLabel(scope.row.type) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="monitorCode"
            show-overflow-tooltip
            label="监控码"
            min-width="200"
          >
          </el-table-column>
          <el-table-column
            prop="updateTime"
            label="最后修改时间"
            width="160"
            align="center"
          >
            <template slot-scope="scope">
              {{ formatDateTime(scope.row.modifyDate) }}
            </template>
          </el-table-column>
          <el-table-column
            prop="updateUserName"
            label="最后修改人"
            width="140"
            align="center"
          >
            <template slot-scope="scope">
              {{ scope.row.modifyUserName }}
            </template>
          </el-table-column>
          <el-table-column
            prop="createTime"
            label="创建时间"
            width="160"
            align="center"
          >
            <template slot-scope="scope">
              {{ formatDateTime(scope.row.createDate) }}
            </template>
          </el-table-column>
          <el-table-column prop="routeUrl" label="路由地址">
            <template slot-scope="scope">
              <span class="route-url" @click="goHome(scope.row)">{{
                scope.row.routeUrl
              }}</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="createUserName"
            label="创建人"
            width="140"
            align="center"
          >
          </el-table-column>
          <!-- <el-table-column prop="takeEffect" label="是否生效" align="center">
            <template slot-scope="scope">
              <div class="takeEffect-box">
                <el-switch v-model="scope.row.takeEffect"></el-switch>
                <div class="pop-box" @click="onSwitch(scope.row)"></div>
              </div>
            </template>
          </el-table-column> -->
          <el-table-column
            prop="chiefPageFlag"
            label="是否是首页"
            align="center"
          >
            <template slot-scope="scope">
              <div class="chiefFlag-box">
                <el-switch v-model="scope.row.chiefPageFlag"></el-switch>
                <div class="pop-box" @click="onSwitchHome(scope.row)"></div>
              </div>
            </template>
          </el-table-column>
          <el-table-column
            label="操作"
            width="270"
            fixed="right"
            align="center"
          >
            <template slot-scope="scope">
              <el-button
                type="text"
                size="small"
                @click="handleEdit(scope.row)"
              >
                <i class="el-icon-edit"></i> 编辑
              </el-button>
              <el-button
                type="text"
                size="small"
                @click="handlePublish(scope.row)"
              >
                <i class="el-icon-upload"></i>
                发布
              </el-button>
              <el-button
                type="text"
                size="small"
                @click="handleVersion(scope.row)"
              >
                <i class="el-icon-time"></i> 版本
              </el-button>
              <el-button
                type="text"
                size="small"
                :disabled="scope.row.chiefPageFlag"
                :class="[
                  'delete-btn',
                  { chiefPageFlag: scope.row.chiefPageFlag },
                ]"
                @click="handleDelete(scope.row)"
              >
                <i class="el-icon-delete"></i> 删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <div class="pagination-container">
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="pagination.current"
            :page-sizes="[10, 20, 30, 50]"
            :page-size="pagination.pageSize"
            layout="total,sizes, prev, pager, next"
            :total="pagination.total"
            :pager-count="5"
          >
          </el-pagination>
        </div>
      </el-card>
      <!-- 页面编辑/创建弹窗 -->
      <page-dialog
        :visible.sync="dialogVisible"
        @success="handleDialogSuccess"
      />
      <!-- 发布说明弹窗 -->
      <publish-dialog
        :visible.sync="publishDialogVisible"
        :page-ids="selectedPublishPageIds"
        @success="handlePublishSuccess"
      />

      <!-- 版本历史弹窗 -->
      <version-dialog
        :visible.sync="versionDialogVisible"
        :page-id="currentVersionPageId"
        :page-name="currentVersionPageName"
      />
    </div>
  </div>
</template>

<script>
import PageDialog from "./components/PageDialog";
import PublishDialog from "./components/PublishDialog";
import VersionDialog from "./components/VersionDialog";
import {
  getPageList,
  deletePage,
  exportPages,
  importPages,
  updatePageInfo,
} from "@/modules/customPortal/api/pageManagement";

export default {
  name: "pageManagement",
  components: {
    PageDialog,
    PublishDialog,
    VersionDialog,
  },
  data() {
    return {
      publishDialogVisible: false, // 发布弹窗显示状态
      selectedPublishPageIds: [], // 批量发布的页面ID数组
      versionDialogVisible: false, // 版本历史弹窗显示状态
      currentVersionPageId: "", // 当前查看版本的页面ID
      currentVersionPageName: "", // 当前查看版本的页面名称
      dialogVisible: false, // 弹窗显示状态
      tableData: [], // 表格数据
      loading: false, // 加载状态
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0,
      },
      selectedRows: [], // 选中的行
      searchForm: {
        // 搜索表单数据
        pageName: "",
        pageType: "",
        routePath: "",
      },
      pageTypeOptions: [
        // 页面类型选项
        { value: "NORMAL", label: "普通页面" },
        { value: "SYSTEM", label: "系统页面" },
        { value: "CUSTOM", label: "自定义页面" },
      ],
    };
  },

  created() {
    this.fetchTableData();
  },

  methods: {
    async handUpLoad(fileobj) {
      try {
        const param = new FormData();
        param.append("zipFile", fileobj.file);
        const { data, code, msg } = await importPages(param);
        if (code === "1") {
          this.$message.error(msg || "失败");
          reutrn;
        }
        this.$message.success("导入成功");
        this.fetchTableData();
      } catch (error) {
        this.$message.error("导入失败");
      }
    },
    // 获取页面类型标签样式
    getPageTypeTag(type) {
      const map = {
        NORMAL: "",
        SYSTEM: "success",
        CUSTOM: "warning",
      };
      return map[type] || "";
    },

    // 获取页面类型显示文本
    getPageTypeLabel(type) {
      const map = {
        NORMAL: "普通页面",
        SYSTEM: "系统页面",
        CUSTOM: "自定义页面",
      };
      return map[type] || type;
    },

    // 获取表格数据
    async fetchTableData() {
      this.loading = true;
      try {
        const { current, pageSize } = this.pagination;
        const res = await getPageList(
          {
            pages: { current, pageSize },
            params: {
              pageName: this.searchForm.pageName,
            },
          },
          false
        );
        if (res.records && res.records.length > 0) {
          this.tableData = res.records.map((d) => {
            // if (d.chiefPageFlag) {
            //   d.routeUrl = "/welcome";
            // }
            d.takeEffect = d.takeEffect === 1;
            return d;
          });
          this.pagination.total = res.total;
          console.log("数据", this.tableData);
        } else {
          this.tableData = [];
          this.pagination.total = 0;
        }
      } catch (error) {
        this.$message.error("获取页面列表失败");
      } finally {
        this.loading = false;
      }
    },

    // 搜索
    handleSearch() {
      this.pagination.current = 1;
      this.fetchTableData();
    },

    // 重置搜索
    resetSearch() {
      this.searchForm = {
        pageName: "",
        pageType: "",
        routePath: "",
      };
      this.handleSearch();
    },

    // 表格选择变化
    handleSelectionChange(rows) {
      this.selectedRows = rows;
    },
    // checkSelectable(row, index) {
    //   return !row.chiefPageFlag;
    // },

    // 当前页变化
    handleCurrentChange(val) {
      this.pagination.current = val;
      this.fetchTableData();
    },

    // 格式化时间
    formatDateTime(date) {
      if (!date) return "";
      const d = new Date(date);
      const pad = (num) => num.toString().padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
      )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    },

    // 获取页面类型名称
    getPageTypeName(type) {
      const option = this.pageTypeOptions.find((item) => item.value === type);
      return option ? option.label : type;
    },

    // 创建页面
    handleCreate() {
      this.dialogVisible = true;
    },
    // 是否生效
    onSwitch(row) {
      this.$confirm(`确认是否生效`, "提示", { type: "warning" })
        .then(async (res) => {
          console.log(111, res);
          const { data, code } = await updatePageInfo({
            takeEffect: row.takeEffect ? 0 : 1,
            id: row.id,
            roleIds: row.roleIds,
          });
          if (code === "0") {
            this.$message.success("更新成功");
            this.fetchTableData();
          }
        })
        .catch(() => {});
    },
    // 是否主页
    onSwitchHome(row) {
      this.$confirm(`确认是否设置为主页`, "提示", { type: "warning" })
        .then(async (res) => {
          console.log(111, res);
          const { data, code } = await updatePageInfo({
            chiefPageFlag: row.chiefPageFlag ? 0 : 1,
            id: row.id,
            roleIds: row.roleIds,
          });
          if (code === "0") {
            this.$message.success("更新成功");
            this.fetchTableData();
          }
        })
        .catch(() => {});
    },

    goHome(row) {
      if (!row.takeEffect) {
        return;
      }
      this.$router.push({
        path: `/welcome${row.routeUrl}/${row.id}`,
      });
    },
    // 处理编辑页面
    handleEdit(row) {
      this.$router.push({
        path: `/customGraph/${row.id}`,
      });
    },

    //判断能否删除
    checkdelete(row) {
      if (!this.selectedRows.length) {
        return true;
      }
      const hasChiefPage = this.selectedRows.some((item) => {
        return item.chiefPageFlag;
      });

      return hasChiefPage;
    },

    // 处理删除页面
    handleDelete(row) {
      this.$confirm("确认删除该页面吗？", "提示", {
        type: "warning",
      })
        .then(async () => {
          try {
            const { code, msg, message } = await deletePage({ ids: [row.id] });
            if (code === "0") {
              this.$message.success("删除成功");
              this.fetchTableData();
            } else {
              this.$message.error(msg || message);
            }
          } catch (error) {
            this.$message.error("删除页面失败");
          }
        })
        .catch(() => {});
    },

    // 处理批量删除
    handleDeleteBatch() {
      if (!this.selectedRows.length) return;

      this.$confirm(
        `确认删除选中的 ${this.selectedRows.length} 个页面吗？`,
        "提示",
        {
          type: "warning",
        }
      )
        .then(async () => {
          try {
            const ids = this.selectedRows.map((row) => row.id);
            await deletePage({ ids });
            this.$message.success("批量删除成功");
            this.fetchTableData();
          } catch (error) {
            this.$message.error("批量删除页面失败");
          }
        })
        .catch(() => {});
    },

    // 处理发布页面
    handlePublish(row) {
      if (row.takeEffect) {
        this.selectedPublishPageIds = [row.id];
        this.publishDialogVisible = true;
      } else {
        this.$message.warning("请先设置成生效");
      }
    },

    // 处理批量发布
    handlePublishBatch() {
      if (!this.selectedRows.length) return;
      this.selectedPublishPageIds = this.selectedRows.map((row) => row.id);
      this.publishDialogVisible = true;
    },

    // 处理导入
    async handleImport() {
      try {
        // 创建一个隐藏的文件输入框
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".zip"; // 限制文件类型

        // 监听文件选择
        input.onchange = async (e) => {
          const file = e.target.files[0];
          if (!file) return;

          // 创建 FormData
          const formData = new FormData();
          formData.append("file", file);

          // 调用导入接口
          await importPages(formData);
          this.$message.success("导入成功");
          this.fetchTableData();
        };

        // 触发文件选择
        input.click();
      } catch (error) {
        this.$message.error("导入页面失败");
      }
    },

    // 处理导出
    async handleExport() {
      try {
        const params = {
          ids: this.selectedRows.map((row) => row.id),
        };
        const response = await exportPages(params);
        // // 创建下载链接
        const url = window.URL.createObjectURL(
          new Blob([
            response,
            { type: "application/octet-stream;charset=utf-8" },
          ])
        );
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `自定义门户_${new Date().getTime()}.zip`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        this.$message.success("导出成功");
      } catch (error) {
        this.$message.error("导出页面失败");
      }
    },
    // 处理创建成功
    handleDialogSuccess(info) {
      this.handleEdit(info);
      this.fetchTableData();
    },
    // 处理版本
    handleVersion(row) {
      this.currentVersionPageId = row.id;
      this.currentVersionPageName = row.pageName;
      this.versionDialogVisible = true;
    },

    // 处理每页条数变化
    handleSizeChange(size) {
      this.pagination.pageSize = size;
      this.pagination.current = 1;

      this.fetchTableData();
    },

    // 处理发布成功
    handlePublishSuccess() {
      this.fetchTableData();
    },
  },
};
</script>
<style lang="less" scoped>
/deep/ .el-card__body {
  padding: 15px 15px 0;
  height: 100%;
}

.card-box {
  height: calc(100% - 100px);
}
.takeEffect-box {
  width: 40px;
  position: relative;
  margin: 0 auto;
}
.chiefFlag-box {
  width: 40px;
  position: relative;
  margin: 0 auto;
}
.pop-box {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  cursor: pointer;
}
.custom-portal {
  width: 100%;
  height: calc(100vh - 91px);
  box-sizing: border-box;
  .route-url {
    cursor: pointer;
    color: #0775db;
  }
  .custom-portal-container {
    // padding: 12px;
    // background: #fff;
    border-radius: 8px;
    height: 100%; // 减去padding的高度
    display: flex;
    flex-direction: column;

    .page-title {
      margin-top: 5px;
      margin-left: 5px;
      font-size: 20px;
      font-weight: bold;
      margin-bottom: 15px;
      flex-shrink: 0;
    }

    .search-form {
      background-color: #fff;
      padding-bottom: 10px;
      border-radius: 4px;
      margin-bottom: 10px;
      flex-shrink: 0;

      /deep/ .el-input__inner {
        width: 251px;
        height: 35px;
        line-height: 35px;
      }

      /deep/ .el-input__icon {
        line-height: 35px;
      }

      /deep/ .el-select {
        .el-input__inner {
          height: 35px;
          line-height: 35px;
        }
      }
      /deep/ .el-button {
        padding: 9.5px 15px;
      }
    }

    .operation-bar {
      margin-bottom: 20px;
      flex-shrink: 0;
      display: flex;
      align-items: center;

      .el-button {
        margin-right: 10px;
      }

      .import-upload {
        margin-right: 10px;
        display: inline-block;
      }
    }

    .el-table {
      flex: 1;

      .el-button--text {
        padding: 0 5px;

        &.delete-btn {
          color: #f56c6c;
        }
        &.chiefPageFlag {
          filter: grayscale(1);
        }
      }
    }

    .pagination-container {
      margin-top: 20px;
      text-align: right;
      flex-shrink: 0;
    }
  }
}
/deep/ .el-table-column--selection .cell {
  display: flex;
  justify-content: center;
}
/deep/ .el-checkbox:last-of-type {
  margin-right: 1px;
}
</style>

<template>
  <el-dialog
    :title="`版本${pageName}`"
    :visible.sync="dialogVisible"
    @close="handleClose"
    :close-on-click-modal="false"
  >
    <div v-loading="loading">
      <!-- 版本表格 -->
      <el-table :data="tableData" border style="width: 100%">
        <el-table-column prop="version" label="版本号"></el-table-column>
        <el-table-column prop="createDate" label="发布日期" width="160">
          <template slot-scope="scope">
            {{ formatDateTime(scope.row.createDate) }}
          </template>
        </el-table-column>
        <el-table-column
          prop="creatorName"
          label="发布人"
          width="140"
        ></el-table-column>
        <el-table-column
          prop="describe"
          label="发布说明"
          min-width="200"
        ></el-table-column>
        <el-table-column label="操作" width="270">
          <template slot-scope="scope">
            <el-button type="text" size="small" @click="handleView(scope.row)">
              <i class="el-icon-view"></i> 查看
            </el-button>
            <el-button
              type="text"
              size="small"
              @click="handleRollback(scope.row)"
            >
              <i class="el-icon-refresh-left"></i> 回退编辑此版本
            </el-button>
            <el-button
              type="text"
              size="small"
              class="delete-btn"
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
          background
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.current"
          :page-sizes="[10, 20, 30, 50]"
          :page-size="pagination.pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="pagination.total"
        >
        </el-pagination>
      </div>
    </div>
  </el-dialog>
</template>

<script>
import {
  versionList,
  versionListDelete,
  rollbackPageVersion
} from "@/modules/customPortal/api/pageManagement";
export default {
  name: "VersionDialog",

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    pageId: {
      type: String,
      default: ""
    },
    pageName: {
      type: String,
      default: ""
    }
  },

  data() {
    return {
      dialogVisible: false,
      loading: false,
      tableData: [],
      pagination: {
        current: 1,
        pageSize: 10,
        total: 0
      }
    };
  },

  watch: {
    visible(val) {
      this.dialogVisible = val;
      if (val) {
        this.fetchVersionData();
      }
    },
    pageId() {
      if (this.dialogVisible) {
        // this.fetchVersionData();
      }
    }
  },

  methods: {
    // 获取版本数据
    async fetchVersionData() {
      if (!this.pageId) return;

      this.loading = true;
      try {
        const { current, pageSize } = this.pagination;
        const pages = {
          current,
          pageSize
        };
        const params = {
          pageId: this.pageId
        };
        const data = await versionList({ pages, params });
        if (data.code === "1") {
          throw new Error(data.data ? data.data : "");
        }
        this.tableData = data.records;
        this.pagination.total = data.total;
      } catch (error) {
        this.$message.error("获取历史失败: " + (error.message || "未知错误"));
      } finally {
        this.loading = false;
      }
    },

    // 格式化时间
    formatDateTime(date) {
      if (!date) return "";
      const d = new Date(date);
      const pad = num => num.toString().padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(
        d.getDate()
      )} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
    },

    // 查看版本
    handleView(row) {
      // 这里可以实现查看版本的逻辑，例如打开一个新的对话框或页面
      // this.$message.info(`查看版本: ${row.version}`);
      // localStorage.setItem("graphLayout", JSON.stringify(graphData.layout));
      this.$router.push({
        path: "/customEditView",
        query: {
          id: row.id
        }
      });
       // 关闭对话框
       this.handleClose();
    },

    // 回退编辑此版本
    async handleRollback(row) {
      try {
        await this.$confirm(
          `确认回退到版本 ${row.version} 进行编辑吗？`,
          "提示",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning"
          }
        );

        this.loading = true;
        try {
          const params = {
            pageId: row.pageId,
            pageVersionId: row.id
          };
          const data = await rollbackPageVersion(params);

          if (data.code === "1") {
            throw new Error(data.data ? data.data : "");
          }
          this.$message.success("回退成功，即将跳转到编辑页面", data);
          // // 关闭对话框
          this.handleClose();

          // 跳转到编辑页面
          this.$router.push({
            path: `/customGraph/${row.pageId}`,
            query: {
              version: row.id
            }
          });
        } catch (error) {
          this.$message.error("接口调用失败: " + (error.message || "未知错误"));
        } finally {
          this.loading = false;
        }
      } catch (e) {
        // 用户取消操作
      }
    },

    // 删除版本
    async handleDelete(row) {
      try {
        await this.$confirm(`确认删除版本吗？`, "提示", {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        });

        this.loading = true;
        try {
          const data = await versionListDelete({ ids: [row.id] });
          this.$message.success("删除成功");
          this.fetchVersionData();
        } catch (error) {
          this.$message.error("删除失败: " + (error.message || "未知错误"));
        } finally {
          this.loading = false;
        }
      } catch (e) {
        // 用户取消操作
      }
    },

    // 处理每页条数变化
    handleSizeChange(size) {
      this.pagination.pageSize = size;
      this.pagination.current = 1;
      this.fetchVersionData();
    },

    // 当前页变化
    handleCurrentChange(val) {
      this.pagination.current = val;
      this.fetchVersionData();
    },

    // 关闭对话框
    handleClose() {
      this.$emit("update:visible", false);
      // 重置分页
      this.pagination.current = 1;
    }
  }
};
</script>

<style lang="less" scoped>
/deep/ .el-dialog__body {
  padding: 20px;
}
.pagination-container {
  margin-top: 20px;
  text-align: right;
}

.delete-btn {
  color: #f56c6c;
}
</style>

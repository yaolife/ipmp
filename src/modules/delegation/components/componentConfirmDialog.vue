<template>
  <el-dialog
    :visible.sync="dialogVisible"
    width="480px"
    custom-class="component-confirm-dialog"
    append-to-body
    :show-close="false"
    :close-on-click-modal="false"
    @close="onClose"
  >
    <div class="confirm-title">
      <span :class="['confirm-icon', isDelete ? 'is-delete' : 'is-download']">
        <i v-if="!isDelete" class="el-icon-download"></i>
        <span v-else>!</span>
      </span>
      <span>{{ dialogTitle }}</span>
    </div>
    <div class="confirm-message">{{ dialogMessage }}</div>
    <div v-if="detailRows.length" class="confirm-detail">
      <div
        v-for="(item, index) in detailRows"
        :key="index"
        :class="['confirm-detail-item', { 'is-inline': !isDelete }]"
      >
        <div class="detail-primary" :title="item.primary">{{ item.primary }}</div>
        <div v-if="item.secondary" class="detail-secondary">
          {{ item.secondary }}
        </div>
      </div>
    </div>
    <div v-if="showLargeFileTip" class="confirm-tip">
      <i class="el-icon-info"></i>
      <span>{{ $t("lang.download_large_file_tip") }}</span>
    </div>
    <span slot="footer">
      <el-button size="small" :disabled="loading" @click="dialogVisible = false">{{
        $t("cm.cancel")
      }}</el-button>
      <el-button
        size="small"
        :type="isDelete ? 'danger' : 'primary'"
        :loading="loading"
        @click="confirm"
        >{{ confirmText }}</el-button
      >
    </span>
  </el-dialog>
</template>

<script>
const LARGE_FILE_SIZE_KB = 50 * 1024;

export default {
  name: "ComponentConfirmDialog",
  data() {
    return {
      dialogVisible: false,
      type: "download",
      loading: false,
      rows: []
    };
  },
  computed: {
    isDelete() {
      return this.type === "delete";
    },
    dialogTitle() {
      return this.isDelete
        ? this.$t("lang.delete_component_title")
        : this.$t("lang.download_model_title");
    },
    dialogMessage() {
      if (this.isDelete) {
        return this.$t("lang.delete_component_confirm");
      }
      if (this.rows.length > 1) {
        return this.$t("lang.download_model_batch_confirm");
      }
      return this.$t("lang.download_model_confirm");
    },
    confirmText() {
      return this.isDelete
        ? this.$t("lang.confirm_delete")
        : this.$t("lang.confirm_download");
    },
    detailRows() {
      return this.rows.map(row => {
        if (this.isDelete) {
          return {
            primary: row.componentName || row.id || "-",
            secondary: row.originalName || row.remark || ""
          };
        }
        return {
          primary: row.originalName || row.componentName || this.$t("lang.model_file"),
          secondary: row.modelSize && row.modelSize !== "-" ? row.modelSize : ""
        };
      });
    },
    showLargeFileTip() {
      if (this.isDelete) return false;
      return this.rows.some(row => Number(row.fileSize) >= LARGE_FILE_SIZE_KB);
    }
  },
  methods: {
    open(type, payload) {
      this.type = type === "delete" ? "delete" : "download";
      this.loading = false;
      this.rows = Array.isArray(payload) ? payload.slice() : payload ? [payload] : [];
      this.dialogVisible = true;
    },
    close() {
      this.dialogVisible = false;
    },
    finish() {
      this.loading = false;
    },
    confirm() {
      if (this.loading) return;
      this.loading = true;
      this.$emit("confirm", {
        type: this.type,
        rows: this.rows.slice()
      });
    },
    onClose() {
      this.loading = false;
      this.rows = [];
    }
  }
};
</script>

<style lang="less">
.component-confirm-dialog {
  border-radius: 8px;
  overflow: hidden;
  .el-dialog__header {
    display: none;
  }
  .el-dialog__body {
    padding: 24px 24px 8px;
  }
  .el-dialog__footer {
    padding: 8px 24px 20px;
  }
}
</style>
<style lang="less" scoped>
.confirm-title {
  display: flex;
  align-items: center;
  font-size: 16px;
  font-weight: 600;
  color: #1f2329;
  line-height: 24px;
}
.confirm-icon {
  width: 28px;
  height: 28px;
  margin-right: 8px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 14px;
  flex-shrink: 0;
  &.is-download {
    background: #2f6bff;
  }
  &.is-delete {
    background: #f56c6c;
    font-size: 16px;
    font-weight: 700;
    line-height: 1;
  }
}
.confirm-message {
  margin: 12px 0 16px 36px;
  font-size: 13px;
  line-height: 22px;
  color: #606266;
}
.confirm-detail {
  margin: 0 0 12px 36px;
  padding: 10px 12px;
  background: #f5f7fa;
  border-radius: 4px;
}
.confirm-detail-item + .confirm-detail-item {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #ebeef5;
}
.confirm-detail-item.is-inline {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 0;
}
.confirm-detail-item.is-inline .detail-primary {
  flex: 1;
  margin-right: 12px;
}
.confirm-detail-item.is-inline .detail-secondary {
  margin-top: 0;
  flex-shrink: 0;
}
.detail-primary {
  font-size: 13px;
  font-weight: 600;
  color: #303133;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.detail-secondary {
  margin-top: 4px;
  font-size: 12px;
  color: #909399;
}
.confirm-tip {
  display: flex;
  align-items: flex-start;
  margin: 0 0 4px 36px;
  padding: 8px 12px;
  background: #ecf5ff;
  border-radius: 4px;
  color: #409eff;
  font-size: 12px;
  line-height: 18px;
  i {
    margin-right: 6px;
    margin-top: 2px;
    font-size: 14px;
  }
}
</style>

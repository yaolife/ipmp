<template>
  <div class="notice-edit-container">
    <div class="header">
      <el-button type="text" @click="$router.back()">← 返回</el-button>
      <span class="title">通知单编辑页（Mock + 控权）</span>
      <div class="spacer" />
      <el-button type="primary" @click="handleSave">保存</el-button>
    </div>

    <el-alert
      v-if="!bianhao_0"
      title="缺少通知单编号，请从列表页进入"
      type="warning"
      show-icon
      style="margin-bottom: 12px;"
    />

    <!-- 顶部工具栏 -->
    <el-row
      type="flex"
      justify="space-between"
      align="middle"
      class="page-toolbar"
    >
      <el-col>
        <h3 class="page-title">通知单编辑</h3>
      </el-col>
      <el-col>
        <el-button size="mini" @click="$router.push('/notice')"
          >返回列表</el-button
        >
        <el-button size="mini" type="primary" @click="jsonDialogVisible = true"
          >查看权限返回结构</el-button
        >
      </el-col>
    </el-row>

    <!-- 表单卡片 -->
    <el-card class="form-card">
      <div slot="header">基础信息</div>
      <el-form :model="form" label-position="top" class="edit-form">
        <el-row :gutter="20">
          <el-col :span="24">
            <el-form-item
              v-if="canView('bianhao_0')"
              label="通知单编号"
              prop="bianhao_0"
            >
              <el-tooltip
                v-if="isControlled('bianhao_0')"
                content="受控字段"
                placement="top"
              >
                <el-tag size="mini" type="info" class="control-tag"
                  >受控</el-tag
                >
              </el-tooltip>
              <template v-if="isMasked('bianhao_0')">
                <el-tooltip content="该字段已脱敏显示" placement="top">
                  <el-tag size="mini" type="danger" class="control-tag"
                    >脱敏</el-tag
                  >
                </el-tooltip>
                <el-input
                  :value="maskedValue(form.bianhao_0, 'bianhao_0')"
                  disabled
                />
              </template>
              <template v-else>
                <el-input v-model="form.bianhao_0" disabled />
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="canView('plant')" label="电厂" prop="plant">
              <el-tooltip
                v-if="isControlled('plant')"
                content="受控字段"
                placement="top"
              >
                <el-tag size="mini" type="warning" class="control-tag"
                  >受控</el-tag
                >
              </el-tooltip>
              <template v-if="isMasked('plant')">
                <el-tooltip content="该字段已脱敏显示" placement="top">
                  <el-tag size="mini" type="danger" class="control-tag"
                    >脱敏</el-tag
                  >
                </el-tooltip>
                <el-input :value="maskedValue(form.plant, 'plant')" disabled />
              </template>
              <template v-else>
                <el-input
                  v-model="form.plant"
                  :disabled="!canEdit('plant')"
                  placeholder="请输入电厂"
                />
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="canView('fuzeren_4')" label="负责人" prop="fuzeren_4">
              <el-tooltip
                v-if="isControlled('fuzeren_4')"
                content="受控字段"
                placement="top"
              >
                <el-tag size="mini" type="warning" class="control-tag"
                  >受控</el-tag
                >
              </el-tooltip>
              <template v-if="isMasked('fuzeren_4')">
                <el-tooltip content="该字段已脱敏显示" placement="top">
                  <el-tag size="mini" type="danger" class="control-tag"
                    >脱敏</el-tag
                  >
                </el-tooltip>
                <el-input :value="maskedValue(form.fuzeren_4, 'fuzeren_4')" disabled />
              </template>
              <template v-else>
                <el-input
                  v-model="form.fuzeren_4"
                  :disabled="!canEdit('fuzeren_4')"
                  placeholder="请输入负责人"
                />
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item v-if="canView('status')" label="状态" prop="status">
              <el-tooltip
                v-if="isControlled('status')"
                content="受控字段"
                placement="top"
              >
                <el-tag size="mini" type="info" class="control-tag"
                  >受控</el-tag
                >
              </el-tooltip>
              <template v-if="isMasked('status')">
                <el-tooltip content="该字段已脱敏显示" placement="top">
                  <el-tag size="mini" type="danger" class="control-tag"
                    >脱敏</el-tag
                  >
                </el-tooltip>
                <el-input
                  :value="maskedValue(form.status, 'status')"
                  disabled
                />
              </template>
              <template v-else>
                <el-select
                  v-model="form.status"
                  :disabled="!canEdit('status')"
                  placeholder="请选择状态"
                  style="width: 100%;"
                >
                  <el-option label="已创建" value="已创建" />
                  <el-option label="进行中" value="进行中" />
                  <el-option label="已完成" value="已完成" />
                </el-select>
              </template>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              v-if="canView('priority')"
              label="优先级"
              prop="priority"
            >
              <el-tooltip
                v-if="isControlled('priority')"
                content="受控字段"
                placement="top"
              >
                <el-tag size="mini" type="info" class="control-tag"
                  >受控</el-tag
                >
              </el-tooltip>
              <template v-if="isMasked('priority')">
                <el-tooltip content="该字段已脱敏显示" placement="top">
                  <el-tag size="mini" type="danger" class="control-tag"
                    >脱敏</el-tag
                  >
                </el-tooltip>
                <el-input
                  :value="maskedValue(form.priority, 'priority')"
                  disabled
                />
              </template>
              <template v-else>
                <el-select
                  v-model="form.priority"
                  :disabled="!canEdit('priority')"
                  placeholder="请选择优先级"
                  style="width: 100%;"
                >
                  <el-option label="高" value="高" />
                  <el-option label="中" value="中" />
                  <el-option label="低" value="低" />
                </el-select>
              </template>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
    </el-card>

    <!-- 权限返回结构弹窗（风格参考 valueHelp 页面） -->
    <el-dialog
      title="权限返回结构"
      :visible.sync="jsonDialogVisible"
      width="60%"
      append-to-body
      v-if="jsonContext"
    >
      <MyJson v-model="jsonContext" :readonly="true" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="jsonDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getFormColPermissions } from "./api";
import MyJson from "@/modules/jurisdiction/components/MyJson.vue";
export default {
  name: "NoticeEdit",
  components: { MyJson },
  data() {
    const bianhao_0 = this.$route.query.bianhao_0 || "";
    return {
      bianhao_0,
      form: {
        bianhao_0,
        plant: "",
        status: "已创建",
        priority: "中",
        fuzeren_4: ""
      },
      // 控权相关状态
      loading: false,
      entityCode: "notice_mock",
      controlFields: ["bianhao_0", "plant", "status", "priority", "fuzeren_4"],
      fieldAliases: {
        bianhao_0: ["operatorCode"],
        fuzeren_4: ["operatorName"]
      },
      // 初始化权限集合
      permSets: {
        visible: new Set(),
        editable: new Set(),
        control: new Set(),
        masking: new Set()
      },
      // 标记权限是否已加载
      permsLoaded: false,
      // 返回结构弹窗
      jsonContext: "",
      jsonDialogVisible: false
    };
  },
  created() {
    this.mockLoadDetail();
    this.loadPerms();
  },
  methods: {
    mockLoadDetail() {
      // 模拟详情加载
      if (!this.bianhao_0) return;
      const prefixPlant = {
        "NT-202501-001": "华能一厂",
        "NT-202501-002": "华电二厂",
        "NT-202501-003": "国电三厂",
        "NT-202501-004": "大唐四厂"
      };
      this.form.plant = prefixPlant[this.bianhao_0] || "华能一厂";
      this.form.fuzeren_4 = "张三";
    },
    handleSave() {
      this.$message && this.$message.success("模拟保存成功");
    },
    async loadPerms() {
      try {
        const resp = await getFormColPermissions([this.entityCode]);
        const list = (resp && resp.data && (resp.data.data || resp.data)) || [];
        const item = Array.isArray(list)
          ? list.find(
              x =>
                x &&
                (x.entityCode === this.entityCode || x.code === this.entityCode)
            )
          : null;
        const visibleFields = ( (Array.isArray(visibleFields) ? visibleFields : []).concat(
            Array.isArray(dataMaskingFields) ? dataMaskingFields : []
          )) || [];
        const editableFields = (item && item.editableFields) || [];
        const controlFields = (item && item.controlFields) || [];
        const dataMaskingFields = (item && item.dataMaskingFields) || [];
        this.permSets.visible = new Set(
          (Array.isArray(visibleFields) ? visibleFields : []).concat(
            Array.isArray(dataMaskingFields) ? dataMaskingFields : []
          )
        );
        this.permSets.editable = new Set(
          Array.isArray(editableFields) ? editableFields : []
        );
        this.permSets.control = new Set(
          Array.isArray(controlFields) ? controlFields : []
        );
        this.permSets.masking = new Set(
          Array.isArray(dataMaskingFields) ? dataMaskingFields : []
        );
        this.permsLoaded = !!item;
        this.jsonContext = JSON.stringify(list, null, 2);
      } catch (e) {
        console.error("拉取控权失败", e);
        this.$message && this.$message.error("拉取控权失败");
      }
    },
    hasAny(set, field) {
      const alias = this.fieldAliases[field];
      if (set.has(field)) return true;
      if (!alias) return false;
      if (Array.isArray(alias)) {
        return alias.some(a => set.has(a));
      }
      return set.has(alias);
    },
    isControlled(field) {
      if (!this.permsLoaded) return false;
      return this.hasAny(this.permSets.control, field);
    },
    canView(field) {
      if (!this.permsLoaded) return true;
      const isControlled = this.hasAny(this.permSets.control, field);
      if (!isControlled) return true;
      // 控权字段>=可见字段：受控字段只有在可见集合中才显示
      return this.hasAny(this.permSets.visible, field);
    },
    canEdit(field) {
      if (!this.permsLoaded) return true;
      const isControlled = this.hasAny(this.permSets.control, field);
      if (!isControlled) return true;
      // 可见字段>=可编辑字段：仅当可见且在可编辑集合中时允许编辑
      return (
        this.hasAny(this.permSets.visible, field) &&
        this.hasAny(this.permSets.editable, field)
      );
    },
    isMasked(field) {
      // 可见字段>=脱敏字段：仅对可见字段判断是否脱敏
      if (!this.permsLoaded) return false;
      if (!this.hasAny(this.permSets.visible, field)) return false;
      return this.hasAny(this.permSets.masking, field);
    },
    maskedValue(value, field) {
      return "***";
    }
  }
};
</script>

<style scoped>
.notice-edit-container {
  padding: 16px;
}
.header {
  display: flex;
  align-items: center;
  gap: 12px;
}
.header .title {
  font-weight: 600;
}
.header .spacer {
  flex: 1;
}
.edit-form :deep(.el-form-item) {
  max-width: 480px;
}
.json-card {
  margin-top: 16px;
}
.return-label {
  font-weight: 600;
}
.return-container {
  margin-top: 8px;
}
.page-toolbar {
  margin-bottom: 12px;
}
.page-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}
.form-card {
  margin-top: 8px;
}
.control-tag {
  margin-bottom: 6px;
}
</style>

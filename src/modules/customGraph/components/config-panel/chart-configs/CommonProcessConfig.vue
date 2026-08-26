<template>
  <div class="common-process-config">
    <h3>常用流程组件配置</h3>
    <el-tabs type="border-card">
      <!-- 基本配置 -->
      <el-tab-pane label="基本配置">
        <el-form label-position="top">
          <el-form-item label="组件标题">
            <el-input
              v-model="config.title"
              placeholder="例如：常用业务流程"
            ></el-input>
          </el-form-item>

          <el-form-item label="显示模式">
            <el-select
              v-model="config.displayMode"
              placeholder="请选择显示模式"
            >
              <el-option label="网格" value="grid"></el-option>
              <el-option label="列表" value="list"></el-option>
              <el-option label="卡片" value="card"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="网格列数" v-if="config.displayMode === 'grid'">
            <el-input-number
              v-model="config.columns"
              :min="1"
              :max="6"
            ></el-input-number>
          </el-form-item>

          <el-form-item label="最大显示数量">
            <el-input-number
              v-model="config.maxDisplay"
              :min="1"
              :max="20"
            ></el-input-number>
          </el-form-item>

          <el-form-item label="显示选项">
            <el-checkbox-group v-model="displayOptions">
              <el-checkbox label="showIcon">显示图标</el-checkbox>
              <el-checkbox label="showDescription">显示描述</el-checkbox>
              <el-checkbox label="showViewMore">显示"查看更多"</el-checkbox>
              <el-checkbox label="showSearch">显示搜索框</el-checkbox>
              <el-checkbox label="showBadges">显示徽章</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 分类管理 -->
      <el-tab-pane label="分类管理">
        <el-button @click="addCategory" type="primary">添加分类</el-button>
        <el-table :data="config.categories" border style="width: 100%">
          <el-table-column
            prop="name"
            label="分类名称"
            width="180"
          ></el-table-column>
          <el-table-column
            prop="id"
            label="分类ID"
            width="120"
          ></el-table-column>
          <el-table-column label="分类图标" width="120">
            <template #default="{ row }">
              <i :class="row.icon"></i>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="{ row, $index }">
              <el-button size="mini" @click="editCategory(row, $index)"
                >编辑</el-button
              >
              <el-button
                size="mini"
                type="danger"
                @click="removeCategory($index)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 流程管理 -->
      <el-tab-pane label="流程管理">
        <el-button @click="addProcess" type="primary">添加流程</el-button>
        <el-table :data="config.processes" border style="width: 100%">
          <el-table-column
            prop="name"
            label="流程名称"
            width="180"
          ></el-table-column>
          <el-table-column prop="categoryId" label="所属分类" width="120">
            <template #default="{ row }">
              {{ getCategoryName(row.categoryId) }}
            </template>
          </el-table-column>
          <el-table-column label="状态" width="120">
            <template #default="{ row }">
              <el-tag v-if="row.isNew" type="success" size="small">新</el-tag>
              <el-tag v-if="row.isHot" type="danger" size="small">热</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作">
            <template #default="{ row, $index }">
              <el-button size="mini" @click="editProcess(row, $index)"
                >编辑</el-button
              >
              <el-button
                size="mini"
                type="danger"
                @click="removeProcess($index)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 排序和推荐 -->
      <el-tab-pane label="排序和推荐">
        <el-form label-position="top">
          <el-form-item label="排序方式">
            <el-select v-model="config.sortBy" placeholder="请选择排序方式">
              <el-option label="默认排序" value="default"></el-option>
              <el-option label="使用频率" value="frequency"></el-option>
              <el-option label="最近使用" value="recent"></el-option>
              <el-option label="手动排序" value="manual"></el-option>
            </el-select>
          </el-form-item>

          <el-form-item label="启用频率跟踪">
            <el-switch v-model="config.enableFrequencyTracking"></el-switch>
          </el-form-item>

          <el-form-item label="启用个性化推荐">
            <el-switch v-model="config.enablePersonalization"></el-switch>
          </el-form-item>

          <el-form-item
            label="热门流程阈值"
            v-if="config.enableFrequencyTracking"
          >
            <el-input-number
              v-model="config.hotThreshold"
              :min="0"
              :max="100"
            ></el-input-number>
          </el-form-item>
        </el-form>
      </el-tab-pane>

      <!-- 权限配置 -->
      <el-tab-pane label="权限配置">
        <el-form label-position="top">
          <el-form-item label="可用角色">
            <el-checkbox-group v-model="config.availableRoles">
              <el-checkbox label="admin">管理员</el-checkbox>
              <el-checkbox label="manager">经理</el-checkbox>
              <el-checkbox label="employee">员工</el-checkbox>
              <el-checkbox label="guest">访客</el-checkbox>
            </el-checkbox-group>
          </el-form-item>

          <el-form-item label="默认可见角色">
            <el-checkbox-group v-model="config.defaultVisibleRoles">
              <el-checkbox label="admin">管理员</el-checkbox>
              <el-checkbox label="manager">经理</el-checkbox>
              <el-checkbox label="employee">员工</el-checkbox>
              <el-checkbox label="guest">访客</el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: "CommonProcessConfig",
  props: {
    value: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      config: {
        title: "常用业务流程",
        displayMode: "grid",
        columns: 4,
        maxDisplay: 8,
        showIcon: true,
        showDescription: true,
        showViewMore: true,
        showSearch: true,
        showBadges: true,
        enableFrequencyTracking: true,
        enablePersonalization: true,
        hotThreshold: 80,
        sortBy: "frequency",
        availableRoles: ["admin", "manager", "employee"],
        defaultVisibleRoles: ["admin", "manager", "employee"],
        categories: [
          {
            id: "approval",
            name: "审批流程",
            icon: "el-icon-s-check",
          },
          {
            id: "finance",
            name: "财务流程",
            icon: "el-icon-money",
          },
        ],
        processes: [
          {
            id: "leave-approval",
            name: "请假申请",
            icon: "el-icon-date",
            description: "发起请假申请流程",
            link: "/workflow/leave",
            categoryId: "approval",
            permissions: ["employee"],
            frequencyScore: 95,
            isNew: false,
            isHot: true,
            badgeText: "",
          },
          {
            id: "expense-approval",
            name: "费用报销",
            icon: "el-icon-tickets",
            description: "发起费用报销流程",
            link: "/workflow/expense",
            categoryId: "finance",
            permissions: ["employee"],
            frequencyScore: 85,
            isNew: false,
            isHot: true,
            badgeText: "",
          },
        ],
      },
    };
  },
  computed: {
    displayOptions: {
      get() {
        return Object.keys(this.config).filter(
          (key) => key.startsWith("show") && this.config[key]
        );
      },
      set(values) {
        Object.keys(this.config).forEach((key) => {
          if (key.startsWith("show")) {
            this.config[key] = values.includes(key);
          }
        });
      },
    },
  },
  watch: {
    value: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.config = { ...this.defaultConfig, ...newVal };
        }
      },
    },
    config: {
      deep: true,
      handler(newVal) {
        this.$emit("input", newVal);
      },
    },
  },
  methods: {
    getCategoryName(categoryId) {
      const category = this.config.categories.find((c) => c.id === categoryId);
      return category ? category.name : "未分类";
    },
    addCategory() {
      this.config.categories.push({
        id: "",
        name: "",
        icon: "el-icon-question",
      });
    },
    editCategory(row, index) {
      // 实际项目中这里应该打开一个对话框进行详细编辑
      this.$message.info(`编辑分类: ${row.name}`);
    },
    removeCategory(index) {
      this.config.categories.splice(index, 1);
    },
    addProcess() {
      this.config.processes.push({
        id: "",
        name: "",
        icon: "el-icon-question",
        description: "",
        link: "",
        categoryId: this.config.categories[0]?.id || "",
        permissions: [],
        frequencyScore: 0,
        isNew: false,
        isHot: false,
        badgeText: "",
      });
    },
    editProcess(row, index) {
      // 实际项目中这里应该打开一个对话框进行详细编辑
      this.$message.info(`编辑流程: ${row.name}`);
    },
    removeProcess(index) {
      this.config.processes.splice(index, 1);
    },
  },
};
</script>

<style lang="less" scoped>
.common-process-config {
  padding: 20px;
}
</style>

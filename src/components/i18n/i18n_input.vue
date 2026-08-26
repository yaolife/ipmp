<!-- 动态多语言数据配置组件-->
<template>
  <div>
    <el-input
      maxlength="256"
      :label="label"
      type="text"
      :size="size"
      v-model="key"
      :clearable="clearable"
      :placeholder="placeholder"
      @focus="open"
    >
      <template slot="append">
        <el-checkbox :value="true" v-model="isI18n">i18n</el-checkbox>
      </template>
    </el-input>
    <el-dialog
      width="1000px"
      title="多语言配置"
      :visible.sync="visible"
      :before-close="cancel"
      append-to-body
      v-dragMove="{
        DragButton: '.el-dialog__header',
        DragWindow: '.el-dialog'
      }"
    >
      <!-- <el-form-item label="key" label-width="100px">
        {{ `i18n:${this.showCategoryCode}:${this.formData.itemKey}` }}
      </el-form-item> -->
      <el-tabs class="border-bottom-card" v-model="tab">
        <el-tab-pane label="分类" name="category">
          <category_card
            :is-options="false"
            :selected-code.sync="categoryCode"
            is-dialog
            title="分类"
          />
        </el-tab-pane>
        <el-tab-pane label="查询" name="query">
          <i18n_search
            :formData.sync="formData"
            :isSelect.sync="isSelect"
            :tab.sync="tab"
            is-dialog
            :selected-code="categoryCode"
          />
        </el-tab-pane>
        <el-tab-pane label="输入" name="input">
          <i18n_input_form
            ref="form"
            :formData.sync="formData"
            :disabled.sync="isSelect"
          />
          <div class="cud--right cud__mlr-20">
            <el-button @click="formReset()" size="small">重置</el-button>
          </div>
        </el-tab-pane>
      </el-tabs>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button size="small" @click="cancel">取消</el-button>
        <el-button
          size="small"
          type="primary"
          @click="save"
          v-loading="saveLoading"
          >确定</el-button
        >
      </div>
    </el-dialog>
  </div>
</template>

<script>
import value from "@/mixins/valueMixin";
import I18n_input_form from "./components/i18n_input_form";
import { mapState } from "vuex";
import i18n_search from "./components/i18n_search";
import Category_card from "../managepage/components/category_card";

export default {
  name: "i18n_input",
  components: { Category_card, I18n_input_form, i18n_search },
  mixins: [value("_value")],
  props: {
    label: {
      type: String,
      default: null
    },
    clearable: {
      type: Boolean,
      default: true
    },
    placeholder: {
      type: String,
      default: null
    },
    size: {
      type: String,
      default: "middle"
    },
    i18n: {
      type: Boolean,
      default: true
    }
  },
  data: () => ({
    visible: false,
    formData: {},
    categoryCode: null,
    showCategoryCode: null,
    isI18n: true,
    saveLoading: false,
    isSelect: false,
    tab: "query"
  }),
  watch: {
    formData(val) {
      if (val.categoryCode) {
        this.showCategoryCode = val.categoryCode;
      }
    },
    categoryCode(val) {
      if (!this.isSelect) {
        this.showCategoryCode = val;
      }
    },
    isI18n: function(val) {
      if ((val && !this.validKey) || (!val && this.validKey)) {
        this._value = null;
        this.formData = this.$options.data().formData;
        this.isSelect = false;
      }
    },
    key(val) {
      if (this.value && !this.validKey) {
        this.formData = {};
        this.isI18n = false;
        this.isSelect = false;
      }
      if (this.value && this.validKey) {
        this.formData = {};
        this.isI18n = true;
      }
    }
  },
  created() {
    this.isI18n = this.i18n;
    if (this.value && !this.validKey) this.isI18n = false;
  },
  computed: {
    ...mapState({ language: state => state.i18n.language }),
    validKey: function() {
      return /^i18n(:[a-zA-Z0-9]+){2}$/.test(this.value);
    },
    key: {
      get() {
        this.$store.commit("setLook", {});
        return this.$i18nn(this._value, this.isI18n);
      },
      set(val) {
        this._value = val;
      }
    }
  },
  methods: {
    formReset() {
      this.isSelect = false;
      this.$refs.form.reset();
    },
    open() {
      if (!this.isI18n) return;
      this.isSelect = true;
      if (this.value && this.validKey) {
        this.queryByKey(this.getI18nKey(this.value));
      } else {
        this.isSelect = false;
        this.tab = "query";
      }
      this.visible = true;
    },
    async save() {
      // todo 表单校验
      if (!this.showCategoryCode) {
        this.$message.warning("请选择分类");
        return;
      }
      if (this.isSelect) {
        this._value = `i18n:${this.showCategoryCode}:${this.formData.itemKey}`;
        this.visible = false;
        return;
      }
      this.saveLoading = true;
      const { data } = await this.$http.post(this.$api.i18n.i18nItem.save, {
        ...this.formData,
        categoryCode: this.showCategoryCode,
        isEdit: false
      });
      if (data.code !== "0") {
        this.$message.error(data.msg);
        this.saveLoading = false;
        return;
      }
      await this.queryByKey(this.formData.itemKey);
      if (!this.showCategoryCode || !this.formData.itemKey) {
        this.$message.warning("信息未填写完整，请检查");
        this.saveLoading = false;
        return;
      }
      this._value = `i18n:${this.showCategoryCode}:${this.formData.itemKey}`;
      this.saveLoading = false;
      this.cancel();
    },
    cancel() {
      this.visible = false;
      this.isSelect = true;
      this.formData = {};
      //处理弹窗遮罩
      this.$emit('closeModal')
    },
    getI18nKey(key) {
      return key.split(":")[2];
    },
    async queryByKey(key) {
      const { data } = await this.$http.get(
        `${this.$api.i18n.i18nItem.getByKey}/${key}`
      );
      if (data.code === "0") {
        this.formData = { ...this.formData, ...data.data };
        this.showCategoryCode = this.formData.categoryCode;
        this.isSelect = true;
        this.tab = "input";
      } else {
        this.$message.error(data.msg);
        this.isSelect = false;
        this.tab = "query";
      }
    }
  }
};
</script>

<style scoped lang="less">
/deep/ .el-table {
  max-height: 200px !important;
}
// @import "src/assets/css/style";
</style>

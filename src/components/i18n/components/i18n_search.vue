<template>
  <manage-page
    :add="false"
    :title="title"
    :headers="headers"
    is-search-append
    :urls="urls"
    ref="managePage"
    :is-dialog="isDialogs"
    :selected-code="selectedCode"
  >
    <template #dialog="{dialogContext}">
      <i18n_input_form :formData.sync="dialogContext.data" />
    </template>
    <template #col_select="{data}">
      <el-button type="primary" size="small" @click="select(data)"
        >选择</el-button
      >
    </template>
    <template #search="{data}">
      <el-col :span="8">
        <el-form-item label="键" label-width="44px">
          <el-input v-model="data.itemKey" size="small"></el-input>
        </el-form-item>
      </el-col>
      <el-col :span="8">
        <el-form-item label="值" label-width="44px">
          <el-input v-model="data.itemValue" size="small"></el-input>
        </el-form-item>
      </el-col>
    </template>
  </manage-page>
</template>

<script>
import ManagePage from "@/components/managepage/manage_page";
import { mapState } from "vuex";
import I18n_input from "@/components/i18n/i18n_input";
import I18n_input_form from "@/components/i18n/components/i18n_input_form";
import { sync } from "../../../mixins/valueMixin";

const HEADERS_CONST = [
  {
    value: "select",
    text: "i18n:system:select"
  },
  {
    value: "itemKey",
    text: "i18n:system:key",
    edit: false,
    add: true,
    i18n: false,
    id: true
  },
  {
    value: "categoryCode",
    text: "分类编码"
  },
  {
    value: "categoryName",
    text: "分类名称"
  }
];
export default {
  name: "i18n_search",
  components: { I18n_input_form, I18n_input, ManagePage },
  mixins: [sync("formData"), sync("isSelect"), sync("tab")],
  props: {
    // 是否为弹窗中
    isDialog: { type: Boolean, default: false },
    // 选择的分类code
    selectedCode: { type: String, default: null }
  },
  computed: {
    ...mapState({ languages: state => state.i18n.languages }),
    headers: function() {
      let options = [];
      if (!!this.languages) {
        options = this.languages.map(i => {
          return {
            value: i.code,
            text: i.name
          };
        });
      }
      return [...HEADERS_CONST, ...options];
    }
  },
  watch: {
    isDialog: {
      immediate: true,
      handler(val) {
        if (this.isDialog) {
          this.isDialogs = true;
        }
      }
    }
  },
  data: () => ({
    urls: {},
    title: null,
    isDialogs: false
  }),
  created() {
    this.urls = {
      page: this.$api.i18n.i18nItem.page,
      add: this.$api.i18n.i18nItem.save,
      edit: this.$api.i18n.i18nItem.save,
      del: this.$api.i18n.i18nItem.delete
    };
  },
  methods: {
    select(row) {
      this.internal_formData = row;
      this.internal_isSelect = true;
      this.internal_tab = "input";
    }
  }
};
</script>
<style scoped lang="less">
/deep/ .el-card.is-always-shadow {
  margin: 15px 22px 15px 20px !important;
}
// @import "src/assets/css/style";
</style>

<!-- 多语言翻译项管理页面-->
<template>
  <manage-page ref="manage-page"
    :activeName="activeName"
    is-category
    title="多语言项管理"
    :headers="headers"
    :urls="urls"
    :is-search-append="false"
  >
    <template #dialog="{dialogContext}">
      <i18n_input_form :formData.sync="dialogContext.data" :is-group="false" />
    </template>
    <template #save_prepend="{data}">
      <el-col :span="12">
        <el-form-item :label="$t('sys.category')" label-width="100px">
          <el-input v-model="data.categoryName" disabled size="small"></el-input>
        </el-form-item>
      </el-col>
    </template>
    <!-- <template #search_append="{data}">
      <el-col :span="8">
        <el-form-item :label="$t('wm.value')" label-width="100px">
          <el-input v-model="data.itemValue" size="small"></el-input>
        </el-form-item>
      </el-col>
    </template> -->
  </manage-page>
</template>

<script>
import ManagePage from "@/components/managepage/manage_page";
import I18n_input from "@/components/i18n/i18n_input";
import I18n_input_form from "@/components/i18n/components/i18n_input_form";
import { mapState } from "vuex";

const HEADERS_CONST = [
  {
    value: "itemKey",
    text: "i18n:system:key",
    search: false,
    edit: false,
    add: true,
    i18n: false,
    id: true
  },
  {
    value: "categoryCode",
    text: "sys.category_code"
  },
  {
    value: "categoryName",
    text: "sys.category_name",
    width: "140px"
  }
];
export default {
  name: "i18n_item_manage",
  components: { I18n_input_form, I18n_input, ManagePage },
  props: {
    activeName: { type: String, default: "i18n_item" }
  },
  data: () => ({
    urls: {},
    // key: ""
  }),
  created() {
    this.urls = {
      page: this.$api.i18n.i18nItem.page,
      add: this.$api.i18n.i18nItem.save,
      edit: this.$api.i18n.i18nItem.save,
      del: this.$api.i18n.i18nItem.delete
    };
  },
  computed: {
    ...mapState({ languages: state => state.i18n.languages }),
    headers: function() {
      let options = [];
      if (!!this.languages) {
        options = this.languages.map(i => {
          return {
            value: i.code,
            text: i.name,
            add: true,
            edit: true
          };
        });
      }
      return [
        ...HEADERS_CONST,
        ...options,
        {
          value: "createUserName",
          text: "cm.creat_by"
        },
        {
          value: "createDate",
          isDate: true,
          text: "cm.creat_time",
          width: "180px"
        },
        {
          value: "action",
          text: "cm.operate",
          width: "130px"
        }
      ];
    }
  },
  methods: {
    tabsChange() {
      this.$refs['manage-page'].initMaxHeight();
    }
  }
};
</script>

<style lang="less" scoped>
// @import "src/assets/css/style";
</style>

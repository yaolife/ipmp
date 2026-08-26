<!-- 多语言类别管理页面-->
<template>
  <manage-page ref="manage-page"
    title="多语言分类管理"
    :headers="headers"
    width="400px"
    :urls="urls"
    :is-lang="true"
    :activeName="activeName"
  />
</template>

<script>
import ManagePage from "@/components/managepage/manage_page";

export default {
  name: "i18n_lang_manage",
  components: { ManagePage },
  props: {
    activeName: { type: String, default: "i18n_lang" }
  },
  data: () => ({
    headers: [
      {
        value: "langId",
        text: "ID",
        hidden: true,
        id: true
      },
      {
        value: "langCode",
        text: "wm.code",
        edit: false,
        add: true
      },
      {
        value: "langName",
        text: "wm.name",
        edit: true,
        add: true
      },
      {
        value: "langDesc",
        text: "cm.describe",
        edit: true,
        add: true
      },
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
    ],
    urls: {}
  }),
  watch: {
    "dialogContext.data": {
      deep: true,
      handler: function(val) {
        if (!val || Object.keys(val).length === 0)
          this.saveForm = this.$options.data().saveForm;
        else this.saveForm = { ...this.saveForm, ...val };
      }
    }
  },
  created() {
    this.urls = {
      list: this.$api.i18n.i18nLang.list,
      add: this.$api.i18n.i18nLang.add,
      edit: this.$api.i18n.i18nLang.update,
      del: this.$api.i18n.i18nLang.delete
    };
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

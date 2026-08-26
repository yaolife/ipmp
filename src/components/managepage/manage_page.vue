<!--
 * 管理页面组件
 * 提供：分类块，搜索块，数据表格，编辑/修改弹窗 等功能
 * TODO 数据验证逻辑待添加
 -->
<template>
  <div class="manage-page">
    <div class="content">
      <!-- <div class="title">
        <img src="@/assets/img/formmanageicon.png"/>
        <span v-if="!!title" v-text="title"></span>
      </div> -->
      <el-row>
        <!-- 分类-->
        <el-col
          :span="6"
          class="cud-commom-tree-left"
          v-if="isCategory"
          :class="{
            'cud-commom-tree-content-hidden': isTreeCollapse,
            'cud-commom-tree-content-show': !isTreeCollapse,
          }"
          :style="isTreeCollapse ? { height: maxRightHeight + 'px' } : {}"
        >
          <category_card
            :title="$t('sys.category')"
            :selected-code.sync="categoryCode"
            :selected-name.sync="categoryName"
            :is-tree-collapse="isTreeCollapse"
            @toggleTreeExpand="toggleTreeExpand"
          >
            <template #category_option="data">
              <!-- 分类操作项扩展-->
              <slot name="category_option" v-bind="data"></slot>
            </template>
          </category_card>
        </el-col>
        <el-col
          :span="colSpan"
          :class="{ 'cud-all-width-resize': isTreeCollapse }"
        >
          <el-card class="box-shadow">
            <div class="cud__tree--right">
              <!-- 搜索表单-->
              <search_card
                @search="search"
                @reset="reset"
                @add="addTable"
                @setTableHeight="setTableHeight"
                :headers="headers"
                :is-show-add="add"
                :is-search-append="isSearchAppend"
                :is-category="isCategory"
                v-model="searchForm"
              >
                <template #search>
                  <!-- 自定义搜索块-->
                  <slot name="search" :data="searchForm" />
                </template>
                <template
                  :slot="`search_${header.value}`"
                  v-for="header in headers"
                  v-if="header.search"
                >
                  <!-- 自定义某一搜索条件-->
                  <slot
                    :name="`search_${header.value}`"
                    :data="searchForm"
                    :header="header"
                  />
                </template>
                <template #search_append>
                  <!-- 追加搜索条件-->
                  <slot name="search_append" :data="searchForm" />
                </template>
              </search_card>
              <el-row class="cud__search--rowhigh">
                <div class="cud__divider"></div>
              </el-row>
              <!-- 数据表格-->
              <table_card
                :page.sync="page"
                :items="items"
                :headers="headers"
                :is-page="!!this.urls.page"
                :dialogContext.sync="dialogContext"
                @del="del"
                :loading="loading"
                :maxTableHeight="maxTableHeight"
                @pageChange="pageReq"
              >
                <template
                  :slot="`col_${header.value}`"
                  slot-scope="{ row }"
                  v-for="header in headers"
                >
                  <!-- 自定义列数据渲染-->
                  <slot
                    :name="`col_${header.value}`"
                    :header="header"
                    :data="row"
                  ></slot>
                </template>
              </table_card>
              <!-- 保存/修改弹窗-->
              <save_card
                v-if="add"
                v-bind="$attrs"
                ref="saveCard"
                :headers="headers"
                :dialogContext.sync="dialogContext"
                @save="save"
              >
                <template #save="{ data }">
                  <!-- 自定义保存弹窗块-->
                  <slot
                    name="save"
                    :data="data"
                    :idEdit="dialogContext.isEdit"
                  />
                </template>
                <template
                  :slot="`save_${header.value}`"
                  v-for="header in headers"
                  v-if="dialogColShow(header)"
                >
                  <!-- 自定义保存某一项-->
                  <slot
                    :name="`save_${header.value}`"
                    :data="dialogContext.data"
                    :idEdit="dialogContext.isEdit"
                    :header="header"
                  />
                </template>
                <template #save_prepend="{ data }">
                  <!-- 前置追加-->
                  <slot
                    name="save_prepend"
                    :data="data"
                    :edit="dialogContext.isEdit"
                  />
                </template>
                <template #save_append="{ data }">
                  <!-- 后置追加-->
                  <slot
                    name="save_append"
                    :data="data"
                    :idEdit="dialogContext.isEdit"
                  />
                </template>
              </save_card>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script>
import Search_card from "./components/search_card";
import Table_card from "./components/table_card";
import Save_card from "./components/save_card";
import Category_card from "./components/category_card";
import { calcHeight } from "@/utils/funcUtil";

const headerConfig = {
  id: false, // 列是否为主键id
  text: null, // 列展示标题
  value: null, // 列对应的属性
  search: false, // 列是否作为搜索条件
  hidden: false, // 是否隐藏
  edit: false, // 列是否提供编辑
  add: false, // 列是否提供新增输入
};
export default {
  name: "manage_page",
  props: {
    // 管理页面标题
    title: { type: String, default: null },
    // 管理页面增删改查URL
    urls: { type: Object, default: () => ({}) },
    // 数据表格头配置，格式见：headerConfig
    headers: { type: Array, default: () => [] },
    // 是否开启新增功能
    add: { type: Boolean, default: true },
    // 选择的分类code
    selectedCode: { type: String, default: null },
    // 是否开启左侧分类
    isCategory: { type: Boolean, default: false },
    // 是否额外追加查询条件
    isSearchAppend: { type: Boolean, default: false },
    // 是否为弹窗中
    isDialog: { type: Boolean, default: false },
    activeName: { type: String, default: "i18n_lang" },
  },
  data: () => ({
    categoryCode: null,
    categoryName: null,
    searchForm: {},
    categoryVo: {},
    loading: false,
    items: [],
    isTreeCollapse: false,
    idKey: null,
    dialogContext: {
      data: {},
      isEdit: false,
      visible: false,
    },
    maxRightHeight: 0,
    maxTableHeight: 0,
    page: {
      size: 10,
      current: 1,
      total: 0,
    },
  }),
  components: { Category_card, Save_card, Table_card, Search_card },
  computed: {
    colSpan() {
      return this.isCategory ? 18 : 24;
    },
    computedTableHeight() {
      return this.maxTableHeight;
    },
  },
  watch: {
    selectedCode(val) {
      this.categoryCode = val;
    },
    categoryCode: function (val) {
      this.categoryVo.categoryCode = val;
      this.search();
    },
    categoryName: function (val) {
      this.categoryVo.categoryName = val;
    },
  },
  created() {
    this.init();
  },
  methods: {
    initMaxHeight() {
      calcHeight(this, -12);
    },
    setTableHeight(tableHeight) {
      // this.maxTableHeight = tableHeight
      // if(!this.add){
      //   this.maxTableHeight = 295
      // }
      this.initMaxHeight();
    },
    toggleTreeExpand() {
      this.isTreeCollapse = !this.isTreeCollapse;
    },
    init() {
      this.headers.forEach((item) => {
        item = { ...headerConfig, ...item };
        if (item.id) this.idKey = item.value;
      });
      this.search();
    },
    addTable() {
      if (this.isCategory && !this.categoryVo.categoryCode) {
        this.$message({
          message: this.$i18nn("i18n:system:categorySelectCheck"),
          type: "warning",
        });
        return;
      }
      this.dialogContext.data = this.isCategory
        ? {
            categoryCode: this.categoryVo.categoryCode,
            categoryName: this.categoryVo.categoryName,
          }
        : {};
      this.dialogContext.visible = !this.dialogContext.visible;
      this.dialogContext.isEdit = false;
    },
    async save() {
      const loading = this.$loading({
        target: "el-main",
        lock: true,
        text: this.$t("cm.loading"),
        spinner: "el-icon-loading",
        background: "rgba(0, 0, 0, 0.7)",
      });
      const url = this.dialogContext.isEdit ? this.urls.edit : this.urls.add;
      const { data } = await this.$http.post(url, {
        ...this.dialogContext.data,
        isEdit: this.dialogContext.isEdit,
      });
      loading.close();
      if (data.code === "0") {
        this.$message.success("保存成功");
        await this.search();
        this.dialogContext.visible = false;
      } else {
        this.$message.error(data.msg);
      }
    },
    async listReq() {
      this.loading = true;
      const { data } = await this.$http.post(this.urls.list, {
        ...this.searchForm,
        categoryCode: this.categoryCode,
      });
      if (data.code === "0") {
        this.items = data.data;
      }
      this.loading = false;
    },
    async pageReq() {
      this.loading = true;
      const params = {
        ...this.page,
        ...this.searchForm,
        categoryCode: this.categoryCode,
      };
      const { data } = await this.$http.post(this.urls.page, params);
      if (data.code === "0") {
        this.items = data.data.records;
        this.page.total = data.data.total;
      }
      this.loading = false;
    },
    del(row) {
      let _this = this;
      _this
        .$confirm(_this.$t("cm.is_delete"), _this.$t("cm.tips"), {
          type: "warning",
          confirmButtonText: _this.$t("cm.confirm"),
          cancelButtonText: _this.$t("cm.cancel"),
          cancelButtonClass: "btn-second",
          confirmButtonClass: "btn-default",
        })
        .then(() => {
          this.$http
            .post(`${_this.urls.del}/${row[_this.idKey]}`)
            .then(({ data }) => {
              if (data.code === "0") {
                _this.$message.success("删除成功");
                this.search();
              } else _this.$message.warning(data.msg);
            });
        });
    },
    reset() {
      this.searchForm = this.$options.data().searchForm;
      this.search();
    },
    dialogColShow(header) {
      return header.id && this.dialogContext.isEdit ? true : header.add;
    },
    search() {
      !!this.urls.page ? this.pageReq() : this.listReq();
    },
  },
};
</script>

<style scoped lang="less">
// @import "src/assets/css/style";
.manage-page {
  // background-color: #f1f1f1;
  // padding: 10px;

  .content {
    // background-color: #ffffff;
    border-radius: 20px;
    margin: 0 !important;
    .title {
      height: 50px;
      padding-left: 17px;
      line-height: 50px;
      display: flex;
      align-items: center;

      img {
        width: 22px;
        height: 24px;
        margin-right: 11px;
      }

      span {
        font-size: 22px;
        color: #102541;
        font-weight: bold;
      }
    }
  }
}
/deep/ .cud__page {
  margin-bottom: 15px;
}
/deep/ .el-card.is-always-shadow {
  margin: 15px 22px 15px 0px;
}
/deep/ .cud__scroll--div {
  padding-left: 15px;
}
</style>

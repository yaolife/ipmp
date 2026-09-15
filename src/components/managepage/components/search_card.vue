<!-- 管理页面搜索组件-->
<template>
  <div>
    <el-form
      size="small"
      label-suffix="："
      label-width="110px"
      label-position="top"
    >
      <el-row class="cud-senior-search mb-10" type="flex">
        <slot :data="internalValue" name="search">
          <slot
            :name="`search_${header.value}`"
            v-for="header in headers"
            v-if="header.search"
            :data="internalValue"
            :header="header"
          >
            <el-col :span="colSpan" :key="`search_${header.value}`">
              <el-form-item
                :label="$t($i18nn(header.text))"
                label-width="100px"
              >
                <el-input
                  v-model="internalValue[header.value]"
                  type="text"
                ></el-input>
              </el-form-item>
            </el-col>
          </slot>
        </slot>
        <slot name="search_append" :data="internalValue"></slot>
        <el-col
          :span="colSpan"
          :offset="isShowSearch() || isSearchAppend ? 0 : colPush"
          class="cud--right"
          :class="{ 'pt-30': isShowSearch() || isSearchAppend }"
        >
          <slot name="option">
            <el-button
              class="mr-10"
              type="primary"
              size="small"
              @click="$emit('search')"
              v-if="isShowSearch() || isSearchAppend"
              >{{ $t("cm.search") }}</el-button
            >
            <el-button
              size="small"
              @click="$emit('reset')"
              v-if="isShowSearch() || isSearchAppend"
              >{{ $t("cm.reset") }}</el-button
            >
            <el-button
              size="small"
              @click="$emit('add')"
              type="primary"
              v-if="isShowAdd && activeName === 'i18n_lang'"
              >{{ $t("cm.add") }}</el-button
            >
          </slot>
        </el-col>
      </el-row>
    </el-form>
    <!-- <div style="text-align: right">
      <slot name="option">
        <el-button size="small" @click="$emit('reset')"  >{{$t('cm.reset')}}</el-button>
        <el-button type="primary" size="small" @click="$emit('search')"  >{{$t('cm.search')}}</el-button>
      </slot>
    </div> -->
  </div>
</template>

<script>
import valueMixin from "@/mixins/valueMixin";
import { calcHeight } from "@/utils/funcUtil";

export default {
  name: "search_card",
  mixins: [valueMixin()],
  props: {
    // 是否开启左侧分类
    isCategory: { type: Boolean, default: false },
    // 是否显示添加按钮
    isShowAdd: { type: Boolean, default: true },
    // 是否额外追加查询条件
    isSearchAppend: { type: Boolean, default: false },
    activeName: { type: String, default: "i18n_lang" },
    // 表格数据头配置
    headers: {
      type: Array,
      default: () => []
    }
  },
  computed: {
    colSpan: function() {
      return this.isCategory ? 8 : 6;
    },
    colPush: function() {
      return this.isCategory ? 16 : 18;
    }
  },
  methods: {
    initMaxHeight() {
      this.$nextTick(() => {
        this.$emit(
            "setTableHeight",
            calcHeight(this, 280)
        )
      });
    },
    isShowSearch() {
      let show = false;
      this.headers.forEach(item => {
        if (item.search) {
          show = true;
        }
      });
      return show;
    }
  },
  mounted() {
    this.initMaxHeight();
  }
};
</script>

<style scoped></style>

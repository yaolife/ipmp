<template>
  <el-row>
    <div
      class="cud__table--list"
      :style="{ height: maxTableHeight + 'px' }"
    >
      <el-table
        :data="items"
        border
        stripe
        highlight-current-row
        tooltip-effect="dark"
        v-loading="loading"
         :max-height="maxTableHeight"
      >
        <!-- :max-height="
        activeName === 'i18n_lang' ? maxTableHeight + 101 : maxTableHeight
      "
      :height="
        activeName === 'i18n_lang' ? maxTableHeight + 101 : maxTableHeight
      " -->
        <el-table-column
          v-if="header.hidden !== true"
          v-for="header in headers"
          show-overflow-tooltip
          :prop="header.value"
          :label="$t($i18nn(header.text))"
          :key="header.value"
          :width="header.width"
        >
          <!-- :fixed="header.value === 'action' ? 'right' : false" -->
          <!-- :fixed="header.value === 'action'?'right':true" -->
          <template slot-scope="scope">
            <slot :name="`col_${header.value}`" :row="scope.row">
              <div v-if="header.value === 'action'">
                <el-button
                  @click="onEdit(scope.row)"
                  type="text"
                  size="small"
                  class="cud-common-operate-edit"
                  >{{ $t("cm.edit") }}</el-button
                >
                <el-button
                  @click="$emit('del', scope.row)"
                  type="text"
                  size="small"
                  class="cud-common-operate-delete"
                  >{{ $t("cm.delete") }}</el-button
                >
              </div>
              <div v-if="header.isDate">
                {{ dateFormat(scope.row[header.value]) }}
              </div>
              <div
                v-else
                v-text="$i18nn(scope.row[header.value], header.i18n)"
              />
            </slot>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <el-row>
      <el-pagination popper-class="cud-pager-dropdown"
        ref="pager"
        class="cud__page mt-10"
        @size-change="$emit('pageChange')"
        @current-change="$emit('pageChange')"
        :current-page.sync="page.current"
        :page-sizes="[10, 20, 30, 40]"
        :page-size.sync="page.size"
        layout="total,sizes, prev, pager, next"
        :pager-count="5"
        :total="page.total"
        v-if="isPage"
      >
      </el-pagination>
      <div v-else style="margin: 15px; height: 33px;"></div>
    </el-row>
  </el-row>
</template>

<script>
import { sync } from "@/mixins/valueMixin";

export default {
  name: "table_card",
  mixins: [sync("dialogContext", "syncDialogContext"), sync("page", "_page")],
  props: {
    // 表格数据
    items: { type: Array, default: () => ({}) },
    // 表格头配置
    headers: { type: Array, default: () => [] },
    // 加载状态
    loading: { type: Boolean, default: false },
    // 是否分页
    isPage: { type: Boolean, default: false },
    // table最大高度
    maxTableHeight: { type: Number, default: 0 },
    activeName: { type: String, default: "i18n_lang" },
  },
  methods: {
    onEdit(row) {
      this.syncDialogContext.data = { ...row };
      this.syncDialogContext.visible = true;
      this.syncDialogContext.isEdit = true;
    },
    dateFormat(time) {
      let date = null;
      if (time) {
        date = new Date(time);
        if (!date.getFullYear()) {
          date = new Date(time.replace(/-/g, "/"));
        }
        var year = date.getFullYear();
        var month =
          date.getMonth() + 1 < 10
            ? "0" + (date.getMonth() + 1)
            : date.getMonth() + 1;
        var day = date.getDate() < 10 ? "0" + date.getDate() : date.getDate();
        var hours =
          date.getHours() < 10 ? "0" + date.getHours() : date.getHours();
        var minutes =
          date.getMinutes() < 10 ? "0" + date.getMinutes() : date.getMinutes();
        var seconds =
          date.getSeconds() < 10 ? "0" + date.getSeconds() : date.getSeconds();
        var milSeconds =
          date.getMilliseconds() < 10
            ? "0" + date.getMilliseconds()
            : date.getMilliseconds();
        // 拼接
        return (
          year + "-" + month + "-" + day + " " + hours + ":" + minutes
          // +
          // ":" +
          // seconds +
          // ":" +
          // milSeconds
        );
      }
    },
  },
};
</script>

<style lang="less" scoped>
// @import "src/assets/css/style";
</style>

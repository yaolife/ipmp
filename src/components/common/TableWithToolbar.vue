<!--
 * @Author: [P631038]杨旭
 * @LastEditors: [P631038]杨旭
 * @Description:
-->
<template>
  <div v-if="isShow" ref="tableContainerChild">
    <vxe-toolbar ref="xToolbar" custom zoom>
      <template #tools>
        <slot name="toolbar-tools"></slot>
        <vxe-button
          icon="vxe-icon-repeat"
          @click="refreshList"
          circle
        ></vxe-button>

        <vxe-button
          style="margin-right: 12px"
          :icon="isFullscreen ? 'vxe-icon-zoom-in' : 'vxe-icon-fullscreen'"
          @click="toggleFullscreen"
          circle
        ></vxe-button>
      </template>
      <template #buttons>
        <slot name="toolbar-buttons"></slot>
      </template>
    </vxe-toolbar>

    <!-- :custom-config="{ storage: true, checkMethod: checkColumnMethod }" -->
    <vxe-table
      ref="xTable"
      stripe
      border
      resizable
      :data="tableData"
      :custom-config="customConfig"
      @custom="customEvent"
      :row-config="{ isHover: true, height: 32 }"
      :height="computedTableHeight - 120"
      :loading="loading"
      id="toolbar_demo"
      @checkbox-all="selectAllEvent"
      @checkbox-change="selectChangeEvent"
      @resizable-change="resizableChangeEvent"
    >
      <vxe-table-column
        v-if="isCheckBox"
        fixed="left"
        type="checkbox"
        width="60"
      ></vxe-table-column>
      <vxe-table-column
        v-for="column in columns"
        :key="column.field"
        :field="column.field"
        :title="column.title"
        :formatter="column.formatter"
        :sortable="column.sortable"
        :width="column.width"
      >
        <template v-if="column.slotName" #default="{ row }">
          <!-- <template v-if="column.children" #default="{ row }"> -->
          <slot :name="column.slotName" :row="row"></slot>
        </template>
      </vxe-table-column>
      <template #empty>
        <div class="el-table__empty-block">
          <span class="el-table__empty-text">暂无数据</span>
        </div>
      </template>
    </vxe-table>

    <el-row>
      <div class="cud-special-pagination cud-special-pagination-button">
        <el-pagination
          popper-class="cud-pager-dropdown"
          class="cud__page float-right"
          layout="total,slot,prev, pager, next"
          :disabled="loading"
          :current-page="currentPage"
          :total="total"
          :page-size="pageSize"
          @current-change="handleCurrentChange"
          @prev-click="prePage"
          @next-click="nextPage"
        >
          <!-- @size-change="detailChangeSize" -->
          <!-- 自定义的页容量选择器 -->
          <el-select
            v-model="pageSize"
            placeholder="请选择"
            size="small"
            style="width: 110px; margin-right: 10px"
            :page-sizes="[10, 20, 30, 40]"
            :pager-count="5"
            @change="handleSizeChange"
            :popper-append-to-body="!isFullscreen"
          >
            <el-option
              v-for="item in [10, 20, 30, 40]"
              :key="item"
              :label="`${item} 条/页`"
              :value="item"
            >
            </el-option>
          </el-select>
        </el-pagination>
      </div>
    </el-row>
  </div>
</template>


<script>
import screenfull from "screenfull";
import { getQueryFields, saveQueryFields, getFieldsList } from "../../api/api";
export default {
  props: {
    tableData: {
      type: Array,
      default: () => [],
    },
    columns: {
      type: Array,
      default: () => [],
    },
    loading: {
      type: Boolean,
      default: false,
    },
    isCheckBox: {
      type: Boolean,
      default: false,
    },
    // pageSize: {
    //   type: Number,
    //   String,
    //   default: 10,
    // },
    total: {
      type: Number,
      String,
      default: 0,
    },
    computedTableHeight: {
      type: Number,
      default: 300,
    },
    //保存配置的唯一标识
    queryTableId: {
      type: String,
      default: "",
    },
  },
  data() {
    return {
      isFullscreen: false,
      currentPage: 1,
      pageSize: 10,
      isShow: true,
      customConfig: {
        storage: true, //
        checkMethod: this.checkColumnMethod,
        // 从服务端恢复列状态
        restoreStore: this.restoreStoreMethod,
        // 将列状态保存到服务端
        updateStore: this.updateStoreMethod,
      },
    };
  },
  created() {
    this.$nextTick(() => {
      // 手动将表格和工具栏进行关联
      this.$refs.xTable.connect(this.$refs.xToolbar);
    });
  },
  mounted() {
    if (screenfull.isEnabled) {
      screenfull.on("change", () => {
        this.isFullScreen = screenfull.isFullscreen;
      });
    }
    // 监听全屏变化事件
    document.addEventListener("fullscreenchange", this.handleFullscreenChange);
    document.addEventListener(
      "webkitfullscreenchange",
      this.handleFullscreenChange
    );
    document.addEventListener(
      "mozfullscreenchange",
      this.handleFullscreenChange
    );
    document.addEventListener(
      "MSFullscreenChange",
      this.handleFullscreenChange
    );
  },

  methods: {
    customEvent() {
      // 如果需要，可以在此处添加一些即时反馈逻辑
      console.log("列显示状态发生了变化");
      // 注意：如果配置了updateStore，通常变化会自动触发保存，不一定需要在此手动保存
    },
    // !!! 核心方法：从服务端获取列状态 (对应 custom-config 的 restoreStore)
    async restoreStoreMethod() {
      console.log("restore");
      let params = {
        queryId: this.queryTableId || "vxeTable",
      };
      let result = null;
      await getQueryFields(params)
        .then((res) => {
          if (res.code === "0" && res.data.queryFields) {
            try {
              let data = JSON.parse(res.data.queryFields);
              result = data;
            } catch (err) {
              console.log("err", err);
            }
          }
        })
        .catch((err) => {
          console.log("err", err);
        });
      return result;
    },

    // !!! 核心方法：将列状态保存到服务端 (对应 custom-config 的 updateStore)
    async updateStoreMethod({ storeData }) {
      console.log("update", storeData);
      //保存自己的配置（单个）
      let setting = {
        queryId: this.queryTableId || "vxeTable",
        queryFields: storeData,
      };
      saveQueryFields(setting)
        .then((res) => {
          if (res.code === "0") {
            this.$message({ type: "success", message: "保存配置成功！" });
          } else {
            this.$message({ type: "error", message: res.msg });
          }
        })
        .catch((err) => {
          console.log("err", err);
        });
    },
    // 列宽的改变
    resizableChangeEvent() {
      const columns = this.$refs.xTable.getColumns();
      const customData = columns.map((column) => {
        return {
          width: column.renderWidth,
        };
      });
      console.log(customData);
    },

    checkColumnMethod({ column }) {
      // 通过获取dom的方法去把工具栏配置列,序号和复选框删除.
      this.$nextTick(() => {
        const elementClass = document.querySelector(".vxe-table-custom--body");
        if (elementClass) {
          const listItem = elementClass.querySelectorAll("li");
          listItem.forEach((item) => {
            if (item.innerText == "序号") {
              item.style.display = "none";
              if (column.type == "checkbox") column.checked = true;
            }
            if (item.innerText == "　") {
              item.style.display = "none";
            }
          });
        }
      });
      if (column.type == "seq" || column.type == "checkbox") {
        return false;
      }

      return true;
    },

    // 复选框全选方法
    selectAllEvent(e) {
      const records = this.$refs.xTable.getCheckboxRecords();
      e.records = records;
      this.$emit("select-all", e);
    },
    // 复选框单选方法
    selectChangeEvent(e) {
      const records = this.$refs.xTable.getCheckboxRecords();
      e.records = records;
      this.$emit("select-change", e);
    },
    // 每页条目数变化
    handleSizeChange(pageSize) {
      this.$emit("handle-size-change", pageSize);
    },
    //点击页数进行翻页
    handleCurrentChange(currentPage) {
      this.$emit("handle-current-change", currentPage);
    },

    //上一页
    prePage(currentPage) {
      this.$emit("pre-page", currentPage);
    },
    // 下一页
    nextPage(currentPage) {
      this.$emit("next-page", currentPage);
    },

    // 切换全屏逻辑
    toggleFullscreen() {
      if (screenfull.isEnabled) {
        // console.log('[ tableContainer ]-296', this.$parent.$parent)
        // console.log('[ tableContainer ]-296', this.$parent.$parent.$refs.tableContainer)
        if (this.$parent.$parent.$refs.tableContainer) {
          screenfull.toggle(this.$parent.$parent.$refs.tableContainer);
        } else {
          screenfull.toggle(this.$parent.$parent.$parent.$refs.tableContainer);
        }
      }
      // 切换的时候控制一下组件的v-if刷新组件,解决无法点击更多按钮问题.
      this.isShow = false;
      setTimeout(() => {
        this.isShow = true;
      }, 0);
    },
    handleFullscreenChange() {
      this.isFullscreen = !!(
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement
      );
    },
    // 刷新列表
    refreshList() {
      this.$emit("refresh");
    },
  },
  beforeDestroy() {
    // // 移除事件监听
    document.removeEventListener(
      "fullscreenchange",
      this.handleFullscreenChange
    );
    document.removeEventListener(
      "webkitfullscreenchange",
      this.handleFullscreenChange
    );
    document.removeEventListener(
      "mozfullscreenchange",
      this.handleFullscreenChange
    );
    document.removeEventListener(
      "MSFullscreenChange",
      this.handleFullscreenChange
    );
  },
};
</script>

<style lang='less' scoped>
/deep/.vxe-table--main-wrapper {
  min-height: 400px !important;
}
</style>

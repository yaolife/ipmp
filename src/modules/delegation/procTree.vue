<!--
 * @Author: P623437
 * @Date: 2021-10-22 16:45:07
 * @LastEditors: P623437
 * @LastEditTime: 2022-04-14 11:10:52
 * @Description: 流程组绑定人员和岗位
-->
<template>
  <el-dialog
    id="procTree"
    v-loading="loading"
    :visible.sync="modelIsOpen"
    custom-class="proc-tree-dialog"
    :title="title"
    v-dragMove="{ DragButton: '.el-dialog__header', DragWindow: '.el-dialog' }"
    :close-on-click-modal="false"
    @opened="openProcTreeFun"
    @close="closeGroupItemFun()"
    width="640px"
  >
    <div class="wfGroupItemBinding">
      <el-input
        v-model="filterText"
        :placeholder="this.$t('cm.filterPlaceholder')"
      >
        <!-- <el-button slot="append" icon="el-icon-search"></el-button> -->
      </el-input>
      <div class="cud__mtb-10 ml-20 mr-20">
        <el-tree
          :data="flowData"
          class="cud_tree"
          show-checkbox
          highlight-current
          ref="flowTree"
          node-key="id"
        >
        </el-tree>
      </div>
    </div>
    <div slot="footer" class="dialog-footer" align="center">
      <el-button
        size="small"
        type="primary"
        v-if="saveIsAdd !== '3'"
        @click="saveClick"
        >{{ $t("cm.commit") }}</el-button
      >
      <el-button size="small" @click="closeGroupItemFun">{{
        $t("cm.return")
      }}</el-button>
    </div>
  </el-dialog>
</template>

<script>
import api from "./api";

export default {
  data() {
    return {
      modelIsOpen: false,
      title: "流程",
      flowData: [],
      flowDataRemote: [],
      flowTreeOption: {
        children: "children",
        label: "label"
      },
      filterText: "",
      loading: false,
      saveIsAdd: "1",
      flowTreeAll: false,
      checkData: [],
      checkAllData: []
    };
  },

  props: {
    callBackEvent: { type: Function }
  },

  methods: {
    // 主页面传递被选择节点数据数据
    saveClick() {
      console.log(this.$refs.flowTree.getCheckedNodes());
      this.$emit("getData", this.$refs.flowTree.getCheckedNodes());
      this.modelIsOpen = false;
    },
    // 取消按钮事件
    closeGroupItemFun() {
      this.modelIsOpen = false;
    },
    // 初始化流程树
    openProcTreeFun() {
      this.initTree();
    },
    // 初始化流程树
    initTree() {
      let _this = this;
      _this.loading = true;
      api.funcTreeAPI().then(res => {
        if (res.code === "0") {
          _this.loading = false;
          _this.checkAllData = [];
          _this.findChild(res.data.data);
          _this.flowData = res.data.data;
          if (_this.checkData.length === 0 && _this.saveIsAdd !== "1") {
            _this.$refs.flowTree.setCheckedKeys(_this.checkAllData);
          } else {
            _this.$refs.flowTree.setCheckedKeys(_this.checkData);
          }

          console.info(_this.flowData);
        }
      });
    },

    findChild(array) {
      for (let i in array) {
        let data = array[i];
        if (data.children) {
          for (var g = 0; g < data.children.length; g++) {
            if (this.saveIsAdd === "3") {
              this.$set(data.children[g], "disabled", true);
            } else {
              this.$set(data.children[g], "disabled", false);
            }
            this.checkAllData.push(data.children[g].id);
          }
          this.findChild(data.children);
        }
      }
    }
  },
  mounted() {},
  watch: {}
};
</script>

<style scoped>
.el-dialog__body {
  height: inherit !important;
}
.el-dialog-div {
  height: 400px;
}
.el-card__header {
  padding: 10px 20px !important;
  border-bottom: 1px solid #ebeef5;
  -webkit-box-sizing: border-box;
  box-sizing: border-box;
}

.el-checkbox__label {
  padding-right: 10px;
}

.station-checkbox .el-checkbox,
.el-checkbox__input {
  display: block;
  position: relative;
  white-space: nowrap;
  padding: 10px 10px 10px 10px;
}
</style>
<style>
.company-dialog .el-dialog__body {
  height: inherit !important;
}

.company-dialog .el-dialog__footer {
  border-top: 1px solid #ebebeb;
  padding: 5px 20px 5px 5px;
}
.group-item-dialog .el-dialog__body {
  height: inherit !important;
  padding: 10px !important;
}
.group-item-dialog .el-dialog__footer {
  border-top: 1px solid #ebebeb;
  padding: 5px 20px 5px 5px;
}
.el-card__header {
  padding: 10px 20px !important;
}
</style>

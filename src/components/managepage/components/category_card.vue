<!--
 * 分类树组件
 * TODO 还需修改达到通用
 -->
<template>
  <!-- <div class="cud__mlr-20 cud__mtb-20"> -->
  <el-card class="box-shadow">
    <div class="cud__tree--left">
      <div class="cud-common-tree-content">
        <div class="tree-search-box">
          <el-input
            v-model="categoryFilterText"
            :placeholder="$t('sys.search_category')"
            maxlength="32"
            size="small"
            suffix-icon="el-icon-search"
          ></el-input>
        </div>
        <div class="cud-common-tree-title-wrap">
          <span class="cud-commom-tree-title-text"
            ><span
              class="cud3-icon-blue font_family icon-icon_process_classification"
            ></span
            >&nbsp;&nbsp;{{ $i18nn("i18n:system:cate") }}</span
          >
          <div
            class="cud-commom-tree-title-icon-wrap"
            v-if="isOptions"
            style="width: 55px !important;"
          >
            <slot
              name="category_option"
              :code="_selectedCode"
              :id="_selectedId"
            />
            <div
              class="cud-commom-tree-title-icon"
              style="width:18px"
              @click="del"
            >
              <span
                class="cud3-icon-blue font_family icon-icon_common_delete"
                :title="$t('cm.delete')"
              ></span>
            </div>
            <div
              class="cud-commom-tree-title-icon"
              style="width:18px"
              @click="edit"
            >
              <span
                class="cud3-icon-blue font_family icon-icon_common_edit"
                :title="$t('cm.edit')"
              ></span>
            </div>
            <div
              class="cud-commom-tree-title-icon"
              style="width:18px"
              @click="add"
            >
              <span
                class="cud3-icon-blue font_family icon-icon_common_add"
                :title="$t('cm.add')"
              ></span>
            </div>
          </div>
        </div>

        <div class="cud__mtb-10 ml-20 mr-20">
          <el-tree
            ref="categoryTree"
            class="cud_tree"
            :data="_treeData"
            :props="_treeConfig"
            :node-key="_treeConfig.key"
            :current-node-key="currentNode"
            highlight-current
            default-expand-all
            :expand-on-click-node="false"
            @node-click="nodeClick"
            :filter-node-method="filterTreeNode"
            v-loading.body="treeLoading"
          >
          </el-tree>
            <!-- :style="{
              height: maxTreeHeight + 'px',
              maxHeight: maxTreeHeight + 'px'
            }" -->
        </div>
      </div>
      <div
        class="cud__tree--expand-trigger box-shadow"
        :class="{ 'cud__tree--expand-shadow': isTreeCollapse }"
        @click="$emit('toggleTreeExpand')"
        v-if="!isDialog"
      >
        <i v-if="isTreeCollapse" class="cud3-icon-blue el-icon-caret-right"></i>
        <i v-else class="cud3-icon-blue el-icon-caret-left"></i>
      </div>
    </div>
    <el-dialog
      width="640px"
      v-bind="$attrs"
      :visible.sync="visible"
      close-on-click-modal
      :before-close="closeDialog"
      :title="$t(dialogTitle)"
      show-close
      v-dragMove="{
        DragButton: '.el-dialog__header',
        DragWindow: '.el-dialog'
      }"
    >
      <el-form
        ref="categoryForm"
        label-suffix="："
        label-position="top"
        :rules="_formRules"
        :model="formData"
      >
        <el-row>
          <el-col :span="12">
            <el-form-item
              :label="$t('sys.parent_node')"
              label-width="100px"
              prop="parentLabel"
            >
              <el-input
                size="small"
                disabled
                placeholder=""
                :model="isEdit ? selectedParentLabel : _selectedName"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              :label="$t('sys.category_code')"
              label-width="100px"
              prop="categoryCode"
            >
              <el-input
                size="small"
                placeholder=""
                v-model="formData.categoryCode"
                :disabled="codeDisabled"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item
              :label="$t('sys.category_name')"
              label-width="100px"
              prop="categoryName"
            >
              <el-input size="small" v-model="formData.categoryName"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item
              :label="$t('cm.describe')"
              label-width="100px"
              prop="categoryDesc"
            >
              <el-input
                v-model="formData.categoryDesc"
                size="small"
                type="textarea"
                rows="5"
                maxlength="255"
                show-word-limit
                class="form-input"
              ></el-input>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button size="small" @click="closeDialog">{{
          $t("cm.cancel")
        }}</el-button>
        <el-button
          size="small"
          type="primary"
          @click="save"
          :disabled="saveLoading"
          >{{ $t("cm.commit") }}</el-button
        >
      </div>
    </el-dialog>
  </el-card>
  <!-- </div> -->
</template>

<script>
import { sync } from "../../../mixins/valueMixin";
import cmsg from "@/components/common/message";
import { calcHeight } from "@/utils/funcUtil";

export default {
  name: "category_card",
  mixins: [
    // 选中分类的id
    sync("selectedId", "_selectedId"),
    // 选中分类的code
    sync("selectedCode", "_selectedCode"),
    // 选中分类的Name
    sync("selectedName", "_selectedName")
  ],
  props: {
    // 标题
    title: { type: String, default: "i18n:system.title" },
    // 是否提增删改操作
    isOptions: { type: Boolean, default: true },
    // 表单校验规则
    formRules: {
      type: Object,
      default: null
    },
    // 左侧树是否收起
    isTreeCollapse: { type: Boolean, default: false },
    // 是否为弹窗中
    isDialog: { type: Boolean, default: false },
    // 树配置
    treeConfig: {
      type: Object,
      default: () => ({
        children: "children",
        label: "categoryName",
        key: "categoryId",
        code: "categoryCode",
        parentKey: "parentId",
        desc: "categoryDesc"
      })
    }
  },
  watch: {
    categoryFilterText(val) {
      this.$refs.categoryTree.filter(val);
    }
  },
  data() {
    let codeValidate = (rule, value, callback) => {
      let reg = /^[a-zA-Z][_a-zA-Z0-9]*$/;
      if (!reg.test(value)) {
        callback(new Error(this.$t("sys.code_valid_message")));
      } else {
        if ("null" === value || "NULL" === value) {
          callback(new Error(this.$t("sys.code_not_null")));
        } else {
          callback();
        }
      }
    };
    let nameValidate = (rule, value, callback) => {
      let reg = /^[\u4e00-\u9fa5_a-zA-Z0-9]*$/;
      if (!reg.test(value)) {
        callback(new Error(this.$t("sys.name_valid_message")));
      } else {
        callback();
      }
    };
    let codeOnLyValidate = (rule, value, callback) => {
      let _this = this;
      let params = {
        categoryCode: value,
        categoryId: _this.formData.categoryId
      };
      this.$http
        .post(this.$api.i18n.i18nCategory.checkCode, params)
        .then(result => {
          if (result.data.code === "0" && result.data.data) {
            callback();
          }
          callback(new Error(_this.$t("sys.code_only_message")));
        })
        .catch(error => {
          cmsg.httpCatchErrorMessage(_this);
          callback(new Error(_this.$t("sys.code_only_message")));
        });
    };
    let nameOnLyValidate = (rule, value, callback) => {
      let _this = this;
      let params = {
        categoryName: value,
        categoryId: _this.formData.categoryId
      };
      this.$http
        .post(this.$api.i18n.i18nCategory.checkName, params)
        .then(result => {
          if (result.data.code === "0" && result.data.data) {
            callback();
          }
          callback(new Error(_this.$t("sys.name_only_message")));
        })
        .catch(error => {
          cmsg.httpCatchErrorMessage(_this);
          callback(new Error(_this.$t("sys.name_only_message")));
        });
    };
    return {
      tree: [
        {
          self: {
            categoryName: "根节点",
            categoryId: "-1",
            categoryCode: null
          },
          children: []
        }
      ],
      currentNode: "-1",
      visible: false,
      isEdit: false,
      formData: {},
      defaultFormRules: {
        categoryCode: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          },
          { validator: codeValidate, trigger: "blur" },
          { validator: codeOnLyValidate, trigger: "blur" }
        ],
        categoryName: [
          {
            required: true,
            message: this.$t("cm.tiprequired"),
            trigger: "blur"
          },
          { validator: nameValidate, trigger: "blur" },
          { validator: nameOnLyValidate, trigger: "blur" }
        ]
      },
      loaded: {},
      saveLoading: false,
      codeDisabled: false,
      treeNodeHasChildren: false,
      selectedParentId: null,
      selectedDesc: null,
      selectedParentLabel: null,
      categoryFilterText: "",
      maxTreeHeight: 0,
      treeLoading: true
    };
  },
  computed: {
    dialogTitle: function() {
      return this.isEdit ? "cm.edit" : "cm.add";
    },
    labels: function() {
      return this.treeConfig.label.split(".");
    },
    keys: function() {
      return this.treeConfig.key.split(".");
    },
    _treeData: function() {
      return [
        {
          ...this.rootNode,
          [this._treeConfig.children]: this.tTree([...this.tree])
        }
      ];
    },
    _formRules: function() {
      if (this.formRules) {
        return this.formRules;
      }
      return this.defaultFormRules;
    },
    _treeConfig: function() {
      return {
        ...this.treeConfig,
        label: this.labels[this.labels.length - 1],
        key: this.keys[this.keys.length - 1]
      };
    },
    rootNode: function() {
      let root = {};
      root[this._treeConfig.label] = "根节点";
      root[this._treeConfig.key] = null;
      root[this._treeConfig.key] = "-1";
      root[this._treeConfig.children] = [];
      return root;
    }
  },
  methods: {
    initMaxHeight() {
      calcHeight(this);
    },
    nodeClick(data, node) {
      this._selectedId = data[this._treeConfig.key];
      this._selectedCode = data[this._treeConfig.code];
      this._selectedName = data[this._treeConfig.label];
      this.selectedParentLabel = node.parent.data[this._treeConfig.label];
      this.selectedParentId = data[this._treeConfig.parentKey];
      this.selectedDesc = data[this._treeConfig.desc];
      this.loaded[data[this._treeConfig.key]] ||
        this.queryTree(this._selectedId);
      this.loaded[data[this._treeConfig.key]] = true;
      this.treeNodeHasChildren =
        data[this._treeConfig.children] &&
        data[this._treeConfig.children].length > 0;
      this.currentNode = data[this._treeConfig.key];
    },
    // 搜索分类
    filterTreeNode(value, data) {
      if (!value) return true;
      return data[this._treeConfig.label].indexOf(value) !== -1;
    },
    tTree(array) {
      array.forEach(item => {
        let labelTemp = item;
        this.labels.forEach(i => {
          labelTemp = labelTemp[i];
        });
        item[this._treeConfig.label] = labelTemp;
        let keyTemp = item;
        this.keys.forEach(i => {
          keyTemp = keyTemp[i];
        });
        item[this._treeConfig.key] = keyTemp;
      });
      if (
        array[this._treeConfig.children] &&
        array[this._treeConfig.children].length > 0
      ) {
        array[this._treeConfig.children] = this.tTree(
          array[this._treeConfig.children]
        );
      }
      return array;
    },
    add() {
      this.formData[this._treeConfig.parentKey] = this._selectedId;
      this.isEdit = false;
      this.visible = true;
    },
    edit() {
      if (this._selectedId === "-1") {
        this.$message({ message: this.$t("sys.root_check"), type: "warning" });
        return;
      }
      this.formData[this._treeConfig.key] = this._selectedId;
      this.formData[this._treeConfig.parentKey] = this.selectedParentId;
      this.formData[this._treeConfig.code] = this._selectedCode;
      this.formData[this._treeConfig.label] = this._selectedName;
      this.formData[this._treeConfig.desc] = this.selectedDesc;
      let _this = this;
      this.$http
        .get(this.$api.i18n.i18nItem.list + `/${this._selectedCode}`)
        .then(({ data }) => {
          if (data.code === "0" && data.data.length > 0) {
            _this.formData[_this._treeConfig.code] = _this._selectedCode;
            _this.$refs["categoryForm"].validateField("categoryCode");
            _this.codeDisabled = true;
          }
        });
      this.isEdit = true;
      this.visible = true;
    },
    closeDialog() {
      this.visible = false;
      this.codeDisabled = false;
      this.$refs["categoryForm"].resetFields();
      this.formData = {
        [this._treeConfig.key]: "",
        [this._treeConfig.code]: "",
        [this._treeConfig.label]: "",
        [this._treeConfig.parentKey]: "",
        [this._treeConfig.desc]: ""
      };
    },
    del() {
      if (this.treeNodeHasChildren) {
        this.$message({
          message: this.$t("sys.has_child_check"),
          type: "warning"
        });
        return;
      }
      if (this._selectedId === "-1") {
        this.$message({ message: this.$t("sys.root_check"), type: "warning" });
        return;
      }
      let _this = this;
      _this
        .$confirm(_this.$t("cm.is_delete"), _this.$t("cm.tips"), {
          type: "warning",
          confirmButtonText: _this.$t("cm.confirm"),
          cancelButtonText: _this.$t("cm.cancel"),
          cancelButtonClass: "btn-second",
          confirmButtonClass: "btn-default"
        })
        .then(() => {
          _this.$http
            .post(_this.$api.i18n.i18nCategory.delete, {
              [_this._treeConfig.key]: _this._selectedId,
              [_this._treeConfig.code]: _this._selectedCode
            })
            .then(({ data }) => {
              if (data.code === "0") {
                _this.$message.success("删除成功");
                _this.queryTree(this.selectedParentId);
              } else _this.$message.warning(data.msg);
            });
        });
    },
    save() {
      this.saveLoading = true;
      this.$refs["categoryForm"].validate(valid => {
        if (valid) {
          let parentId = this.isEdit ? this.selectedParentId : this._selectedId;
          this.$http
            .post(this.$api.i18n.i18nCategory.save, {
              ...this.formData,
              [this._treeConfig.parentKey]: parentId
            })
            .then(({ data }) => {
              if (data.code === "0") {
                this.$message.success("保存成功");
                this.closeDialog();
                this.queryTree(parentId);
                this.saveLoading = false;
              }
            });
        } else {
          this.$message({
            message: this.$t("sys.fill_in_error"),
            type: "warning"
          });
          this.saveLoading = false;
          return false;
        }
      });
    },
    setChildren(tree, data, parentKey) {
      tree.forEach(item => {
        if (item[this._treeConfig.key] === parentKey) {
          item[this._treeConfig.children] = [];
          data.forEach(subItem => {
            item[this._treeConfig.children].push({
              [this._treeConfig.key]: subItem[this._treeConfig.key],
              [this._treeConfig.code]: subItem[this._treeConfig.code],
              [this._treeConfig.label]: subItem[this._treeConfig.label],
              [this._treeConfig.parentKey]: subItem[this._treeConfig.parentKey],
              [this._treeConfig.desc]: subItem[this._treeConfig.desc]
            });
            this.loaded[subItem[this._treeConfig.key]] = false;
          });
          this.treeLoading = false;
        }
        if (item[this._treeConfig.children]) {
          this.setChildren(item[this._treeConfig.children], data, parentKey);
        }
      });
    },
    queryTree(parentKey) {
      this.treeLoading = true;
      this.$http
        .post(this.$api.i18n.i18nCategory.list, {
          [this._treeConfig.key]: parentKey
        })
        .then(({ data }) => {
          if (data.code === "0") {
            if (parentKey === "-1") {
              this.tree = [];
              data.data.forEach(item => {
                this.tree.push({
                  [this._treeConfig.key]: item[this._treeConfig.key],
                  [this._treeConfig.code]: item[this._treeConfig.code],
                  [this._treeConfig.label]: item[this._treeConfig.label],
                  [this._treeConfig.parentKey]:
                    item[this._treeConfig.parentKey],
                  [this._treeConfig.desc]: item[this._treeConfig.desc]
                });
                this.loaded[item[this._treeConfig.key]] = false;
              });
              this.treeLoading = false;
            } else {
              this.setChildren(this.tree, data.data, parentKey);
              this.tree = this.deepClone(this.tree);
            }
            this.currentNode = parentKey;
          }
        });
    }
  },
  created() {
    this.formData = {
      [this._treeConfig.key]: "",
      [this._treeConfig.code]: "",
      [this._treeConfig.label]: "",
      [this._treeConfig.parentKey]: "",
      [this._treeConfig.desc]: ""
    };
    this.queryTree("-1");
    this.loaded["-1"] = true;
    this._selectedId = "-1";
    this._selectedName = "根节点";
    this.currentNode = "-1";
    this.initMaxHeight();
  }
};
</script>

<style scoped lang="less">
// @import "src/assets/css/style";
.category-card {
  background-color: #f7f9fb;
  padding: 10px;

  & > div {
    margin-top: 10px;
  }

  .header {
    margin-top: 0;
    display: flex;
    justify-content: space-between;

    .title {
      font-size: 18px;
      color: #102541;
      font-weight: bold;
    }
  }

  .img {
    cursor: pointer;
    width: 16px;
    height: 100%;
    text-align: center;

    img {
      width: 4px;
      height: 20px;
      overflow: hidden;
      margin-bottom: -6px;
    }
  }

  h3 {
    margin: 0;
  }

  .tree /deep/ .el-tree {
    background-color: #f7f9fb;
  }
}
</style>

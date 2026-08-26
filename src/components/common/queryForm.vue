<template>
  <div class="cud-query-form" v-if="isShow">
    <div
      class="query-form"
      :class="isCollapse ? 'collapse' : ''"
      v-if="fields.length > 0"
    >
      <el-form
        v-model="queryForm"
        size="small"
        :label-width="labelWidth"
        label-position="right"
        label-suffix="："
      >
        <div class="query-form-right">
          <!-- 查询 / 重置 -->
          <el-button
            size="small"
            type="primary"
            @click="submitQueryForm"
            :disabled="disabledSearch || loading"
            >{{ $t("cgnCommon.search") }}</el-button
          >
          <el-button
            size="small"
            @click="resetQueryForm"
            :disabled="disabledSearch || loading"
            >{{ $t("cgnCommon.reset") }}</el-button
          >
          <el-popover
            v-if="showMoreSetting"
            placement="top-end"
            width="200"
            trigger="click"
            v-model="showEdit"
            popper-class="query-form-option"
            :append-to-body="true"
          >
            <div class="query-form-list" :style="zoomStyle">
              <draggable
                tag="ul"
                v-model="fields"
                ghost-class="ghost"
                :animation="300"
                :setData="() => {}"
              >
                <li v-for="(item, index) in fields" :key="index">
                  <i class="el-icon-rank"></i>
                  <el-checkbox
                    v-model="item.display"
                    @change="queryFormOverflow"
                  ></el-checkbox>
                  {{ item.label ? item.label : $t(item.labelKey) }}
                </li>
              </draggable>
            </div>
            <div class="query-form-btn">
              <el-button size="small" @click="cancelSetting">{{ $t('cm.cancel') }}</el-button>
              <el-button size="small" @click="resetSetting">{{ $t('cm.reset') }}</el-button>
              <el-button
                size="small"
                type="primary"
                @click="saveSetting"
                :disabled="btnLoading"
                >{{ $t('cm.save') }}</el-button
              >
            </div>
            <el-button size="small" slot="reference"
              ><i class="el-icon-more"></i
            ></el-button>
          </el-popover>
        </div>
        <el-row class="query-form-left">
          <!-- 根据屏幕大小显示2-4个 -->
          <el-col
            :md="12"
            :lg="fields.length > 1 || isFlowManageType ? 8 : 12"
            :xl="fields.length > 1 || isFlowManageType ? 6 : 12"
            v-for="(item, index) in fields"
            :key="index"
          >
            <div v-if="item.display">
              <el-form-item
                :label="item.label ? item.label : $t(item.labelKey)"
                :rules="item.rules || null"
              >
              <div slot="label" v-if="item.required">
                <label style="color:red">*</label> {{item.label}}：
              </div>
                <!-- 输入框 -->
                <el-input
                  size="small"
                  :clearable="true"
                  v-model="queryForm[item.name]"
                  v-if="item.type === 'input'"
                  :placeholder="$t('cm.pleaseEnter')"
                ></el-input>
                <!-- 下拉 -->
                <el-select
                  :popper-append-to-body="isFullscreen"
                  size="small"
                  :clearable="true"
                  filterable
                  v-model="queryForm[item.name]"
                  v-if="item.type === 'select'"
                  :remote="item.remote"
                  :remote-method="item.remoteMethod"
                  :disabled="item.disabled"
                >
                  <el-option
                    v-for="item1 in item.fieldMap"
                    :key="item1.value"
                    :label="item1.label ? item1.label : $t(item1.labelKey)"
                    :value="item1.value"
                  >
                  </el-option>
                </el-select>
                <!-- 选人 -->
                <person-select
                  ref="personSelect"
                  v-model="queryForm[item.name]"
                  v-if="item.type === 'personal'"
                  :isFullscreen="isFullscreen"
                >
                </person-select>
                <!--日期-->
                <el-date-picker
                  v-model="queryForm[item.name]"
                  type="date"
                  range-separator="-"
                  :placeholder="$t('cm.pleaseEnter')"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  v-if="item.type === 'date'"
                  :append-to-body="isFullscreen"
                >
                </el-date-picker>
                <!-- 日期范围 -->
                <el-date-picker
                  v-model="queryForm[item.name]"
                  type="daterange"
                  range-separator="-"
                  :start-placeholder="$t('workbench.begin_delegation_date')"
                  :end-placeholder="$t('workbench.end_delegation_date')"
                  value-format="yyyy-MM-dd HH:mm:ss"
                  v-if="item.type === 'dateRange'"
                  :append-to-body="isFullscreen"
                >
                </el-date-picker>
                <!-- 年 -->
                <el-date-picker
                  v-model="queryForm[item.name]"
                  type="year"
                  format="yyyy"
                  value-format="yyyy"
                  v-if="item.type === 'dateYear'"
                  :append-to-body="isFullscreen"
                >
                </el-date-picker>
                <!-- 月 -->
                <el-date-picker
                  v-model="queryForm[item.name]"
                  type="month"
                  format="MM"
                  value-format="MM"
                  v-if="item.type === 'dateMonth'"
                  :append-to-body="isFullscreen"
                >
                </el-date-picker>
                <!-- 级联 -->
                <el-cascader
                  v-model="queryForm[item.name]"
                  v-if="item.type === 'cascader'"
                  :options="item.fieldMap"
                  :show-all-levels="false"
                  filterable
                  :props="processCategoryTreeOption"
                  :popper-append-to-body="isFullscreen"
                  :append-to-body="isFullscreen"
                ></el-cascader>
              </el-form-item>
            </div>
          </el-col>
        </el-row>
      </el-form>
    </div>
    <div class="query-collapse" v-if="fields.length > 0 && showMoreSetting">
      <el-button
        type="text"
        @click="queryCollapse(false)"
        v-if="isCollapse && isOverflow"
      >
        <i class="el-icon-caret-bottom"></i>
        <p>展开</p>
      </el-button>
      <el-button type="text" @click="queryCollapse(true)" v-if="!isCollapse">
        <i class="el-icon-caret-top"></i>
        <p>收起</p>
      </el-button>
      <el-button type="text" @click="queryFormFixed()" v-if="!isCollapse">
        <i
          style="display: inline-block; width: 10px; height: 10px;"
          :style="
            'background-image: url(' + require('@/assets/img/u4031.svg') + ')'
          "
        ></i>
        <p v-if="!isFixed">固定</p>
        <p v-else>取消固定</p>
      </el-button>
    </div>
    <el-dialog
      width="60%"
      :visible.sync="showDialog"
      v-if="showDialog"
      custom-class="process-creator-dialog"
      :modal="false"
      :destory-on-close="true"
      :title="$t('wm.principal_config')"
      :close-on-click-modal="false"
      v-dragMove="{
        DragButton: '.el-dialog__header',
        DragWindow: '.el-dialog',
      }"
    >
      <div class="el-dialog-div">
        <!-- showUserTab 类型Boolean true代表选人控件 -->
        <!-- showOrgTab 类型Boolean true代表选部门控件 -->
        <wf-comm-person-component
          ref="wfCommPersonComponentId"
          :show-user-group-tab="false"
          :showDynRoleTab="false"
          :showStationTab="false"
          :showUserTab="showUserTab"
          :showOrgTab="showOrgTab"
          :showUserMultiple="false"
          :orgShowCheckbox="false"
          :initUserId="initUserId"
        ></wf-comm-person-component>
      </div>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button size="small" @click="closeCreatorFunc">{{
          $t("cm.cancel")
        }}</el-button>
        <!-- 确定 -->
        <el-button size="small" type="primary" @click="commitCreatorFunc">{{
          $t("cm.confirm")
        }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import Draggable from "vuedraggable";
import { getQueryFields, saveQueryFields, getFieldsList } from "../../api/api";
import { throttle } from "@/utils/funcUtil";

export default {
  name: "queryForm",
  props: {
    labelWidth: { type: String, default: "90px" },
    queryFormId: { type: String, require: true }, //唯一标识，保存用
    queryFields: { type: Array, require: true }, //查询字段列表
    delaySetting: { type: Number, default: 0 }, //延迟获取配置，用于解决同一页面多个组件实例同时调用接口问题
    loading: { type: Boolean, default: false }, //列表加载中，禁用搜索按钮
    isFlowManageType: { type: Boolean, default: false }, //是否为流程分类页面
    isFullscreen: { type: Boolean, default: true }, //是否为流程分类页面
    showMoreSetting: { type: Boolean, default: true }, //是否显示重置后的字段配置按钮

    // @resize: { type: Function },               //展开表单时触发，用于调整高度
    // @submit: { type: Function },               //点击搜索时触发
  },
  components: {
    Draggable,
  },
  data() {
    return {
      // 示例
      // fields: [
      //   /* label: 静态文本；labelKey: i18n key；默认label */
      //   { name: 'query1', label: '查询条件1', labelKey: '', value: '', type: 'input', display: true, order: 0 },
      //   { name: 'query2', label: '', labelKey: 'cgnTask.field.priority', value: '', type: 'select', display: true, order: 1, fieldMap: [
      //     { label: '选项1', labelKey: '', value: '1' },
      //     { label: '选项2', labelKey: '', value: '2' },
      //     { label: '选项3', labelKey: '', value: '3' },
      //   ]},
      //   { name: 'query4', label: '选人', labelKey: '', value: '', type: 'personal', display: true, order: 3 },
      //   /* relation 关联字段名，日期范围有开始和结束两个值，将第二个值返给relation指定的字段 */
      //   { name: 'query5', label: '日期范围', labelKey: '', relation: 'query6', value: '', type: 'dateRange', display: true, order: 4 },
      // ],
      // 查询字段
      fields: [],
      // 查询表单模型
      queryForm: {},
      // 返回结果
      queryResult: {},
      // 是否折叠
      isCollapse: true,
      // 是否固定
      isFixed: false,
      //是否超出一行
      isOverflow: true,
      // 显示字段列表
      showEdit: false,
      // 选人弹窗
      showDialog: false,
      //禁用搜索按钮
      disabledSearch: false,
      //解决zoom缩放后拖拽失效问题
      zoomStyle: {
        zoom: "100%"
      },
      //禁用保存按钮
      btnLoading: false,
      processCategoryTreeOption: {
        children: "children",
        label: "label",
        value: "procCategoryId",
      },
      isShow: 1,
    };
  },

  watch: {
    isFullscreen: {
      handler(val) {
        this.isShow = false;
        setTimeout(() => {
          this.isShow = true;
        }, 0);
      },
    },
    queryFields: {
      handler(val) {
        //初始化查询字段
        // this.fields = [...val]; //JSON.parse(JSON.stringify(val));
        this.fields = this.deepClone(val);
        //初始化
        this.initQueryForm(val);
      },
      deep: true,
      immediate: true,
    },
    fields: {
      handler(val) {
        let disabled = true;
        val.forEach((item) => {
          if (item.display) disabled = false;
        });
        this.disabledSearch = disabled;
      },
      deep: true
    }
  },
  mounted() {
    //需要先调节一下高度
    this.$emit("resize");
    //检查是否超出一行
    this.queryFormOverflow();
    //解决zoom缩放后拖拽失效问题
    this.zoomFunc = throttle(this.resetZoom, 500);
    window.addEventListener("resize", this.zoomFunc);
    this.resetZoom();
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.zoomFunc);
  },
  methods: {
    //解决zoom缩放后拖拽失效问题
    resetZoom() {
      this.zoomStyle = {
        zoom: (100 / this.$root.zoom) * 100 + "%",
        transform: "scale(" + this.$root.zoom / 100 + ")",
        transformOrigin: "left center"
      };
    },
    //初始化查询表单
    initQueryForm(val) {
      //默认值
      this.fields.forEach(item => {
        this.$set(this.queryForm, item.name, item.value);
      });
      //获取配置
      setTimeout(
        () => {
          this.getSetting();
        },
        this.delaySetting ? this.delaySetting : 0
      );
      //检查是否超出一行
      this.queryFormOverflow();
    },
    //提交查询表单
    submitQueryForm() {
      //通知父组件更新查询条件
      this.$emit("submit", this.getQueryForm());
    },
    //获取查询条件
    getQueryForm() {
      this.queryResult = {};
      this.fields.forEach((item) => {
        if (item.display) {
          if (item.type === "personal") {
            //选人取userId
            this.queryResult[item.name] =
              (this.queryForm[item.name] &&
                this.queryForm[item.name]["userId"]) ||
              "";
          } else if (item.type === "dateRange") {
            //日期范围两个值
            this.queryResult[item.name] =
              (this.queryForm[item.name] && this.queryForm[item.name][0]) || "";
            if (item.relation) {
              //设置了关联字段，该字段有两个值
              this.queryResult[item.relation] =
                (this.queryForm[item.name] && this.queryForm[item.name][1]) ||
                "";
              //默认00:00:00
              if (this.queryResult[item.relation]) {
                this.queryResult[item.relation] = this.queryResult[
                  item.relation
                ].replace("00:00:00", "23:59:59");
              }
            }
          } else {
            //其他
            this.queryResult[item.name] = this.queryForm[item.name] || "";
          }
        }
      });
      return this.queryResult;
    },
    //重置查询表单
    resetQueryForm() {
      //清空
      this.queryForm = {};
      //加载默认值
      this.fields.forEach((item) => {
        if (item.value !== "") {
          this.$set(this.queryForm, item.name, item.value);
        }
      });
      //通知父组件更新查询条件
      this.$emit("submit", this.getQueryForm());
    },

    //折叠
    queryCollapse(collapse) {
      this.isCollapse = !this.isCollapse;
      //通知父组件更新高度
      this.$emit("resize");
      //检查是否超出一行
      this.queryFormOverflow();
    },
    //固定
    queryFormFixed() {
      this.isFixed = !this.isFixed;
      if (!this.isFixed && !this.isCollapse) {
        this.isCollapse = true;
      }
      this.saveSetting();
      //检查是否超出一行
      this.queryFormOverflow();
    },
    //检查是否超出一行
    queryFormOverflow() {
      this.$nextTick(() => {
        let outerBox = this.$el.querySelector(".query-form");
        let innerBox = this.$el.querySelector(".query-form-left");
        if (outerBox.clientHeight && innerBox.clientHeight) {
          if (innerBox.clientHeight <= outerBox.clientHeight) {
            this.isOverflow = false;
          } else {
            //超出一行
            this.isOverflow = true;
          }
        }
        //通知调整高度
        this.$emit("resize");
      });
    },
    //读取设置
    async getSetting() {
      let settings = [];
      let queryForm = sessionStorage.getItem("queryForm");
      if (queryForm) {
        //有缓存直接拿缓存
        settings = JSON.parse(queryForm);
      } else {
        //没有缓存，去后端请求所有配置
        await getFieldsList().then((res) => {
          if (res.code === "0") {
            settings = res.data;
            settings.forEach((item) => {
              if (!item.queryFields) return;
              //返回queryFields数据是json字符串，需要处理一下
              item.queryFields.forEach((item1, index) => {
                if (!item1) return;
                try {
                  item.queryFields[index] = JSON.parse(item1);
                } catch (e) {
                  console.error("解析搜索字段JSON出错！");
                }
              });
            });
            //缓存到本地
            sessionStorage.setItem("queryForm", JSON.stringify(settings));
          }
        });
      }
      //拿到当前单个配置
      let setting = {};
      if (settings && settings.length > 0) {
        setting = settings.find((item) => item.queryId == this.queryFormId);
      }
      if (setting && setting.isFixed) {
        //是否固定
        this.isFixed = setting.isFixed;
        this.isCollapse = this.isFixed ? false : true;
      }
      if (setting && setting.queryFields) {
        //字段定义配置
        let queryFields = setting.queryFields;
        if (!queryFields || queryFields.length < 1) return;
        queryFields.forEach((item) => {
          let find = this.fields.find((item1) => item1.name == item.name);
          if (find) {
            //更新是否显示和排序属性
            find.display = item.display;
            find.order = item.order;
          }
        });
        //重新排序
        this.fields.sort((a, b) => {
          return a.order - b.order;
        });
        //检查是否超出一行
        this.queryFormOverflow();
      }
    },
    //保存设置
    saveSetting() {
      let queryForm = sessionStorage.getItem("queryForm");
      let settings = [];
      if (queryForm) {
        settings = JSON.parse(queryForm);
      }
      //遍历自己的字段
      let fields = [];
      this.fields.forEach((item, index) => {
        fields.push({
          name: item.name,
          display: item.display,
          order: index,
        });
      });
      //生成自己的配置
      let setting = {
        queryId: this.queryFormId,
        queryFields: fields,
        isFixed: this.isFixed,
      };
      //找到自己对应的配置
      let found = false;
      settings.forEach((item, index) => {
        if (item.queryId == this.queryFormId) {
          //找到
          settings[index] = Object.assign(settings[index], setting);
          found = true;
        }
      });
      if (!found) {
        //没找到要把自己放入缓存
        settings.push(setting);
      }
      //更新缓存
      sessionStorage.setItem("queryForm", JSON.stringify(settings));

      this.btnLoading = true;
      //保存自己的配置（单个）
      saveQueryFields(setting)
        .then((res) => {
          this.btnLoading = false;
          if (res.code === "0") {
            this.showEdit = false;
            this.$message({ type: "success", message: "保存配置成功！" });
          } else {
            this.$message({ type: "error", message: res.msg });
          }
        })
        .catch((err) => {
          this.btnLoading = false;
          console.log("err", err);
        });
    },
    //取消
    cancelSetting() {
      this.showEdit = false;
    },
    //重置
    resetSetting() {
      this.isFixed = false;
      this.fields = JSON.parse(JSON.stringify(this.queryFields));
      this.saveSetting();
    },
  },
};
</script>

<style lang="less" scoped>
// @import "src/assets/css/style";
.cud-query-form {
  position: relative;
  overflow: visible;
  margin-bottom: 15px;
  padding-bottom: 10px;
  z-index: 10;
}

.cud-query-form /deep/.el-form-item__label {
  height: 32px;
  line-height: 18px;
  display: flex;
  flex-direction: row-reverse;
  flex-wrap: wrap;
  align-content: space-around;

  &::after {
    display: none;
  }
}

.cud-query-form .query-form {
  height: auto;
  overflow: auto;
}
.cud-query-form .query-form.collapse {
  height: 42px;
  overflow: hidden;
}
.cud-query-form .query-form-left {
  padding-right: 200px;
}
.query-form-left .el-form-item {
  margin-right: 0px;
}
.cud-query-form .query-form-right {
  width: 200px;
  text-align: right;
  position: absolute;
  right: 0px;
  z-index: 2;
}
.cud-query-form .query-collapse {
  display: flex;
  justify-content: center;
  position: absolute;
  width: 100%;
  margin-top: -0px;
}
.cud-query-form .query-collapse button {
  border: 2px solid #aaa;
  width: 20px;
  height: 20px;
  padding: 0;
  margin: 0 5px;
  border-radius: 50%;
  z-index: 2;
  background-color: #fff;
}
.cud-query-form .query-collapse button i {
  color: #aaa;
}
.cud-query-form .query-collapse button p {
  position: absolute;
  color: #666;
  font-size: 12px;
  width: 100px;
  text-align: center;
  margin-top: -35px;
  margin-left: -42px;
  opacity: 0;
  transform: translateY(-100%);
  display: none;
}
.cud-query-form .query-collapse button:hover p {
  opacity: 1;
  transition: all 0.3s;
  transform: translateY(0);
  display: block;
}
.cud-query-form .query-collapse::after {
  content: "";
  position: absolute;
  left: 0px;
  margin-top: 10px;
  width: 100%;
  height: 1px;
  background: radial-gradient(circle, rgba(0, 0, 0, 0.1), rgba(0, 0, 0, 0));
}
.query-form-option .query-form-list ul {
  padding: 0;
  max-height: 250px;
  overflow-x: hidden;
  overflow-y: scroll;
}
.query-form-option .query-form-list li {
  list-style: none;
  padding-left: 20px;
  width: 180px;
  height: 30px;
  line-height: 30px;
  cursor: move;
}
.query-form-option .query-form-list li:hover {
  background-color: rgba(100, 100, 100, 0.1);
}
.query-form-option .query-form-list li i {
  margin-right: 5px;
}
.query-form-option .query-form-list li label {
  margin-right: 5px;
}
.query-form-option .query-form-btn {
  border-top: 1px solid rgba(100, 100, 100, 0.2);
  padding-top: 10px;
  text-align: right;
}
.query-form-option .query-form-btn button {
  width: 50px;
  height: 28px;
  line-height: 26px;
  padding: 2px 5px;
}

.el-range-editor {
  width: 100%;
}
/* 解决自适应日期范围显示不全 */
.el-range-editor.el-input__inner {
  padding: 3px 5px;
}
/deep/.el-date-editor .el-range-input {
  font-size: 12px;
}
/deep/.el-date-editor .el-range-separator {
  padding: 0;
}
/deep/.el-date-editor .el-input__icon {
  width: 15px;
}
</style>

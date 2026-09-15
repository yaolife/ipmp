<template>
  <div v-if="processFlag != '3'" id="comment" ref="comment">
    <el-form
      label-width="10rem"
      :label-position="labelPosition"
      ref="commentForm"
    >
      <el-row
        v-if="currentLink != null && currentLink != ''"
        style="padding:0 10px"
      >
        <el-col :span="14">
          <!-- 当前环节 -->
          <el-form-item
            :label="$t('cudComponents.current_link')"
            v-if="!isEnLanguage"
          >
            <el-input v-model="currentLink" disabled size="small"></el-input>
          </el-form-item>
          <el-form-item
            :label="$t('cudComponents.current_link')"
            v-if="isEnLanguage"
          >
            <el-input v-model="currentLinkEn" disabled size="small"></el-input>
          </el-form-item>
          <!-- 流转方式 -->
          <el-form-item
            :label="$t('cudComponents.circulation_mode')"
            v-if="
              !circulationModeShow &&
                circlationModeDataList != null &&
                circlationModeDataList.length > 0
            "
          >
            <el-radio-group
              v-model="selectedMode"
              @change="changeCirclationMode"
              :disabled="detail"
            >
              <el-radio
                v-for="item in circlationModeDataList"
                :key="item.label"
                :label="item.label"
                :disabled="item.disabled"
                >{{ $t(item.value) }}</el-radio
              >
            </el-radio-group>
          </el-form-item>
          <!-- 审批意见 -->
          <el-form-item
            v-if="processFlag == '2' || processFlag == '5'"
            :label="$t('cudComponents.approve_suggest')"
          >
            <span v-if="detail == true"> {{ commentText }}</span>
            <div class="commentDiv" v-if="detail != true">
              <div ref="inputRef">
                <el-input
                  type="textarea"
                  show-word-limit
                  :autosize="{ minRows: 2, maxRows: 10 }"
                  maxlength="200"
                  :placeholder="$t('cudComponents.enter_suggest')"
                  rows="10"
                  v-model="commentText"
                  v-on:blur="getCommentText"
                ></el-input>
              </div>
              <!-- 常用词条 -->
              <div v-if="!isShow" class="tag-css" ref="inputTagRef">
                <el-tag
                  v-for="(item, index) in perTermsList"
                  :key="index"
                  type="info"
                  size="small"
                  :closable="item.id ? true : false"
                  v-on:click="addCommentText($t(item))"
                  @close="handleClose(item, index)"
                  style="
                    cursor: pointer;
                    margin-right: 10px !important;
                    margin-bottom: 7px !important;
                  "
                  class="p_pointer tag-color-css"
                  >{{ $t(item.term) }}{{ item.termType }}</el-tag
                >
                <el-input
                  class="input-new-tag"
                  v-if="inputVisible"
                  v-model="inputValue"
                  ref="saveTagInput"
                  size="mini"
                  placeholder="请输入词条..."
                  @keyup.enter.native="handleInputConfirm"
                  @blur="handleInputConfirm"
                >
                </el-input>
                <div
                  v-else
                  class="button-new-tag"
                  size="small"
                  style="margin-bottom: 8px"
                  @click="showInput"
                >
                  + 添加
                </div>
              </div>
              <div v-if="!isShow" class="arrowicon-css" @click="arrowClick">
                <i class="el-icon-d-arrow-right"></i>
              </div>
              <div v-else class="arrowicon-css" @click="arrowClick">
                <i class="el-icon-d-arrow-left"></i>
              </div>
            </div>
          </el-form-item>
          <div v-else>
            <el-form-item :label="$t('cudComponents.approve_suggest')">
              {{ commentText }}
            </el-form-item>
          </div>
        </el-col>
        <el-col :span="8" v-if="detail != true && isShow">
          <el-form-item label="" label-width="32px">
            <div
              :class="
                labelPosition == 'top' ? 'commonTermsDivTop' : 'commonTermsDiv'
              "
            >
              <div style="margin-left: 2px; margin-bottom: 2px">
                {{ $t("cudComponents.common_entries") }}
              </div>
              <el-tag
                v-for="(item, index) in perTermsList"
                :key="index"
                type="info"
                :closable="item.id ? true : false"
                v-on:click="addCommentText($t(item))"
                @close="handleClose(item, index)"
                class="p_pointer tag-color-css"
                style="
                  cursor: pointer;
                  margin-right: 10px !important;
                  margin-bottom: 7px !important;
                "
                >{{ $t(item.term) }}</el-tag
              >
              <el-input
                class="input-new-tag"
                v-if="inputVisible"
                v-model="inputValue"
                ref="saveTagInput"
                size="small"
                placeholder="请输入词条..."
                @keyup.enter.native="handleInputConfirm"
                @blur="handleInputConfirm"
              >
              </el-input>
              <div
                v-else
                class="button-new-tag"
                size="small"
                @click="showInput"
              >
                + 添加
              </div>
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import osUtil from "@/utils/osUtil";
import * as Utils from "@/utils/Utils";
import API from "../api";
import { debounce } from "lodash";
export default {
  name: "Comment",
  props: {
    prop: { type: String },
    // 状态:1 发起 / 2 待办 / 3 已办 / 4 草稿 / 5 待阅 / 6 已阅
    processFlag: { type: String, default: "2" },
    // 流程名称
    processName: { type: String, default: "cudComponents.approve_suggest" },
    // 环节名称
    currentLink: { type: String, default: "cudComponents.auto_sys_genera" },
    // 环节名称英文
    currentLinkEn: { type: String, default: "cudComponents.auto_sys_genera" },
    // 数据传参
    model: {
      type: Object,
      default: () => {
        return {
          selectedCirclationMode: "1",
          comments: "同意"
        };
      }
    },
    // 默认词条
    perTermsList: {
      type: Array,
      default: () => {
        return [
          {
            id: "",
            procId: "",
            term: "同意",
            termType: ""
          },
          {
            id: "",
            procId: "",
            term: "退回，请重新修改",
            termType: ""
          }
        ];
      }
    },
    // 流转方式
    circlationModeDataList: {
      type: Array,
      default: () => {
        return [
          { value: "cm.commit", label: "1", disabled: false },
          { value: "cudComponents.send_back", label: "2", disabled: false },
          { value: "cudComponents.invalid", label: "3", disabled: true }
        ];
      }
    },
    //否是隐藏流转方式
    circulationModeShow: {
      type: Boolean,
      default: false
    },
    // 只读
    detail: { type: Boolean, default: false }
  },
  data() {
    return {
      labelPosition: "left",
      isEnLanguage: Utils.isEnLanguage(this.$i18n), // 是否是英语
      selectedMode: "1",
      commentText: "",
      inputVisible: false,
      inputValue: "",
      returnFile: "",
      isShow: true
      // approvalLogArrow: ""
    };
  },
  watch: {
    circlationModeDataList: {
      handler(n, o) {
        return Object.assign(n, o);
      },
      deep: true
    },
    i18nLocale: {
      handler(n, o) {
        //增加监听事件，多语言控制
        this.isEnLanguage = Utils.isEnLanguage(this.$i18n);
      }
    }
  },
  computed: {
    i18nLocale() {
      return this.$i18n.locale;
    }
  },
  mounted() {
    if (osUtil.getBrowserInfo().browser.indexOf("IE") === 0) {
      this.$refs.comment.parentNode.removeAttribute("disabled");
    }
    let timer = setTimeout(() => {
      this.init();
      clearTimeout(timer);
      if (this.$refs.inputRef) {
        let inputRef = this.$refs.inputRef.offsetWidth;
        if (!this.isShow) {
          this.$nextTick(() => {
            this.$refs.inputTagRef.style = `overflow: hidden;width:calc(${inputRef}px - 70px)`;
          });
        }
      }

      // 解决静态扫描问题注释
      // 缓存中获取常用词条显示位置
      // if (localStorage.getItem("approvalLogArrow")) {
      //   let arrow = localStorage.getItem("approvalLogArrow");
      //   arrow === "left" ? (this.isShow = false) : (this.isShow = true);
      // }
      this.handleResize = debounce(this.handleResize, 200); // 设置resize事件的调用间隔时间为200ms
      window.addEventListener("resize", this.handleResize); // 监听window的resize事件
    }, 1000);
  },

  methods: {
    handleResize() {
      const width = this.$refs.inputRef.offsetWidth; // 获取组件的宽度
      let inputRef = this.$refs.inputRef.offsetWidth;
      if (!this.isShow) {
        this.$nextTick(() => {
          this.$refs.inputTagRef.style = `overflow: hidden;width:calc(${inputRef}px - 70px)`;
        });
      }
      // 进行其他操作或更新状态等
    },
    // 箭头点击,获取审批意见宽度
    arrowClick() {
      this.isShow = !this.isShow;
      let inputRef = this.$refs.inputRef.offsetWidth;
      if (!this.isShow) {
        this.$nextTick(() => {
          this.$refs.inputTagRef.style = `overflow: hidden;width:calc(${inputRef}px - 70px)`;
        });
      }
      // if (!this.isShow) {
      //   this.approvalLogArrow = "left";
      // } else {
      //   this.approvalLogArrow = "right";
      // }
    },
    init() {
      this.labelPosition = this.$store.state.form.formOption.labelPosition;
      let sessionProcItem = this.$route.query || {};
      let procId = sessionProcItem.procId;
      let user = sessionStorage.getItem("user");
      let userId = user.split("[")[1].split("]");
      API.termsQueryApi({
        createUserNo: userId[0],
        procId: procId,
        term: ""
      }).then(res => {
        console.log(res, "====1");
        if (res.data.code === "0" && res.data.data) {
          res.data.data.forEach(item => {
            this.perTermsList.push(item);
          });
        }
      });
      this.commentText = "同意";
      this.$emit("input", this.$data);
    },
    /** 获取附件退回的数据 */
    getFile(file) {
      this.$data.attachment = file;
    },
    // 画面上改变优先级下拉框的值
    changeCirclationMode(val) {
      if (val === "1") {
        this.commentText = "同意";
      } else if (val === "2") {
        this.commentText = "退回,请重新修改";
      } else if (val === "3") {
        this.commentText = "作废";
      }
      this.$data.perTermsList = this.perTermsList;
      this.$emit("input", this.$data);
    },
    /** 常用词条点击事件 */
    addCommentText(val) {
      let textValue = this.$data.commentText + val.term;
      this.$data.commentText = textValue;
      this.$data.perTermsList = this.perTermsList;
      this.$emit("input", this.$data);
      this.commentText = val.term;
    },
    getCommentText() {
      this.$data.perTermsList = this.perTermsList;
      this.$emit("input", this.$data);
    },
    // 词条删除
    handleClose(tag, index) {
      let sessionProcItem = this.$route.query || {};
      let procId = sessionProcItem.procId;
      API.termsDeleteApi({
        procId: procId,
        id: tag.id
      })
        .then(res => {
          this.perTermsList.splice(index, 1);
          this.$forceUpdate();
          this.$message.success("词条删除成功");
        })
        .catch(err => {
          console.log("[ err ]", err);
        });
    },

    showInput() {
      this.inputVisible = true;
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    // 词条新增
    handleInputConfirm() {
      let inputValue = this.inputValue;
      let sessionProcItem = this.$route.query || {};
      let procId = sessionProcItem.procId;
      if (inputValue) {
        API.termsAddApi({
          procId: procId,
          term: inputValue
        })
          .then(res => {
            console.log(res, "sessionProcItem");
            let { term, termType, id } = res.data.data;
            this.perTermsList.push({
              term: term,
              termType: termType,
              id: id
            });
            this.$forceUpdate();
          })
          .catch(err => {
            console.log("[ err ]", err);
          });
      }
      this.inputVisible = false;
      this.inputValue = "";
    }
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.handleResize); // 移除resize事件监听器
  }
};
</script>
<style scoped lang="less">
.topTitle {
  padding: inherit;
  display: flex;
}
.sidebarText {
  width: 2px;
  margin-right: 5px;
  background: rgba(7, 75, 132, 1);
}

.commonTermsDiv {
  height: 187px !important;
  width: 425px !important;
  overflow: auto;
  padding: 10px 20px 0 20px;
  background: #ffffff;
  border: 1px solid #ebebeb;
  border-radius: 5px;
}

.commonTermsDivTop {
  height: 212px !important;
  width: 425px !important;
  overflow: auto;
  padding: 10px 20px 20px 20px;
  background: #ffffff;
  border: 1px solid #ebebeb;
  border-radius: 5px;
  margin-top: 20px;
  margin-left: 28px;
}

.button-new-tag {
  height: 25px;
  line-height: 23px;
  // height: 32px;
  // line-height: 30px;
  padding: 0 10px;
  border-radius: 4px;
  background-color: #efefef !important;
  border: 0px !important;
  width: 44px;
  text-align: center;
  color: #0c7bca;
  display: inline-block;
  cursor: pointer;
}
.button-new-tag:hover {
  background-color: #0c7bcaed !important;
  color: #ffffff !important;
}

.tag-color-css:hover {
  border: 1px solid #0c7bcaed;
}

.input-new-tag {
  width: 120px;
  height: 32px;
}
/deep/ .el-tag {
  margin: 0 5px 0 0 !important;
}
/deep/ .el-textarea__inner {
  min-height: 120px !important;
  // min-height: 68px !important;
  // height: 120px !important;
}
.tag-css {
  position: absolute;
  bottom: 0px;
  left: 8px;
  white-space: nowrap;
}
.arrowicon-css {
  position: absolute;
  right: -28px;
  bottom: 12px;
  font-size: 20px;
  font-weight: 700;
  cursor: pointer;
  z-index: 2;
}
.arrowicon-css:hover {
  color: #0c7bcaed;
}
/deep/.el-icon-close {
  top: 1px;
}
/deep/.el-tag__close:hover {
  color: #ffffff !important;
  top: 1px !important;
}
/deep/ .el-form {
  padding: 5.5px;
}
/deep/ [class*="el-col-"] {
  padding: 0;
}
/deep/ .el-form-item {
  margin-right: 5px;
}
/deep/ .el-tag--info {
  color: #666;
}
</style>

<template>
  <div class="cud-bg-blue">
    <div class="cud-form-detail-full">
      <div class="cud-commom-form-style">
        <div
          class="cud__scroll--div cud__detail_bg"
          v-loading.fullscreen.lock="loading"
        >
          <div class="cud-common-header-wrap">
            <span class="cud-common-title-icon"></span>
            <span class="cud-common-title-text">{{
              $t("tm.update_email_template")
            }}</span>
          </div>
          <el-form
            label-width="160px"
            label-suffix="："
            label-position="top"
            :rules="basicRules"
            ref="ruleForm"
            :model="ruleForm"
            class="cud-entity-form-wrap"
          >
            <el-card class="box-card-20" style="margin-bottom:70px">
              <div class="cud-common-header-wrap" slot="header">
                <span class="cud-common-title-icon"></span>
                <span class="cud-common-title-text">
                  {{ $t("cm.basicinfo") }}
                </span>
              </div>
              <el-row>
                <el-col :span="6">
                  <el-form-item
                    :label="$t('tm.template_code')"
                    prop="templateCode"
                  >
                    <el-input
                      :placeholder="$t('cm.pleaseEnter')"
                      :disabled="true"
                      v-model="ruleForm.templateCode"
                      size="small"
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item
                    :label="$t('tm.template_name')"
                    prop="templateName"
                  >
                    <el-input
                      maxlength="64"
                      :placeholder="$t('cm.pleaseEnter')"
                      v-model="ruleForm.templateName"
                      size="small"
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item :label="$t('tm.email_topic')" prop="emailTopic">
                    <el-input
                      maxlength="64"
                      :placeholder="$t('cm.pleaseEnter')"
                      v-model="ruleForm.emailTopic"
                      size="small"
                    ></el-input>
                  </el-form-item>
                </el-col>
                <!-- <el-col :span="6">
                  <el-form-item
                    :label="$t('tm.templateType')"
                    prop="templateType"
                  >
                    <el-select
                      v-model="ruleForm.templateType"
                      :placeholder="$t('cm.pselect')"
                      size="small"
                    >
                      <el-option
                        v-for="item in templateTypeOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col> -->
                <el-col :span="6">
                  <el-form-item
                    :label="$t('cm.is_public')"
                    prop="publicFlag"
                  >
                    <el-select
                      v-model="ruleForm.publicFlag"
                      :placeholder="$t('cm.pselect')"
                      size="small"
                    >
                      <el-option
                        :label="$t('cm.public')"
                        :value="true"
                      ></el-option>
                      <el-option
                        :label="$t('cm.private')"
                        :value="false"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item
                    :label="$t('tm.templateStatus')"
                    prop="templateStatus"
                  >
                    <el-select
                      v-model="ruleForm.templateStatus"
                      :placeholder="$t('cm.pselect')"
                      size="small"
                    >
                      <el-option
                        v-for="item in templateStatusOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
                <el-col
                  :span="24"
                  class="cud__mtb-10"
                  style="margin-right:10px"
                >
                  <el-form-item :label="$t('tm.templateContent')">
                    <tinymce-editor
                      style="margin-top:10px"
                      ref="editor"
                      v-model="editorContent"
                      :value="editorContent"
                      :menubarFlg="false"
                      :plugins="plugins"
                      :toolbar="toolbar"
                      :disabled="disabled"
                    ></tinymce-editor>
                  </el-form-item>
                </el-col>
              </el-row>
            </el-card>
            <div class="cud-examine-tool">
              <el-row
                style="position: relative; left: 95%; transform: translateX(-95%);"
              >
                <el-button size="small" @click="cancel">{{
                  $t("cm.cancel")
                }}</el-button>
                <el-button
                  size="small"
                  type="primary"
                  @click="updateEmailTemplate('ruleForm')"
                  >{{ $t("cm.save") }}</el-button
                >
              </el-row>
            </div>
          </el-form>
        </div>
        <el-dialog
          :title="$t('tm.preview_email_template')"
          v-if="showDialog"
          :visible.sync="showDialog"
          width="640px"
        >
          <el-scrollbar>
            <div class="cud__mlr-20 cud__mtb-20" v-html="editorContent"></div>
          </el-scrollbar>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script>
import email_template_edit from "./js/email_template_edit";
export default email_template_edit;
</script>

<style lang="less" scoped>
/deep/ .el-card.is-always-shadow {
  margin: 15px 22px 60px 0px;
}

// @import "src/assets/css/style";
</style>

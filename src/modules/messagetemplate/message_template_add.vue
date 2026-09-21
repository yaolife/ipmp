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
              $t("tm.new_message_template")
            }}</span>
          </div>
          <el-form
            :model="ruleForm"
            size="small"
            label-suffix="："
            label-position="top"
            :rules="basicRules"
            ref="ruleForm"
            label-width="130px"
          >
            <el-card class="box-card-20">
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
                      maxlength="32"
                      :placeholder="$t('cm.pleaseEnter')"
                      v-model="ruleForm.templateCode"
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
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item
                    :label="$t('tm.message_topic')"
                    prop="messageTopic"
                  >
                    <el-input
                      maxlength="64"
                      :placeholder="$t('cm.pleaseEnter')"
                      v-model="ruleForm.messageTopic"
                    ></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item
                    :label="$t('tm.templateType')"
                    prop="templateType"
                  >
                    <el-select
                      v-model="ruleForm.templateType"
                      :placeholder="$t('cm.pselect')"
                    >
                      <el-option
                        v-for="item in templateTypeOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      ></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
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
                <el-col :span="24" class="cud__mtb-10">
                  <!-- <el-upload
                    :headers="headersOptions"
                    ref="upload"
                    :limit="2"
                    :on-change="changeFile"
                    :show-file-list="false"
                    :file-list="fileLists"
                    :action="fileUploadUrl"
                    accept=".html"
                  >
                    <el-button size="small" type="primary">{{
                      $t("cm.import")
                    }}</el-button>
                  </el-upload> -->
                  <el-form-item :label="$t('tm.templateContent')">
                    <el-input
                      v-model="editorContent"
                      :rows="5"
                      :maxlength="500"
                      type="textarea"
                    ></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <div class="cud-examine-tool">
                <el-row
                  style="
                    position: relative;
                    left: 95%;
                    transform: translateX(-95%);
                  "
                >
                  <el-button size="small" @click="cancel">{{
                    $t("cm.return")
                  }}</el-button>
                  <el-button
                    size="small"
                    type="primary"
                    @click="addMessageTemplate('ruleForm')"
                    >{{ $t("cm.save") }}</el-button
                  >
                  <!-- <el-button type="primary" @click="previewMessageTemplate()"  >{{$t('tm.preview')}}</el-button>-->
                </el-row>
              </div>
            </el-card>
          </el-form>
        </div>
        <el-dialog
          :title="$t('tm.preview_message_template')"
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
import message_template_add from "./js/message_template_add";
export default message_template_add;
</script>

<style lang="less" scoped>
/deep/ .el-card.is-always-shadow {
  margin: 15px 22px 60px 20px;
}
// @import "src/assets/css/style";
</style>

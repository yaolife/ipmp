<!--
 * @Author: P623437
 * @Date: 2021-09-10 08:42:38
 * @LastEditors: P623437
 * @LastEditTime: 2022-01-19 14:39:08
 * @Description: 添加流程模板,增加流程配置时，需要告诉他的环节类型和环节名称，需要和PSC交互
-->
<template>
  <div class="bpmn-designer">
    <!-- 组件内容 -->
    <div v-if="bpmnDesignerConfig.show" class="example-body">
      <!-- 外接按钮 -->
      <el-button-group class="bpmn-external">
        <!-- 导出模型：导出流程模型Bmpn文件 -->
        <el-button
          v-if="externalBtns.indexOf('exportBpmnModel') >= 0"
          size="small"
          icon="el-icon-download"
          :title="$t('wm.export_temp')"
          v-loading.fullscreen.lock="fullscreenLoading"
          @click="exportBpmnModel"
        ></el-button>
        <!-- 导入模型：导入流程模型Bmpn文件 -->
        <el-upload
          :headers="headersOptions"
          v-if="externalBtns.indexOf('importBpmnModel') >= 0"
          class="el-button upload-wrapper"
          action=""
          :show-file-list="false"
          :before-upload="importBpmnModel"
          @click.native="bpmnDesignerExt.showProcDefForm = false"
        >
          <el-button
            slot="trigger"
            size="small"
            icon="el-icon-upload2"
            :title="$t('wm.import_temp')"
          ></el-button>
        </el-upload>
        <!-- 撤销/恢复：设计器操作撤销/恢复 -->
        <el-button
          v-if="externalBtns.indexOf('backBpmn') >= 0"
          size="small"
          icon="el-icon-back"
          :title="$t('cm.undo')"
          @click="backBpmn"
        ></el-button>
        <el-button
          v-if="externalBtns.indexOf('redoBpmn') >= 0"
          size="small"
          icon="el-icon-right"
          :title="$t('cm.redo')"
          @click="redoBpmn"
        ></el-button>

        <!-- 保存草稿：保存流程模型草稿 -->
        <el-button
          v-if="externalBtns.indexOf('saveProcModel') >= 0"
          size="small"
          icon="el-icon-document"
          :title="$t('wm.save_draft')"
          @click="saveProcModel"
        ></el-button>
        <!-- 发布：发布流程模型 -->
        <el-button
          v-if="
            externalBtns.indexOf('publishProcModel') >= 0 &&
              $route.query.opAct !== 'add'
          "
          size="small"
          icon="el-icon-document-checked"
          :title="$t('wm.publish')"
          @click="publishProcModel"
        ></el-button>
        <!-- 保存配置：流程模型发布后修改流程模型配置 -->
        <el-button
          v-if="externalBtns.indexOf('updateProcModelConfig') >= 0"
          size="small"
          icon="el-icon-set-up"
          :title="$t('wm.publish_config')"
          @click="updateProcModelConfig"
        ></el-button>
        <el-button v-if="externalBtns.indexOf('runTest') >= 0" size="small" icon="el-icon-tickets" :title="$t('pm.test')"
                   @click="selectTestType"></el-button>

        <!-- 配置：仅修改流程名称 -->
        <el-popover
          v-if="externalBtns.indexOf('configProcModel') >= 0"
          v-model="bpmnDesignerExt.showProcDefForm"
          placement="bottom-end"
          width="350"
          trigger="manual"
        >
          <el-form
            class="design-form"
            ref="procDefForm"
            :model="bpmnDesignerExt.procModel"
            size="small"
            label-width="140px"
          >
            <el-form-item
              :label="$t('wm.process_cn')"
              prop="procDefName"
              :rules="{
                required: true,
                message: $t('cm.tiprequired'),
                trigger: ['blur', 'change']
              }"
            >
              <el-input
                v-model="bpmnDesignerExt.procModel.procDefName"
                maxlength="50"
                class="show-word"
                show-word-limit
              ></el-input>
            </el-form-item>
            <el-form-item :label="$t('wm.process_en')" prop="procDefEnName">
              <el-input
                v-model="bpmnDesignerExt.procModel.procDefEnName"
                maxlength="50"
                class="show-word"
                show-word-limit
              ></el-input>
            </el-form-item>
          </el-form>
          <el-button
            slot="reference"
            size="small"
            icon="el-icon-set-up"
            :title="$t('wm.config')"
            @click="
              bpmnDesignerExt.showProcDefForm = !bpmnDesignerExt.showProcDefForm
            "
          ></el-button>
        </el-popover>
      </el-button-group>
      <cgn-bpmn-designer
        v-if="bpmnDesigner.accessToken"
        ref="bpmn"
        v-model="bpmnDesignerExt.procModel"
        v-bind="bpmnDesigner"
        @elementEvent="onBpmnElementEvent"
        @click.native="bpmnDesignerExt.showProcDefForm = false"
      >
      </cgn-bpmn-designer>

      <!-- 自定义设定弹窗 -->
      <designer-custom-setting
        ref="settingDialog"
        v-model="bpmnDesignerExt.procModel"
        v-bind="bpmnDesignerExt.settingDialog"
        :is-open.sync="bpmnDesignerExt.settingDialog.isOpen"
        :processTemplateData="processTemplateData"
        :get-setting-elements="getSettingElements"
        :update-element-attr="updateElementAttr"
        :update-process-config="_updateProcModelConfig"
      >
      </designer-custom-setting>

      <el-dialog :title="$t('pm.simulationTest')" :visible.sync="dialogVisible" width="600px">
        <el-form ref="simulationForm" :model="simulationForm" size="small" label-width="140px">
          <el-form-item :label="$t('pm.testType')" prop="testType" :rules="{ required: true, message: $t('cm.tiprequired'), trigger: ['change'] }">
            <el-radio-group v-model="simulationForm.testType">
              <el-radio :label="0" style="width: 100px; margin-bottom: 1px;">{{$t('pm.manualTest')}}</el-radio>
              <el-radio :label="1" style="width: 100px; margin-bottom: 1px;">{{$t('pm.autoTest')}}</el-radio>
            </el-radio-group>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button @click="dialogVisible = false">{{$t('cm.cancel')}}</el-button>
          <el-button type="primary" @click="simulationTest">{{$t('cm.confirm')}}</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>

<script>
  import wfTemplateDesign from "./js/wf_template_design.js";
  export default wfTemplateDesign;
</script>
<style lang="less">
  .bpmn-designer {
    height: 100vh;

  > .toolbar {
    padding: 10px 20px;
    text-align: right;

  .el-dropdown {
    cursor: pointer;
  }
  }

  .cgn-bpmn-designer {
    height: calc(100vh - 62px);
  }
  .example-body {
    position: relative;

  .bpmn-external {
    z-index: 1;
    position: absolute;
    right: 20px;
    top: 15px;

  .el-button {
    font-size: 18px;
    padding: 5.5px 12px;
    width: 56px;
  }
  .upload-wrapper {
    display: inline-block;
    padding: 0;
    border: none;
  }
  }
  }
  }

  .sub-process-extend-dialog {
  /** 操作按钮 **/
  .table-oprate {
  .el-button {
    padding: 0;
    font-size: 24px;
    color: rgba(96, 149, 255, 1);
  }
  .el-button:hover {
    color: rgba(96, 149, 255, 0.8);
  }
  .el-button.danger {
    color: rgba(216, 30, 6, 1);
  }
  .el-button:hover.danger {
    color: rgba(216, 30, 6, 0.8);
  }
  .el-button:disabled,
  .el-button:disabled.danger {
    color: #999999;
  }
  }
  }
  .design-form .el-form-item__error {
    top: 70% !important;
    margin-top: 2px;
  }
  .el-form-item--mini.el-form-item,
  .el-form-item--small.el-form-item {
  // margin-bottom: 10px;
  }
</style>

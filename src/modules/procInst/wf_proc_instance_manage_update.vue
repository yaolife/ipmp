<template>
  <div class="cud-bg-blue">
    <div class="cud-form-detail-full">
      <div class="cud-commom-form-style">
        <div class="cud__scroll--div cud__detail_bg">
          <div class="cud-common-header-wrap">
            <span class="cud-common-title-icon"></span>
            <span class="cud-common-title-text"
              >{{ $t("cm.update") }}{{ $t("wm.proc_instance_manage") }}</span
            >
          </div>
          <el-form
            ref="formBasicSetting"
            size="small"
            label-position="top"
            label-suffix=":"
            :rules="formBasicSettingRules"
            :model="typeof RespProcInstDto === 'string' ? {} : RespProcInstDto"
            label-width="170px"
            class="cud-entity-form-wrap"
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
                  <el-form-item :label="$t('wm.procInstId')" prop="id">
                    <el-input
                      :disabled="!isCreate"
                      :placeholder="$t('cm.pleaseEnter')"
                      maxlength="64"
                      v-model="RespProcInstDto.id"
                      class="form-input"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item
                    :label="$t('wm.parentProcInstId')"
                    prop="parentProcInstId"
                  >
                    <el-input
                      :disabled="!isCreate"
                      :placeholder="$t('cm.pleaseEnter')"
                      maxlength="64"
                      v-model="RespProcInstDto.parentProcInstId"
                      class="form-input"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item :label="$t('cm.creat_by')" prop="createUser">
                    <el-input
                      size="small"
                      ref="createUserInput"
                      @focus="showSelectUserDialog('createUserInput')"
                      v-model="createUser"
                      :maxlength="30"
                      :disabled="!isCreate"
                      @clear="clearUser('createUserInput')"
                      clearable
                      :placeholder="$t('cm.pleaseSelect')"
                    >
                      <el-button
                        size="small"
                        type="primary"
                        :disabled="!isCreate"
                        class="el-button--half"
                        slot="append"
                        icon="el-icon-plus"
                        @click="showSelectUserDialog('createUserInput')"
                      ></el-button>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item :label="$t('cm.creat_time')" prop="createTime">
                    <el-date-picker
                      :disabled="!isCreate"
                      v-model="RespProcInstDto.createTime"
                      align="right"
                      type="date"
                      :placeholder="$t('cm.pleaseEnter')"
                    />
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="6">
                  <el-form-item :label="$t('wm.start_time')" prop="startTime">
                    <el-date-picker
                      :disabled="!isCreate"
                      v-model="RespProcInstDto.startTime"
                      align="right"
                      type="date"
                      :placeholder="$t('cm.pleaseEnter')"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item :label="$t('wm.end_time')" prop="endTime">
                    <el-date-picker
                      :disabled="!isCreate"
                      v-model="RespProcInstDto.endTime"
                      align="right"
                      type="date"
                      :placeholder="$t('cm.pleaseEnter')"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item
                    :label="$t('wm.procSubject')"
                    prop="procSubject"
                  >
                    <el-input
                      :disabled="isCreate"
                      :placeholder="$t('cm.pleaseEnter')"
                      maxlength="64"
                      v-model="RespProcInstDto.procSubject"
                      class="form-input"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <el-form-item :label="$t('wm.priority')" prop="priority">
                    <template>
                      <el-select
                        v-model="RespProcInstDto.priority"
                        clearable
                        class="form-input"
                        size="small"
                        :placeholder="$t('cm.pleaseSelect')"
                      >
                        <el-option
                          v-for="item in options"
                          :key="item.value"
                          :label="item.label"
                          :value="item.value"
                        />
                      </el-select>
                    </template>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <!-- 发起人 -->
                <el-col :span="6">
                  <el-form-item :label="$t('wm.start_user')" prop="startUser">
                    <person-select
                      v-model="RespProcInstDto.startUser"
                    ></person-select>
                    <!-- <el-input
                      size="small"
                      ref="startUserInput"
                      @focus="showSelectUserDialog('startUserInput')"
                      v-model="RespProcInstDto.startUser"
                      :maxlength="30"
                      :placeholder="$t('cm.pleaseSelect')"
                    >
                      <el-button
                        size="small"
                        type="primary"
                        class="el-button--half"
                        slot="append"
                        icon="el-icon-plus"
                        @click="showSelectUserDialog('startUserInput')"
                      ></el-button>
                    </el-input> -->
                  </el-form-item>
                </el-col>
                <el-col :span="6">
                  <!--发起部门-->
                  <el-form-item :label="$t('wm.start_dept')" prop="startDept">
                    <el-input
                      size="small"
                      ref="startDeptInput"
                      @focus="showSelectUserDialog('startDeptInput')"
                      v-model="RespProcInstDto.startDept"
                      :maxlength="30"
                      :placeholder="$t('cm.pleaseSelect')"
                    >
                      <el-button
                        size="small"
                        type="primary"
                        class="el-button--half"
                        slot="append"
                        icon="el-icon-plus"
                        @click="showSelectUserDialog('startDeptInput')"
                      ></el-button>
                    </el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <div class="cud-examine-tool">
                <el-row
                  style="position: relative; left: 95%; transform: translateX(-95%);"
                >
                  <el-button size="small" @click="back">{{
                    $t("cm.cancel")
                  }}</el-button>
                  <el-button
                    size="small"
                    type="primary"
                    v-loading.fullscreen.lock="fullscreenLoading"
                    @click="update"
                    >{{ $t("cm.commit") }}
                  </el-button>
                </el-row>
              </div>
            </el-card>
          </el-form>
        </div>
      </div>
      <el-dialog
        width="60%"
        :visible.sync="showSelectUser"
        custom-class="act-creator-dialog"
        :modal="true"
        :destory-on-close="true"
        :title="$t('cm.choose') + $t(selectUserTitle)"
        :before-close="closeSelectUserDialog"
        :close-on-click-modal="false"
        v-dragMove="{
          DragButton: '.el-dialog__header',
          DragWindow: '.el-dialog'
        }"
      >
        <div class="el-dialog-div">
          <wf-comm-person-component
            v-if="showSelectUser"
            ref="selectUser"
            :showUserMultiple="isUserMultiple"
            :show-user-group-tab="false"
            :showDynRoleTab="false"
            :showStationTab="false"
            :showUserTab="showUserTab"
            :showOrgTab="showOrgTab"
            :initUserId="initUserId"
            :orgShowCheckbox="false"
          ></wf-comm-person-component>
        </div>
        <div slot="footer" class="dialog-footer" align="center">
          <el-button size="small" @click="closeSelectUserDialog">{{
            $t("cm.cancel")
          }}</el-button>
          <!-- 确定 -->
          <el-button size="small" type="primary" @click="commitSelectUser">{{
            $t("cm.confirm")
          }}</el-button>
        </div>
      </el-dialog>
    </div>
  </div>
</template>
<script>
import procInst from "./js/wf_proc_instance_manage_update.js";

export default procInst;
</script>

<style lang="less" scoped>
/deep/ .cud-commom-form-style .cud-entity-form-wrap {
  margin: 15px 0;
}
// /deep/ .orgselect .previewBtn
//  {
//   margin: 0;
//   position: absolute;
//   right: 0;
//   top: -1px !important;
//   border: none;
//   color: #999999 !important;
//   height: 32px !important;
//   background: transparent !important;
// }
.el-button--half {
  padding: 0 10px;
}
</style>

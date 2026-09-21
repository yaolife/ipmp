<!--
-->
<template>
  <div class="cud-commom-form-style">
    <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div class="cud__scroll--div workflow_task_manage">
      <el-row class="cud-common-bottom-wrap">
        <el-col :span="24">
          <el-card>
            <div class="container">
              <el-row class="cud-commom-form-search">
                <div class="search-collapse hight_search">
                  <!--普通搜索-->
                  <el-form
                    class="cud__search"
                    label-width="120px"
                    label-position="right"
                  >
                    <el-row class="cud__search--rowhigh">
                      <!--流程名称-->

                      <el-col :xs="12" :sm="12" :md="8" :lg="8">
                        <el-form-item :label="$t('flow.procName')" prop="user">
                          <wf-radio-select
                            v-model="ReqProcInstDto.procName"
                            @callback="processRadioCallback"
                          ></wf-radio-select>
                        </el-form-item>
                      </el-col>

                      <!--工作主题-->

                      <el-col :xs="12" :sm="12" :md="8" :lg="8">
                        <el-form-item :label="$t('flow.procSubject')">
                          <el-input
                            v-model="ReqProcInstDto.procSubject"
                            size="small"
                            :placeholder="$t('cm.pleaseEnter')"
                            maxlength="64"
                          ></el-input>
                        </el-form-item>
                      </el-col>
                    </el-row>

                    <el-row class="cud__search--rowhigh">
                      <!--申请公司-->
                      <el-col :xs="12" :sm="12" :md="8" :lg="8">
                        <el-form-item :label="$t('flow.apply_company')">
                          <template>
                            <el-select
                              v-model="ReqProcInstDto.apply_company"
                              clearable
                              class="form-input"
                              size="small"
                              placeholder="请选择"
                            >
                              <el-option
                                v-for="item in companys"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                              />
                            </el-select>
                          </template>
                        </el-form-item>
                      </el-col>

                      <!--费用公司-->
                      <el-col :xs="12" :sm="12" :md="8" :lg="8">
                        <el-form-item :label="$t('flow.cost_company')">
                          <template>
                            <el-select
                              v-model="ReqProcInstDto.cost_company"
                              clearable
                              class="form-input"
                              size="small"
                              placeholder="请选择"
                            >
                              <el-option
                                v-for="item in companys"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                              />
                            </el-select>
                          </template>
                        </el-form-item>
                      </el-col>
                    </el-row>

                    <el-row class="cud__search--rowhigh">
                      <!--优先级-->

                      <el-col :xs="12" :sm="12" :md="8" :lg="8">
                        <el-form-item :label="$t('flow.priority')">
                          <template>
                            <el-select
                              v-model="ReqProcInstDto.priority"
                              clearable
                              class="form-input"
                              size="small"
                              placeholder="请选择"
                            >
                              <el-option
                                v-for="item in prioritys"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                              />
                            </el-select>
                          </template>
                        </el-form-item>
                      </el-col>
                      <!--流程状态-->

                      <el-col :xs="12" :sm="12" :md="8" :lg="8">
                        <el-form-item :label="$t('flow.process_status')">
                          <template>
                            <el-select
                              v-model="ReqProcInstDto.status"
                              clearable
                              class="form-input"
                              size="small"
                              placeholder="请选择"
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

                    <el-row class="cud__search--rowhigh">
                      <!--当前任务环节-->

                      <el-col :xs="12" :sm="12" :md="8" :lg="8">
                        <el-form-item :label="$t('flow.current_task_step')">
                          <el-input
                            v-model="ReqProcInstDto.currentTaskStep"
                            size="small"
                            :placeholder="$t('cm.pleaseEnter')"
                            maxlength="64"
                          ></el-input>
                        </el-form-item>
                      </el-col>

                      <!--当前任务执行人-->

                      <el-col :xs="12" :sm="12" :md="8" :lg="8">
                        <el-form-item
                          :label="$t('flow.current_task_user')"
                          prop="user"
                        >
                          <PersonSelect
                            id="currentTaskUserId"
                            size="small"
                            :value="currentTaskUser"
                            :multiple="false"
                          />
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row class="cud__search--rowhigh">
                      <!--已处理任务环节-->

                      <el-col :xs="12" :sm="12" :md="8" :lg="8">
                        <el-form-item :label="$t('flow.deal_task_step')">
                          <el-input
                            v-model="ReqProcInstDto.dealTaskStep"
                            size="small"
                            :placeholder="$t('cm.pleaseEnter')"
                            maxlength="64"
                          ></el-input>
                        </el-form-item>
                      </el-col>

                      <!--已处理人-->

                      <el-col :xs="12" :sm="12" :md="8" :lg="8">
                        <el-form-item
                          :label="$t('flow.deal_task_user')"
                          prop="user"
                        >
                          <PersonSelect
                            id="dealTaskUserId"
                            size="small"
                            :value="dealTaskUser"
                            :multiple="false"
                          />
                        </el-form-item>
                      </el-col>
                    </el-row>

                    <el-row class="cud__search--rowhigh">
                      <!--发起时间-->

                      <el-col :xs="12" :sm="12" :md="8" :lg="8">
                        <el-form-item :label="$t('wm.start_time')">
                          <el-date-picker
                            size="small"
                            v-model="instDateStart"
                            type="datetimerange"
                            :default-time="['00:00:00', '23:59:59']"
                            unlink-panels
                            value-format="yyyy-MM-dd HH:mm:ss"
                            :range-separator="$t('wm.to')"
                            :start-placeholder="$t('wm.begin_time')"
                            :end-placeholder="$t('wm.end_time')"
                          ></el-date-picker>
                        </el-form-item>
                      </el-col>

                      <!--发起人-->

                      <el-col :xs="12" :sm="12" :md="8" :lg="8">
                        <el-form-item
                          :label="$t('flow.start_user')"
                          prop="user"
                        >
                          <PersonSelect
                            id="startUserId"
                            size="small"
                            :value="user"
                            :multiple="false"
                          />
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row class="cud__search--rowhigh">
                      <!--申请人-->
                      <el-col :xs="12" :sm="12" :md="8" :lg="8">
                        <el-form-item
                          :label="$t('flow.apply_user')"
                          prop="applyUser"
                        >
                          <PersonSelect
                            id="applyUserId"
                            size="small"
                            :value="applyUser"
                            :multiple="false"
                          />
                        </el-form-item>
                      </el-col>
                    </el-row>

                    <el-row class="cud__search--rowhigh">
                      <!--异常状态-->

                      <el-col :xs="12" :sm="12" :md="8" :lg="8">
                        <el-form-item :label="$t('flow.exception_status')">
                          <template>
                            <el-select
                              v-model="ReqProcInstDto.exception_status"
                              clearable
                              class="form-input"
                              size="small"
                              placeholder="请选择"
                            >
                              <el-option
                                v-for="item in exception_statuses"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                              />
                            </el-select>
                          </template>
                        </el-form-item>
                      </el-col>
                      <!--选择库-->

                      <el-col :xs="12" :sm="12" :md="8" :lg="8">
                        <el-form-item :label="$t('cgnTask.field.selectSource')">
                          <template>
                            <el-select
                              v-model="ReqProcInstDto.selectSource"
                              clearable
                              class="form-input"
                              size="small"
                              placeholder="请选择"
                            >
                              <el-option
                                v-for="item in selectSources"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                              />
                            </el-select>
                          </template>
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row class="cud__search--rowhigh">
                      <!--总流程时间-->

                      <el-col :xs="12" :sm="12" :md="8" :lg="8">
                        <el-form-item :label="$t('flow.total_process_time')">
                          <template>
                            <el-select
                              v-model="ReqProcInstDto.totalProcessTime"
                              clearable
                              class="form-input"
                              size="small"
                              placeholder="请选择"
                            >
                              <el-option
                                v-for="item in totalProcessTimes"
                                :key="item.value"
                                :label="item.label"
                                :value="item.value"
                              />
                            </el-select>
                          </template>
                        </el-form-item>
                      </el-col>
                      <!--流程KPI-->

                      <el-col :xs="12" :sm="12" :md="8" :lg="8">
                        <el-form-item :label="$t('flow.process_kpi')">
                          <el-input
                            v-model="ReqProcInstDto.processKpi"
                            size="small"
                            :placeholder="$t('cm.pleaseEnter')"
                            maxlength="64"
                          ></el-input>
                        </el-form-item>
                      </el-col>
                    </el-row>
                  </el-form>
                </div>
              </el-row>

              <el-row>
                <el-form
                  class="cud__search"
                  label-width="110px"
                  label-position="right"
                >
                  <el-row class="cud__search--rowhigh">
                    <el-col
                      :xs="36"
                      :sm="36"
                      :md="24"
                      :lg="24"
                      class="cud--left"
                    >
                      <el-form-item label=" ">
                        <el-button
                          class="mr-10"
                          type="primary"
                          @click="searchTaskInstList"
                          size="small"
                          >{{ $t("cm.search") }}</el-button
                        >
                        <el-button @click="resetTaskInst" size="small">{{
                          $t("cm.reset")
                        }}</el-button>
                        <el-button
                          type="primary"
                          @click="searchTaskInstList"
                          size="small"
                          >{{ $t("cm.export") }}</el-button
                        >
                        <el-button
                          type="primary"
                          @click="searchTaskInstList"
                          size="small"
                          >{{ $t("te.urge") }}</el-button
                        >
                        <el-button
                          type="primary"
                          @click="searchTaskInstList"
                          size="small"
                          >{{ $t("te.to_void") }}</el-button
                        >
                        <el-button
                          type="primary"
                          @click="searchTaskInstList"
                          size="small"
                          >{{ $t("te.jump") }}</el-button
                        >
                        <el-button
                          type="primary"
                          @click="searchTaskInstList"
                          size="small"
                          >{{ $t("te.hang") }}</el-button
                        >
                        <el-button
                          type="primary"
                          @click="searchTaskInstList"
                          size="small"
                          >{{ $t("te.un_hang") }}</el-button
                        >
                        <el-button
                          type="primary"
                          @click="searchTaskInstList"
                          size="small"
                          >{{ $t("te.diagnosis_auth_email") }}</el-button
                        >
                        <el-button
                          type="primary"
                          @click="searchTaskInstList"
                          size="small"
                          >{{ $t("te.diagnosis_auth_process") }}</el-button
                        >
                      </el-form-item>
                    </el-col>
                  </el-row>
                </el-form>
              </el-row>

              <el-row>
                <!--折叠板-->
                <el-collapse
                  class="search-collapse-content"
                  @change="advanceSearch"
                  v-model="activeName"
                  accordion
                  v-if="false"
                >
                  <el-collapse-item>
                    <template slot="title" class="search-collapse-title">
                      <span class="title-font"
                        >{{ $t("cm.advance_search") }}
                        <i class="cud3-icon-blue" :class="iconArrow"></i
                      ></span>
                    </template>
                    <!-- 高级搜索具体内容 -->
                    <!--状态-->
                    <el-form
                      class="cud__search"
                      label-width="110px"
                      label-position="right"
                    >
                      <el-row class="cud__search--rowhigh">
                        <!--流程名称-->

                        <el-col :xs="12" :sm="12" :md="8" :lg="8">
                          <el-form-item
                            :label="$t('flow.procName')"
                            prop="user"
                          >
                            <PersonSelect
                              id="startUserId"
                              size="small"
                              :value="user"
                              :multiple="false"
                            />
                          </el-form-item>
                        </el-col>

                        <!--数据模板-->
                        <el-col :xs="12" :sm="12" :md="8" :lg="8">
                          <el-form-item :label="$t('flow.data_template')">
                            <template>
                              <el-select
                                v-model="ReqProcInstDto.status"
                                clearable
                                class="form-input"
                                size="small"
                                placeholder="请选择"
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

                      <el-row class="cud__search--rowhigh">
                        <!--字段-->
                        <el-col :xs="12" :sm="12" :md="8" :lg="8">
                          <el-form-item :label="$t('flow.field')" prop="user">
                            <PersonSelect
                              id="startUserId"
                              size="small"
                              :value="user"
                              :multiple="false"
                            />
                          </el-form-item>
                        </el-col>
                      </el-row>

                      <el-row class="cud__search--rowhigh">
                        <!--发起时间-->
                        <el-col :xs="12" :sm="12" :md="8" :lg="8">
                          <el-form-item :label="$t('flow.filter_condition')">
                            <template>
                              <el-select
                                v-model="ReqProcInstDto.status"
                                clearable
                                class="form-input"
                                size="small"
                                placeholder="请选择"
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

                        <!--状态-->
                        <el-col :xs="12" :sm="12" :md="8" :lg="8">
                          <el-form-item :label="$t('flow.filter_sign')">
                            <template>
                              <el-select
                                v-model="ReqProcInstDto.status"
                                clearable
                                class="form-input"
                                size="small"
                                placeholder="请选择"
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

                      <el-row class="cud__search--rowhigh">
                        <el-col :xs="24" :sm="24" :md="16" :lg="16">
                          <el-form-item :label="$t('flow.query_rule')">
                            <el-input
                              type="textarea"
                              :rows="2"
                              placeholder="请输入内容"
                              v-model="textarea"
                            >
                            </el-input>
                          </el-form-item>
                        </el-col>
                      </el-row>

                      <el-row class="cud__search--rowhigh">
                        <el-col :xs="24" :sm="24" :md="16" :lg="16">
                          <el-form-item :label="$t('flow.show_field')">
                            <el-input
                              type="textarea"
                              :rows="2"
                              placeholder="请输入内容"
                              v-model="textarea"
                            >
                            </el-input>
                          </el-form-item>
                        </el-col>
                      </el-row>

                      <el-row class="cud__search--rowhigh">
                        <el-col :xs="6" :sm="6" :md="4" :lg="4">
                          <el-form-item>
                            <el-button size="small">保存模板</el-button>
                          </el-form-item>
                        </el-col>

                        <el-col :xs="6" :sm="6" :md="4" :lg="4">
                          <el-form-item :label="$t('flow.runing_datasource')">
                            <template>
                              <el-select
                                v-model="ReqProcInstDto.status"
                                clearable
                                class="form-input"
                                size="small"
                                placeholder="请选择"
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

                        <el-col :xs="6" :sm="6" :md="4" :lg="4">
                          <el-form-item :label="$t('cgnTask.field.dataSource')">
                            <template>
                              <el-select
                                v-model="ReqProcInstDto.status"
                                clearable
                                class="form-input"
                                size="small"
                                placeholder="请选择"
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

                        <el-col :xs="6" :sm="6" :md="4" :lg="4">
                          <el-form-item :label="$t('flow.sort_type')">
                            <template>
                              <el-radio v-model="radio" label="1">{{
                                $t("flow.sort_asc")
                              }}</el-radio>
                              <el-radio v-model="radio" label="2">{{
                                $t("flow.sort_desc")
                              }}</el-radio>
                            </template>
                          </el-form-item>
                        </el-col>
                      </el-row>

                      <el-row class="cud__search--rowhigh">
                        <el-col
                          :xs="36"
                          :sm="36"
                          :md="24"
                          :lg="24"
                          class="cud--left"
                        >
                          <el-form-item label=" ">
                            <el-button
                              class="mr-10"
                              type="primary"
                              @click="searchTaskInstList"
                              size="small"
                              >{{ $t("cm.search") }}</el-button
                            >
                            <el-button @click="resetTaskInst" size="small">{{
                              $t("cm.reset")
                            }}</el-button>
                            <el-button
                              type="primary"
                              @click="searchTaskInstList"
                              size="small"
                              >{{ $t("cm.export") }}</el-button
                            >
                            <el-button
                              type="primary"
                              @click="searchTaskInstList"
                              size="small"
                              >{{ $t("te.urge") }}</el-button
                            >
                            <el-button
                              type="primary"
                              @click="searchTaskInstList"
                              size="small"
                              >{{ $t("te.to_void") }}</el-button
                            >
                            <el-button
                              type="primary"
                              @click="searchTaskInstList"
                              size="small"
                              >{{ $t("te.jump") }}</el-button
                            >
                            <el-button
                              type="primary"
                              @click="searchTaskInstList"
                              size="small"
                              >{{ $t("te.hang") }}</el-button
                            >
                            <el-button
                              type="primary"
                              @click="searchTaskInstList"
                              size="small"
                              >{{ $t("te.un_hang") }}</el-button
                            >
                            <el-button
                              type="primary"
                              @click="searchTaskInstList"
                              size="small"
                              >{{ $t("te.diagnosis_auth_email") }}</el-button
                            >
                            <el-button
                              type="primary"
                              @click="searchTaskInstList"
                              size="small"
                              >{{ $t("te.diagnosis_auth_process") }}</el-button
                            >
                          </el-form-item>
                        </el-col>
                      </el-row>
                    </el-form>
                  </el-collapse-item>
                </el-collapse>
              </el-row>

              <!--↓表单列表-->
              <el-row class="cud__table--list">
                <el-table
                  :data="processTableData"
                  ref="processTable"
                  :max-height="maxTableHeight"
                  :empty-text="$t('cm.nodata')"
                  highlight-current-row
                  header-row-class-name="cud-office-table-header"
                  class="cud-office-table"
                  @selection-change="handleSelectionChange"
                  v-loading="listLoading"
                >
                  <!-- <el-table-column align="left" type="index" :label="$t('cm.no')" width="80"/> -->
                  <!-- 流程图 -->

                  <el-table-column type="selection" width="60">
                  </el-table-column>
                  <el-table-column
                    width="100"
                    align="center"
                    :label="$t('pw.proc_pic')"
                  >
                    <template slot-scope="scope">
                      <div
                        class="cud-table-process-pic"
                        @click="showFlow(scope.row)"
                      >
                        <span
                          class="cud3-icon-blue font_family icon-icon_workplace_flowchart"
                        ></span>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column
                    align="left"
                    prop="priority"
                    :label="$t('flow.priority')"
                  />
                  <el-table-column
                    align="left"
                    prop="procSubject"
                    :label="$t('flow.procSubject')"
                  />
                  <el-table-column
                    align="left"
                    prop="procName"
                    :label="$t('flow.procName')"
                  />
                  <el-table-column
                    align="left"
                    prop="currentTaskStep"
                    :label="$t('flow.current_task_step')"
                  />
                  <el-table-column
                    align="left"
                    prop="currentTaskUser"
                    :label="$t('flow.current_task_user')"
                  />
                  <el-table-column
                    align="left"
                    prop="residenceTime"
                    :label="$t('flow.residence_time')"
                  />
                  <el-table-column
                    align="left"
                    prop="totalProcessTime"
                    :label="$t('flow.total_process_time')"
                  />
                  <el-table-column
                    align="left"
                    width="150"
                    :label="$t('flow.start_user')"
                  >
                    <template slot-scope="scope">
                      [{{ scope.row.startUserId }}]
                      {{ scope.row.startUserName }}
                    </template>
                  </el-table-column>
                  <el-table-column
                    align="left"
                    width="180"
                    prop="createTime"
                    :label="$t('flow.create_time')"
                  />
                  <el-table-column
                    align="left"
                    :label="$t('flow.process_status')"
                    width="80"
                  >
                    <template slot-scope="scope">
                      <span v-if="scope.row.status === 0">运行中</span>
                      <span v-if="scope.row.status === 1">已挂起</span>
                      <span v-if="scope.row.status === 2">已完成</span>
                      <span v-if="scope.row.status === 3">已作废</span>
                      <span v-if="scope.row.status === 4">已终止</span>
                    </template>
                  </el-table-column>

                  <el-table-column
                    align="left"
                    :label="$t('flow.exception_status')"
                    width="80"
                  >
                    <template slot-scope="scope">
                      <span v-if="scope.row.status === 0">运行中</span>
                      <span v-if="scope.row.status === 1">已挂起</span>
                      <span v-if="scope.row.status === 2">已完成</span>
                      <span v-if="scope.row.status === 3">已作废</span>
                      <span v-if="scope.row.status === 4">已终止</span>
                    </template>
                  </el-table-column>

                  <el-table-column
                    align="left"
                    width="150"
                    :label="$t('flow.approve_user')"
                  >
                    <!--审批人 -->
                    <template slot-scope="scope">
                      [{{ scope.row.startUserId }}]
                      {{ scope.row.startUserName }}
                    </template>
                  </el-table-column>
                </el-table>
                <el-row>
                  <div class="cud-special-pagination">
                    <el-pagination popper-class="cud-pager-dropdown"
                      ref="pager"
                      class="cud__page"
                      @size-change="changeSize"
                      @current-change="changeCurrentPage"
                      :current-page.sync="tablePage.pageIndex"
                      :page-sizes="[10, 20, 30, 40]"
                      :page-size.sync="tablePage.pageSize"
                      :pager-count="5"
                      layout="total,sizes, prev, pager, next"
                      :total="tablePage.total"
                    />
                  </div>
                </el-row>
              </el-row>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <div>
      <!--弹框-作废-->
      <el-dialog
        class="add_tip"
        :title="$t('flow.abandon')"
        append-to-body
        :withHeader="false"
        :visible.sync="entityDialogVisible"
        :before-close="entityDialogHandleClose"
        width="40%"
        height="40%"
        direction="rtl"
        destroy-on-close
        :close-on-press-escape="false"
        v-dragMove="{
          DragButton: '.el-dialog__header',
          DragWindow: '.el-dialog'
        }"
      >
        <el-form label-width="110px">
          <el-row type="flex" class="cud-senior-search">
            <el-col :span="15">
              <el-form-item :label="$t('flow.abandon_reason')" prop="comment">
                <el-input
                  maxlength="50"
                  :placeholder="$t('cm.pleaseEnter')"
                  size="small"
                  class="form-input"
                  type="textarea"
                  show-word-limit
                  v-model="comment"
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row type="flex" class="cud-senior-search">
            <el-col :xs="12" :sm="12" :md="6" :lg="6" style="text-align: right">
              <el-button size="small" type="primary" @click="procInstAbandon()">{{
                $t("cm.commit")
              }}</el-button>
              <el-button size="small" @click="cancel">{{ $t("cm.cancel") }}</el-button>
            </el-col>
          </el-row>
        </el-form>
      </el-dialog>
      <el-drawer
        title=""
        append-to-body
        :withHeader="false"
        :visible.sync="configflowDialogVisible"
        size="800px"
        direction="rtl"
        destroy-on-close
        :close-on-press-escape="false"
        :wrapperClosable="false"
      >
        <div class="cud-inter-define-title">
          <span
            ><img src="@/assets/img/flowview.png" class="cud-define-pic" /><span
              class="cud-define-text"
              >{{ $t("workbench.show_flow") }}</span
            ></span
          >
          <i
            class="el-icon-close cud-interdrawer-close"
            @click="configflowDialogVisible = false"
          ></i>
        </div>
        <!-- 查看流程图模式 -->
        <cgn-bpmn-map
          ref="bpmn"
          v-bind="flowVO"
          @elementEvent="onElementEvent"
          @renderComplete="onRenderComplete"
          v-if="configflowDialogVisible"
        >
        </cgn-bpmn-map>
      </el-drawer>
    </div>
  </div>
</template>

<script>
import instance from "./js/wf_proc_instance_manage_supervise.js";
export default instance;
</script>

<style lang="less" scoped>
.workflow_template_manage .el-table .cell {
  padding: 0;
}

.el-table .el-tag {
  padding: 0;
  width: 60px;
  text-align: center;
}

.cud_tree {
  max-height: 552px;
}

.cud__table--list {
  margin-top: 0px;
}
</style>

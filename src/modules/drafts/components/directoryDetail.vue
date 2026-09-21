<template>
  <div class="directory-detail" v-loading="loading">
    <div class="detail-topbar">
      <div class="detail-crumb">
        <span>{{ $t("lang.pipe_data_manage") }}</span>
        <i class="el-icon-arrow-right crumb-sep"></i>
        <span>{{ $t("lang.pipe_database") }}</span>
        <i class="el-icon-arrow-right crumb-sep"></i>
        <span class="crumb-current">{{ $t("lang.add_edit_component") }}</span>
      </div>
      <div class="detail-top-actions">
        <span class="save-status">
          <i class="status-dot"></i>
          {{ $t("lang.pending_save") }}
        </span>
        <el-button size="small" @click="$emit('back')">{{
          $t("cm.cancel")
        }}</el-button>
        <el-button
          type="primary"
          size="small"
          :loading="saving"
          :disabled="saving || uploadingImages > 0"
          @click="onSaveClick"
          >{{ $t("cm.save") }}</el-button
        >
      </div>
    </div>

    <div class="detail-head-card">
      <div class="detail-head-left">
        <h2>{{ $t("lang.pipe_detail") }}</h2>
        <p>{{ $t("lang.pipe_detail_tip") }}</p>
      </div>
    </div>

    <div class="detail-body-card">
      <el-tabs v-model="activeTab" class="detail-tabs">
        <el-tab-pane name="basic">
          <span slot="label" class="tab-with-icon">
            <tab-svg name="file-text"></tab-svg>
            {{ $t("lang.screen_tab_basic") }}
          </span>
          <div class="section-block">
            <div class="section-title">{{ $t("lang.basic_identity") }}</div>
            <el-row :gutter="24" class="form-grid">
              <el-col
                :span="8"
                v-for="item in basicIdentityFields"
                :key="item.key"
              >
                <div class="field">
                  <label>
                    {{ $t(item.label) }}
                    <span v-if="item.required" class="req">*</span>
                  </label>
                  <el-select
                    v-if="item.type === 'select'"
                    v-model="form[item.key]"
                    size="small"
                    :clearable="!item.disabled"
                    :disabled="!!item.disabled"
                  >
                    <el-option
                      v-for="opt in getFieldOptions(item)"
                      :key="opt.key || String(opt.value)"
                      :label="opt.label"
                      :value="opt.value"
                    ></el-option>
                  </el-select>
                  <el-input
                    v-else
                    v-model="form[item.key]"
                    size="small"
                    :placeholder="item.placeholder || ''"
                    :disabled="!!item.disabled"
                  ></el-input>
                </div>
              </el-col>
            </el-row>
          </div>

          <div class="section-block">
            <div class="section-title">{{ $t("lang.location_belong") }}</div>
            <el-row :gutter="24" class="form-grid">
              <el-col
                :span="8"
                v-for="item in locationFields"
                :key="item.key"
              >
                <div class="field">
                  <label>{{ $t(item.label) }}</label>
                  <el-input
                    v-model="form[item.key]"
                    size="small"
                    :placeholder="item.placeholder || ''"
                  ></el-input>
                </div>
              </el-col>
            </el-row>
          </div>

          <div class="section-block">
            <div class="section-title">{{ $t("lang.hierarchy_locate") }}</div>
            <el-row :gutter="24" class="form-grid">
              <el-col
                :span="8"
                v-for="item in hierarchyFields"
                :key="item.key"
              >
                <div class="field">
                  <label>{{ $t(item.label) }}</label>
                  <el-input
                    v-model="form[item.key]"
                    size="small"
                    :placeholder="item.placeholder || ''"
                  ></el-input>
                </div>
              </el-col>
            </el-row>

            <div class="private-panel">
              <div class="sub-label">{{ $t("lang.private_attrs") }}</div>
              <div class="private-table-wrap">
                <el-table
                  :data="privateAttrs"
                  class="private-table"
                  size="small"
                  :empty-text="$t('cm.nodata')"
                >
                  <el-table-column
                    :label="$t('lang.attr_name')"
                    min-width="200"
                  >
                    <template slot-scope="scope">
                      <el-input
                        v-model="scope.row.name"
                        size="small"
                        placeholder="key"
                      ></el-input>
                    </template>
                  </el-table-column>
                  <el-table-column
                    :label="$t('lang.attr_value')"
                    min-width="200"
                  >
                    <template slot-scope="scope">
                      <el-input
                        v-model="scope.row.value"
                        size="small"
                        placeholder="value"
                      ></el-input>
                    </template>
                  </el-table-column>
                  <el-table-column
                    :label="$t('cm.operate')"
                    width="88"
                    align="center"
                  >
                    <template slot-scope="scope">
                      <el-button
                        type="text"
                        size="small"
                        class="delete-link"
                        @click="removePrivateAttr(scope.$index)"
                        >{{ $t("cm.delete") }}</el-button
                      >
                    </template>
                  </el-table-column>
                </el-table>
              </div>
              <el-button
                size="small"
                icon="el-icon-plus"
                class="add-attr-btn"
                @click="addPrivateAttr"
                >{{ $t("lang.add_private_attr") }}</el-button
              >

              <div class="image-panel">
                <div class="sub-label">{{ $t("lang.image_upload_path") }}</div>
                <div class="image-list">
                  <div
                    class="image-thumb is-empty"
                    v-if="!imagePreviews.length"
                  >
                    <i class="el-icon-picture-outline"></i>
                    <span>{{ $t("lang.example_image") }} 1</span>
                  </div>
                  <div
                    class="image-thumb"
                    v-for="(img, idx) in imagePreviews"
                    :key="img.id || idx"
                  >
                    <img v-if="img.url" :src="img.url" alt="" />
                    <span v-else>{{ img.name }}</span>
                    <i class="el-icon-close" @click="removeImage(idx)"></i>
                  </div>
                </div>
                <div class="image-actions">
                  <input
                    ref="imageInput"
                    type="file"
                    accept="image/*"
                    multiple
                    class="hidden-file"
                    @change="onImageFiles"
                  />
                  <div class="file-picker" @click="triggerImageInput">
                    <el-button size="small" icon="el-icon-upload2">{{
                      $t("lang.select_file")
                    }}</el-button>
                    <span class="file-hint">{{ imageFileHint }}</span>
                  </div>
                  <el-input
                    v-model="form.imagePaths"
                    size="small"
                    class="path-input"
                    :placeholder="$t('lang.image_path_placeholder')"
                  ></el-input>
                </div>
              </div>
            </div>
          </div>

          <div class="section-block">
            <div class="section-title">{{ $t("lang.remark_section") }}</div>
            <el-input
              type="textarea"
              v-model="form.remark"
              :rows="4"
              :placeholder="$t('lang.remark_placeholder')"
            ></el-input>
          </div>
        </el-tab-pane>

        <el-tab-pane name="technical">
          <span slot="label" class="tab-with-icon">
            <tab-svg name="settings-2"></tab-svg>
            {{ $t("lang.tab_tech_params") }}
          </span>
          <div class="section-block">
            <div class="section-title">{{ $t("lang.run_condition") }}</div>
            <el-row :gutter="24" class="form-grid">
              <el-col
                :span="8"
                v-for="item in technicalFields"
                :key="item.key"
              >
                <div class="field">
                  <label>{{ $t(item.label) }}</label>
                  <el-input
                    v-model="form[item.key]"
                    size="small"
                  ></el-input>
                </div>
              </el-col>
            </el-row>
          </div>
          <div class="section-block">
            <div class="section-title">{{ $t("lang.status_source") }}</div>
            <el-row :gutter="24" class="form-grid">
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.data_status") }}</label>
                  <el-select v-model="form.dataStatus" size="small">
                    <el-option
                      v-for="opt in dataStatusOptions"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    ></el-option>
                  </el-select>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.data_source") }}</label>
                  <el-select v-model="form.dataSource" size="small" clearable>
                    <el-option
                      v-for="opt in dataSourceOptions"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    ></el-option>
                  </el-select>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="field">
                  <label>{{ $t("lang.update_time") }}</label>
                  <el-input
                    :value="form.modifyDate"
                    size="small"
                    disabled
                  ></el-input>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <el-tab-pane name="lof">
          <span slot="label" class="tab-with-icon">
            <tab-svg name="database"></tab-svg>
            {{ $t("lang.tab_lof_basic") }}
          </span>
          <div
            class="section-block"
            v-for="section in lofSections"
            :key="section.title"
          >
            <div class="section-title">{{ $t(section.title) }}</div>
            <el-row :gutter="24" class="form-grid">
              <el-col
                :span="item.span || 8"
                v-for="item in section.fields"
                :key="section.title + '-' + item.key"
              >
                <div class="field">
                  <label>{{ $t(item.label) }}</label>
                  <el-select
                    v-if="item.type === 'select'"
                    v-model="form[item.key]"
                    size="small"
                    clearable
                  >
                    <el-option
                      v-for="opt in getFieldOptions(item)"
                      :key="item.key + '-' + String(opt.value)"
                      :label="opt.label"
                      :value="opt.value"
                    ></el-option>
                  </el-select>
                  <el-input
                    v-else-if="item.type === 'textarea'"
                    type="textarea"
                    :rows="3"
                    v-model="form[item.key]"
                    :placeholder="item.placeholder || ''"
                  ></el-input>
                  <el-input
                    v-else
                    v-model="form[item.key]"
                    size="small"
                    :type="item.type === 'number' ? 'number' : 'text'"
                    :placeholder="item.placeholder || ''"
                  ></el-input>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-tab-pane>

        <el-tab-pane name="related">
          <span slot="label" class="tab-with-icon">
            <tab-svg name="link"></tab-svg>
            {{ $t("lang.tab_related_segment") }}
          </span>
          <div class="section-block">
            <div class="section-title">{{ $t("lang.related_segment_list") }}</div>
            <div class="toolbar-row">
              <el-input
                v-model="segmentKeyword"
                size="small"
                clearable
                prefix-icon="el-icon-search"
                :placeholder="$t('lang.search_segment_placeholder')"
                class="toolbar-search"
              ></el-input>
              <el-select
                v-model="segmentTypeFilter"
                size="small"
                class="toolbar-select"
              >
                <el-option
                  :label="$t('lang.all_types')"
                  value=""
                ></el-option>
                <el-option
                  v-for="opt in relationTypeOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                ></el-option>
              </el-select>
              <el-button
                size="small"
                icon="el-icon-plus"
                class="ml-auto"
                @click="addSegment"
                >{{ $t("lang.add_segment") }}</el-button
              >
            </div>
            <el-table
              :data="filteredSegments"
              border
              size="small"
              :empty-text="$t('cm.nodata')"
              @selection-change="onSegmentSelectionChange"
            >
              <el-table-column type="selection" width="46"></el-table-column>
              <el-table-column
                :label="$t('lang.segment_no')"
                min-width="130"
              >
                <template slot-scope="scope">
                  <el-input v-model="scope.row.segmentNo" size="mini"></el-input>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('lang.segment_name')"
                min-width="140"
              >
                <template slot-scope="scope">
                  <el-input v-model="scope.row.segmentName" size="mini"></el-input>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('lang.segment_start')"
                min-width="120"
              >
                <template slot-scope="scope">
                  <el-input v-model="scope.row.startPoint" size="mini"></el-input>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('lang.segment_end')"
                min-width="120"
              >
                <template slot-scope="scope">
                  <el-input v-model="scope.row.endPoint" size="mini"></el-input>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('lang.relation_type')"
                min-width="120"
              >
                <template slot-scope="scope">
                  <el-select v-model="scope.row.relationType" size="mini">
                    <el-option
                      v-for="opt in relationTypeOptions"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    ></el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('lang.data_integrity')"
                min-width="110"
              >
                <template slot-scope="scope">
                  <el-select v-model="scope.row.integrity" size="mini">
                    <el-option
                      v-for="opt in integrityOptions"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    ></el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('lang.relation_status')"
                min-width="110"
              >
                <template slot-scope="scope">
                  <el-select v-model="scope.row.status" size="mini">
                    <el-option
                      v-for="opt in relationStatusOptions"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    ></el-option>
                  </el-select>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('cm.operate')"
                width="80"
                align="center"
                fixed="right"
              >
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    size="small"
                    class="cud-common-operate-delete"
                    @click="removeSegment(scope.row)"
                    >{{ $t("lang.remove_item") }}</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
            <div class="batch-bar">
              <span>{{ $t("lang.selected_count") }} {{ selectedSegments.length }}</span>
              <div>
                <el-button type="primary" size="small" @click="batchConfirmSegments">{{
                  $t("lang.batch_confirm")
                }}</el-button>
                <el-button size="small" @click="batchRemoveSegments">{{
                  $t("lang.batch_remove")
                }}</el-button>
              </div>
            </div>
            <div class="relate-hint">{{ $t("lang.relate_hint") }}</div>
          </div>
        </el-tab-pane>

        <el-tab-pane name="maintenance">
          <span slot="label" class="tab-with-icon">
            <tab-svg name="wrench"></tab-svg>
            {{ $t("lang.maintenance_records") }}
          </span>
          <div class="section-block">
            <div class="section-title">{{ $t("lang.maintenance_records") }}</div>
            <div class="stat-grid">
              <div class="mini-stat">
                <p>{{ $t("lang.maintenance_total") }}</p>
                <strong>{{ maintenanceStats.total }}</strong>
              </div>
              <div class="mini-stat">
                <p>{{ $t("lang.last_maintenance_date") }}</p>
                <strong>{{ maintenanceStats.lastDate }}</strong>
              </div>
              <div class="mini-stat">
                <p>{{ $t("lang.next_plan_maintenance") }}</p>
                <strong>{{ maintenanceStats.nextDate }}</strong>
              </div>
              <div class="mini-stat">
                <p>{{ $t("lang.abnormal_count") }}</p>
                <strong class="danger">{{ maintenanceStats.abnormal }}</strong>
              </div>
            </div>
            <div class="toolbar-row filter-row">
              <div class="field compact">
                <label>{{ $t("lang.start_date") }}</label>
                <el-date-picker
                  v-model="maintenanceQuery.startDate"
                  type="date"
                  size="small"
                  value-format="yyyy-MM-dd"
                ></el-date-picker>
              </div>
              <div class="field compact">
                <label>{{ $t("lang.end_date") }}</label>
                <el-date-picker
                  v-model="maintenanceQuery.endDate"
                  type="date"
                  size="small"
                  value-format="yyyy-MM-dd"
                ></el-date-picker>
              </div>
              <div class="field compact">
                <label>{{ $t("lang.maintenance_round") }}</label>
                <el-input
                  v-model="maintenanceQuery.round"
                  size="small"
                  :placeholder="$t('lang.round_placeholder')"
                ></el-input>
              </div>
              <div class="field compact">
                <label>{{ $t("lang.status") }}</label>
                <el-select v-model="maintenanceQuery.status" size="small">
                  <el-option :label="$t('lang.all_option')" value=""></el-option>
                  <el-option
                    v-for="opt in maintenanceStatusOptions"
                    :key="opt.value"
                    :label="opt.label"
                    :value="opt.value"
                  ></el-option>
                </el-select>
              </div>
              <div class="filter-actions">
                <el-button type="primary" size="small" @click="applyMaintenanceFilter">{{
                  $t("cm.query")
                }}</el-button>
                <el-button size="small" @click="resetMaintenanceFilter">{{
                  $t("cm.reset")
                }}</el-button>
              </div>
            </div>
            <el-table
              :data="filteredMaintenance"
              border
              size="small"
              :empty-text="$t('cm.nodata')"
            >
              <el-table-column type="selection" width="46"></el-table-column>
              <el-table-column
                :label="$t('lang.maintenance_date')"
                prop="date"
                min-width="110"
              ></el-table-column>
              <el-table-column
                :label="$t('lang.maintenance_round')"
                prop="round"
                min-width="100"
              ></el-table-column>
              <el-table-column
                :label="$t('lang.inspect_content')"
                prop="content"
                min-width="140"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :label="$t('lang.inspect_items')"
                prop="items"
                min-width="120"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :label="$t('lang.inspect_method')"
                prop="method"
                min-width="110"
              ></el-table-column>
              <el-table-column
                :label="$t('lang.defect_desc')"
                prop="defect"
                min-width="120"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :label="$t('lang.handle_status')"
                prop="handleStatus"
                min-width="110"
              ></el-table-column>
              <el-table-column
                :label="$t('lang.reinspect_after')"
                prop="reinspect"
                min-width="120"
                show-overflow-tooltip
              ></el-table-column>
              <el-table-column
                :label="$t('lang.report_no')"
                prop="reportNo"
                min-width="120"
              ></el-table-column>
              <el-table-column
                :label="$t('lang.measured_load')"
                prop="measuredLoad"
                min-width="120"
              ></el-table-column>
              <el-table-column
                :label="$t('lang.measured_scale')"
                prop="measuredScale"
                min-width="120"
              ></el-table-column>
              <el-table-column
                :label="$t('lang.status')"
                min-width="90"
              >
                <template slot-scope="scope">
                  <span :class="['status-tag', statusClass(scope.row.status)]">{{
                    scope.row.status || "/"
                  }}</span>
                </template>
              </el-table-column>
              <el-table-column
                :label="$t('lang.maintenance_unit')"
                prop="unit"
                min-width="110"
              ></el-table-column>
              <el-table-column
                :label="$t('lang.sign_name')"
                prop="sign"
                min-width="80"
              ></el-table-column>
              <el-table-column
                :label="$t('cm.operate')"
                width="120"
                align="center"
                fixed="right"
              >
                <template slot-scope="scope">
                  <el-button
                    type="text"
                    size="small"
                    class="cud-common-operate-edit"
                    @click="editMaintenance(scope.row)"
                    >{{ $t("cm.edit") }}</el-button
                  >
                  <el-button
                    type="text"
                    size="small"
                    class="cud-common-operate-delete"
                    @click="removeMaintenance(scope.row)"
                    >{{ $t("cm.delete") }}</el-button
                  >
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="section-block">
            <div class="section-title">{{ $t("lang.add_maintenance") }}</div>
            <el-row :gutter="24" class="form-grid">
              <el-col :span="6">
                <div class="field">
                  <label>{{ $t("lang.maintenance_date") }}</label>
                  <el-date-picker
                    v-model="maintenanceForm.date"
                    type="date"
                    size="small"
                    value-format="yyyy-MM-dd"
                  ></el-date-picker>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="field">
                  <label>{{ $t("lang.maintenance_round") }}</label>
                  <el-input v-model="maintenanceForm.round" size="small"></el-input>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="field">
                  <label>{{ $t("lang.report_no") }}</label>
                  <el-input v-model="maintenanceForm.reportNo" size="small"></el-input>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="field">
                  <label>{{ $t("lang.status") }}</label>
                  <el-select v-model="maintenanceForm.status" size="small">
                    <el-option
                      v-for="opt in maintenanceStatusOptions"
                      :key="opt.value"
                      :label="opt.label"
                      :value="opt.value"
                    ></el-option>
                  </el-select>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="field">
                  <label>{{ $t("lang.inspect_items_multi") }}</label>
                  <el-checkbox-group
                    v-model="maintenanceForm.itemList"
                    class="check-group"
                  >
                    <el-checkbox
                      v-for="opt in inspectItemOptions"
                      :key="opt"
                      :label="opt"
                      >{{ opt }}</el-checkbox
                    >
                  </el-checkbox-group>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="field">
                  <label>{{ $t("lang.inspect_method") }}</label>
                  <el-select v-model="maintenanceForm.method" size="small" clearable>
                    <el-option
                      v-for="opt in inspectMethodOptions"
                      :key="opt"
                      :label="opt"
                      :value="opt"
                    ></el-option>
                  </el-select>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="field">
                  <label>{{ $t("lang.handle_status") }}</label>
                  <el-select v-model="maintenanceForm.handleStatus" size="small">
                    <el-option
                      v-for="opt in handleStatusOptions"
                      :key="opt"
                      :label="opt"
                      :value="opt"
                    ></el-option>
                  </el-select>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="field">
                  <label>{{ $t("lang.defect_desc") }}</label>
                  <el-input
                    v-model="maintenanceForm.defect"
                    size="small"
                    :placeholder="$t('lang.defect_placeholder')"
                  ></el-input>
                </div>
              </el-col>
              <el-col :span="12">
                <div class="field">
                  <label>{{ $t("lang.reinspect_after") }}</label>
                  <el-input
                    v-model="maintenanceForm.reinspect"
                    size="small"
                    :placeholder="$t('lang.reinspect_placeholder')"
                  ></el-input>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="field">
                  <label>{{ $t("lang.measured_load") }}</label>
                  <el-input v-model="maintenanceForm.measuredLoad" size="small"></el-input>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="field">
                  <label>{{ $t("lang.measured_scale") }}</label>
                  <el-input v-model="maintenanceForm.measuredScale" size="small"></el-input>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="field">
                  <label>{{ $t("lang.maintenance_unit") }}</label>
                  <el-input v-model="maintenanceForm.unit" size="small"></el-input>
                </div>
              </el-col>
              <el-col :span="6">
                <div class="field">
                  <label>{{ $t("lang.sign_name") }}</label>
                  <el-input v-model="maintenanceForm.sign" size="small"></el-input>
                </div>
              </el-col>
              <el-col :span="24">
                <div class="field">
                  <label>{{ $t("lang.inspect_content") }}</label>
                  <el-input
                    type="textarea"
                    :rows="3"
                    v-model="maintenanceForm.content"
                    :placeholder="$t('lang.inspect_content_placeholder')"
                  ></el-input>
                </div>
              </el-col>
            </el-row>
            <div class="form-actions">
              <el-button type="primary" size="small" @click="saveMaintenance">{{
                $t("lang.save_record")
              }}</el-button>
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<script>
import api from "../api";
import { debounce } from "@/utils/funcUtil";
import {
  getComponentTypeItem,
  getComponentTypeOptions
} from "@/constant/componentType";

const TAB_ICONS = {
  "file-text":
    '<path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/>',
  "settings-2":
    '<path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/>',
  database:
    '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
  link:
    '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
  wrench:
    '<path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>'
};

const TabSvg = {
  name: "TabSvg",
  props: {
    name: {
      type: String,
      required: true
    }
  },
  render(h) {
    return h("svg", {
      class: "tab-svg",
      attrs: {
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        "stroke-width": "2",
        "stroke-linecap": "round",
        "stroke-linejoin": "round"
      },
      domProps: {
        innerHTML: TAB_ICONS[this.name] || ""
      }
    });
  }
};

function emptyForm() {
  return {
    nodeName: "",
    specCode: "",
    pipelineName: "",
    componentType: "",
    name: "",
    kksCode: "",
    pipeStandardKks: "",
    unitName: "",
    systemNo: "",
    safetyArea: "",
    roomNo: "",
    islandType: "",
    responsiblePerson: "",
    pipelineNo: "",
    flowCoord: "",
    flowDrawingNo: "",
    isoCode: "",
    installDrawingNo: "",
    installInnerCode: "",
    parentSystemNo: "",
    systemCode: "",
    levelNo: "",
    systemName: "",
    parentLocationNo: "",
    locationNo: "",
    locationDepth: "",
    locationName: "",
    deviceNo: "",
    orientation: "",
    plantUnit: "",
    processName: "",
    drawingNo: "",
    remark: "",
    imagePaths: "",
    startPoint: "",
    endPoint: "",
    operatingPressure: "",
    operatingTemperature: "",
    designPressure: "",
    designTemperature: "",
    nominalDiameter: "",
    outerDiameter: "",
    wallThickness: "",
    material: "",
    centerElevation: "",
    workingMedium: "",
    flowVelocity: "",
    maxVelocity: "",
    thermalDisplacement: "",
    dataStatus: "已发布",
    dataSource: "",
    modifyDate: "",
    fluidDensity: "",
    isChokedFlow: "",
    hasSlugFlow: "",
    equipmentType: "",
    spanReference: "",
    lofRemark: "",
    mediumType: "",
    materialGrade: "",
    elasticModulus: "",
    poissonRatio: "",
    materialDensity: "",
    yieldStrength: "",
    fatigueLimit: "",
    naturalFrequencyParams: "",
    annualUnplannedStops: "",
    annualStartStops: "",
    annualFastValveActions: "",
    periodicOperation: "",
    c1Level: "",
    c2Level: "",
    c3Level: "",
    c4Level: "",
    hasThrottlingElement: "",
    hasReciprocatingEquipment: "",
    hasCentrifugalEquipment: "",
    lowFlowRatio: "",
    fastActingValveType: "",
    hasFlashingCavitation: "",
    hasThermowellProbe: "",
    hasDeadBranch: "",
    vibrationFailureHistory: "",
    manufacturingStandard: "",
    weldCode: "",
    weldType: "",
    weldCategory: "",
    stressConcentrationFactor: "",
    fatigueLevel: "",
    visualDefectStandard: ""
  };
}

function emptyMaintenance() {
  return {
    id: "",
    date: "",
    round: "",
    reportNo: "",
    status: "正常",
    itemList: [],
    items: "",
    method: "",
    handleStatus: "无需处理",
    defect: "",
    reinspect: "",
    measuredLoad: "",
    measuredScale: "",
    unit: "",
    sign: "",
    content: ""
  };
}

let rowSeed = 1;
function nextId() {
  rowSeed += 1;
  return "row-" + Date.now() + "-" + rowSeed;
}

export default {
  name: "DirectoryDetail",
  components: {
    TabSvg
  },
  props: {
    directoryId: {
      type: [String, Number],
      default: ""
    }
  },
  data() {
    return {
      loading: false,
      saving: false,
      uploadingImages: 0,
      activeTab: "basic",
      detail: {},
      form: emptyForm(),
      privateAttrs: [{ name: "", value: "" }],
      imagePreviews: [],
      relatedSegments: [],
      selectedSegments: [],
      segmentKeyword: "",
      segmentTypeFilter: "",
      maintenanceRecords: [],
      maintenanceFilter: {
        startDate: "",
        endDate: "",
        round: "",
        status: ""
      },
      maintenanceQuery: {
        startDate: "",
        endDate: "",
        round: "",
        status: ""
      },
      maintenanceForm: emptyMaintenance(),
      basicIdentityFields: [
        { key: "nodeName", label: "lang.component_no", disabled: true },
        { key: "pipelineName", label: "lang.component_name", required: true },
        {
          key: "componentType",
          label: "lang.component_type",
          type: "select",
          disabled: true
        },
        { key: "pipeStandardKks", label: "lang.kks_code" },
        { key: "specCode", label: "lang.spec_code" },
        { key: "unitName", label: "lang.belong_unit", required: true },
        { key: "systemNo", label: "lang.system_no" },
        { key: "safetyArea", label: "lang.safety_area" },
        { key: "roomNo", label: "lang.room_no" },
        { key: "islandType", label: "lang.island_type", type: "select" },
        { key: "responsiblePerson", label: "lang.pipe_owner" }
      ],
      locationFields: [
        { key: "pipelineNo", label: "lang.pipeline_on_line" },
        { key: "startPoint", label: "lang.pipeline_start" },
        { key: "endPoint", label: "lang.pipeline_end" },
        { key: "flowCoord", label: "lang.flow_coord" },
        { key: "flowDrawingNo", label: "lang.flow_drawing_no" },
        { key: "isoCode", label: "lang.iso_drawing_no" },
        { key: "installDrawingNo", label: "lang.install_drawing_no" },
        { key: "installInnerCode", label: "lang.install_inner_code" }
      ],
      hierarchyFields: [
        {
          key: "parentSystemNo",
          label: "lang.parent_system_no",
          placeholder: "如 6VVP"
        },
        { key: "systemCode", label: "lang.system_no", placeholder: "如 VVP" },
        {
          key: "levelNo",
          label: "lang.system_depth",
          placeholder: "层级深度"
        },
        {
          key: "systemName",
          label: "lang.system_name_label",
          placeholder: "如 主蒸汽系统"
        },
        { key: "parentLocationNo", label: "lang.parent_location_no" },
        { key: "locationNo", label: "lang.location_no" },
        { key: "locationDepth", label: "lang.location_depth" },
        { key: "locationName", label: "lang.location_name" },
        { key: "deviceNo", label: "lang.device_no" },
        { key: "orientation", label: "lang.orientation", placeholder: "如 N/E/S/W" },
        { key: "plantUnit", label: "lang.plant_unit" },
        { key: "processName", label: "lang.process_name" },
        { key: "drawingNo", label: "lang.drawing_no" }
      ],
      technicalFields: [
        { key: "operatingPressure", label: "lang.work_pressure" },
        { key: "operatingTemperature", label: "lang.work_temperature" },
        { key: "designPressure", label: "lang.design_pressure_mpa" },
        { key: "designTemperature", label: "lang.design_temperature_c" },
        { key: "nominalDiameter", label: "lang.pipe_nominal_inch" },
        { key: "outerDiameter", label: "lang.pipe_outer_diameter_mm" },
        { key: "wallThickness", label: "lang.pipe_wall_thickness_mm" },
        { key: "material", label: "lang.pipe_material" },
        { key: "centerElevation", label: "lang.pipe_center_elevation" },
        { key: "workingMedium", label: "lang.fluid_medium" },
        { key: "maxVelocity", label: "lang.flow_velocity" },
        { key: "thermalDisplacement", label: "lang.thermal_displacement" }
      ],
      lofSections: [
        {
          title: "lang.lof_pipe_params",
          fields: [
            {
              key: "pipeStandardKks",
              label: "lang.pipe_standard_kks",
              placeholder: "如 P-273-12.5-316LN"
            },
            { key: "outerDiameter", label: "lang.pipe_outer_diameter_mm", type: "number" },
            { key: "wallThickness", label: "lang.pipe_wall_thickness_mm", type: "number" },
            { key: "material", label: "lang.standard_material", placeholder: "如 316LN / 碳钢" },
            { key: "designTemperature", label: "lang.design_temperature_c", type: "number" },
            { key: "designPressure", label: "lang.design_pressure_mpa", type: "number" },
            { key: "mediumType", label: "lang.medium_type", type: "select", options: "mediumType" },
            { key: "fluidDensity", label: "lang.fluid_density", type: "number" },
            { key: "equipmentType", label: "lang.equipment_type", placeholder: "如 主蒸汽隔离阀 / 给水泵" },
            { key: "spanReference", label: "lang.span_reference", type: "number" }
          ]
        },
        {
          title: "lang.lof_material_info",
          fields: [
            { key: "materialGrade", label: "lang.material_grade", placeholder: "如 316LN" },
            { key: "elasticModulus", label: "lang.elastic_modulus", type: "number" },
            { key: "poissonRatio", label: "lang.poisson_ratio", type: "number" },
            { key: "materialDensity", label: "lang.material_density", type: "number" },
            { key: "yieldStrength", label: "lang.yield_strength", type: "number" },
            { key: "fatigueLimit", label: "lang.fatigue_limit", type: "number" },
            {
              key: "naturalFrequencyParams",
              label: "lang.natural_frequency_params",
              placeholder: "如 C1=1.0, C2=0.85",
              span: 16
            }
          ]
        },
        {
          title: "lang.lof_operate_condition",
          fields: [
            { key: "annualUnplannedStops", label: "lang.annual_unplanned_stops", type: "number" },
            { key: "annualStartStops", label: "lang.annual_start_stops", type: "number" },
            { key: "annualFastValveActions", label: "lang.annual_fast_valve_actions", type: "number" },
            { key: "periodicOperation", label: "lang.periodic_operation", placeholder: "如 频繁间歇 / 长期稳态" },
            { key: "c1Level", label: "lang.c1_level", type: "select", options: "level" },
            { key: "c2Level", label: "lang.c2_level", type: "select", options: "level" },
            { key: "c3Level", label: "lang.c3_level", type: "select", options: "level" },
            { key: "c4Level", label: "lang.c4_level", type: "select", options: "level" }
          ]
        },
        {
          title: "lang.lof_incentive_flags",
          fields: [
            { key: "maxVelocity", label: "lang.max_velocity", type: "number", span: 6 },
            { key: "hasThrottlingElement", label: "lang.has_throttling", type: "select", options: "yesNo", span: 6 },
            { key: "isChokedFlow", label: "lang.is_choked_flow", type: "select", options: "yesNo", span: 6 },
            { key: "hasReciprocatingEquipment", label: "lang.has_reciprocating", type: "select", options: "yesNo", span: 6 },
            { key: "hasCentrifugalEquipment", label: "lang.has_centrifugal", type: "select", options: "yesNo", span: 6 },
            { key: "lowFlowRatio", label: "lang.low_flow_ratio", type: "number", span: 6 },
            { key: "fastActingValveType", label: "lang.fast_acting_valve", type: "select", options: "fastValve", span: 6 },
            { key: "hasFlashingCavitation", label: "lang.has_flashing_cavitation", type: "select", options: "yesNo", span: 6 },
            { key: "hasThermowellProbe", label: "lang.has_thermowell_probe", type: "select", options: "yesNo", span: 6 },
            { key: "hasDeadBranch", label: "lang.has_dead_branch", type: "select", options: "yesNo", span: 6 },
            { key: "hasSlugFlow", label: "lang.has_slug_flow", type: "select", options: "yesNo", span: 6 },
            { key: "vibrationFailureHistory", label: "lang.vibration_failure_history", type: "select", options: "vibration", span: 6 }
          ]
        },
        {
          title: "lang.lof_weld_info",
          fields: [
            { key: "manufacturingStandard", label: "lang.manufacturing_standard" },
            { key: "weldCode", label: "lang.weld_code" },
            { key: "weldType", label: "lang.weld_type" },
            { key: "weldCategory", label: "lang.weld_category" },
            { key: "stressConcentrationFactor", label: "lang.stress_concentration_factor", type: "number" },
            { key: "fatigueLevel", label: "lang.fatigue_level" },
            { key: "visualDefectStandard", label: "lang.visual_defect_standard" },
            { key: "lofRemark", label: "lang.lof_remark", type: "textarea", span: 24 }
          ]
        }
      ]
    };
  },
  computed: {
    islandOptions() {
      return [
        { label: this.$t("lang.conventional_island"), value: "常规岛" },
        { label: this.$t("lang.nuclear_island"), value: "核岛" }
      ];
    },
    yesNoOptions() {
      return [
        { label: this.$t("lang.option_no"), value: 0 },
        { label: this.$t("lang.option_yes"), value: 1 }
      ];
    },
    levelOptions() {
      return [
        { label: this.$t("lang.level_low"), value: 0 },
        { label: this.$t("lang.level_medium"), value: 1 },
        { label: this.$t("lang.level_high"), value: 2 }
      ];
    },
    mediumTypeOptions() {
      return [
        { label: this.$t("lang.medium_steam"), value: 0 },
        { label: this.$t("lang.medium_water"), value: 1 },
        { label: this.$t("lang.medium_two_phase"), value: 2 },
        { label: this.$t("lang.medium_multi_phase"), value: 3 }
      ];
    },
    fastValveOptions() {
      return [
        { label: this.$t("lang.valve_none"), value: 0 },
        { label: this.$t("lang.valve_esd"), value: 1 },
        { label: this.$t("lang.valve_safety"), value: 2 }
      ];
    },
    vibrationOptions() {
      return [
        { label: this.$t("lang.vib_none"), value: 0 },
        { label: this.$t("lang.vib_slight"), value: 1 },
        { label: this.$t("lang.vib_severe"), value: 2 }
      ];
    },
    componentTypeOptions() {
      return getComponentTypeOptions(this.$t.bind(this));
    },
    dataStatusOptions() {
      return [
        { label: this.$t("lang.status_draft"), value: "草稿" },
        { label: this.$t("lang.status_published"), value: "已发布" },
        { label: this.$t("lang.status_pending"), value: "待审核" },
        { label: this.$t("lang.status_disabled"), value: "已停用" }
      ];
    },
    dataSourceOptions() {
      return [
        { label: this.$t("lang.source_3d"), value: "三维模型导入" },
        { label: this.$t("lang.source_base"), value: "基础库同步" },
        { label: this.$t("lang.source_manual"), value: "手动录入" }
      ];
    },
    relationTypeOptions() {
      return [
        { label: this.$t("lang.relation_install"), value: "安装位置" },
        { label: this.$t("lang.relation_medium"), value: "介质连通" },
        { label: this.$t("lang.relation_support"), value: "支撑关联" },
        { label: this.$t("lang.relation_measure"), value: "测量关联" }
      ];
    },
    integrityOptions() {
      return [
        { label: this.$t("lang.integrity_complete"), value: "完整" },
        { label: this.$t("lang.integrity_pending"), value: "待补" },
        { label: this.$t("lang.integrity_missing"), value: "缺失" }
      ];
    },
    relationStatusOptions() {
      return [
        { label: this.$t("lang.status_confirmed"), value: "已确认" },
        { label: this.$t("lang.status_unconfirmed"), value: "待确认" }
      ];
    },
    maintenanceStatusOptions() {
      return [
        { label: this.$t("lang.pipe_status_normal"), value: "正常" },
        { label: this.$t("lang.status_abnormal"), value: "异常" },
        { label: this.$t("lang.status_to_confirm"), value: "待确认" }
      ];
    },
    inspectItemOptions() {
      return ["超声", "硬度", "金相", "表面", "测厚", "其他"];
    },
    inspectMethodOptions() {
      return ["UT", "RT", "PT", "MT", "TOFD", "相控阵", "硬度", "金相", "测厚"];
    },
    handleStatusOptions() {
      return ["无需处理", "返修", "更换", "监控运行"];
    },
    imageFileHint() {
      if (!this.imagePreviews.length) {
        return this.$t("lang.no_file_chosen");
      }
      if (this.imagePreviews.length === 1) {
        return this.imagePreviews[0].name;
      }
      return this.imagePreviews.length + this.$t("lang.files_selected");
    },
    filteredSegments() {
      const keyword = (this.segmentKeyword || "").trim().toLowerCase();
      const type = this.segmentTypeFilter;
      return this.relatedSegments.filter(item => {
        const matchType = !type || item.relationType === type;
        if (!keyword) return matchType;
        const text = [item.segmentNo, item.segmentName].join(" ").toLowerCase();
        return matchType && text.indexOf(keyword) !== -1;
      });
    },
    filteredMaintenance() {
      const query = this.maintenanceFilter;
      return this.maintenanceRecords.filter(item => {
        if (query.startDate && item.date && item.date < query.startDate) {
          return false;
        }
        if (query.endDate && item.date && item.date > query.endDate) {
          return false;
        }
        if (
          query.round &&
          (item.round || "").toLowerCase().indexOf(query.round.toLowerCase()) === -1
        ) {
          return false;
        }
        if (query.status && item.status !== query.status) return false;
        return true;
      });
    },
    maintenanceStats() {
      const list = this.maintenanceRecords;
      const dates = list.map(item => item.date).filter(Boolean).sort();
      return {
        total: list.length,
        lastDate: dates.length ? dates[dates.length - 1] : "/",
        nextDate: "/",
        abnormal: list.filter(item => item.status === "异常").length
      };
    }
  },
  created() {
    this._debouncedSave = debounce(this.saveDetail, 400);
  },
  watch: {
    directoryId: {
      immediate: true,
      handler(val) {
        if (val) this.loadDetail();
      }
    }
  },
  methods: {
    isSuccessCode(code) {
      return code === 0 || code === "0";
    },
    getFieldOptions(item) {
      if (item.key === "islandType") return this.islandOptions;
      if (item.key === "componentType") return this.componentTypeOptions;
      if (item.options === "yesNo") return this.yesNoOptions;
      if (item.options === "level") return this.levelOptions;
      if (item.options === "mediumType") return this.mediumTypeOptions;
      if (item.options === "fastValve") return this.fastValveOptions;
      if (item.options === "vibration") return this.vibrationOptions;
      return [];
    },
    normalizeText(val) {
      if (val === 0) return 0;
      if (val === null || val === undefined) return "";
      return val;
    },
    fillForm(detail) {
      const form = emptyForm();
      Object.keys(form).forEach(key => {
        if (detail[key] !== undefined && detail[key] !== null) {
          form[key] = this.normalizeText(detail[key]);
        }
      });
      if (!form.pipelineName) form.pipelineName = detail.pipelineName || "";
      if (!form.nodeName) form.nodeName = detail.nodeName || "";
      if (!form.specCode) form.specCode = detail.specCode || "";
      if (!form.systemCode) form.systemCode = detail.systemNo || "";
      if (!form.pipeStandardKks) {
        form.pipeStandardKks = detail.pipeStandardKks || detail.kksCode || "";
      }
      if (form.maxVelocity === "" || form.maxVelocity == null) {
        form.maxVelocity = this.normalizeText(
          detail.maxVelocity != null ? detail.maxVelocity : detail.flowVelocity
        );
      }
      if (form.flowVelocity === "" || form.flowVelocity == null) {
        form.flowVelocity = form.maxVelocity;
      }
      const typeItem = getComponentTypeItem(detail.componentType);
      form.componentType = typeItem ? typeItem.code : "";
      this.form = form;
    },
    normalizeAttrs(list) {
      if (Array.isArray(list) && list.length) {
        return list.map(item => ({
          name: item.name || item.key || "",
          value: item.value == null ? "" : item.value
        }));
      }
      return [{ name: "", value: "" }];
    },
    resolveAttachmentUrl(item) {
      if (!item) return "";
      return item.absoluteFileUrl || item.fileUrl || item.filePath || "";
    },
    normalizeAttachments(list) {
      if (!Array.isArray(list)) return [];
      return list
        .filter(item => item && (item.id || this.resolveAttachmentUrl(item)))
        .map(item => ({
          id: item.id || "",
          name: item.originalName || item.name || "",
          url: this.resolveAttachmentUrl(item),
          uploading: false
        }));
    },
    normalizeSegments(list) {
      if (!Array.isArray(list)) return [];
      return list.map(item => ({
        id: item.id || nextId(),
        segmentNo: item.segmentNo || item.pipelineNo || "",
        segmentName: item.segmentName || item.pipelineName || item.name || "",
        startPoint: item.startPoint || "",
        endPoint: item.endPoint || "",
        relationType: item.relationType || "安装位置",
        integrity: item.integrity || "完整",
        status: item.status || "待确认"
      }));
    },
    normalizeMaintenance(list) {
      if (!Array.isArray(list)) return [];
      return list.map(item => ({
        id: item.id || nextId(),
        date: item.date || item.maintainDate || "",
        round: item.round || "",
        content: item.content || "",
        items: item.items || "",
        method: item.method || "",
        defect: item.defect || "",
        handleStatus: item.handleStatus || "",
        reinspect: item.reinspect || "",
        reportNo: item.reportNo || "",
        measuredLoad: item.measuredLoad || "",
        measuredScale: item.measuredScale || "",
        status: item.status || "正常",
        unit: item.unit || "",
        sign: item.sign || ""
      }));
    },
    resetLocalState() {
      this.form = emptyForm();
      this.privateAttrs = [{ name: "", value: "" }];
      this.imagePreviews = [];
      this.uploadingImages = 0;
      this.relatedSegments = [];
      this.selectedSegments = [];
      this.segmentKeyword = "";
      this.segmentTypeFilter = "";
      this.maintenanceRecords = [];
      this.maintenanceForm = emptyMaintenance();
      this.resetMaintenanceFilter();
    },
    loadDetail() {
      if (!this.directoryId) return;
      this.loading = true;
      this.activeTab = "basic";
      this.resetLocalState();
      api
        .getResourceDirectoryDetail(this.directoryId)
        .then(res => {
          this.loading = false;
          if (this.isSuccessCode(res && res.code)) {
            this.detail = res.data || {};
            this.fillForm(this.detail);
            this.privateAttrs = this.normalizeAttrs(
              this.detail.privateAttributes || this.detail.privateAttrs
            );
            this.imagePreviews = this.normalizeAttachments(
              this.detail.attachments
            );
            this.relatedSegments = this.normalizeSegments(
              this.detail.relatedSegments
            );
            this.maintenanceRecords = this.normalizeMaintenance(
              this.detail.maintenanceRecords
            );
            if (this.detail.imagePaths) {
              this.form.imagePaths = this.detail.imagePaths;
            }
          } else {
            this.detail = {};
            this.resetLocalState();
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
        })
        .catch(() => {
          this.loading = false;
          this.detail = {};
          this.resetLocalState();
        });
    },
    triggerImageInput() {
      this.$refs.imageInput && this.$refs.imageInput.click();
    },
    addPrivateAttr() {
      this.privateAttrs.push({ name: "", value: "" });
    },
    removePrivateAttr(index) {
      this.privateAttrs.splice(index, 1);
      if (!this.privateAttrs.length) {
        this.privateAttrs.push({ name: "", value: "" });
      }
    },
    onImageFiles(event) {
      const files = event.target.files || [];
      const list = [];
      for (let i = 0; i < files.length; i++) {
        list.push(files[i]);
      }
      event.target.value = "";
      list.forEach(file => this.uploadImageFile(file));
    },
    uploadImageFile(file) {
      const tempId = nextId();
      const localUrl = window.URL.createObjectURL(file);
      this.imagePreviews.push({
        id: tempId,
        name: file.name,
        url: localUrl,
        uploading: true
      });
      this.uploadingImages += 1;
      const formData = new FormData();
      formData.append("file", file);
      formData.append("directory", "common");
      api
        .uploadSysFile(formData)
        .then(res => {
          this.uploadingImages = Math.max(0, this.uploadingImages - 1);
          const idx = this.imagePreviews.findIndex(item => item.id === tempId);
          if (idx < 0) {
            if (localUrl) window.URL.revokeObjectURL(localUrl);
            return;
          }
          if (!this.isSuccessCode(res && res.code) || !res.data) {
            this.imagePreviews.splice(idx, 1);
            if (localUrl) window.URL.revokeObjectURL(localUrl);
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
            return;
          }
          const data = res.data || {};
          const remoteUrl = this.resolveAttachmentUrl(data);
          this.$set(this.imagePreviews, idx, {
            id: data.id || "",
            name: data.originalName || file.name,
            url: remoteUrl || localUrl,
            uploading: false
          });
          if (remoteUrl && localUrl) {
            window.URL.revokeObjectURL(localUrl);
          }
        })
        .catch(err => {
          this.uploadingImages = Math.max(0, this.uploadingImages - 1);
          const idx = this.imagePreviews.findIndex(item => item.id === tempId);
          if (idx >= 0) this.imagePreviews.splice(idx, 1);
          if (localUrl) window.URL.revokeObjectURL(localUrl);
          this.$message.error((err && err.msg) || this.$t("cm.fail"));
        });
    },
    removeImage(index) {
      const item = this.imagePreviews[index];
      if (item && item.url && item.url.indexOf("blob:") === 0) {
        window.URL.revokeObjectURL(item.url);
      }
      this.imagePreviews.splice(index, 1);
    },
    addSegment() {
      this.relatedSegments.push({
        id: nextId(),
        segmentNo: "",
        segmentName: "",
        startPoint: "",
        endPoint: "",
        relationType: "安装位置",
        integrity: "待补",
        status: "待确认"
      });
    },
    removeSegment(row) {
      this.relatedSegments = this.relatedSegments.filter(item => item.id !== row.id);
    },
    onSegmentSelectionChange(val) {
      this.selectedSegments = val || [];
    },
    batchConfirmSegments() {
      if (!this.selectedSegments.length) {
        this.$message.warning(this.$t("lang.select_delete_item"));
        return;
      }
      const ids = this.selectedSegments.map(item => item.id);
      this.relatedSegments.forEach(item => {
        if (ids.indexOf(item.id) !== -1) item.status = "已确认";
      });
    },
    batchRemoveSegments() {
      if (!this.selectedSegments.length) {
        this.$message.warning(this.$t("lang.select_delete_item"));
        return;
      }
      const ids = this.selectedSegments.map(item => item.id);
      this.relatedSegments = this.relatedSegments.filter(
        item => ids.indexOf(item.id) === -1
      );
      this.selectedSegments = [];
    },
    applyMaintenanceFilter() {
      this.maintenanceFilter = Object.assign({}, this.maintenanceQuery);
    },
    resetMaintenanceFilter() {
      this.maintenanceQuery = {
        startDate: "",
        endDate: "",
        round: "",
        status: ""
      };
      this.maintenanceFilter = Object.assign({}, this.maintenanceQuery);
    },
    editMaintenance(row) {
      this.maintenanceForm = Object.assign(emptyMaintenance(), row, {
        itemList: row.items ? String(row.items).split(/[、,，]/).filter(Boolean) : []
      });
    },
    removeMaintenance(row) {
      this.maintenanceRecords = this.maintenanceRecords.filter(
        item => item.id !== row.id
      );
      if (this.maintenanceForm.id === row.id) {
        this.maintenanceForm = emptyMaintenance();
      }
    },
    saveMaintenance() {
      const form = this.maintenanceForm;
      const record = Object.assign({}, form, {
        id: form.id || nextId(),
        items: (form.itemList || []).join("、")
      });
      const index = this.maintenanceRecords.findIndex(item => item.id === record.id);
      if (index >= 0) {
        this.$set(this.maintenanceRecords, index, record);
      } else {
        this.maintenanceRecords.unshift(record);
      }
      this.maintenanceForm = emptyMaintenance();
      this.$message.success(this.$t("cm.savesuccess"));
    },
    statusClass(status) {
      if (status === "异常") return "is-error";
      if (status === "待确认") return "is-warn";
      return "is-success";
    },
    onSaveClick() {
      if (this.saving) return;
      this._debouncedSave && this._debouncedSave();
    },
    toNumber(val) {
      if (val === "" || val === null || val === undefined) return null;
      const num = Number(val);
      return Number.isFinite(num) ? num : null;
    },
    toInteger(val) {
      if (val === "" || val === null || val === undefined) return null;
      const num = Number(val);
      if (!Number.isFinite(num)) return null;
      return Math.trunc(num);
    },
    toText(val) {
      if (val === null || val === undefined) return "";
      return val;
    },
    buildPrivateAttributes() {
      return (this.privateAttrs || [])
        .map(item => ({
          name: String(this.toText(item && item.name) || "").trim(),
          value: String(this.toText(item && item.value)),
        }))
        .filter(item => item.name || item.value);
    },
    buildAttachmentIds() {
      return (this.imagePreviews || [])
        .filter(
          item =>
            item &&
            item.id &&
            !item.uploading &&
            String(item.id).indexOf("row-") !== 0
        )
        .map(item => String(item.id));
    },
    buildUpdatePayload() {
      const form = this.form || {};
      return {
        id: this.detail.id || this.directoryId,
        pipelineNo: this.toText(form.pipelineNo),
        pipelineName: this.toText(form.pipelineName),
        startPoint: this.toText(form.startPoint),
        endPoint: this.toText(form.endPoint),
        workingMedium: this.toText(form.workingMedium),
        nominalDiameter: this.toNumber(form.nominalDiameter),
        outerDiameter: this.toNumber(form.outerDiameter),
        wallThickness: this.toNumber(form.wallThickness),
        material: this.toText(form.material),
        specCode: this.toText(form.specCode),
        designPressure: this.toNumber(form.designPressure),
        designTemperature: this.toNumber(form.designTemperature),
        operatingPressure: this.toNumber(form.operatingPressure),
        operatingTemperature: this.toNumber(form.operatingTemperature),
        isoCode: this.toText(form.isoCode),
        componentType: this.toInteger(form.componentType),
        pipeStandardKks: this.toText(form.pipeStandardKks),
        fluidDensity: this.toNumber(form.fluidDensity),
        maxVelocity: this.toNumber(
          form.maxVelocity !== "" && form.maxVelocity != null
            ? form.maxVelocity
            : form.flowVelocity
        ),
        isChokedFlow: this.toInteger(form.isChokedFlow),
        hasSlugFlow: this.toInteger(form.hasSlugFlow),
        equipmentType: this.toText(form.equipmentType),
        spanReference: this.toNumber(form.spanReference),
        lofRemark: this.toText(form.lofRemark),
        mediumType: this.toInteger(form.mediumType),
        materialGrade: this.toText(form.materialGrade),
        elasticModulus: this.toNumber(form.elasticModulus),
        poissonRatio: this.toNumber(form.poissonRatio),
        materialDensity: this.toNumber(form.materialDensity),
        yieldStrength: this.toNumber(form.yieldStrength),
        fatigueLimit: this.toNumber(form.fatigueLimit),
        naturalFrequencyParams: this.toText(form.naturalFrequencyParams),
        annualUnplannedStops: this.toInteger(form.annualUnplannedStops),
        annualStartStops: this.toInteger(form.annualStartStops),
        annualFastValveActions: this.toInteger(form.annualFastValveActions),
        periodicOperation: this.toText(form.periodicOperation),
        c1Level: this.toInteger(form.c1Level),
        c2Level: this.toInteger(form.c2Level),
        c3Level: this.toInteger(form.c3Level),
        c4Level: this.toInteger(form.c4Level),
        hasThrottlingElement: this.toInteger(form.hasThrottlingElement),
        hasReciprocatingEquipment: this.toInteger(form.hasReciprocatingEquipment),
        hasCentrifugalEquipment: this.toInteger(form.hasCentrifugalEquipment),
        lowFlowRatio: this.toNumber(form.lowFlowRatio),
        fastActingValveType: this.toInteger(form.fastActingValveType),
        hasFlashingCavitation: this.toInteger(form.hasFlashingCavitation),
        hasThermowellProbe: this.toInteger(form.hasThermowellProbe),
        hasDeadBranch: this.toInteger(form.hasDeadBranch),
        vibrationFailureHistory: this.toInteger(form.vibrationFailureHistory),
        manufacturingStandard: this.toText(form.manufacturingStandard),
        weldCode: this.toText(form.weldCode),
        weldType: this.toText(form.weldType),
        weldCategory: this.toText(form.weldCategory),
        stressConcentrationFactor: this.toNumber(form.stressConcentrationFactor),
        fatigueLevel: this.toText(form.fatigueLevel),
        visualDefectStandard: this.toText(form.visualDefectStandard),
        privateAttributes: this.buildPrivateAttributes(),
        attachmentIds: this.buildAttachmentIds()
      };
    },
    saveDetail() {
      if (this.saving) return;
      if (this.uploadingImages > 0) {
        this.$message.warning(this.$t("lang.file_uploading"));
        return;
      }
      const payload = this.buildUpdatePayload();
      if (!payload.id) return;
      this.saving = true;
      api
        .updateResourceDirectory(payload)
        .then(res => {
          this.saving = false;
          if (this.isSuccessCode(res && res.code)) {
            this.$message.success(this.$t("cm.savesuccess"));
            this.$emit("updated");
            this.loadDetail();
          } else {
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
        })
        .catch(() => {
          this.saving = false;
        });
    }
  }
};
</script>

<style lang="less" scoped>
.directory-detail {
  height: 100%;
  overflow: auto;
  background: #f4f6f9;
  padding: 4px 4px 8px;
  box-sizing: border-box;
}
.detail-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.detail-crumb {
  font-size: 13px;
  color: #909399;
  .crumb-sep {
    margin: 0 6px;
    font-size: 12px;
  }
  .crumb-current {
    color: #1f2329;
    font-weight: 500;
  }
}
.detail-top-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}
.save-status {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #909399;
  background: #f4f6f9;
  border: 1px solid #e6e8eb;
  border-radius: 6px;
  padding: 4px 10px;
}
.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #f59e0b;
}
.detail-head-card,
.detail-body-card {
  background: #fff;
  border: 1px solid #e6e8eb;
  border-radius: 8px;
  margin-bottom: 12px;
}
.detail-head-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 20px 16px;
  gap: 16px;
  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 600;
    color: #1f2329;
    line-height: 28px;
  }
  p {
    margin: 6px 0 0;
    font-size: 13px;
    color: #909399;
  }
}
.detail-body-card {
  padding: 0 20px 20px;
}
.detail-tabs {
  /deep/ .el-tabs__header {
    margin-bottom: 16px;
  }
  /deep/ .el-tabs__nav-wrap::after {
    height: 1px;
    background-color: #e6e8eb;
  }
  /deep/ .el-tabs__item {
    height: 44px;
    line-height: 44px;
    font-size: 14px;
    color: #606266;
    display: inline-flex;
    align-items: center;
  }
  /deep/ .el-tabs__item.is-active {
    color: #1a6fc4;
    font-weight: 600;
  }
  /deep/ .el-tabs__active-bar {
    background-color: #1a6fc4;
    height: 2px;
  }
  .tab-with-icon {
    display: inline-flex;
    align-items: center;
    gap: 6px;
  }
  /deep/ .tab-svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }
}
.section-block {
  margin-bottom: 8px;
  padding-top: 4px;
  & + .section-block {
    margin-top: 8px;
    padding-top: 20px;
    border-top: 1px solid #e6e8eb;
  }
}
.section-title {
  font-size: 14px;
  font-weight: 600;
  color: #1f2329;
  margin-bottom: 16px;
  padding-left: 10px;
  line-height: 16px;
  border-left: 4px solid #1a6fc4;
}
.form-grid {
  .el-col {
    margin-bottom: 16px;
  }
}
.field {
  label {
    display: block;
    font-size: 12px;
    color: #909399;
    margin-bottom: 6px;
    line-height: 18px;
  }
  /deep/ .el-select,
  /deep/ .el-date-editor {
    width: 100%;
  }
  /deep/ .el-input.is-disabled .el-input__inner {
    color: #1f2329;
    background: #fff;
  }
}
.req {
  color: #ef4444;
  margin-left: 2px;
}
.private-panel {
  margin-top: 8px;
}
.sub-label {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
  margin-bottom: 8px;
  line-height: 18px;
}
.private-table-wrap {
  overflow: hidden;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #fff;
  /deep/ .el-table {
    font-size: 13px;
  }
  /deep/ .el-table::before,
  /deep/ .el-table--group::after,
  /deep/ .el-table--border::after {
    display: none;
  }
  /deep/ .el-table th {
    background: #f1f5f9;
    color: #64748b;
    font-weight: 500;
    font-size: 13px;
    height: 40px;
    padding: 0;
    border-bottom: 1px solid #e2e8f0;
  }
  /deep/ .el-table td {
    padding: 8px 12px;
    border-bottom: 1px solid #e2e8f0;
  }
  /deep/ .el-table .cell {
    padding: 0 12px;
    overflow: visible;
  }
  /deep/ .el-input {
    width: 100%;
    display: block;
  }
  /deep/ .el-input__inner {
    width: 100%;
    height: 32px;
    line-height: 32px;
    border-radius: 4px;
    border-color: #e2e8f0;
    box-sizing: border-box;
  }
  /deep/ .el-table__row:last-child td {
    border-bottom: none;
  }
}
.delete-link {
  color: #ef4444 !important;
  padding: 0 !important;
  &:hover {
    text-decoration: underline;
  }
}
.add-attr-btn {
  margin-top: 10px;
  color: #1f2937;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-weight: 500;
  &:hover,
  &:focus {
    color: #1a6fc4;
    border-color: #1a6fc4;
    background: #f8fbff;
  }
}
.image-panel {
  margin-top: 20px;
}
.image-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}
.image-thumb {
  position: relative;
  width: 96px;
  height: 96px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  background: #f1f5f9;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-size: 12px;
  color: #64748b;
  gap: 4px;
  i.el-icon-picture-outline {
    font-size: 22px;
    color: #94a3b8;
  }
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  .el-icon-close {
    position: absolute;
    top: 4px;
    right: 4px;
    cursor: pointer;
    background: rgba(15, 23, 42, 0.55);
    color: #fff;
    border-radius: 50%;
    font-size: 12px;
    padding: 2px;
  }
}
.image-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}
.hidden-file {
  display: none;
}
.file-picker {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  height: 36px;
  padding: 0 8px 0 4px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  gap: 8px;
  &:hover {
    border-color: #1a6fc4;
  }
  /deep/ .el-button {
    border: none;
    background: transparent;
    padding: 0 8px;
    color: #334155;
    font-weight: 500;
  }
}
.file-hint {
  font-size: 12px;
  color: #94a3b8;
  max-width: 160px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.path-input {
  flex: 1;
  min-width: 200px;
  /deep/ .el-input__inner {
    height: 36px;
    line-height: 36px;
    border-color: #e2e8f0;
    border-radius: 6px;
  }
}
.toolbar-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}
.toolbar-search {
  width: 240px;
}
.toolbar-select {
  width: 160px;
}
.ml-auto {
  margin-left: auto;
}
.batch-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding: 10px 12px;
  border: 1px solid #e6e8eb;
  border-radius: 8px;
  font-size: 12px;
  color: #909399;
}
.relate-hint {
  margin-top: 12px;
  padding: 16px;
  text-align: center;
  color: #909399;
  font-size: 13px;
  border: 1px dashed #e6e8eb;
  border-radius: 8px;
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 16px;
}
.mini-stat {
  border: 1px solid #e6e8eb;
  border-radius: 8px;
  padding: 12px;
  p {
    margin: 0 0 6px;
    font-size: 12px;
    color: #909399;
  }
  strong {
    font-size: 18px;
    color: #1f2329;
  }
  .danger {
    color: #ef4444;
  }
}
.filter-row {
  padding: 12px;
  border: 1px solid #e6e8eb;
  border-radius: 8px;
  align-items: flex-end;
}
.field.compact {
  min-width: 160px;
}
.filter-actions {
  margin-left: auto;
  display: flex;
  gap: 8px;
}
.status-tag {
  display: inline-flex;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  &.is-success {
    color: #10b981;
    background: rgba(16, 185, 129, 0.1);
  }
  &.is-warn {
    color: #f59e0b;
    background: rgba(245, 158, 11, 0.1);
  }
  &.is-error {
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
  }
}
.check-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  padding-top: 4px;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}
</style>

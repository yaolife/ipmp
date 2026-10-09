<template>
  <div class="asset-detail-panel" v-show="visible">
    <div class="panel-tabs">
      <div
        v-for="tab in tabs"
        :key="tab.name"
        class="panel-tab"
        :class="{ active: activeTab === tab.name }"
        @click="activeTab = tab.name"
      >
        {{ $t(tab.labelKey) }}
      </div>
      <i class="el-icon-close panel-close" @click="$emit('close')"></i>
    </div>
    <div class="panel-common">
      <h2 class="panel-title">{{ displayTitle }}</h2>
    </div>
    <div class="panel-body" v-loading="loading">
      <template v-if="activeTab === 'related'">
        <div class="info-section" :class="{ 'is-fill': !relatedSegments.length }">
          <div class="section-title">{{ $t("lang.related_segment_list") }}</div>
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ $t("lang.segment_no") }}</th>
                  <th>{{ $t("lang.segment_name") }}</th>
                  <th>{{ $t("lang.segment_start") }}</th>
                  <th>{{ $t("lang.segment_end") }}</th>
                  <th>{{ $t("lang.relation_type") }}</th>
                  <th>{{ $t("lang.data_integrity") }}</th>
                  <th>{{ $t("lang.relation_status") }}</th>
                </tr>
              </thead>
              <tbody v-if="relatedSegments.length">
                <tr v-for="row in relatedSegments" :key="row.id">
                  <td>{{ displayVal(row.segmentNo) }}</td>
                  <td>{{ displayVal(row.segmentName) }}</td>
                  <td>{{ displayVal(row.startPoint) }}</td>
                  <td>{{ displayVal(row.endPoint) }}</td>
                  <td>{{ displayVal(row.relationType) }}</td>
                  <td>{{ displayVal(row.integrity) }}</td>
                  <td>{{ displayVal(row.status) }}</td>
                </tr>
              </tbody>
            </table>
            <div v-if="!relatedSegments.length" class="viewport-empty">
              {{ $t("cm.nodata") }}
            </div>
          </div>
        </div>
      </template>
      <template v-else-if="activeTab === 'maintenance'">
        <div class="info-section" :class="{ 'is-fill': !maintenanceRecords.length }">
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
              <strong class="is-danger">{{ maintenanceStats.abnormal }}</strong>
            </div>
          </div>
          <div class="table-scroll">
            <table class="data-table">
              <thead>
                <tr>
                  <th>{{ $t("lang.maintenance_date") }}</th>
                  <th>{{ $t("lang.maintenance_round") }}</th>
                  <th>{{ $t("lang.inspect_content") }}</th>
                  <th>{{ $t("lang.inspect_items") }}</th>
                  <th>{{ $t("lang.inspect_method") }}</th>
                  <th>{{ $t("lang.defect_desc") }}</th>
                  <th>{{ $t("lang.handle_status") }}</th>
                  <th>{{ $t("lang.reinspect_after") }}</th>
                  <th>{{ $t("lang.report_no") }}</th>
                  <th>{{ $t("lang.measured_load") }}</th>
                  <th>{{ $t("lang.measured_scale") }}</th>
                  <th>{{ $t("lang.status") }}</th>
                  <th>{{ $t("lang.maintenance_unit") }}</th>
                  <th>{{ $t("lang.sign_name") }}</th>
                </tr>
              </thead>
              <tbody v-if="maintenanceRecords.length">
                <tr v-for="row in maintenanceRecords" :key="row.id">
                  <td>{{ displayVal(row.date) }}</td>
                  <td>{{ displayVal(row.round) }}</td>
                  <td>{{ displayVal(row.content) }}</td>
                  <td>{{ displayVal(row.items) }}</td>
                  <td>{{ displayVal(row.method) }}</td>
                  <td>{{ displayVal(row.defect) }}</td>
                  <td>{{ displayVal(row.handleStatus) }}</td>
                  <td>{{ displayVal(row.reinspect) }}</td>
                  <td>{{ displayVal(row.reportNo) }}</td>
                  <td>{{ displayVal(row.measuredLoad) }}</td>
                  <td>{{ displayVal(row.measuredScale) }}</td>
                  <td>{{ displayVal(row.status) }}</td>
                  <td>{{ displayVal(row.unit) }}</td>
                  <td>{{ displayVal(row.sign) }}</td>
                </tr>
              </tbody>
            </table>
            <div v-if="!maintenanceRecords.length" class="viewport-empty">
              {{ $t("cm.nodata") }}
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div
          v-for="section in activeSections"
          :key="section.titleKey"
          class="info-section"
        >
          <div class="section-title">{{ $t(section.titleKey) }}</div>
          <div v-if="section.kind === 'attrs'">
            <div v-if="!visiblePrivateAttrs.length" class="section-empty">
              {{ $t("cm.nodata") }}
            </div>
            <div v-else class="info-grid">
              <div
                v-for="(attr, index) in visiblePrivateAttrs"
                :key="attr.name + '-' + index"
                class="info-item"
              >
                <span class="info-label">{{ displayVal(attr.name) }}</span>
                <span class="info-value">{{ displayVal(attr.value) }}</span>
              </div>
            </div>
          </div>
          <div v-else-if="section.kind === 'images'" class="image-row">
            <span v-if="!imagePreviews.length" class="info-value">{{
              $t("cm.nodata")
            }}</span>
            <div
              v-for="(img, index) in imagePreviews"
              :key="img.id || index"
              class="image-thumb"
            >
              <img v-if="img.url" :src="img.url" alt="" />
              <span v-else>{{ img.name }}</span>
            </div>
          </div>
          <div v-else-if="section.kind === 'remark'" class="remark-value">
            {{ displayVal(form.remark) }}
          </div>
          <div v-else class="info-grid">
            <div
              v-for="item in section.fields"
              :key="item.key"
              class="info-item"
              :class="{ 'is-full': item.full || item.type === 'textarea' }"
            >
              <span class="info-label">{{ $t(item.label) }}</span>
              <span class="info-value">{{ formatField(item) }}</span>
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script>
import api from "@/modules/drafts/api";
import {
  getComponentTypeItem,
  getComponentTypeLabel,
  getComponentTypeOptions
} from "@/constant/componentType";

const PIPE_LOF_TYPES = [0, 1, 2, 3];
const RIGID_LOF_TYPES = [5, 6, 7, 8, 9, 10, 11, 12];
const WELD_LOF_TYPE = 4;
const THERMOWELL_LOF_TYPE = 13;

function resolveLofLayout(componentType) {
  if (componentType === null || componentType === undefined || componentType === "") {
    return "default";
  }
  const code = Number(componentType);
  if (!Number.isFinite(code)) return "default";
  if (PIPE_LOF_TYPES.indexOf(code) !== -1) return "pipe";
  if (RIGID_LOF_TYPES.indexOf(code) !== -1) return "rigid";
  if (code === WELD_LOF_TYPE) return "weld";
  if (code === THERMOWELL_LOF_TYPE) return "thermowell";
  return "default";
}

function getDefaultLofSections() {
  return [
    {
      titleKey: "lang.lof_pipe_params",
      fields: [
        { key: "pipeStandardKks", label: "lang.pipe_standard_kks" },
        { key: "outerDiameter", label: "lang.pipe_outer_diameter_mm" },
        { key: "wallThickness", label: "lang.pipe_wall_thickness_mm" },
        { key: "material", label: "lang.standard_material" },
        { key: "designTemperature", label: "lang.design_temperature_c" },
        { key: "designPressure", label: "lang.design_pressure_mpa" },
        { key: "mediumType", label: "lang.medium_type", type: "select", options: "mediumType" },
        { key: "fluidDensity", label: "lang.fluid_density" },
        { key: "equipmentType", label: "lang.equipment_type" },
        { key: "spanReference", label: "lang.span_reference" }
      ]
    },
    {
      titleKey: "lang.lof_material_info",
      fields: [
        { key: "materialGrade", label: "lang.material_grade" },
        { key: "elasticModulus", label: "lang.elastic_modulus" },
        { key: "poissonRatio", label: "lang.poisson_ratio" },
        { key: "materialDensity", label: "lang.material_density" },
        { key: "yieldStrength", label: "lang.yield_strength" },
        { key: "fatigueLimit", label: "lang.fatigue_limit" },
        { key: "naturalFrequencyParams", label: "lang.natural_frequency_params" }
      ]
    },
    {
      titleKey: "lang.lof_operate_condition",
      fields: [
        { key: "annualUnplannedStops", label: "lang.annual_unplanned_stops" },
        { key: "annualStartStops", label: "lang.annual_start_stops" },
        { key: "annualFastValveActions", label: "lang.annual_fast_valve_actions" },
        { key: "periodicOperation", label: "lang.periodic_operation" },
        { key: "c1Level", label: "lang.c1_level", type: "select", options: "level" },
        { key: "c2Level", label: "lang.c2_level", type: "select", options: "level" },
        { key: "c3Level", label: "lang.c3_level", type: "select", options: "level" },
        { key: "c4Level", label: "lang.c4_level", type: "select", options: "level" }
      ]
    },
    {
      titleKey: "lang.lof_incentive_flags",
      fields: [
        { key: "maxVelocity", label: "lang.max_velocity" },
        { key: "hasThrottlingElement", label: "lang.has_throttling", type: "select", options: "yesNo" },
        { key: "isChokedFlow", label: "lang.is_choked_flow", type: "select", options: "yesNo" },
        { key: "hasReciprocatingEquipment", label: "lang.has_reciprocating", type: "select", options: "yesNo" },
        { key: "hasCentrifugalEquipment", label: "lang.has_centrifugal", type: "select", options: "yesNo" },
        { key: "lowFlowRatio", label: "lang.low_flow_ratio" },
        { key: "fastActingValveType", label: "lang.fast_acting_valve", type: "select", options: "fastValve" },
        { key: "hasFlashingCavitation", label: "lang.has_flashing_cavitation", type: "select", options: "yesNo" },
        { key: "hasThermowellProbe", label: "lang.has_thermowell_probe", type: "select", options: "yesNo" },
        { key: "hasDeadBranch", label: "lang.has_dead_branch", type: "select", options: "yesNo" },
        { key: "hasSlugFlow", label: "lang.has_slug_flow", type: "select", options: "yesNo" },
        { key: "vibrationFailureHistory", label: "lang.vibration_failure_history", type: "select", options: "vibration" }
      ]
    },
    {
      titleKey: "lang.lof_weld_info",
      fields: [
        { key: "manufacturingStandard", label: "lang.manufacturing_standard" },
        { key: "weldCode", label: "lang.weld_code" },
        { key: "weldType", label: "lang.weld_type" },
        { key: "weldCategory", label: "lang.weld_category" },
        { key: "stressConcentrationFactor", label: "lang.stress_concentration_factor" },
        { key: "fatigueLevel", label: "lang.fatigue_level" },
        { key: "visualDefectStandard", label: "lang.visual_defect_standard" },
        { key: "lofRemark", label: "lang.lof_remark" }
      ]
    }
  ];
}

function getPipeLofSections() {
  const sections = getDefaultLofSections();
  const first = sections[0];
  if (first && first.fields) {
    const extras = [
      { key: "length", label: "lang.lof_length" },
      { key: "drawingNo", label: "lang.lof_drawing_code" }
    ];
    const idx = first.fields.findIndex(item => item.key === "wallThickness");
    if (idx >= 0) {
      first.fields.splice(idx + 1, 0, extras[0], extras[1]);
    } else {
      first.fields.push(extras[0], extras[1]);
    }
  }
  return sections;
}

function getRigidLofSections() {
  return [
    {
      titleKey: "lang.lof_rigid_params",
      fields: [
        { key: "functionLocation", label: "lang.lof_function_location" },
        { key: "typeName", label: "lang.lof_type" },
        { key: "modelNo", label: "lang.lof_model" },
        { key: "length", label: "lang.lof_length" },
        { key: "mass", label: "lang.lof_mass" },
        { key: "drawingNo", label: "lang.lof_drawing_code" }
      ]
    }
  ];
}

function getWeldLofSections() {
  return [
    {
      titleKey: "lang.lof_weld_params",
      fields: [
        { key: "weldCode", label: "lang.lof_weld_no" },
        { key: "weldType", label: "lang.weld_type", type: "select", options: "weldTypeLof" }
      ]
    }
  ];
}

function getThermowellLofSections() {
  return [
    {
      titleKey: "lang.lof_thermowell_params",
      fields: [
        { key: "twType", label: "lang.tw_type", type: "select", options: "thermowellType" },
        { key: "outerDiameter", label: "lang.tw_outer_diameter" },
        { key: "dtw", label: "lang.tw_bore_diameter" },
        { key: "Ltw", label: "lang.tw_ltw" },
        { key: "material", label: "lang.tw_material" },
        { key: "elasticModulus", label: "lang.elastic_modulus" },
        { key: "materialDensity", label: "lang.tw_material_density" },
        { key: "fluidDensity", label: "lang.fluid_density" },
        { key: "fluidViscosity", label: "lang.tw_fluid_viscosity" },
        { key: "maxVelocity", label: "lang.max_velocity" },
        { key: "schedule", label: "lang.tw_parent_sch" },
        { key: "has90Reinforcement", label: "lang.tw_has_90_reinforcement", type: "select", options: "yesNo" }
      ]
    }
  ];
}

function emptyForm() {
  return {
    nodeName: "",
    specCode: "",
    pipelineName: "",
    componentType: "",
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
    visualDefectStandard: "",
    length: "",
    mass: "",
    functionLocation: "",
    typeName: "",
    modelNo: "",
    twType: "",
    dtw: "",
    Ltw: "",
    fluidViscosity: "",
    schedule: "",
    has90Reinforcement: ""
  };
}

let rowSeed = 1;
function nextId() {
  rowSeed += 1;
  return "row-" + Date.now() + "-" + rowSeed;
}

export default {
  name: "AssetDetailPanel",
  props: {
    visible: {
      type: Boolean,
      default: true
    },
    pipelineId: {
      type: [String, Number],
      default: ""
    },
    nodeName: {
      type: String,
      default: ""
    },
    directoryPath: {
      type: Array,
      default() {
        return [];
      }
    }
  },
  data() {
    return {
      loading: false,
      activeTab: "basic",
      detail: {},
      form: emptyForm(),
      privateAttrs: [],
      imagePreviews: [],
      relatedSegments: [],
      maintenanceRecords: [],
      tabs: [
        { name: "basic", labelKey: "lang.screen_tab_basic" },
        { name: "technical", labelKey: "lang.tab_tech_params" },
        { name: "lof", labelKey: "lang.tab_lof_basic" },
        { name: "related", labelKey: "lang.tab_related_segment" },
        { name: "maintenance", labelKey: "lang.maintenance_records" }
      ],
      basicIdentityFields: [
        { key: "nodeName", label: "lang.component_no" },
        { key: "pipelineName", label: "lang.component_name" },
        { key: "componentType", label: "lang.component_type", type: "select" },
        { key: "pipeStandardKks", label: "lang.kks_code" },
        { key: "specCode", label: "lang.spec_code" },
        { key: "unitName", label: "lang.belong_unit" },
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
        { key: "parentSystemNo", label: "lang.parent_system_no" },
        { key: "systemCode", label: "lang.system_no" },
        { key: "levelNo", label: "lang.system_depth" },
        { key: "systemName", label: "lang.system_name_label" },
        { key: "parentLocationNo", label: "lang.parent_location_no" },
        { key: "locationNo", label: "lang.location_no" },
        { key: "locationDepth", label: "lang.location_depth" },
        { key: "locationName", label: "lang.location_name" },
        { key: "deviceNo", label: "lang.device_no" },
        { key: "orientation", label: "lang.orientation" },
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
      statusFields: [
        { key: "dataStatus", label: "lang.data_status", type: "select", options: "dataStatus" },
        { key: "dataSource", label: "lang.data_source", type: "select", options: "dataSource" },
        { key: "modifyDate", label: "lang.update_time" }
      ]
    };
  },
  computed: {
    displayTitle() {
      return (
        this.form.nodeName ||
        this.detail.nodeName ||
        this.nodeName ||
        "--"
      );
    },
    lofLayout() {
      return resolveLofLayout(this.form && this.form.componentType);
    },
    lofSections() {
      const layout = this.lofLayout;
      if (layout === "pipe") return getPipeLofSections();
      if (layout === "rigid") return getRigidLofSections();
      if (layout === "weld") return getWeldLofSections();
      if (layout === "thermowell") return getThermowellLofSections();
      return getDefaultLofSections();
    },
    activeSections() {
      if (this.activeTab === "technical") {
        return [
          { titleKey: "lang.run_condition", fields: this.technicalFields },
          { titleKey: "lang.status_source", fields: this.statusFields }
        ];
      }
      if (this.activeTab === "lof") return this.lofSections;
      return [
        { titleKey: "lang.basic_identity", fields: this.basicIdentityFields },
        { titleKey: "lang.location_belong", fields: this.locationFields },
        { titleKey: "lang.hierarchy_locate", fields: this.hierarchyFields },
        { titleKey: "lang.private_attrs", kind: "attrs" },
        { titleKey: "lang.image_upload_path", kind: "images" },
        { titleKey: "lang.remark_section", kind: "remark" }
      ];
    },
    visiblePrivateAttrs() {
      return (this.privateAttrs || []).filter(item => item && (item.name || item.value));
    },
    maintenanceStats() {
      const list = this.maintenanceRecords || [];
      const dates = list.map(item => item.date).filter(Boolean).sort();
      return {
        total: list.length,
        lastDate: dates.length ? dates[dates.length - 1] : "/",
        nextDate: "/",
        abnormal: list.filter(item => item.status === "异常").length
      };
    },
    componentTypeOptions() {
      return getComponentTypeOptions(this.$t.bind(this));
    },
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
    thermowellTypeOptions() {
      return [
        { label: this.$t("lang.tw_straight"), value: "直型" },
        { label: this.$t("lang.tw_tapered"), value: "锥型" },
        { label: this.$t("lang.tw_stepped"), value: "台阶型" }
      ];
    },
    weldTypeLofOptions() {
      return [
        { label: this.$t("lang.weld_butt"), value: "对接焊缝" },
        { label: this.$t("lang.weld_fillet"), value: "角焊缝" },
        { label: this.$t("lang.weld_socket"), value: "承插焊" },
        { label: this.$t("lang.weld_flange"), value: "法兰焊" },
        { label: this.$t("lang.weld_other"), value: "其他" }
      ];
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
    }
  },
  watch: {
    nodeName: {
      immediate: true,
      handler(val) {
        if (val) {
          this.loadDetail();
        } else {
          this.resetState();
        }
      }
    }
  },
  methods: {
    setActiveTab(name) {
      const exists = this.tabs.some(tab => tab.name === name);
      if (exists) this.activeTab = name;
    },
    isSuccessCode(code) {
      return code === 0 || code === "0";
    },
    displayVal(val) {
      if (val === 0) return 0;
      if (val === false) return this.$t("lang.option_no");
      if (val === true) return this.$t("lang.option_yes");
      if (val === null || val === undefined || val === "") return "--";
      if (typeof val === "number") {
        return Number.isInteger(val) ? val : parseFloat(val.toFixed(6));
      }
      if (/^-?\d+\.\d+$/.test(String(val))) {
        return String(Number(val));
      }
      return val;
    },
    getFieldOptions(item) {
      if (!item) return [];
      if (item.key === "islandType") return this.islandOptions;
      if (item.key === "componentType") return this.componentTypeOptions;
      if (item.options === "yesNo") return this.yesNoOptions;
      if (item.options === "level") return this.levelOptions;
      if (item.options === "mediumType") return this.mediumTypeOptions;
      if (item.options === "fastValve") return this.fastValveOptions;
      if (item.options === "vibration") return this.vibrationOptions;
      if (item.options === "thermowellType") return this.thermowellTypeOptions;
      if (item.options === "weldTypeLof") return this.weldTypeLofOptions;
      if (item.options === "dataStatus") return this.dataStatusOptions;
      if (item.options === "dataSource") return this.dataSourceOptions;
      return [];
    },
    formatField(item) {
      const raw = this.form[item.key];
      if (item.type === "select") {
        let value = raw;
        if (value === true) value = 1;
        if (value === false) value = 0;
        const found = this.getFieldOptions(item).find(
          opt => String(opt.value) === String(value)
        );
        if (found) return found.label;
      }
      return this.displayVal(raw);
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
      const typeItem = getComponentTypeItem(detail.componentType);
      form.componentType = typeItem ? typeItem.code : "";
      if (form.functionLocation === "" || form.functionLocation == null) {
        form.functionLocation = this.normalizeText(
          detail.functionLocation || detail.locationNo || detail.locationName
        );
      }
      if (form.typeName === "" || form.typeName == null) {
        form.typeName = this.normalizeText(
          detail.typeName ||
            (typeItem ? getComponentTypeLabel(typeItem.code, this.$t.bind(this)) : "")
        );
      }
      if (form.modelNo === "" || form.modelNo == null) {
        form.modelNo = this.normalizeText(detail.modelNo || detail.specCode);
      }
      if (form.length === "" || form.length == null) {
        form.length = this.normalizeText(detail.length);
      }
      if (form.mass === "" || form.mass == null) {
        form.mass = this.normalizeText(detail.mass);
      }
      if (form.twType === "" || form.twType == null) {
        form.twType = this.normalizeText(detail.twType || detail.thermowellType);
      }
      const twTypeMap = {
        straight: "直型",
        tapered: "锥型",
        stepped: "台阶型"
      };
      if (twTypeMap[form.twType]) form.twType = twTypeMap[form.twType];
      if (form.dtw === "" || form.dtw == null) {
        form.dtw = this.normalizeText(detail.dtw || detail.boreDiameter);
      }
      if (form.Ltw === "" || form.Ltw == null) {
        form.Ltw = this.normalizeText(detail.Ltw || detail.ltw);
      }
      if (form.fluidViscosity === "" || form.fluidViscosity == null) {
        form.fluidViscosity = this.normalizeText(detail.fluidViscosity || detail.viscosity);
      }
      if (form.schedule === "" || form.schedule == null) {
        form.schedule = this.normalizeText(detail.schedule || detail.Sch);
      }
      if (
        (form.has90Reinforcement === "" || form.has90Reinforcement == null) &&
        detail.reinforcement != null &&
        detail.reinforcement !== ""
      ) {
        const text = String(detail.reinforcement);
        form.has90Reinforcement = /补强|是/.test(text) ? 1 : 0;
      }
      this.form = form;
    },
    normalizeAttrs(list) {
      if (!Array.isArray(list)) return [];
      return list.map(item => ({
        name: (item && (item.name || item.key)) || "",
        value: item && item.value != null ? item.value : ""
      }));
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
          url: this.resolveAttachmentUrl(item)
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
        relationType: item.relationType || "",
        integrity: item.integrity || "",
        status: item.status || ""
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
        status: item.status || "",
        unit: item.unit || "",
        sign: item.sign || ""
      }));
    },
    resetState() {
      this.detail = {};
      this.form = emptyForm();
      this.privateAttrs = [];
      this.imagePreviews = [];
      this.relatedSegments = [];
      this.maintenanceRecords = [];
    },
    loadDetail() {
      if (!this.nodeName) return;
      this.loading = true;
      api
        .getDirectoryDetailByNodeName({
          nodeName: this.nodeName
        })
        .then(res => {
          this.loading = false;
          if (this.isSuccessCode(res && res.code)) {
            this.detail = res.data || {};
            this.fillForm(this.detail);
            this.privateAttrs = this.normalizeAttrs(
              this.detail.privateAttributes || this.detail.privateAttrs
            );
            this.imagePreviews = this.normalizeAttachments(this.detail.attachments);
            this.relatedSegments = this.normalizeSegments(this.detail.relatedSegments);
            this.maintenanceRecords = this.normalizeMaintenance(
              this.detail.maintenanceRecords
            );
          } else {
            this.resetState();
            this.$message.error((res && res.msg) || this.$t("cm.fail"));
          }
        })
        .catch(() => {
          this.loading = false;
          this.resetState();
        });
    }
  }
};
</script>

<style lang="less" scoped>
.asset-detail-panel {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  max-width: 100%;
  max-height: 100%;
  box-sizing: border-box;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.3);
  -webkit-backdrop-filter: blur(5.5px);
  backdrop-filter: blur(5.5px);
  color: #e8f4ff;
}
.panel-tabs {
  position: relative;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  height: 38px;
  min-height: 38px;
  padding: 0 40px 0 0;
  box-sizing: border-box;
  background: rgba(0, 0, 0, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-top: none;
  border-left: none;
  border-right: none;
  overflow-x: auto;
  overflow-y: hidden;
}
.panel-tabs::-webkit-scrollbar {
  height: 0;
}
.panel-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-right: 8px;
  height: 38px;
  padding: 0 16px;
  font-size: 16px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.55);
  cursor: pointer;
  user-select: none;
  white-space: nowrap;
}
.panel-tab.active {
  color: #ffffff;
  font-weight: 600;
  background: linear-gradient(180deg, rgba(7, 61, 95, 0) 0%, #00c2ec 100%);
}
.panel-close {
  position: absolute;
  right: 16px;
  top: 50%;
  margin-top: -8px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
}
.panel-close:hover {
  color: #ffffff;
}
.panel-body {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 12px 20px 20px;
  overflow-x: hidden;
  overflow-y: auto;
  /deep/ .el-loading-mask {
    background: rgba(0, 0, 0, 0.25);
  }
}
.panel-body::-webkit-scrollbar {
  width: 6px;
}
.panel-body::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.28);
  border-radius: 3px;
}
.panel-common {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  min-height: 56px;
  margin: 0 20px;
  padding: 12px 0;
  background: transparent;
  border-bottom: 1px solid rgba(104, 190, 254, 0.22);
}
.panel-title {
  margin: 0 12px 0 0;
  font-size: 28px;
  font-weight: 600;
  line-height: 36px;
  color: #ffffff;
}
.info-section {
  margin-bottom: 12px;
  padding: 12px 16px 12px;
  border-radius: 6px;
  border: 1px solid rgba(104, 190, 254, 0.35);
  background: rgba(8, 36, 59, 0.74);
}
.info-section.is-fill {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
  margin-bottom: 0;
}
.section-title {
  margin-bottom: 12px;
  padding-left: 10px;
  font-size: 14px;
  font-weight: 600;
  line-height: 16px;
  color: #ffffff;
  border-left: 3px solid #3ec6ff;
}
.info-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  column-gap: 32px;
  row-gap: 12px;
}
.info-item {
  display: grid;
  grid-template-columns: 108px minmax(0, 1fr);
  column-gap: 8px;
  align-items: start;
  min-width: 0;
  line-height: 20px;
}
.info-item.is-full {
  grid-column: 1 / -1;
}
.info-label {
  min-width: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.55);
  word-break: break-all;
}
.info-value {
  min-width: 0;
  font-size: 14px;
  color: #ffffff;
  word-break: break-all;
}
.remark-value {
  font-size: 14px;
  line-height: 22px;
  color: #ffffff;
  white-space: pre-wrap;
  word-break: break-all;
}
.image-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.image-thumb {
  width: 72px;
  height: 72px;
  border-radius: 4px;
  border: 1px solid rgba(104, 190, 254, 0.35);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
}
.image-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 12px;
}
.mini-stat {
  min-width: 0;
  padding: 8px 10px;
  border-radius: 4px;
  background: rgba(0, 0, 0, 0.2);
}
.mini-stat p {
  margin: 0 0 6px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.55);
}
.mini-stat strong {
  font-size: 16px;
  color: #ffffff;
}
.mini-stat strong.is-danger {
  color: #ff8d8d;
}
.table-scroll {
  width: 100%;
  min-width: 0;
  overflow-x: auto;
  overflow-y: hidden;
}
.info-section.is-fill .table-scroll {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.info-section.is-fill .data-table {
  flex: none;
  width: max-content;
  min-width: 100%;
}
.table-scroll::-webkit-scrollbar {
  height: 6px;
}
.table-scroll::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.28);
  border-radius: 3px;
}
.data-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.data-table th,
.data-table td {
  padding: 8px 10px;
  border-bottom: 1px solid rgba(104, 190, 254, 0.22);
  text-align: left;
  white-space: nowrap;
  color: #ffffff;
}
.data-table th {
  color: rgba(255, 255, 255, 0.55);
  font-weight: 500;
}
.section-empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  color: rgba(255, 255, 255, 0.45);
  font-size: 14px;
}
.viewport-empty {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 72px;
  color: rgba(255, 255, 255, 0.45);
  font-size: 14px;
}
</style>

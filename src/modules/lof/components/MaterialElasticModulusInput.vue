<template>
  <div class="material-elastic-input">
    <div class="material-elastic-control">
      <input type="number" step="any" aria-label="杨氏模量 Etw (Pa)" :value="value" @input="onManualInput">
      <el-button size="small" plain :disabled="!contextKey" @click="openMatcher">按材料和温度取值</el-button>
    </div>
    <el-dialog title="按材料和温度取值" :visible.sync="dialogVisible" width="640px"
      custom-class="material-elastic-dialog" append-to-body :close-on-click-modal="false" @close="cancelPending">
      <div class="material-elastic-match">
        <p class="material-elastic-hint">先匹配材料子类，再按热电偶套管的温度 TP 取值。确认后才填入计算页。</p>
        <div class="material-elastic-field">
          <label>材料子类</label>
          <div class="material-elastic-search">
            <el-input :value="keyword" size="small" placeholder="请输入材料子类" @input="onKeywordInput" @keyup.enter.native="searchMaterials"></el-input>
            <el-button size="small" :loading="searching" @click="searchMaterials">匹配材料</el-button>
          </div>
          <p class="material-elastic-hint">默认使用当前管道材质；套管材质不同时，可修改后重新匹配。</p>
        </div>
        <div v-if="candidates.length" class="material-elastic-field">
          <label>材料记录</label>
          <el-select v-model="materialId" size="small" placeholder="请选择具体材料记录" @change="resolveValue">
            <el-option v-for="item in candidates" :key="item.id" :value="item.id" :label="materialLabel(item)"></el-option>
          </el-select>
        </div>
        <div class="material-elastic-preview">
          <div class="material-elastic-preview-row"><span>温度 TP</span><strong>{{ displayTemperature }} ℃</strong></div>
          <div class="material-elastic-preview-row"><span>匹配弹性模量</span><strong>{{ preview ? preview.value + ' Pa' : '—' }}</strong></div>
          <div v-if="preview" class="material-elastic-preview-row"><span>取值方式</span><span>{{ preview.matchType === 1 ? '线性插值（' + preview.lowerTemperature + '～' + preview.upperTemperature + ' ℃）' : '温度点直接取值' }}</span></div>
        </div>
        <p class="material-elastic-status" role="status">{{ status }}</p>
      </div>
      <span slot="footer">
        <el-button size="small" @click="closeDialog">取消</el-button>
        <el-button size="small" type="primary" :disabled="!canConfirm" @click="confirmValue">确认填入</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import api from "../api";
import { isSuccessCode } from "../utils";

// 查询只生成预览，只有明确确认才更新计算输入；所有数值直接按Pa使用。
export default {
  props: {
    value: { type: [Number, String], default: null },
    material: { type: String, default: "" },
    temperature: { type: [Number, String], default: null },
    contextKey: { type: String, default: "" }
  },
  data() {
    return {
      dialogVisible: false,
      keyword: "",
      candidates: [],
      materialId: "",
      searching: false,
      resolving: false,
      preview: null,
      status: "",
      // 请求序号使关闭弹窗、切换管段及修改条件前的慢响应失效。
      materialRequestSeq: 0,
      valueRequestSeq: 0
    };
  },
  computed: {
    displayTemperature() {
      return this.temperature === null || this.temperature === undefined || this.temperature === "" ? "—" : this.temperature;
    },
    canConfirm() {
      return !!(this.dialogVisible && !this.searching && !this.resolving && this.preview &&
        this.preview.context === this.contextKey && this.preview.materialId === this.materialId &&
        this.preview.temperature === this.temperature);
    }
  },
  watch: {
    contextKey() { this.closeDialog(); },
    material() {
      if (this.dialogVisible) {
        this.keyword = String(this.material || "").trim();
        this.searchMaterials();
      }
    },
    temperature() {
      if (this.dialogVisible) this.resolveValue();
    }
  },
  beforeDestroy() { this.cancelPending(); },
  methods: {
    /** 作废旧查询，只清除待确认的预览，保留计算页原值。 */
    cancelPending() {
      this.materialRequestSeq++;
      this.valueRequestSeq++;
      this.searching = false;
      this.resolving = false;
      this.preview = null;
    },
    /** 用户主动打开弹窗时才开始匹配，不在页面加载或温度改变时自动覆盖输入。 */
    openMatcher() {
      if (!this.contextKey) return;
      this.dialogVisible = true;
      this.keyword = String(this.material || "").trim();
      this.searchMaterials();
    },
    /** 取消或切换管段时关闭预览，未确认的查询结果不写回表单。 */
    closeDialog() {
      this.dialogVisible = false;
      this.cancelPending();
    },
    /** 回显历史时关闭查询，保留当时保存的弹性模量快照。 */
    restoreHistory() { this.closeDialog(); },
    /** 修改关键词后使旧候选和预览失效，等待用户重新点击匹配。 */
    onKeywordInput(value) {
      this.cancelPending();
      this.keyword = value;
      this.candidates = [];
      this.materialId = "";
      this.status = "请点击匹配材料";
    },
    /** 单候选自动预览，多候选由用户选择；任何情况都不直接更新计算输入。 */
    searchMaterials() {
      this.cancelPending();
      if (!this.dialogVisible) return;
      const keyword = String(this.keyword || "").trim();
      const context = this.contextKey;
      const seq = this.materialRequestSeq;
      this.candidates = [];
      this.materialId = "";
      if (!keyword) {
        this.status = "当前管道未维护材质，请输入材料子类后匹配";
        return;
      }
      this.searching = true;
      this.status = "正在匹配材料子类…";
      const isCurrent = () => seq === this.materialRequestSeq && this.dialogVisible &&
        context === this.contextKey && keyword === String(this.keyword || "").trim();
      return api.matchMaterialLibrary(keyword).then(res => {
        if (!isCurrent()) return;
        this.searching = false;
        if (!isSuccessCode(res && res.code)) throw new Error((res && res.msg) || "材料匹配失败");
        this.candidates = Array.isArray(res.data) ? res.data : [];
        if (this.candidates.length === 1) {
          this.materialId = this.candidates[0].id;
          this.resolveValue();
        } else {
          this.status = this.candidates.length ? "匹配到多条材料，请选择具体记录" : "没有匹配的材料子类，请修改关键词或取消后直接输入";
        }
      }).catch(error => {
        if (!isCurrent()) return;
        this.searching = false;
        this.status = error.message || "材料匹配失败，请重试";
      });
    },
    /** 根据已选材料和当前TP查询预览，拒绝旧温度、旧材料及已关闭弹窗的响应。 */
    resolveValue() {
      const seq = ++this.valueRequestSeq;
      this.preview = null;
      this.resolving = false;
      if (!this.dialogVisible || !this.materialId) return;
      const temperature = this.temperature;
      if (temperature === null || temperature === undefined || temperature === "" || !Number.isFinite(Number(temperature))) {
        this.status = "请先在计算页填写温度 TP (℃)，再匹配弹性模量";
        return;
      }
      const materialId = this.materialId;
      const context = this.contextKey;
      this.resolving = true;
      this.status = "正在按温度 TP 查询弹性模量…";
      const isCurrent = () => seq === this.valueRequestSeq && this.dialogVisible &&
        context === this.contextKey && materialId === this.materialId && temperature === this.temperature;
      return api.getMaterialElasticModulus(materialId, temperature).then(res => {
        if (!isCurrent()) return;
        if (!isSuccessCode(res && res.code)) throw new Error((res && res.msg) || "弹性模量取值失败");
        const data = res.data || {};
        const value = data.elasticModulus == null ? null : Number(data.elasticModulus);
        if (value !== null && (!Number.isFinite(value) || value <= 0)) throw new Error("材料弹性模量无效，请核对材料库");
        if (value !== null) this.preview = Object.assign({}, data, { value, context, materialId, temperature });
        this.status = value === null ? (data.message || "该温度未取得弹性模量，请核对材料库或取消后直接输入") : "请核对材料、温度及取值结果，确认后填入计算页。";
        this.resolving = false;
      }).catch(error => {
        if (!isCurrent()) return;
        this.preview = null;
        this.resolving = false;
        this.status = error.message || "弹性模量取值失败，请重试";
      });
    },
    /** 只有当前条件下的有效预览才能在用户确认后原样填入。 */
    confirmValue() {
      if (!this.canConfirm) return;
      this.publish(this.preview.value);
      this.closeDialog();
    },
    /** 默认允许直接输入，不需要切换模式。 */
    onManualInput(event) {
      this.closeDialog();
      const raw = event.target.value;
      this.publish(raw === "" ? null : Number(raw));
    },
    /** 只在数值实际改变时触发原有计算结果失效逻辑。 */
    publish(value) {
      if (value !== this.value) {
        this.$emit("input", value);
        this.$emit("change");
      }
    },
    /** 展示子类、牌号、规范和产品形式，帮助区分同子类的不同材料。 */
    materialLabel(item) {
      return [item.subcategory, item.materialGrade, item.specificationNo, item.productForm, item.unsNo].filter(Boolean).join(" / ") || item.id;
    }
  }
};
</script>

<style>
.material-elastic-input { min-width: 0; }
.material-elastic-control { display: flex; align-items: center; gap: 8px; }
.material-elastic-control > input { flex: 1 1 0; min-width: 0; box-sizing: border-box; }
.material-elastic-control > .el-button { flex: 0 0 auto; margin: 0; }
.material-elastic-dialog { max-width: calc(100vw - 32px); }
.material-elastic-dialog .el-dialog__body { padding: 16px 24px 8px; }
.material-elastic-match { line-height: 1.6; }
.material-elastic-field { margin-top: 18px; }
.material-elastic-field > label { display: block; margin-bottom: 6px; color: #303133; font-size: 13px; }
.material-elastic-field .el-select { width: 100%; }
.material-elastic-search { display: flex; gap: 8px; }
.material-elastic-search .el-input { flex: 1; min-width: 0; }
.material-elastic-search .el-button { flex: 0 0 auto; }
.material-elastic-hint { margin: 6px 0 0; font-size: 12px; color: #909399; }
.material-elastic-preview { margin-top: 20px; padding: 12px 16px; background: #f5f7fa; border: 1px solid #ebeef5; border-radius: 4px; }
.material-elastic-preview-row { display: flex; justify-content: space-between; gap: 16px; padding: 5px 0; }
.material-elastic-preview-row > :last-child { text-align: right; overflow-wrap: anywhere; }
.material-elastic-status { min-height: 22px; margin: 12px 0 0; color: #606266; font-size: 13px; }
@media (max-width: 480px) {
  .material-elastic-control { flex-wrap: wrap; }
  .material-elastic-control > input { flex-basis: 100%; }
}
</style>

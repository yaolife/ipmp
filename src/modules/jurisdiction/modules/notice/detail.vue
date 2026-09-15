<template>
  <div class="notice-detail-container">
    <div class="header">
      <el-button type="text" @click="$router.back()">← 返回</el-button>
      <span class="title">通知单详情页（Mock + 控权）</span>
      <div class="spacer" />
      <el-button size="mini" @click="$router.push('/notice')">返回列表</el-button>
      <el-button size="mini" type="primary" @click="jsonDialogVisible = true">查看权限返回结构</el-button>
    </div>

    <el-alert v-if="!bianhao_0" title="缺少通知单编号，请从列表页进入" type="warning" show-icon style="margin-bottom: 12px;"/>

    <!-- 详情卡片 -->
    <el-card class="detail-card">
      <div slot="header">基础信息</div>
      <el-row :gutter="20">
        <el-col :span="12" v-if="canView('bianhao_0')">
          <div class="field-block">
            <div class="label">通知单编号</div>
            <div class="value">
              <el-tooltip v-if="isControlled('bianhao_0')" content="受控字段" placement="top">
                <el-tag size="mini" type="info" class="control-tag">受控</el-tag>
              </el-tooltip>
              <el-tag v-if="isMasked('bianhao_0')" size="mini" type="danger" class="control-tag">脱敏</el-tag>
              <span>{{ isMasked('bianhao_0') ? maskedValue(detail.bianhao_0, 'bianhao_0') : detail.bianhao_0 }}</span>
            </div>
          </div>
        </el-col>
        <el-col :span="12" v-if="canView('plant')">
          <div class="field-block">
            <div class="label">电厂</div>
            <div class="value">
              <el-tooltip v-if="isControlled('plant')" content="受控字段" placement="top">
                <el-tag size="mini" type="warning" class="control-tag">受控</el-tag>
              </el-tooltip>
              <el-tag v-if="isMasked('plant')" size="mini" type="danger" class="control-tag">脱敏</el-tag>
              <span>{{ isMasked('plant') ? maskedValue(detail.plant, 'plant') : detail.plant }}</span>
            </div>
          </div>
        </el-col>
        <el-col :span="12" v-if="canView('fuzeren_4')">
          <div class="field-block">
            <div class="label">负责人</div>
            <div class="value">
              <el-tooltip v-if="isControlled('fuzeren_4')" content="受控字段" placement="top">
                <el-tag size="mini" type="warning" class="control-tag">受控</el-tag>
              </el-tooltip>
              <el-tag v-if="isMasked('fuzeren_4')" size="mini" type="danger" class="control-tag">脱敏</el-tag>
              <div>{{ isMasked('fuzeren_4') ? maskedValue(detail.fuzeren_4, 'fuzeren_4') : detail.fuzeren_4 }}</div>
            </div>
          </div>
        </el-col>
        <el-col :span="12" v-if="canView('status')">
          <div class="field-block">
            <div class="label">状态</div>
            <div class="value">
              <el-tooltip v-if="isControlled('status')" content="受控字段" placement="top">
                <el-tag size="mini" type="info" class="control-tag">受控</el-tag>
              </el-tooltip>
              <el-tag v-if="isMasked('status')" size="mini" type="danger" class="control-tag">脱敏</el-tag>
              <span>{{ isMasked('status') ? maskedValue(detail.status, 'status') : detail.status }}</span>
            </div>
          </div>
        </el-col>
        <el-col :span="12" v-if="canView('priority')">
          <div class="field-block">
            <div class="label">优先级</div>
            <div class="value">
              <el-tooltip v-if="isControlled('priority')" content="受控字段" placement="top">
                <el-tag size="mini" type="info" class="control-tag">受控</el-tag>
              </el-tooltip>
              <el-tag v-if="isMasked('priority')" size="mini" type="danger" class="control-tag">脱敏</el-tag>
              <span>{{ isMasked('priority') ? maskedValue(detail.priority, 'priority') : detail.priority }}</span>
            </div>
          </div>
        </el-col>
      </el-row>
    </el-card>

    <!-- 权限返回结构弹窗 -->
    <el-dialog title="权限返回结构" :visible.sync="jsonDialogVisible" width="60%" append-to-body v-if="jsonContext">
      <MyJson v-model="jsonContext" :readonly="true" />
      <span slot="footer" class="dialog-footer">
        <el-button @click="jsonDialogVisible = false">关闭</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getFormColPermissions } from './api'
import MyJson from '@/modules/jurisdiction/components/MyJson.vue'
export default {
  name: 'NoticeDetail',
  components: { MyJson },
  data() {
    const bianhao_0 = this.$route.query.bianhao_0 || ''
    return {
      bianhao_0,
      detail: {
        bianhao_0,
        plant: '',
        status: '已创建',
        priority: '中',
        fuzeren_4: ''
      },
      // 控权相关状态
      loading: false,
      entityCode: 'notice_mock',
      fieldAliases: {
        bianhao_0: ['operatorCode'],
        fuzeren_4: ['operatorName']
      },
      permSets: {
        visible: new Set(),
        editable: new Set(),
        control: new Set(),
        masking: new Set()
      },
      permsLoaded: false,
      // 返回结构弹窗
      jsonContext: '',
      jsonDialogVisible: false,
    }
  },
  created() {
    this.mockLoadDetail()
    this.loadPerms()
  },
  methods: {
    mockLoadDetail() {
      if (!this.bianhao_0) return
      const prefixPlant = {
        'NT-202501-001': '华能一厂',
        'NT-202501-002': '华电二厂',
        'NT-202501-003': '国电三厂',
        'NT-202501-004': '大唐四厂'
      }
      this.detail.plant = prefixPlant[this.bianhao_0] || '华能一厂'
      this.detail.fuzeren_4 = '张三'
    },
    async loadPerms() {
      try {
        const resp = await getFormColPermissions([this.entityCode])
        const list = (resp && resp.data && (resp.data.data || resp.data)) || []
        const item = Array.isArray(list) ? list.find(x => x && (x.entityCode === this.entityCode || x.code === this.entityCode)) : null
        const visibleFields = (item && item.visibleFields) || []
        const editableFields = (item && item.editableFields) || []
        const controlFields = (item && item.controlFields) || []
        const dataMaskingFields = (item && item.dataMaskingFields) || []
        this.permSets.visible = new Set( (Array.isArray(visibleFields) ? visibleFields : []).concat(
            Array.isArray(dataMaskingFields) ? dataMaskingFields : []
          ))
        this.permSets.editable = new Set(Array.isArray(editableFields) ? editableFields : [])
        this.permSets.control = new Set(Array.isArray(controlFields) ? controlFields : [])
        this.permSets.masking = new Set(Array.isArray(dataMaskingFields) ? dataMaskingFields : [])
        this.permsLoaded = !!item
        this.jsonContext = JSON.stringify(list, null, 2)
      } catch (e) {
        console.error('拉取控权失败', e)
        this.$message && this.$message.error('拉取控权失败')
      }
    },
    hasAny(set, field) {
      const alias = this.fieldAliases[field]
      if (set.has(field)) return true
      if (!alias) return false
      if (Array.isArray(alias)) {
        return alias.some(a => set.has(a))
      }
      return set.has(alias)
    },
    isControlled(field) {
      if (!this.permsLoaded) return false
      return this.hasAny(this.permSets.control, field)
    },
    canView(field) {
      if (!this.permsLoaded) return true
      const isControlled = this.hasAny(this.permSets.control, field)
      if (!isControlled) return true
      return this.hasAny(this.permSets.visible, field)
    },
    isMasked(field) {
      if (!this.permsLoaded) return false
      if (!this.hasAny(this.permSets.visible, field)) return false
      return this.hasAny(this.permSets.masking, field)
    },
    maskedValue(value, field) {
      if (value == null) return ''
      const str = String(value)
      const lower = field.toLowerCase()
      if (lower.includes('email')) {
        const prefix = str.slice(0, 2)
        const domainIndex = str.indexOf('@')
        if (domainIndex > -1) {
          const domain = str.slice(domainIndex)
          return `${prefix}***${domain}`
        }
        return `${prefix}***`
      }
      if (lower.includes('phone') || /^1\d{10}$/.test(str)) {
        return `${str.slice(0, 3)}****${str.slice(-4)}`
      }
      if (str.length <= 2) return '*'.repeat(str.length)
      return `${str[0]}***${str[str.length - 1]}`
    }
  }
}
</script>

<style scoped>
.notice-detail-container { padding: 16px; }
.header { display: flex; align-items: center; gap: 12px; }
.header .title { font-weight: 600; }
.header .spacer { flex: 1; }
.detail-card { margin-top: 8px; }
.field-block { margin-bottom: 12px; }
.field-block .label { font-weight: 600; margin-bottom: 6px; }
.field-block .value {  align-items: center; gap: 8px; }
.control-tag { margin-bottom: 0; }
</style>
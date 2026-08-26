<!-- 管理页面新增/编辑组件-->
<template>
  <div>
    <el-dialog
      width="640px"
      v-bind="$attrs"
      :visible.sync="_dialogContext.visible"
      close-on-click-modal
      :title="title"
      show-close
      v-dragMove="{
        DragButton: '.el-dialog__header',
        DragWindow: '.el-dialog'
      }"
    >
      <slot
        name="save"
        :data="dialogContext.data"
        :dialogContext="dialogContext"
        :idEdit="dialogContext.isEdit"
      >
        <el-form size="small" label-position="top" label-suffix="：">
          <el-row>
            <slot name="save_prepend" :data="dialogContext.data" />
            <slot
              :name="`save_${header.value}`"
              v-for="header in headers"
              v-if="dialogColShow(header)"
              :data="dialogContext.data"
              :idEdit="dialogContext.isEdit"
              :header="header"
            >
              <el-col :span="12">
                <el-form-item
                  :label="$t($i18nn(header.text))"
                  label-width="100px"
                  :key="`save_${header.value}`"
                >
                  <el-input
                    size="small"
                    v-model="dialogContext.data[header.value]"
                    type="text"
                    :disabled="dialogContext.isEdit && !header.edit"
                  />
                </el-form-item>
              </el-col>
            </slot>
            <slot name="save_append" :data="dialogContext.data" />
          </el-row>
        </el-form>
      </slot>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button size="small" @click="_dialogContext.visible = false">{{
          $t("cm.cancel")
        }}</el-button>
        <el-button type="primary" size="small" @click="$emit('save')">{{
          $t("cm.commit")
        }}</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { sync } from "@/mixins/valueMixin";

export default {
  name: "save_card",
  mixins: [sync("dialogContext", "_dialogContext")],
  props: {
    // 表格数据头配置
    headers: { type: Array, default: () => [] }
  },
  data: () => ({}),
  methods: {
    dialogColShow(header) {
      if (header.id) {
        return header.add ? true : this.dialogContext.isEdit;
      }
      return this.dialogContext.isEdit ? header.edit : header.add;
    }
  },
  computed: {
    title() {
      return this._dialogContext.isEdit
        ? this.$i18nn("i18n:system:edit")
        : this.$i18nn("i18n:system:add");
    }
  }
};
</script>

<style scoped></style>

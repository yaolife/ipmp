<template>
  <div class="cud-commom-form-style">
    <div class="cud__scroll--div">
      <div class="cud-common-header-wrap">
        <img
          src="@/assets/img/formmanageicon.png"
          class="cud-common-title-icon"
        />
        <span class="cud-common-title-text">{{
          $t("sys.interface_account_manage")
        }}</span>
      </div>
      <el-form label-width="110px">
        <el-row type="flex" class="cud-senior-search">
          <el-col :xs="12" :sm="12" :md="8" :lg="8">
            <el-form-item :label="$t('sys.account_id')">
              <el-input
                :placeholder="$t('cm.pleaseEnter')"
                v-model="model.accountId"
                size="small"
              ></el-input>
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="12" :md="10" :lg="8">
            <el-form-item
              :label="$t('sys.belonging_application')"
              prop="systemType"
            >
              <el-select
                class="form-input"
                v-model="model.systemType"
                size="small"
                :clearable="true"
              >
                <el-option
                  v-for="(item, index) in systemTypes"
                  :key="index"
                  :label="item.label"
                  :value="item.value"
                ></el-option>
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :xs="12" :sm="12" :md="6" :lg="8" class="cud--right">
            <el-button type="primary" size="small" @click="search">{{
              $t("cm.search")
            }}</el-button>
            <el-button size="small" @click="resetData">{{
              $t("cm.reset")
            }}</el-button>
          </el-col>
        </el-row>
      </el-form>
      <el-row class="cud__table--list cud__table--list-padding">
        <el-table
          :data="tableData"
          ref="multipleSelection"
          @selection-change="handleSelectionChange"
          v-loading="loading"
          :empty-text="$t('cm.nodata')"
          :max-height="maxTableHeight"
          highlight-current-row
          header-row-class-name="cud-office-table-header"
          class="cud-office-table"
        >
          <el-table-column
            align="center"
            type="index"
            :label="$t('cm.no')"
            width="70"
          ></el-table-column>
          <div style="display:inline-block;" v-if="show">
            <el-table-column
              align="center"
              prop="id"
              width="55"
            ></el-table-column>
            <el-table-column
              align="center"
              prop="accountPw"
              width="55"
            ></el-table-column>
          </div>

          <el-table-column
            align="left"
            prop="accountId"
            :label="$t('sys.account_id')"
          ></el-table-column>
          <el-table-column
            align="center"
            prop="systemType"
            :label="$t('sys.belonging_application')"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.systemType === 1">EDM</span>
              <span v-if="scope.row.systemType === 2">SAP</span>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            prop="accountStatus"
            :label="$t('sys.account_struts')"
          >
            <template slot-scope="scope">
              <span v-if="scope.row.accountStatus === 1">启用</span>
              <span v-if="scope.row.accountStatus === 2">停用</span>
            </template>
          </el-table-column>
          <el-table-column
            align="center"
            prop="accountContent"
            :label="$t('sys.procDesc')"
          ></el-table-column>
          <el-table-column :label="$t('cm.operate')" align="left" width="110">
            <template slot-scope="scope">
              <el-button
                type="text"
                size="small"
                class="cud-common-operate-edit"
                @click="editClick(scope.row)"
              >
                <img
                  src="@/assets/img/commonediticon.png"
                  class="cud-common-operate-edit-pic"
                />{{ $t("cm.edit") }}</el-button
              >
              <el-dropdown trigger="click">
                <div class="cud-commom-operate-expand-wrap">
                  <img
                    src="@/assets/img/moreexpand.png"
                    class="cud-commom-operate-expand"
                  />
                </div>
                <el-dropdown-menu slot="dropdown">
                  <el-dropdown-item>
                    <span @click="delClick(scope.row)">
                      <img
                        src="@/assets/img/commondelicon.png"
                        class="cud-commom-operate-delete-size cud-commom-title-operate-icon cud-commom-operate-size"
                      />{{ $t("cm.delete") }}
                    </span>
                  </el-dropdown-item>
                  <el-dropdown-item>
                    <span @click="saveStartClick(scope.row)">
                      <span v-if="scope.row.accountStatus == '1'">
                        <span
                          class="cud3-icon-blue font_family icon-icon_more_disable"
                        ></span>
                        {{ $t("cm.disable") }}</span
                      >
                      <span v-if="scope.row.accountStatus != '1'">
                        <span
                          class="cud3-icon-blue font_family icon-icon_more_star"
                        ></span>
                        {{ $t("cm.enable") }}</span
                      >
                    </span>
                  </el-dropdown-item>
                </el-dropdown-menu>
              </el-dropdown>
            </template>
          </el-table-column>
        </el-table>
        <el-row>
          <div class="cud-special-pagination">
            <el-button size="small" class="cud__button--search" @click="addAccount">{{
              $t("cm.increase")
            }}</el-button>
            <el-pagination popper-class="cud-pager-dropdown"
              ref="pager"
              class="cud__page"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
              :current-page="current"
              :page-sizes="[10, 20, 30, 40]"
              :page-size="size"
              :pager-count="5"
              layout="total,sizes, prev, pager, next"
              :total="total"
            >
            </el-pagination>
          </div>
        </el-row>
      </el-row>
      <div>
        <el-dialog
          :title="$t('sys.account_config')"
          :visible.sync="configflowDialogVisible"
          width="40%"
          v-dragMove="{
            DragButton: '.el-dialog__header',
            DragWindow: '.el-dialog'
          }"
        >
          <el-form
            ref="itemForm"
            :rules="itemRules"
            :model="flowVO"
            label-width="170px"
          >
            <el-row>
              <el-col :span="20" class="cud__col20">
                <el-form-item :label="$t('sys.account_id')" prop="accountId">
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    maxlength="32"
                    v-model="flowVO.accountId"
                    size="small"
                    class="form-input"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="20" class="cud__col20">
                <el-form-item
                  :label="$t('sys.belonging_application')"
                  prop="systemType"
                >
                  <el-select
                    class="form-input"
                    v-model="flowVO.systemType"
                    size="small"
                    :clearable="true"
                  >
                    <el-option
                      v-for="(item, index) in systemTypes"
                      :key="index"
                      :label="item.label"
                      :value="item.value"
                    ></el-option>
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="20" class="cud__col20">
                <el-form-item
                  :label="$t('sys.account_pw')"
                  prop="accountPw"
                >
                  <el-input
                    :type="inputType"
                    :placeholder="$t('cm.pleaseEnter')"
                    maxlength="32"
                    auto-complete="off"
                    v-model="flowVO.accountPw"
                    size="small"
                  ></el-input>
                </el-form-item>
              </el-col>
              <el-col :span="20" class="cud__col20">
                <el-form-item
                  :label="$t('sys.config_pw')"
                  prop="accountPw1"
                >
                  <el-input
                    :type="inputType1"
                    :placeholder="$t('cm.pleaseEnter')"
                    maxlength="32"
                    auto-complete="off"
                    v-model="flowVO.accountPw1"
                    size="small"
                  >
                  </el-input>
                </el-form-item>
              </el-col>
              <el-col :span="20" class="cud__col20 add_tip_textarea">
                <el-form-item :label="$t('sys.procDesc')">
                  <el-input
                    :placeholder="$t('cm.pleaseEnter')"
                    v-model="flowVO.accountContent"
                    type="textarea"
                    maxlength="255"
                    show-word-limit
                    size="small"
                    class="form-input"
                  ></el-input>
                </el-form-item>
              </el-col>
            </el-row>
            <el-col :span="20" class="cud__col20">
              <el-form-item
                :label="$t('sys.config_start')"
                prop="accountStatusValue"
              >
                <el-checkbox v-model="flowVO.accountStatusValue"></el-checkbox>
              </el-form-item>
            </el-col>
          </el-form>
          <div slot="footer" class="dialog-footer">
            <el-button
              class="cud__button--search"
              size="small"
              @click="saveFlowClick"
              >{{ $t("cm.commit") }}
            </el-button>
            <el-button
              class="cud__button--reset"
              size="small"
              @click="configFlowDialogHandleClose"
              >{{ $t("cm.return") }}</el-button
            >
          </div>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script>
import drafts from "./js/account_manage.js";
export default drafts;
</script>
<style lang="less" scoped>
// @import "src/assets/css/style";
</style>

<template>
  <div class="cud-commom-form-style" @keydown.enter.prevent>
    <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div class="cud__scroll--div">
      <el-card>
        <query-form
          :queryFormId="'email_template'"
          :queryFields="queryFields"
          :loading="loading"
          @resize="initMaxHeight"
          @submit="search"
          ref="queryForm"
          class="cud-commom-form-search"
        >
        </query-form>
      </el-card>
      <el-card>
        <div class="cud__tree--right">
          <!--添加-->
          <div class="table-button">
            <el-button
              type="primary"
              size="small"
              @click="handleAddEngineering"
              v-if="btnShow('engineering_create')"
              >创建</el-button
            >
            <el-button
              size="small"
              type="danger"
              @click="batchDel(tableData)"
              v-if="btnShow('engineering_delete')"
              :disabled="selectnum == '0'"
              >删除</el-button
            >
          </div>
          <div class="cud__table--list">
            <el-row :gutter="10">
              <el-col :span="6" v-for="card in tableData" :key="card.id">
                <el-card class="card">
                  <div class="cardHead">
                    <div class="card-left ellipsis">
                      <el-checkbox
                        class="checkEn"
                        v-model="card.isSelected"
                        @change="handleSelectionChange"
                      ></el-checkbox>
                      <div class="cardName">
                        <el-tooltip
                          :content="card.projectName"
                          popper-class="heihei"
                          :disabled="
                            isDisabled(card.projectName, 14, 'cardName')
                          "
                        >
                          <span
                            class="width: 100%;
    display: inline-block;"
                            @click.stop="handleCard(card)"
                          >
                            {{ card.projectName }}</span
                          >
                        </el-tooltip>
                      </div>
                    </div>
                  </div>
                  <div @click.stop="handleCard(card)" class="height30">
                    <span>工程类型：</span>
                    <el-tooltip
                      :content="getType(card.projectType)"
                      :disabled="isDisabled(card.projectType, 14, 'height30')"
                    >
                      <span class="ellipsis projectType">{{
                        getType(card.projectType)
                      }}</span>
                    </el-tooltip>
                  </div>
                  <div @click.stop="handleCard(card)" class="height30">
                    <span
                      >修改人：{{ getTextWidth(card.modifyUserName, 14) }}</span
                    >
                    <!-- <el-tooltip :content="card.modifyUserName"> -->
                    <span class="ellipsis updateUserName">{{
                      card.modifyUserName
                    }}</span>
                    <!-- </el-tooltip> -->
                  </div>
                  <div @click.stop="handleCard(card)" class="height30">
                    <span>最后修改时间：</span>
                    <!-- <el-tooltip :content="card.updateDateTimeStr"> -->
                    <span class="ellipsis updateTime">{{
                      card.updateDateTimeStr
                    }}</span>
                    <!-- </el-tooltip> -->
                  </div>
                  <div class="cardIcon">
                    <el-button
                      v-if="btnShow('engineering_edit')"
                      class="btn"
                      size="small"
                      @click.stop="handleEditEngineering(card)"
                      >编辑</el-button
                    >
                    <el-button
                      v-if="btnShow('engineering_delete')"
                      size="small"
                      class="btn"
                      @click.stop="delClick(card)"
                      >删除</el-button
                    >
                    <!-- <i
                      class="el-icon-edit"
                      v-if="btnShow('engineering_edit')"
                      @click.stop="handleEditEngineering(card)"
                    ></i> -->
                    <!-- <i
                      class="el-icon-delete"
                      v-if="btnShow('engineering_delete')"
                      @click.stop="delClick(card)"
                    ></i> -->
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </div>
          <el-row>
            <div class="cud-special-pagination cud-special-pagination-button">
              <el-pagination
                popper-class="cud-pager-dropdown"
                class="cud__page float-right"
                @size-change="handleSizeChange"
                @current-change="handleCurrentChange"
                @prev-click="prePage"
                @next-click="nextPage"
                :current-page.sync="currentPage"
                :page-sizes="[12, 20, 30, 40]"
                :page-size="pageSize"
                layout="total,sizes, prev, pager, next"
                :total="total"
                :pager-count="5"
                :disabled="loading"
              >
              </el-pagination>
            </div>
          </el-row>
        </div>
      </el-card>
      <addEngineering
        ref="addEngineeringRef"
        @handleConfirm="resetData"
        :engineeringTypeList="engineeringTypeList"
        :detailObj="detailObj"
        :title="title"
      ></addEngineering>
    </div>
  </div>
</template>

<script>
import engineering from "./js/engineering";
export default engineering;
</script>
<style>
.heihei {
  max-width: 300px;
}
</style>
<style lang="less" scoped>
/deep/ .cud__table--list {
  height: calc(100vh - 317px);
}
/deep/ .el-row {
  height: 100%;
  overflow: auto;
}
// @import "src/assets/css/style";
/deep/ .el-card__body {
  padding: 15px 15px 0;
}
/deep/ .el-input {
  width: 251px;
}
.card {
  border: 1px solid #e6e6e6;
  height: 150px;
  border-radius: 5px;
  padding: 14px 16px;
  cursor: pointer;
  position: relative;

  overflow: hidden;
  &:hover {
    border: 1px solid #ddd;
    box-shadow: 1px 1px 5px #eee;
    .cardName {
      color: #0775db;
    }
    .cardIcon {
      bottom: 0;
    }
  }
  /deep/.el-card__body {
    padding: 0px;
  }
}
.ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex-shrink: 1;
}
.cardHead {
  margin-bottom: 11px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  .card-left {
    // width: calc(100% - 50px);
    width: calc(100% - 0px);
  }
  .el-icon-delete {
    color: #e94848;
  }
  .el-icon-edit {
    color: #0775db;
  }
  .cardName {
    display: inline-block;
    width: calc(100% - 26px);
    font-size: 16px;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: bottom;
  }
}
.cardIcon {
  position: absolute;
  bottom: -34px;
  transition: all 0.3s;
  left: 0;
  width: 100%;
  // width: 45px;
  display: flex;
  cursor: pointer;
  justify-content: center;
  align-items: center;
  background-color: #f6f6f6;
  // align-items: end;
  // height: 24px;
  .btn {
    width: 50%;
    border: 1px solid #f6f6f6;
    &:hover {
      border-color: #0775db !important;
      background-color: #0775db !important;
    }
  }
  i {
    width: 20px;
    height: 20px;
    font-size: 16px;
  }
}
.height30 {
  height: 30px;
  line-height: 30px;
  color: rgb(94, 109, 130);
  display: flex;
  span {
    white-space: nowrap;
  }
}
.checkEn {
  margin-right: 4px !important;
}
</style>

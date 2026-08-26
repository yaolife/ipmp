<template>
  <div class="cud-commom-form-style" v-loading="loading">
    <!-- <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div> -->
    <!-- <div class="cud-process-bg-wrap">
      <div class="cud-process-top-bg"></div>
      <div class="cud-process-bg"></div>
    </div> -->
    <div
      class="cud__scroll--div dict_manage cud-cgn-task-center"
      style="margin: 10px 12px 15px 10px"
    >
      <!-- 发起流程 -->
      <el-tabs
        v-model="activeName"
        @tab-click="handleClick"
        class="dict_tab cgn-task-tabs"
        ref="tabs"
      >
        <el-tab-pane
          :style="{ height: computedTableHeight + 'px', overflowY: 'auto' }"
          :label="$t('workbench.all_process')"
          name="all_process"
        >
          <!-- <div :style="{ 'height': computedTableHeight+'px' }"> -->
          <el-row style="margin-top: 3px ​5px 5px 0">
            <el-col :span="6" class="ml-10">
              <el-input
                type="text"
                size="small"
                style="width: 192px"
                :placeholder="$t('workbench.search_proc_name')"
                v-model="model.procName"
                class="cud-commom-search-ipt el-input-search"
                @keyup.enter.native="commonSearch"
              >
                <el-button
                  type="primary"
                  size="small"
                  slot="append"
                  icon="el-icon-search"
                  style="line-height: 18px; border-radius: 5px"
                  @click="commonSearch"
                ></el-button>
              </el-input>
            </el-col>
          </el-row>
          <div
            v-if="processOdd.length === 0 && processEven.length === 0"
            class="cud-process-empty-text"
          >
            <span>{{ $t("cm.no_init_process") }}</span>
          </div>
          <div v-else>
            <el-col :span="24" class="cud-process-card-wrap">
              <el-card
                :id="item.procCategoryId"
                class="start-flow"
                style="margin: 8px 0px 15px 0px !important"
                v-for="(item, index) in processOdd"
                :key="index"
                :class="{
                  'cud-process-collapse': categoryIds[item.procCategoryId],
                  'cud-process-expaned':
                    categoryIds[item.procCategoryId] === false
                }"
              >
                <div slot="header" class="cud-process-type-header">
                  <span>
                    <span
                      style="font-size: 14px"
                      :class="[
                        family_name,
                        'icon-' + item.procIcon + ' iconColor' + item.procColour
                      ]"
                    ></span>
                    <span
                      style="font-weight: bold; font-size: 14px"
                      class="ml-10"
                      >{{
                        $options.filters.processName(
                          item,
                          $i18n,
                          "procCategoryName",
                          "procCategoryCode"
                        )
                      }}</span
                    >
                    <span
                      style="font-weight: 700; font-size: 14px; color: #999999"
                      >({{ item.processDtoList.length }})</span
                    >
                  </span>
                  <span @click="handleCollapseClick(item.procCategoryId)">
                    <span
                      class="font_family"
                      :class="
                        !categoryIds[item.procCategoryId]
                          ? 'icon-icon_process_retract'
                          : 'icon-icon_process_unfold'
                      "
                    ></span>
                  </span>
                </div>
                <ul
                  style="
                    display: flex;
                    flex-wrap: wrap;
                    width: 100%;
                    justify-content: start;
                  "
                >
                  <li
                    v-for="(fItem, findex) in item.processDtoList"
                    :key="findex"
                    :class="
                      fItem.procId === clickedItemProcId
                        ? 'content-block-item cud-start-oprate content-block-item-current'
                        : 'content-block-item cud-start-oprate'
                    "
                    @click="addShadow(fItem.procId)"
                  >
                    <div class="cud-process-li-left">
                      <div
                        class="mr-10 cud-table-process-pic"
                        :class="[
                          item.process,
                          fItem.isProcBeginDiagram === '1'
                            ? item.color
                            : 'cud-table-process-pic-gray'
                        ]"
                        @click="showFlow(fItem)"
                      >
                        <span class="font_family icon-icon_process"></span>
                      </div>
                      <div
                        class="cud-table-process-describe"
                        @click="procClick(fItem)"
                      >
                        {{
                          $options.filters.processName(
                            fItem,
                            $i18n,
                            "procName",
                            "procNameEn"
                          )
                        }}
                      </div>
                    </div>
                    <el-button
                      style="margin-right: 15px"
                      type="text"
                      :class="
                        !fItem.defProcId
                          ? 'el-icon-star-off'
                          : 'el-icon-star-on'
                      "
                      @click="handleCollect(fItem)"
                    ></el-button>
                  </li>
                </ul>
              </el-card>
            </el-col>

          </div>
          <!-- </div> -->
        </el-tab-pane>
        <!-- 收藏流程 -->
        <el-tab-pane
          v-if="showBtn('my_favorite')"
          :label="$t('workbench.my_favorite')"
          :style="{ height: computedTableHeight + 'px' }"
          name="my_favorite"
        >
          <el-row style="margin-top: 3px ​5px 5px 0">
            <el-col :span="6" class="ml-10">
              <el-input
                type="text"
                style="width: 192px"
                size="small"
                :placeholder="$t('workbench.search_proc_name')"
                v-model="model.procName"
                class="cud-commom-search-ipt el-input-search"
                @keyup.enter.native="commonSearch"
              >
                <el-button
                  type="primary"
                  size="small"
                  slot="append"
                  style="line-height: 18px; border-radius: 5px"
                  icon="el-icon-search"
                  @click="commonSearch"
                >
                </el-button>
              </el-input>
            </el-col>
          </el-row>
          <div
            v-if="favoritesOdd.length === 0 && favoritesEven.length === 0"
            class="cud-process-empty-text"
          >
            <span>{{ $t("cm.no_init_process") }}</span>
          </div>
          <div v-else>
            <el-col :span="24" class="cud-process-card-wrap">
              <div v-for="(item, index) in favoritesOdd" :key="index">
                <el-card
                  class="start-flow"
                  style="margin: 8px 0px 15px 0px !important"
                  v-if="item.processDtoList.length > 0"
                  :class="{
                    'cud-process-collapse': categoryIds[item.procCategoryId],
                    'cud-process-expaned':
                      categoryIds[item.procCategoryId] === false
                  }"
                >
                  <div slot="header" class="cud-process-type-header">
                    <span>
                      <span
                        style="font-size: 14px"
                        :class="[
                          family_name,
                          'icon-' +
                            item.procIcon +
                            ' iconColor' +
                            item.procColour
                        ]"
                      ></span>
                      <span
                        style="font-weight: bold; font-size: 14px"
                        class="ml-10"
                        >{{
                          $options.filters.processName(
                            item,
                            $i18n,
                            "procCategoryName",
                            "procCategoryCode"
                          )
                        }}</span
                      >
                      <span
                        style="
                          font-weight: 700;
                          font-size: 14px;
                          color: #999999;
                        "
                        >({{ item.processDtoList.length }})</span
                      >
                    </span>
                    <span @click="handleCollapseClick(item.procCategoryId)">
                      <span
                        class="font_family"
                        :class="
                          !categoryIds[item.procCategoryId]
                            ? 'icon-icon_process_retract'
                            : 'icon-icon_process_unfold'
                        "
                      ></span>
                    </span>
                  </div>
                  <ul
                    style="
                      display: flex;
                      flex-wrap: wrap;
                      width: 100%;
                      justify-content: start;
                    "
                  >
                    <li
                      v-for="(fItem, findex) in item.processDtoList"
                      :key="findex"
                      :class="
                        fItem.procId === clickedItemProcId
                          ? 'content-block-item cud-start-oprate content-block-item-current'
                          : 'content-block-item cud-start-oprate'
                      "
                      @click="addShadow(fItem.procId)"
                    >
                      <div class="cud-process-li-left">
                        <div
                          class="mr-10 cud-table-process-pic"
                          :class="[
                            item.process,
                            fItem.isProcBeginDiagram === '1'
                              ? item.color
                              : 'cud-table-process-pic-gray'
                          ]"
                          @click="showFlow(fItem)"
                        >
                          <span class="font_family icon-icon_process"></span>
                        </div>
                        <div
                          class="cud-table-process-describe"
                          @click="procClick(fItem)"
                        >
                          {{
                            $options.filters.processName(
                              fItem,
                              $i18n,
                              "procName",
                              "procNameEn"
                            )
                          }}
                        </div>
                      </div>
                      <el-button
                        style="margin-right: 15px"
                        size="small"
                        type="text"
                        :class="
                          !fItem.defProcId
                            ? 'el-icon-star-off'
                            : 'el-icon-star-on'
                        "
                        @click="handleCollect(fItem)"
                      ></el-button>
                    </li>
                  </ul>
                </el-card>
              </div>
            </el-col>
            <!-- <el-col :span="12" class="cud-process-card-wrap">
              <div v-for="(item, index) in favoritesEven" :key="index">
                <el-card
                  class="start-flow"
                  style="margin: 8px 15px 15px 0px"
                  v-if="item.processDtoList.length > 0"
                  :class="{
                    'cud-process-collapse': categoryIds[item.procCategoryId],
                    'cud-process-expaned':
                      categoryIds[item.procCategoryId] === false,
                  }"
                >
                  <div slot="header" class="cud-process-type-header">
                    <span>
                      <span
                        style="font-size: 14px"
                        :class="[
                          family_name,
                          'icon-' +
                            item.procIcon +
                            ' iconColor' +
                            item.procColour,
                        ]"
                      ></span>
                      <span
                        style="font-weight: bold; font-size: 14px"
                        class="ml-10"
                        >{{
                          $options.filters.processName(
                            item,
                            $i18n,
                            "procCategoryName",
                            "procCategoryCode"
                          )
                        }}</span
                      >
                      <span
                        style="
                          font-weight: 700;
                          font-size: 14px;
                          color: #999999;
                        "
                        >({{ item.processDtoList.length }})</span
                      >
                    </span>
                    <span @click="handleCollapseClick(item.procCategoryId)">
                      <span
                        class="font_family"
                        :class="
                          !categoryIds[item.procCategoryId]
                            ? 'icon-icon_process_retract'
                            : 'icon-icon_process_unfold'
                        "
                      ></span>
                    </span>
                  </div>
                  <ul>
                    <li
                      v-for="(fItem, findex) in item.processDtoList"
                      :key="findex"
                      :class="
                        fItem.procId === clickedItemProcId
                          ? 'content-block-item cud-start-oprate content-block-item-current'
                          : 'content-block-item cud-start-oprate'
                      "
                      @click="addShadow(fItem.procId)"
                    >
                      <div class="cud-process-li-left">
                        <div
                          class="mr-10 cud-table-process-pic"
                          :class="[
                            item.process,
                            fItem.isProcBeginDiagram === '1'
                              ? item.color
                              : 'cud-table-process-pic-gray',
                          ]"
                          @click="showFlow(fItem)"
                        >
                          <span class="font_family icon-icon_process"></span>
                        </div>
                        <div
                          class="cud-table-process-describe"
                          @click="procClick(fItem)"
                        >
                          {{
                            $options.filters.processName(
                              fItem,
                              $i18n,
                              "procName",
                              "procNameEn"
                            )
                          }}
                        </div>
                      </div>
                      <el-button
                        size="small"
                        type="text"
                        :class="
                          fItem.defProcId === null ||
                          fItem.defProcId === undefined
                            ? 'el-icon-star-off'
                            : 'el-icon-star-on'
                        "
                        @click="handleCollect(fItem)"
                      ></el-button>
                    </li>
                  </ul>
                </el-card>
              </div>
            </el-col> -->
          </div>
        </el-tab-pane>
        <!-- 最近发起流程 -->
        <el-tab-pane
          v-if="showBtn('commonly_used')"
          :label="$t('workbench.commonly_used')"
          name="commonly_used"
          :style="{ height: computedTableHeight + 'px' }"
        >
          <el-row style="margin-top: 3px ​5px 5px 0">
            <el-col :span="6" class="ml-10">
              <el-input
                type="text"
                size="small"
                style="width: 192px"
                :placeholder="$t('workbench.search_proc_name')"
                v-model="model.procName"
                class="cud-commom-search-ipt el-input-search"
                @keyup.enter.native="commonSearch"
              >
                <el-button
                  size="small"
                  type="primary"
                  style="line-height: 18px; border-radius: 5px"
                  icon="el-icon-search"
                  slot="append"
                  @click="commonSearch"
                >
                </el-button>
              </el-input>
            </el-col>
          </el-row>
          <div
            v-if="commonUseOdd.length === 0 && commonUseEven.length === 0"
            class="cud-process-empty-text"
          >
            <span>{{ $t("cm.no_init_process") }}</span>
          </div>
          <div v-else>
            <el-col :span="24" class="cud-process-card-wrap">
              <div v-for="(item, index) in commonUseOdd" :key="index">
                <el-card
                  class="start-flow"
                  style="margin: 8px 0px 15px 0px !important"
                  v-if="item.processDtoList.length > 0"
                  :class="{
                    'cud-process-collapse': categoryIds[item.procCategoryId],
                    'cud-process-expaned':
                      categoryIds[item.procCategoryId] === false
                  }"
                >
                  <div slot="header" class="cud-process-type-header">
                    <span>
                      <span
                        style="font-size: 14px"
                        :class="[
                          family_name,
                          'icon-' +
                            item.procIcon +
                            ' iconColor' +
                            item.procColour
                        ]"
                      ></span>
                      <span
                        style="font-weight: bold; font-size: 14px"
                        class="ml-10"
                        >{{
                          $options.filters.processName(
                            item,
                            $i18n,
                            "procCategoryName",
                            "procCategoryCode"
                          )
                        }}</span
                      >
                      <span
                        style="
                          font-weight: 700;
                          font-size: 14px;
                          color: #999999;
                        "
                        >({{ item.processDtoList.length }})</span
                      >
                    </span>
                    <span @click="handleCollapseClick(item.procCategoryId)">
                      <span
                        class="font_family"
                        :class="
                          !categoryIds[item.procCategoryId]
                            ? 'icon-icon_process_retract'
                            : 'icon-icon_process_unfold'
                        "
                      ></span>
                    </span>
                  </div>
                  <ul
                    style="
                      display: flex;
                      flex-wrap: wrap;
                      width: 100%;
                      justify-content: start;
                    "
                  >
                    <li
                      v-for="(fItem, findex) in item.processDtoList"
                      :key="findex"
                      :class="
                        fItem.procId === clickedItemProcId
                          ? 'content-block-item cud-start-oprate content-block-item-current'
                          : 'content-block-item cud-start-oprate'
                      "
                      @click="addShadow(fItem.procId)"
                    >
                      <div class="cud-process-li-left">
                        <div
                          class="mr-10 cud-table-process-pic"
                          :class="[
                            item.process,
                            fItem.isProcBeginDiagram === '1'
                              ? item.color
                              : 'cud-table-process-pic-gray'
                          ]"
                          @click="showFlow(fItem)"
                        >
                          <span class="font_family icon-icon_process"></span>
                        </div>
                        <div
                          class="cud-table-process-describe"
                          @click="procClick(fItem)"
                        >
                          {{
                            $options.filters.processName(
                              fItem,
                              $i18n,
                              "procName",
                              "procNameEn"
                            )
                          }}
                        </div>
                      </div>
                      <el-button
                        style="margin-right: 15px"
                        size="small"
                        type="text"
                        :class="
                          fItem.defProcId === null ||
                          fItem.defProcId === undefined
                            ? 'el-icon-star-off'
                            : 'el-icon-star-on'
                        "
                        @click="handleCollect(fItem)"
                      ></el-button>
                    </li>
                  </ul>
                </el-card>
              </div>
            </el-col>
            <!-- <el-col :span="12" class="cud-process-card-wrap">
              <div v-for="(item, index) in commonUseEven" :key="index">
                <el-card
                  class="start-flow"
                  style="margin: 8px 15px 15px 0px; background-color: #fafafa;"
                  v-if="item.processDtoList.length > 0"
                  :class="{
                    'cud-process-collapse': categoryIds[item.procCategoryId],
                    'cud-process-expaned':
                      categoryIds[item.procCategoryId] === false,
                  }"
                >
                  <div slot="header" class="cud-process-type-header">
                    <span>
                      <span
                        style="font-size: 14px"
                        :class="[
                          family_name,
                          'icon-' +
                            item.procIcon +
                            ' iconColor' +
                            item.procColour,
                        ]"
                      ></span>
                      <span
                        style="font-weight: bold; font-size: 14px"
                        class="ml-10"
                        >{{
                          $options.filters.processName(
                            item,
                            $i18n,
                            "procCategoryName",
                            "procCategoryCode"
                          )
                        }}</span
                      >
                      <span
                        style="
                          font-weight: 700;
                          font-size: 14px;
                          color: #999999;
                        "
                        >({{ item.processDtoList.length }})</span
                      >
                    </span>
                    <span @click="handleCollapseClick(item.procCategoryId)">
                      <span
                        class="font_family"
                        :class="
                          !categoryIds[item.procCategoryId]
                            ? 'icon-icon_process_retract'
                            : 'icon-icon_process_unfold'
                        "
                      ></span>
                    </span>
                  </div>
                  <ul>
                    <li
                      v-for="(fItem, findex) in item.processDtoList"
                      :key="findex"
                      :class="
                        fItem.procId === clickedItemProcId
                          ? 'content-block-item cud-start-oprate content-block-item-current'
                          : 'content-block-item cud-start-oprate'
                      "
                      @click="addShadow(fItem.procId)"
                    >
                      <div class="cud-process-li-left">
                        <div
                          class="mr-10 cud-table-process-pic"
                          :class="[
                            item.process,
                            fItem.isProcBeginDiagram === '1'
                              ? item.color
                              : 'cud-table-process-pic-gray',
                          ]"
                          @click="showFlow(fItem)"
                        >
                          <span class="font_family icon-icon_process"></span>
                        </div>
                        <div
                          class="cud-table-process-describe"
                          @click="procClick(fItem)"
                        >
                          {{
                            $options.filters.processName(
                              fItem,
                              $i18n,
                              "procName",
                              "procNameEn"
                            )
                          }}
                        </div>
                      </div>
                      <el-button
                        size="small"
                        type="text"
                        :class="
                          fItem.defProcId === null ||
                          fItem.defProcId === undefined
                            ? 'el-icon-star-off'
                            : 'el-icon-star-on'
                        "
                        @click="handleCollect(fItem)"
                      ></el-button>
                    </li>
                  </ul>
                </el-card>
              </div>
            </el-col> -->
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
    <el-dialog
      class="task-dialog task-submit-dialog body-fullscreen-dialog"
      :title="$t('cgnTask.operate.viewFlowChart')"
      append-to-body
      :withHeader="false"
      :visible.sync="configflowDialogVisible"
      :fullscreen="true"
      direction="rtl"
      destroy-on-close
      :close-on-press-escape="false"
      :wrapperClosable="false"
      v-dragMove="{
        DragButton: '.el-dialog__header',
        DragWindow: '.el-dialog'
      }"
    >
      <!-- <div class="cud-inter-define-title">
      <span><img src="@/assets/img/flowview.png" class="cud-define-pic"><span class="cud-define-text">{{$t('workbench.show_flow')}}</span></span>
      <i class="el-icon-close cud-interdrawer-close" @click="configflowDialogVisible = false"></i>
    </div> -->
      <!-- 查看流程图模式 为支持多语言，把原先的设计图改成运行图 -->
      <cgn-bpmn-map
        ref="bpmn"
        v-bind="flowVO"
        @elementEvent="onElementEvent"
        v-if="configflowDialogVisible"
      >
      </cgn-bpmn-map>
    </el-dialog>
  </div>
</template>

<script>
import start from "./js/start.js";
export default start;
</script>
<style lang="less" scoped>
// @import "src/assets/css/style";
// .dict_manage .el-table .cell{
//   padding: 0;
// }
// .el-table .el-tag{
//   padding: 0;
//   width: 60px;
//   text-align: center;
// }
.start-flow {
  box-shadow: initial !important;
  // background: #f7f8fa !important;
  border-radius: 5px !important;
  background-color: #fafafa;
}
// .cud-cm-config-left {
//   margin-top: 40px;
// }

.el-dialog {
  overflow: auto;
}
.tab-body-content-wrapper {
  position: relative;
  width: 100%;
  margin-top: 50px;
  border-top: 1px solid #ccc;
  box-sizing: border-box;
  font-weight: 100;
}
.tab-body-content-filters {
  position: absolute;
  top: -44px;
  right: 0;
  height: 40px;
  box-sizing: border-box;
  display: flex;
}
.filter {
  display: inline-block;
  margin: 0 0 0 4px;
  padding: 2px;
  height: 30px;
  width: 120px;
  border: 1px solid #333333;
  border-radius: 4px;
}
.tab-body-content {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  padding: 10px 0 0 0;
  box-sizing: border-box;
}
.content-block {
  margin: 4px;
  padding: 0;
  box-sizing: border-box;
  border-radius: 6px;
  box-shadow: 0px 0px 2px #ccc;
  width: calc(50% - 8px);
}
.content-block-title {
  margin: 0;
  padding: 4px 10px;
  border-bottom: 1px solid #ccc;
  font-size: 20px;
  color: #333;
  line-height: 2;
}
.content-block-item-wrapper {
  height: 300px;
  overflow: auto;
}
.content-block-item:hover {
  border: 1px solid #0775DB;
  .cud-table-process-describe {
    color: #0775DB;
  }
}
.content-block-item {
  height: 56px;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  line-height: 16px;
  font-size: 0;
  margin-bottom: 15px;
  background-color: #ffffff;
  border: 1px solid #eaedf7;
  border-radius: 5px;
  width: calc(33% - 10px);
  margin-right: 15px;
  // padding: 0 15px;
  .cud-process-li-left {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    width: 90%;
    .cud-table-process-pic {
      // margin: 0 10px 0 0;
      // flex-shrink: 0;
      // width: 24px;
      // height: 24px;
      // line-height: 24px;
      // border-radius: 50%;
      // margin: 0 auto;
      // background: #F2F7FB;
      // border: 1px solid #BFD9EA;
      // cursor: initial;
      // text-align: center;
      width: 30px;
      min-width: 30px;
      height: 30px;
      line-height: 30px;
      border-radius: 6px;
      /* margin: 0 auto; */
      text-align: center;
      margin-left: 15px;
      cursor: pointer;
    }
    .cud-table-process-describe {
      margin-left: 10px;
      font-size: 16px;
      cursor: pointer;
      width: 360px;
      text-overflow: -o-ellipsis-lastline;
      overflow: hidden; //溢出内容隐藏
      text-overflow: ellipsis; //文本溢出部分用省略号表示
      display: -webkit-box; //特别显示模式
      -webkit-line-clamp: 2; //行数
      line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  }
  flex-shrink: 0;
  .cud-process-icon {
    margin-left: 10px;
  }
}
.content-block-item:nth-child(3n) {
  margin-right: 0;
}
.content-block-item-current {
  // box-shadow: 0px 5px 10px 0px rgba(0,74,134,0.4);
}

.content-block-item-icon {
  display: inline-block;
  margin: 0 0 0 10px;
  width: 20px;
  height: auto;
}
.content-block:nth-child(1) .content-block-item-icon {
  fill: #000fff;
}

.content-block:nth-child(2) .content-block-item-icon {
  fill: #00ff00;
}

.content-block:nth-child(3) .content-block-item-icon {
  fill: #8a00ff;
}

.content-block:nth-child(4) .content-block-item-icon {
  fill: #ffd900;
}

.content-block:nth-child(5) .content-block-item-icon {
  fill: #00cbff;
}
.content-block:nth-child(6) .content-block-item-icon {
  fill: #ff0000;
}
.content-block-item-name {
  position: relative;
  display: inline-block;
  margin: 0 0 0 10px;
  padding-right: 30px;
  font-size: 14px;
}
.cud-process-bg-wrap {
  position: relative;
  height: 138px;
  margin-bottom: -118px;
  .cud-process-top-bg {
    background-image: url("~@/assets/img/officebg.png");
    background-repeat: no-repeat;
    background-size: cover;
    width: 100%;
    height: 138px;
    position: absolute;
  }
  .cud-process-bg {
    width: 100%;
    height: 138px;
    background-image: linear-gradient(
      to top,
      rgba(255, 255, 255, 1),
      rgba(255, 255, 255, 0)
    );
    position: absolute;
    z-index: 1;
  }
}
.cud-process-wrap {
  position: relative;
  z-index: 2;
}
.el-tabs__content {
  background: white;
}
.cud-process-type-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.cud-process-type-icon {
  display: inline-block;
  margin-right: 8px;
}
.cud-process-type-icon-img {
  width: 16.5px;
  height: 16.5px;
}
.cud-process-card-wrap {
  /deep/ .el-card__header {
    // border-bottom: unset;
    border-bottom: 0;
  }
  /deep/ .el-card__body {
    padding-top: 0;
  }
  ul {
    padding: 0;
    margin: 0;
    list-style: none;
  }
}
.cud-process-collapse {
  .el-card__body {
    animation: move 0.2s;
    animation-fill-mode: forwards;
    animation-timing-function: linear;
    // 因为上述在ie不生效所以改height:0
    // animation: expand 0.2s;
    height: 0;
  }
  overflow: hidden;
  height: 40px;
}
@keyframes move {
  0% {
    height: calc(100% - 61.75px);
    padding-bottom: 20px;
  }
  50% {
    height: calc(50%- 61.75px);
    padding-bottom: 10px;
  }
  100% {
    height: 0;
    padding-bottom: 0;
  }
}
.cud-process-expaned {
  .el-card__body {
    animation: expand 0.2s;
    animation-fill-mode: forwards;
  }
}
@keyframes expand {
  0% {
    height: 0;
    padding-bottom: 0;
  }
  50% {
    height: calc(50%- 61.75px);
    padding-bottom: 10px;
  }
  100% {
    height: auto;
    padding-bottom: 20px;
  }
}
.cud-process-query-input {
  width: 240px;
  margin: 0 10px;
}
.cud-process-empty-text {
  margin: 20px;
}
.cud-process-toggle {
  font-size: 20px;
  color: #0069ac;
  cursor: pointer;
}
.iconColor00AAE8 {
  color: #00aae8 !important;
}
.iconColor0C7BCA {
  color: #0c7bca !important;
}
.iconColor0069AC {
  color: #0069ac !important;
}
.iconColor609819 {
  color: #609819 !important;
}
.iconColorEC6C00 {
  color: #ec6c00 !important;
}
/deep/ .el-tabs__active-bar {
  width: 30px !important;
  left: 52px;
}
/deep/ .cud-cgn-task-center .cgn-task-tabs .el-tabs__content {
  padding: 25px 15px 0;
}
</style>

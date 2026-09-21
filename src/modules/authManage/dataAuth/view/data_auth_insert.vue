<template>
  <div class="cud-commom-form-style">
    <div class="cud__scroll--div">
          <div class="cud-commom-form-style">
            <div class="brand">
              <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
            </div>
            <div class="cud__scroll--div">
              <el-card :style="'height: ' + maxTableHeight + 'px'">
                <el-form label-width="120px" label-position="left" label-suffix=":" :model="addDataAuth" ref="role" :rules="roleRules">
                  <el-row type="flex" justify="center" class="cud__mtb-10">
                    <el-col :span="24">
                      <el-row :gutter="20">
                        <!-- <el-col :span="10">
                          <el-form-item :label="$t('dataAuth.role_group')" prop="roleGroupId" label-width="130px">
                            <el-select v-model="addDataAuth.roleGroupId" :placeholder="$t('cm.pselect')"
                              @change="handleChangeRoleGroup" :disabled="isdisabled" size="small">
                              <el-option v-for="item in roleGroupList" :key="item.roleGroupCode"
                                :label="item.roleGroupName" :value="item.roleGroupCode">
                              </el-option>
                            </el-select>
                          </el-form-item>
                        </el-col> -->
                        <el-col :span="10">
                          <el-form-item :label="$t('dataAuth.selectapplication')" prop="appId" label-width="130px">
                            <el-select v-model="addDataAuth.appId" :placeholder="$t('cm.pselect')" @change="handleChangeApp" :disabled="isdisabled" size="small">
                              <el-option v-for="item in appList" :key="item.appId" :label="item.appName" :value="item.appId">
                              </el-option>
                            </el-select>
                          </el-form-item>
                        </el-col>
                        <el-col :span="10">
                          <el-form-item :label="$t('dataAuth.role_person')" prop="roleId">
                            <el-select v-model="addDataAuth.roleId" :placeholder="$t('cm.pselect')" @change="checkRole" size="small" :disabled="isdisabled">
                              <el-option v-for="item in roleList" :key="item.roleId" :label="item.roleName"
                                :value="item.roleId">
                              </el-option>
                            </el-select>
                          </el-form-item>
                        </el-col>
                      </el-row>
                      <el-row :gutter="20">
                        <el-col :span="10">
                          <el-form-item :label="$t('dataAuth.begin_time')" label-width="130px">
                            <el-date-picker size="small" prop="dataAuthTime" v-model="dataAuthTime" type="daterange"
                              range-separator="至" format="yyyy 年 MM 月 dd 日"
                              start-placeholder="开始日期" end-placeholder="结束日期">
                            </el-date-picker>
                          </el-form-item>
                        </el-col>
                      </el-row>

                      <el-row class="cud__mtb-10 select_item">
                        <el-col>
                          <el-button size="small" type="primary" @click="showSelectRole = true">选择人员/组织</el-button>
                        </el-col>
                      </el-row>

                      <el-row type="flex" class="cud__mtb-10">
                        <el-col>
                          <div class="select_item">
                            <strong>{{ $t("dataAuth.person") }}:</strong>&nbsp;&nbsp;
                            <span v-for="(item,index) in userData"
                              :key="index">{{item.userNum+'-'+item.userName }}&nbsp;;&nbsp;</span>
                          </div>
                          <div class="select_item">
                            <strong>{{ $t("dataAuth.organization") }}:</strong>&nbsp;&nbsp;
                            <span v-for="(item,index) in orgData"
                              :key="index">{{item.orgNum+'-'+item.orgName }}&nbsp;;&nbsp;</span>
                          </div>
                          <!-- <div class="select_item">
                            <strong>{{ $t("dataAuth.group") }}:</strong>&nbsp;&nbsp;<span v-for="item in groupData"
                              :key="item.id">{{ item.participantName }};</span>
                          </div>
                          <div class="select_item">
                            <strong>{{ $t("dataAuth.post") }}:</strong>&nbsp;&nbsp;<span v-for="item in stationData"
                              :key="item.postCode">{{ item.postName }};</span>
                          </div> -->
                        </el-col>
                      </el-row>
                      <el-row>
                        <el-col> </el-col>
                      </el-row>
                      <!-- <el-row class="cud__mtb-10 select_item">
                        <el-col :span="4">
                          <el-button size="small" @click="selectDataRule">{{$t("dataAuth.select_data_rule")}}</el-button>
                        </el-col>
                      </el-row> -->
                      <!-- <el-row type="flex">
                        <el-col :span="7" :offset="1">
                          <el-tree v-loading="treeLoading" :data="treedata" :props="defaultProps" highlight-currentx
                            @node-click="saveTreeNodeData" node-key="id" ref="tree">
                            <span class="custom-tree-node" slot-scope="{ node,data }">
                              <span>{{ node.label }}</span>
                              <span>
                                <el-radio-group v-model="data.value">
                                  <el-radio label="1">全数据通用</el-radio>
                                  <el-radio label="2">选数据规则</el-radio>
                                </el-radio-group>
                              </span>
                            </span>
                          </el-tree>
                        </el-col>
                        <el-col :span="15" :offset="1">
                          <el-table :data="treeTableData.data" v-loading="tabelLoading">
                            <el-table-column :label="$t('dataAuth.data_rule_name')" prop="ruleName" width="200">
                            </el-table-column>
                            <el-table-column :label="$t('dataAuth.data_rule_code')" prop="ruleDisplayContent"
                              width="200"></el-table-column>
                            <el-table-column :label="$t('dataAuth.data_rule_show')">
                              <template slot-scope="scope">
                                <span v-for="(item,index) in scope.row.ruleOriginalContent" :key="index">
                                  (<span v-for="(info,index2) in item.ruleName " :key="index2">{{info.label}}:
                                    <span>&nbsp;{{info.value}}&nbsp;</span>
                                    <span v-if="item.ruleName.length-1!==index2">&nbsp;{{'&&'}}&nbsp;</span>
                                  </span>)
                                  <span v-if="scope.row.ruleOriginalContent.length-1!==index">&nbsp;||&nbsp;</span>
                                </span>
                              </template>
                            </el-table-column>
                            <el-table-column align="center" :label="$t('cm.operate')" width="120">
                              <template slot-scope="scope">
                                <el-button type="text" size="small" @click="delRow(scope.row)">{{ $t("cm.delete") }}
                                </el-button>
                              </template>
                            </el-table-column>
                          </el-table>
                        </el-col>
                      </el-row> -->
                      <el-row class="cud__mtb-10">
                        <el-form-item :label="$t('dataAuth.auth_description')">
                          <el-input size="small" :placeholder="$t('cm.pleaseEnter')" v-model="addDataAuth.remark">
                          </el-input>
                        </el-form-item>
                      </el-row>
                    </el-col>
                  </el-row>
                </el-form>
                <div class="cud-examine-tool">
                  <el-row style="position: relative; left: 95%; transform: translateX(-95%);">
                    <el-button size="small" @click="closeInsert('role')">{{ $t("cm.cancel") }}</el-button>
                    <el-button size="small" type="primary" @click="insert">{{ $t("cm.commit") }}
                    </el-button>
                  </el-row>
                </div>
              </el-card>
            </div>
          </div>
        </div>

    <el-dialog width="50%" :visible.sync="showSelectRole" :destory-on-close="true" :before-close="closeCreatorFunc" :title="$t('dataAuth.select_person')">
      <!-- 这里直接关闭或取消操作，直接销毁，下次打开重新初始化 -->
      <selectDataRule ref="selectDataRule" :initUserId="initUserId" :initOrgList="initOrgList" v-if="showSelectRole" />
      <div slot="footer" class="dialog-footer" align="center">
        <el-button size="small" @click="closeCreatorFunc">{{ $t("cm.cancel") }}</el-button>
        <el-button size="small" type="primary" @click="commitActParticipantFunc">{{ $t("cm.commit") }}</el-button>
      </div>
    </el-dialog>
    <el-dialog width="80%" :visible.sync="showSelectDataRule">
      <el-row>
        <el-table :data="dataRule.records" @selection-change="handleSelectionChange">
          <el-table-column type="selection" width="55"> </el-table-column>
          <el-table-column :label="$t('dataAuth.data_rule_name')" prop="ruleName" width="200"></el-table-column>
          <el-table-column :label="$t('dataAuth.data_rule_code')" prop="ruleDisplayContent" width="300">
          </el-table-column>
          <el-table-column :label="$t('dataAuth.data_rule_show')" show-overflow-tooltip>
            <template slot-scope="scope">
              <span v-for="(item,index) in scope.row.ruleOriginalContent" :key="index">
                (<span v-for="(info,index2) in item.ruleName " :key="index2">{{info.label}}:
                  <span>&nbsp;{{info.value}}&nbsp;</span>
                  <span v-if="item.ruleName.length-1!==index2">&nbsp;{{'&&'}}&nbsp;</span>
                </span>)
                <span v-if="scope.row.ruleOriginalContent.length-1!==index">&nbsp;||&nbsp;</span>
              </span>
            </template>
          </el-table-column>

        </el-table>
      </el-row>
      <div slot="footer" class="dialog-footer" align="center">
        <el-button size="small" @click="showSelectDataRule = false">{{ $t("cm.cancel") }}</el-button>
        <el-button size="small" type="primary" @click="saveRoleData">{{ $t("cm.commit") }}</el-button>
      </div>
      <el-row>
        <div class="cud-special-pagination">
          <el-pagination popper-class="cud-pager-dropdown" ref="pager" class="cud__page" @size-change="changeSize" @current-change="changeCurrentPage"
            :current-page="queryData.pageIndex" :page-sizes="[10, 20, 30, 40]" :page-size="queryData.pageSize"
            layout="total, sizes, prev, pager, next, jumper" :total="dataRule.total">
          </el-pagination>
        </div>
      </el-row>
    </el-dialog>
  </div>
</template>

<script>
  import data_auth_insert from "../js/data_auth_insert";
  export default data_auth_insert;
</script>

<style>
  .select_item {
    /*margin-left: 30px;*/
    word-break: all;
    line-height: 40px;
  }

  .custom-tree-node {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 14px;
    padding-right: 8px;
  }
</style>

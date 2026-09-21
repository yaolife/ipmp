<template>
  <div>
    <el-dialog :before-close="cancelRouter" :close-on-click-modal="false" :close-on-press-escape="false" :title="$t('wm.route_binding')"
               :visible.sync="dialogVisible"
               append-to-body class="active-router"
               width="70%">
      <el-main style="background-color: white">
        <el-form size="small" label-position="top" label-suffix="：" label-width="80px">
          <el-row>
            <el-col :span="20">
              <el-form-item :label="$t('wm.rule_name')" prop="">
                <el-select @change="selectChange" :placeholder="$t('cm.pleaseSelect')" v-model="wfRuleMasterId">
                  <el-option
                    :key="item.wfRuleMasterId"
                    :label="item.ruleName"
                    :value="item.wfRuleMasterId"
                    v-for="item in options">
                  </el-option>
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="4" class="cud--right pt-30">
              <!--新增规则按钮暂时隐藏-->
              <el-button type="primary" @click="addRuleClick" size="small" v-if="false" round>新增规则</el-button>
            </el-col>
          </el-row>
          <div v-if="wfRuleMasterId !== ''">
            <el-row>
              <el-col :span="20">
                <el-form-item :label="$t('wm.rule_desc')">
                  <span>{{ruleDescribe}}</span>
                </el-form-item>
              </el-col>
              <el-col :span="4">
                &nbsp;
              </el-col>
            </el-row>
            <el-row class="cud__mlr-20 cud__mtb-10">
              <el-col :span="6" style="border: 3px solid #F4F6F9;height: 500px;margin-right: 20px;border-radius: 20px;">
                  <el-tree
                    :allow-drop="allowDrop"
                    :data="modelTreeData"
                    :empty-text="$t('cm.nodata')"
                    :expand-on-click-node="false"
                    :props="defaultModelProps"
                    @node-click="modelDataClick"
                    @node-drag-end="handleDragend"
                    @node-drag-start="handleDragStart"
                    default-expand-all
                    draggable
                    node-key="id"
                    ref="tree"
                    style="height: 400px;overflow-y: auto"
                    class="cud__mlr-10 cud__mtb-10"
                    v-bind:key="id"
                  >
                        <span class="custom-tree-node" slot-scope="{data}">
                          <span :title="data.label"
                                @click.stop="modelDataClick(data)" style="font-size: 10px">
                            {{data.label}}
                          </span>
                        </span>
                  </el-tree>
              </el-col>
              <el-col :span="17" style="border: 3px solid #F4F6F9;height: 500px;border-radius: 20px;">
                <div class="container cud__mlr-10 cud__mtb-10">
                  <!--表格部分-->
                  <el-row class="cud__table--list">
                    <el-col>
                      <div style="margin-bottom: 10px;font-size: 20px">{{$t('wm.map')}}：</div>
                      <table class="rule-binding__table">
                        <tr>
                          <th width="200" class="left-radius">{{$t('wm.rule_param')}}</th>
                          <th>{{$t('wm.field')}}</th>
                          <th width="100" class="right-radius">{{$t('cm.operate')}}</th>
                        </tr>
                        <tr :key="index" v-for="(item, index) in roleParam">
                          <td>{{item.mockName}}</td>
                          <td>
                            <el-input :readonly="true" @focus="inputFocus(index)" size="small" v-model="item.bindingParam.paramName"></el-input>
                          </td>
                          <td>
                            <el-button @click="clearBinding(index)" icon="el-icon-delete" type="text"></el-button>
                          </td>
                        </tr>
                      </table>

                      <!-- <div style="line-height: 30px">
                        <el-row>
                          <el-col :span="12" style="border: 1px #dfe0e4 solid;height: 35px">{{$t('wm.rule_param')}}</el-col>
                          <el-col :span="12" style="border: 1px #dfe0e4 solid;height: 35px">{{$t('wm.field')}}</el-col>
                        </el-row>
                        <el-row :key="index" v-for="(item, index) in roleParam">
                          <el-col :span="12" style="border: 1px #dfe0e4 solid;height: 35px">{{item.mockName}}
                          </el-col>
                          <el-col :span="11" style="border: 1px #dfe0e4 solid;height: 35px">
                            <el-input :readonly="true" @focus="inputFocus(index)" class="paramInput"
                                      v-model="item.bindingParam.paramName"></el-input>
                          </el-col>
                          <el-col :span="1">
                            <el-button @click="clearBinding(index)" icon="el-icon-delete" style="height: 35px"
                                       type="text"></el-button>
                          </el-col>
                        </el-row>
                      </div> -->
                    </el-col>
                  </el-row>
                </div>
              </el-col>
            </el-row>
          </div>
        </el-form>
      </el-main>
      <div align="center" class="dialog-footer" slot="footer">
        <el-button @click="cancelRouter" round> {{$t('cm.cancel')}}
        </el-button>
        <el-button @click="routerSubmit" type="primary" round>{{$t('cm.confirm')}}
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
  import ruleBinding from './js/ruleBinding'
  export default ruleBinding
</script>

<style lang="less">
  .paramInput .el-input__inner {
    height: 32px;
    border-bottom: 0;
    border-top: 0;
    border-right: 0;
    border-left: 0;
    border-radius: 0px;
  }
  .rule-binding__table {
    // border: 1px solid rgb(238, 238, 238);
    width: 100%;
  }
  .rule-binding__table tr th {
    background-color: #F2F7FB;
    height: 40px;
    text-align: left;
    padding: 0px 20px;
  }
  .left-radius {
    border-radius: 20px 0 0 20px;
  }
  .right-radius {
    border-radius: 0 20px 20px 0;
  }
  .rule-binding__table tr td {
    height: 50px;
    min-height: 50px;
    min-width: 50px;
    position: relative;
    box-sizing: border-box;
    padding: 0px 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  }
  .rule-binding__th {
    border: 1px solid rgb(238, 238, 238);
    width: 30%;
  }
</style>

<template>
  <div class="cud-bg-blue">
    <div class="cud-form-detail-full" style="border-radius: initial">
      <div class="cud-commom-form-style">
        <el-card>
          <el-steps :active="step-1" align-center class="standard">
            <el-step :class="step==1?'current':''" :title="$t('hc.http_basic_info')" description=""></el-step>
            <el-step :class="step==2?'current':''" :title="$t('hc.http_action')" description=""></el-step>
            <el-step :class="step==3?'current':''" :title="$t('hc.http_response')" description=""></el-step>
          </el-steps>
        </el-card>
        <!--基本信息-->
        <el-form label-width="180px" label-suffix="：" label-position="top" :model="model1" :rules="rules1" ref="model1"
          v-if="step == 1">
          <el-card class="box-card-20">
            <div class="basic-info" :style="'min-height: ' + minHeight + 'px'">
              <el-row>
                <el-col :span="24">
                  <el-form-item :label="$t('hc.http_name')" prop="name">
                    <el-input v-model="model1.name" :placeholder="$t('hc.http_name_msg')" maxlength="128" size="small"
                      :clearable="true"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item :label="$t('hc.http_description')">
                    <el-input type="textarea" rows="4" v-model="model1.description"
                      :placeholder="$t('hc.http_description_msg')" size="small" :clearable="true"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="24">
                  <el-form-item :label="$t('hc.http_domain')" prop="domain">
                    <el-input v-model="model1.domain" :placeholder="$t('hc.http_domain_msg')" size="small"
                      :clearable="true">
                      <template slot="prepend">{{
                        model1.protocol == "0" ? "http://" : "https://"
                      }}</template>
                    </el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="$t('hc.http_protocol')" prop="protocol">
                    <el-radio-group v-model="model1.protocol">
                      <el-radio label="0">HTTP</el-radio>
                      <el-radio label="1">HTTPS</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="'BaseURL'" prop="baseUrl">
                    <el-input v-model="model1.baseUrl" :placeholder="$t('hc.http_base_url_msg')" size="small"
                      :clearable="true"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row>
                <el-col :span="12">
                  <el-form-item :label="$t('hc.http_data_type')" size="small">
                    <el-radio-group v-model="model1.interfaceType">
                      <el-radio :label="1">JSON</el-radio>
                      <el-radio :label="2">SOAP</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="12" v-if="model1.interfaceType == 2">
                  <el-form-item :label="$t('hc.http_soap_type')" size="small">
                    <el-radio-group v-model="model1.soapType">
                      <el-radio :label="1">SOAP 1.1</el-radio>
                      <el-radio :label="2">SOAP 1.2</el-radio>
                    </el-radio-group>
                  </el-form-item>
                </el-col>
                <el-col :span="12" v-else>
                  <el-form-item :label="$t('hc.http_auth_type')" prop="authType" size="small">
                    <el-select v-model="model1.authType" :placeholder="$t('cm.pselect')">
                      <el-option :label="$t('hc.http_auth_type_0')" value="0"></el-option>
                      <el-option :label="$t('hc.http_auth_type_3')" value="3"></el-option>
                      <el-option :label="$t('hc.http_auth_type_1')" value="1"></el-option>
                      <el-option :label="$t('hc.http_auth_type_2')" value="2"></el-option>
                    </el-select>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-row v-if="model1.authType == 2 && model1.interfaceType == 1">
                <el-col :span="12">
                  <el-form-item :label="$t('hc.http_username')" prop="username">
                    <el-input v-model="model1.username" :placeholder="$t('hc.http_username_msg')" size="small"
                      :clearable="true"></el-input>
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item :label="$t('hc.http_pw')" prop="password">
                    <el-input type="password" v-model="model1.password" :placeholder="$t('hc.http_pw_msg')"
                      size="small" :clearable="true"></el-input>
                  </el-form-item>
                </el-col>
              </el-row>
            </div>
          </el-card>
        </el-form>
        <!--执行动作-->
        <el-form label-width="180px" label-suffix="：" label-position="top" :model="model2" :rules="rules2" ref="model2"
          v-if="step == 2">
          <el-card>
            <div class="action-info" :style="'min-height: ' + minHeight + 'px'">
              <el-row>
                <el-col :span="5">
                  <el-row>
                    <el-button size="small" type="primary" class="action_button" @click="addAction()" plain>
                      <i class="el-icon-plus"></i>
                      {{ $t("hc.http_action_add") }}
                    </el-button>
                    <el-button size="small" v-for="(action, index) in actionList" :key="index"
                      @click="changeAction(index)" :type="index == actionIndex ? 'primary' : ''" class="action_button">
                      {{ action.actionName }}
                    </el-button>
                  </el-row>
                </el-col>
                <el-col :span="18" :offset="1">
                  <el-row class="action_title">
                    <el-col :span="20">
                      <h2>{{ model2.actionName }}&nbsp;</h2>
                    </el-col>
                    <el-col :span="4" align="right" style="padding-right: 20px;">
                      <el-button type="danger" @click="delAction(actionIndex)" size="small">
                        <i class="el-icon-delete"></i>
                        {{ $t("hc.http_action_del") }}
                      </el-button>
                    </el-col>
                  </el-row>
                  <el-row style="margin-top: 20px;">
                    <el-col :span="12">
                      <el-form-item :label="$t('hc.http_action_id')" prop="actionId">
                        <el-input v-model="model2.actionId" :placeholder="$t('hc.http_action_id_msg')" size="small" maxlength="20"
                          :clearable="true" :disabled="model2.isEdit"></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="12">
                      <el-form-item :label="$t('hc.http_action_name')" prop="actionName">
                        <el-input v-model="model2.actionName" :placeholder="$t('hc.http_action_name_msg')" size="small" maxlength="50"
                          :clearable="true"></el-input>
                      </el-form-item>
                    </el-col>
                    <el-col :span="24">
                      <el-form-item :label="$t('hc.http_action_desc')" prop="actionDesc">
                        <el-input type="textarea" rows="3" v-model="model2.actionDesc"
                          :placeholder="$t('hc.http_action_desc_msg')" size="small" :clearable="true"></el-input>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <el-row>
                    <el-col :span="24">
                      <el-form-item :label="$t('hc.http_action_url')" prop="actionUrl">
                        <el-input v-model="model2.actionUrl" @change="getParam()"
                          :placeholder="$t('hc.http_action_url_msg')" maxlength="128" size="small" :clearable="true">
                          <template slot="prepend">
                            {{ model1.protocol == "0" ? "http://" : "https://"}}{{ model1.domain }}{{ model1.baseUrl }}
                          </template>
                        </el-input>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <!--SOAP连接器设置-->
                  <el-row v-if="model1.interfaceType == 2">
                    <el-col :span="24">
                      <el-form-item :label="$t('hc.http_param_header')">
                        <!--Header参数-->
                        <el-table :data="model2.headerParams" v-if="model2.headerParams.length > 0">
                          <el-table-column :label="$t('hc.http_param_name')" min-width="200">
                            <template slot-scope="scope">
                              <el-form-item :prop="'headerParams.' + scope.$index + '.name'" :rules="rules2.paramName">
                                <el-input v-model="scope.row.name" :placeholder="$t('hc.http_param_name_msg')" size="small"></el-input>
                              </el-form-item>
                            </template>
                          </el-table-column>
                          <el-table-column :label="$t('hc.http_param_value')" min-width="300">
                            <template slot-scope="scope">
                              <el-form-item :prop="'headerParams.' + scope.$index + '.value'" :rules="rules2.paramValue">
                                <el-input v-model="scope.row.value" :placeholder="$t('hc.http_param_value_msg')" size="small"></el-input>
                              </el-form-item>
                            </template>
                          </el-table-column>
                          <el-table-column :label="$t('cm.operate')" width="60" fixed="right">
                            <template slot-scope="scope">
                              <el-form-item>
                                <el-button size="small" type="text" class="cud-common-operate-delete" @click="delHeaderParam(scope.$index)">
                                  {{ $t("cm.delete") }}
                                </el-button>
                              </el-form-item>
                            </template>
                          </el-table-column>
                        </el-table>
                        <el-button size="small" @click="addHeaderParam()" class="params-add">
                          <i class="el-icon-plus"></i> {{ $t("cm.add") }}
                        </el-button>
                      </el-form-item>
                    </el-col>
                    <el-col :span="24" style="padding-top: 10px;">
                      <el-form-item :label="$t('hc.http_param_xml_input')">
                        <monaco-editor ref="bodyInput" :options="options" v-model="model2.bodyInput" :height="200" class="editor"></monaco-editor>
                        <el-button size="small" type="primary" @click="soapParse()">{{ $t("hc.http_parse_parse")}}</el-button>
                      </el-form-item>
                    </el-col>
                    <el-col :span="24" style="padding-top: 10px;">
                      <el-form-item :label="$t('hc.http_param_xml')" v-if="model2.bodyParams.length > 0">
                        <!--SOAP请求参数-->
                        <el-table :data="model2.bodyParams" row-key="id"
                          :tree-props="{ children: 'children' }" default-expand-all>
                          <el-table-column :label="$t('hc.http_param_name')" min-width="200">
                            <template slot-scope="scope">
                              <el-form-item>
                                <el-input v-model="scope.row.name" :placeholder="$t('hc.http_param_name_msg')" size="small"></el-input>
                              </el-form-item>
                            </template>
                          </el-table-column>
                          <el-table-column :label="$t('hc.http_param_desc')" min-width="300">
                            <template slot-scope="scope">
                              <el-form-item>
                                <el-input v-model="scope.row.describe" :placeholder="$t('hc.http_param_desc_msg')" size="small"></el-input>
                              </el-form-item>
                            </template>
                          </el-table-column>
                          <el-table-column :label="$t('hc.http_param_type')">
                            <template slot-scope="scope">
                              <el-form-item>
                                <!-- <el-input v-model="scope.row.type" size="small" disabled></el-input> -->
                                {{scope.row.type}}
                              </el-form-item>
                            </template>
                          </el-table-column>
                          <el-table-column :label="$t('cm.operate')" width="60" fixed="right">
                            <template slot-scope="scope">
                              <el-form-item>
                                <el-button size="small" type="text" class="cud-common-operate-delete" @click="delBodyParam(scope.row.id)">{{ $t("cm.delete") }}
                                </el-button>
                              </el-form-item>
                            </template>
                          </el-table-column>
                        </el-table>
                      </el-form-item>
                    </el-col>
                  </el-row>
                  <!--JSON连接器设置-->
                  <el-row v-else>
                    <el-col :span="24">
                      <el-form-item :label="$t('hc.http_action_method')">
                        <el-radio-group v-model="model2.actionMethod">
                          <el-radio label="0">GET</el-radio>
                          <el-radio label="1">POST</el-radio>
                        </el-radio-group>
                      </el-form-item>
                    </el-col>
                    <el-form-item :label="$t('hc.http_action_param')">
                      <el-tabs v-model="model2.activeTab" class="border-bottom-card">
                        <el-tab-pane label="Query" name="query">
                          <!--Query参数-->
                          <el-table :data="model2.queryParams">
                            <el-table-column :label="$t('hc.http_param_name')" min-width="200">
                              <template slot-scope="scope">
                                <el-form-item :prop="'queryParams.' + scope.$index + '.name'" :rules="rules2.paramName">
                                  <el-input v-model="scope.row.name" :placeholder="$t('hc.http_param_name_msg')"
                                    size="small"></el-input>
                                </el-form-item>
                              </template>
                            </el-table-column>
                            <el-table-column :label="$t('hc.http_param_desc')" min-width="300">
                              <template slot-scope="scope">
                                <el-form-item :prop="'queryParams.' + scope.$index + '.describe'" :rules="rules2.paramDesc">
                                  <el-input v-model="scope.row.describe" :placeholder="$t('hc.http_param_desc_msg')"
                                    size="small"></el-input>
                                </el-form-item>
                              </template>
                            </el-table-column>
                            <el-table-column :label="$t('cm.operate')" width="60" fixed="right">
                              <template slot-scope="scope">
                                <el-form-item>
                                  <el-button size="small" type="text" class="cud-common-operate-delete" @click="delQueryParam(scope.$index)">
                                    {{ $t("cm.delete") }}
                                  </el-button>
                                </el-form-item>
                              </template>
                            </el-table-column>
                          </el-table>
                          <el-button size="small" @click="addQueryParam()" class="params-add">
                            <i class="el-icon-plus"></i> {{ $t("cm.add") }}
                          </el-button>
                        </el-tab-pane>
                        <el-tab-pane label="Body" name="body" v-if="model2.showBody">
                          <!--Body参数-->
                          <el-form-item :label="$t('hc.http_param_json_input')"></el-form-item>
                          <monaco-editor ref="bodyInput" :options="options" v-model="model2.bodyInput" :height="150" class="editor"></monaco-editor>
                          <el-button size="small" @click="bodyFormat()">{{ $t("hc.http_parse_format") }}
                          </el-button>
                          <el-button size="small" type="primary" @click="getBodyParam()">{{ $t("hc.http_parse_parse")}}</el-button>

                          <el-table :data="model2.bodyParams" v-if="model2.bodyParams.length > 0" row-key="id"
                            :tree-props="{ children: 'children' }" default-expand-all style="margin-top: 10px;">
                            <el-table-column :label="$t('hc.http_param_name')" min-width="200">
                              <template slot-scope="scope">
                                <!-- <el-form-item :prop="scope.row.level == 1 ? 'bodyParams.' + scope.$index + '.name' : ''" :rules="rules2.paramName"> -->
                                <el-form-item>
                                  <el-input v-model="scope.row.name" :placeholder="$t('hc.http_param_name_msg')"
                                    size="small"></el-input>
                                </el-form-item>
                              </template>
                            </el-table-column>
                            <el-table-column :label="$t('hc.http_param_desc')" min-width="300">
                              <template slot-scope="scope">
                                <!-- <el-form-item :prop="scope.row.level == 1 ? 'bodyParams.' + scope.$index + '.describe' : ''" :rules="rules2.paramDesc"> -->
                                <el-form-item>
                                  <el-input v-model="scope.row.describe" :placeholder="$t('hc.http_param_desc_msg')"
                                    size="small"></el-input>
                                </el-form-item>
                              </template>
                            </el-table-column>
                            <el-table-column :label="$t('hc.http_param_type')">
                              <template slot-scope="scope">
                                <el-form-item>
                                  <!-- <el-input v-model="scope.row.type" size="small" disabled></el-input> -->
                                  {{scope.row.type}}
                                </el-form-item>
                              </template>
                            </el-table-column>
                            <el-table-column :label="$t('cm.operate')" width="60" fixed="right">
                              <template slot-scope="scope">
                                <el-form-item>
                                  <el-button size="small" type="text" class="cud-common-operate-delete" @click="delBodyParam(scope.row.id)">{{ $t("cm.delete") }}
                                  </el-button>
                                </el-form-item>
                              </template>
                            </el-table-column>
                          </el-table>
                        </el-tab-pane>
                        <el-tab-pane label="Header" name="header">
                          <el-table :data="model2.headerParams">
                            <!--Header参数-->
                            <el-table-column :label="$t('hc.http_param_name')" min-width="200">
                              <template slot-scope="scope">
                                <el-form-item :prop="'headerParams.' + scope.$index + '.name'" :rules="rules2.paramName">
                                  <el-input v-model="scope.row.name" :placeholder="$t('hc.http_header_type_msg')"
                                    size="small"></el-input>
                                </el-form-item>
                              </template>
                            </el-table-column>
                            <el-table-column :label="$t('hc.http_param_value')" min-width="300">
                              <template slot-scope="scope">
                                <el-form-item :prop="'headerParams.' + scope.$index + '.value'" :rules="rules2.paramValue">
                                  <el-input v-model="scope.row.value" :placeholder="$t('hc.http_header_cont_msg')"
                                    size="small"></el-input>
                                </el-form-item>
                              </template>
                            </el-table-column>
                            <el-table-column :label="$t('cm.operate')" width="60" fixed="right">
                              <template slot-scope="scope">
                                <el-form-item>
                                  <el-button size="small" type="text" class="cud-common-operate-delete" @click="delHeaderParam(scope.$index)">{{ $t("cm.delete") }}
                                  </el-button>
                                </el-form-item>
                              </template>
                            </el-table-column>
                          </el-table>
                          <el-button size="small" @click="addHeaderParam()" class="params-add"><i
                              class="el-icon-plus"></i>
                            {{ $t("cm.add") }}
                          </el-button>
                        </el-tab-pane>
                        <el-tab-pane label="Path" name="path">
                          <el-table :data="model2.pathParams">
                            <!--Path参数-->
                            <el-table-column :label="$t('hc.http_param_name')" min-width="200">
                              <template slot-scope="scope">
                                <el-form-item :prop="'pathParams.' + scope.$index + '.name'" :rules="rules2.paramName">
                                  <el-input v-model="scope.row.name" :placeholder="$t('hc.http_path_name_msg')"
                                    size="small"></el-input>
                                </el-form-item>
                              </template>
                            </el-table-column>
                            <el-table-column :label="$t('hc.http_param_desc')" min-width="300">
                              <template slot-scope="scope">
                                <el-form-item :prop="'pathParams.' + scope.$index + '.describe'" :rules="rules2.paramDesc">
                                  <el-input v-model="scope.row.describe" :placeholder="$t('hc.http_path_desc_msg')" size="small"></el-input>
                                </el-form-item>
                              </template>
                            </el-table-column>
                            <el-table-column :label="$t('cm.operate')" width="60" fixed="right">
                              <template slot-scope="scope">
                                <el-form-item>
                                  <el-button size="small" type="text" class="cud-common-operate-delete" @click="delPathParam(scope.$index)">{{ $t("cm.delete") }}
                                  </el-button>
                                </el-form-item>
                              </template>
                            </el-table-column>
                          </el-table>
                          <el-alert type="info" :title="$t('hc.http_path_tips')" show-icon></el-alert>
                        </el-tab-pane>
                      </el-tabs>
                    </el-form-item>
                  </el-row>
                </el-col>
              </el-row>
            </div>
          </el-card>
          <!--测试动作-->
          <el-drawer :title="$t('hc.http_action_test')" :visible.sync="model2.showTest" v-if="model2.showTest" size="600px">
            <div class="test">
              <el-form label-width="100px" label-suffix="：" label-position="top" :model="model2" :rules="rules3"
                ref="model3" class="cud-entity-form-wrap">
                <!--SOAP-->
                <div v-if="model1.interfaceType == 2">
                  <h4 v-if="model2.headerParams.length > 0">{{$t('hc.http_param_header')}}</h4>
                  <el-form-item v-for="item in model2.headerParams" :label="item.name" :key="item.id">
                    <el-input v-model="item.value" :placeholder="$t('hc.http_path_value_msg')" size="small"></el-input>
                  </el-form-item>
                  <h4 v-if="model2.bodyParams.length > 0">{{$t('hc.http_param_xml_input')}}</h4>
                  <monaco-editor ref="testInput" :options="options" v-model="model2.bodyInput" :height="200" class="editor"
                    v-if="model2.bodyParams.length > 0"></monaco-editor>
                </div>
                <!--JSON-->
                <div v-else>
                  <h4 v-if="model2.queryParams.length > 0">{{ $t("hc.http_param_query") }}</h4>
                  <el-form-item v-for="item in model2.queryParams" :label="item.name" :key="item.id">
                    <el-input v-model="item.value" :placeholder="$t('hc.http_param_value_msg')" size="small"></el-input>
                  </el-form-item>
                  <h4 v-if="model2.actionMethod != '0' && model2.bodyParams.length > 0">{{ $t("hc.http_param_body") }}</h4>
                  <monaco-editor ref="testInput" :options="options" v-model="model2.bodyInput" :height="200" class="editor"
                    v-if="model2.actionMethod != '0' && model2.bodyParams.length > 0"></monaco-editor>
                  <h4 v-if="model2.headerParams.length > 0">{{ $t("hc.http_param_header") }}</h4>
                  <el-form-item v-for="item in model2.headerParams" :label="item.name" :key="item.id">
                    <el-input v-model="item.value" :placeholder="$t('hc.http_header_cont_msg')" size="small"></el-input>
                  </el-form-item>
                  <h4 v-if="model2.pathParams.length > 0">{{ $t("hc.http_param_path") }}</h4>
                  <el-form-item v-for="item in model2.pathParams" :label="item.name" :key="item.id">
                    <el-input v-model="item.value" :placeholder="$t('hc.http_path_value_msg')" size="small"></el-input>
                  </el-form-item>
                </div>
                <el-row style="padding-top: 20px">
                  <el-button size="small" type="primary" @click="testAction()">{{$t("hc.http_action_test")}}</el-button>
                </el-row>
              </el-form>
            </div>
          </el-drawer>
        </el-form>
        <!--接口返回-->
        <el-form label-width="180px" label-suffix="：" label-position="top" v-if="step == 3">
          <el-card class="box-card-20">
            <div class="response-info" :style="'min-height: ' + minHeight + 'px'">
              <el-form-item :label="$t('hc.http_response_data')">
                <monaco-editor ref="responseInput" :options="options" v-model="model2.responseInput" :height="200" class="editor"></monaco-editor>
                <div class="response-btn">
                  <el-button @click="responseFormat()" size="small" class="response-btn">
                    {{ $t("hc.http_parse_format") }}
                  </el-button>
                  <el-button @click="responseParse()" size="small" type="primary" class="response-btn">
                    {{ $t("hc.http_parse_parse") }}
                  </el-button>
                </div>
              </el-form-item>
              <el-form-item :label="$t('hc.http_response_param')">
                <el-table :data="model2.responseParams" row-key="id" style="margin-top: 8px"
                  :tree-props="{ children: 'children' }">
                  <el-table-column :label="$t('hc.http_param_name')" min-width="200">
                    <template slot-scope="scope">
                      <el-form-item>
                        <el-input v-model="scope.row.name" size="small" readonly=""></el-input>
                      </el-form-item>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('hc.http_param_desc')" min-width="200">
                    <template slot-scope="scope">
                      <el-form-item>
                        <el-input v-model="scope.row.describe" :placeholder="$t('hc.http_param_desc_msg')" size="small"
                          v-if="scope.row.type !== 'object'"></el-input>
                      </el-form-item>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('hc.http_condition_set')" align="left" min-width="70">
                    <template slot-scope="scope">
                      <el-checkbox v-model="scope.row.type" v-if="scope.row.level == 1"></el-checkbox>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('hc.http_condition_flag')" min-width="100">
                    <template slot-scope="scope">
                      <el-select v-model="scope.row.value" :placeholder="$t('cm.pselect')" v-if="scope.row.level == 1"
                        size="small">
                        <el-option :label="$t('hc.http_condition_flag_1')" value="1"></el-option>
                        <el-option :label="$t('hc.http_condition_flag_2')" value="2"></el-option>
                        <el-option :label="$t('hc.http_condition_flag_3')" value="3"></el-option>
                        <el-option :label="$t('hc.http_condition_flag_4')" value="4"></el-option>
                        <el-option :label="$t('hc.http_condition_flag_5')" value="5"></el-option>
                      </el-select>
                    </template>
                  </el-table-column>
                  <el-table-column :label="$t('cm.operate')" width="60" fixed="right">
                    <template slot-scope="scope">
                      <el-button size="small" type="text" class="cud-common-operate-delete" @click="delResponseParam(scope.row.id)">{{ $t("cm.delete") }}</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-form-item>
            </div>
          </el-card>
        </el-form>
        <div class="cud-examine-tool">
          <el-row style="position: relative; left: 95%; transform: translateX(-95%);">
            <el-button size="small" @click="stepPrev()" v-if="step > 1">{{$t("hc.http_prev")}}</el-button>
            <el-button size="small" @click="testShow()" type="primary" v-if="step === 2">{{$t("hc.http_action_test")}}</el-button>
            <el-button size="small" @click="stepNext()" type="primary" v-if="step < 3">{{$t("hc.http_next")}}</el-button>
            <el-button size="small" @click="saveConnector()" type="primary" v-if="step === 3">{{$t("hc.http_save")}}</el-button>
          </el-row>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import httpConnectorEdit from "./js/http_connector_edit.js";
  export default httpConnectorEdit;
</script>

<style lang="less" scoped>
  // @import "src/assets/css/style";
  .container {
    margin-left: 0;
    margin-right: 0;
    background: none;
  }

  .el-card {
    padding-top: 20px;
  }

  .el-steps {
    width: 82%;
    min-width: 1000px;
    margin: 0 auto;
  }

  .basic-info {
    width: 60%;
    min-width: 800px;
    height: 600px;
    margin: 0 auto;
    padding-bottom: 50px;
  }
  .basic-info .el-row {
    padding: 10px 0;
  }

  // /deep/.el-table .el-form-item__content {
  //   padding: 0 !important;
  // }

  /deep/.el-table .el-table__expand-icon {
    // top: 8px !important;
    // left: 0 !important
    position: absolute;
    margin-left: -15px;
    margin-top: 5px;
  }
  /deep/.el-table .cell {
    display: flex;
  }

  .el-alert {
    margin-top: 10px;
    padding: 5px !important;
    border-radius: 5px;
  }

  .el-radio {
    padding-right: 20px;
  }

  .form-add-tabs {
    background-color: #0c7bca;
  }

  .form-add-tabs>.el-tabs__header {
    border-bottom: none !important;
    margin: 0 !important;
  }

  .form-add-tabs>.el-tabs__header .el-tabs__nav-wrap .el-tabs__nav-scroll {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }

  .form-add-tabs>.el-tabs__header .el-tabs__item {
    border-top-right-radius: 10px;
    border-top-left-radius: 10px;
    font-size: 16px;
    color: #fff !important;
    font-weight: bold;
    margin-top: 10px;
    padding-top: 5px;
    height: 50px;
  }

  .form-add-tabs>.el-tabs__header .el-tabs__item.is-active,
  .form-add-tabs>.el-tabs__header .el-tabs__item:hover {
    color: #0069ac !important;
    background-color: #fff;
  }

  .form-add-tabs>.el-tabs__content {
    padding-top: 50px;
    background-color: #fff;
    border-top-left-radius: 40px;
    border-top-right-radius: 40px;
  }

  .action-info {
    width: 80%;
    margin: 0 auto;
    padding-bottom: 60px;
  }

  .action_title {
    height: 50px;
    border-bottom: 1px solid #ddd;
  }

  .action_title h2 {
    margin: 0;
    font-size: 20px;
    font-weight: bold;
  }

  .action_button {
    width: 100%;
    margin-bottom: 10px;
    height: 40px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .el-table .el-form-item {
    padding-bottom: 0em;
  }

  .params-add {
    margin-top: 10px;
    margin-left: 0px;
  }

  .el-alert {
    padding: 0 20px;
  }

  .textarea {
    width: 99%;
    margin: 10px 0;
    border: 1px solid #ddd;
    border-radius: 5px;
  }

  .test {
    padding: 30px;
  }

  .test .el-form-item {
    padding: 0;
  }

  .test .el-form-item__label {
    float: left !important;
    line-height: 30px;
  }

  .response-info {
    width: 60%;
    margin: 0 auto;
    padding-bottom: 60px;
  }

  .response-info .el-form-item,
  .response-card .el-form-item__content,
  .el-table .el-form-item__content {
    padding-bottom: 0 !important;
  }

  .response-btn {
    padding-bottom: 5px;
  }

  .editor {
    border: 1px solid #f0f0f0;
    margin-bottom: 10px;
  }

  /deep/ .el-input-group__prepend {
    height: auto;
  }
  /deep/ .el-tabs {
    margin: 0 !important;
  }
  /deep/ .el-table__body-wrapper .cell {
    // padding: 0;
    padding-left: 20px
  }
</style>

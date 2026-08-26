<template>
  <el-row>
    <el-col :span="24" v-if="validata">
      <el-row class="keywordBar" v-if="false">
        <el-input
          @blur="blur"
          v-model="keyWord"
          v-if="false"
          :placeholder="this.$t('cm.searchPlaceholder')"
        ></el-input>
        <transition name="el-fade-in">
          <span
            v-if="isShow"
            style="
              color: #e94848;
              float: left;
              margin-top: 5px;
              font-size: 14px;
              font-weight: bold;
            "
            >{{ tipText }}</span
          >
        </transition>
      </el-row>
      <!-- 左侧栏 -->
      <el-row class="keywordBar">
        <el-col :span="11">
          <!-- 使用card -->
          <el-card class="box-card left_tree" shadow="never">
            <!-- card头部 -->
            <div slot="header" class="clearfix">
              <span>{{ $t("cm.queryData") }}</span>
              <div class="header-btn">
                <!-- <el-button type="text" @click="selectAll">全选</el-button>
                <el-button type="text" @click="selectNone">取消</el-button> -->
              </div>
            </div>
            <el-row>
              <el-col class="inputFilter">
                <el-input
                  v-if="inputFilter"
                  :placeholder="$t('cm.filterPlaceholder')"
                  v-model="filterText"
                  clearable
                  @blur="blur"
                  size="small"
                >
                </el-input>
              </el-col>
            </el-row>
            <el-row>
              <el-row class="left_tree_body" style="height: 310px;">
                <el-scrollbar style="height: 100%">
                  <transition name="el-zoom-in-center">
                    <el-row>
                      <el-tree
                        :data="data"
                        :props="defaultProps"
                        @node-click="getOrgTreeForHr"
                        @chack-change="handleCheckChange"
                        @node-expand="getOrgTreeForHr"
                        icon-class="el-icon-caret-right"
                        :filter-node-method="filterNode"
                        :highlight-current="true"
                        :expand-on-click-node="true"
                        :lazy="true"
                        :show-checkbox="showCheckBox"
                        :check-strictly="true"
                        node-key="id"
                        ref="childrenTreeLeft"
                      >
                      </el-tree>
                    </el-row>
                  </transition>
                </el-scrollbar>
              </el-row>
            </el-row>
          </el-card>
        </el-col>

        <!-- 中间部分 -->
        <el-col :span="2">
          <el-row style="margin-top: 140px">
            <el-row style="text-align: center">
              <el-button type="primary" size="small" @click="getCheckedNodes">
                <i class="el-icon-arrow-right"></i>
              </el-button>
              <el-button
                type="primary"
                disabled
                size="small"
                @click="checkedNodesToLeft"
                ><i class="el-icon-arrow-left"></i
              ></el-button>
            </el-row>
          </el-row>
        </el-col>

        <!-- 右侧 -->
        <el-col :span="11">
          <!-- 使用card -->
          <el-card class="box-card left_tree" shadow="never">
            <!-- card头部 -->
            <div slot="header" class="clearfix">
              <span>{{ $t("cm.theSelectData") }}</span>
            </div>

            <el-row>
              <el-row
                class="left_tree_body"
                v-if="reLoadR"
                style="height: 350px;"
              >
                <el-scrollbar style="height: 100%">
                  <transition name="el-zoom-in-center">
                    <el-row>
                      <!-- <el-input
													v-if="inputFilter"
													:placeholder="$t('cm.filterPlaceholder')"
													v-model="rightFilterText">
												</el-input> -->
                      <el-tree
                        :data="menuItems"
                        :props="defaultProps"
                        icon-class="el-icon-"
                        @node-click="getOrgTreeForHrRight"
                        @dbclick="rightTreeDbClickRight"
                        :filter-node-method="filterNode"
                        :highlight-current="true"
                        :lazy="false"
                        node-key="id"
                        ref="treeRight"
                      >
                      </el-tree>
                    </el-row>
                  </transition>
                </el-scrollbar>
              </el-row>
            </el-row>
          </el-card>
        </el-col>

        <el-col
          :span="24"
          style="text-align: center; margin-top: 20px"
          v-if="buttonGroup"
        >
          <el-button
            size="small"
            style="display: inline-block"
            type="primary"
            @click="submit"
            >{{ $t("cm.confirm2") }}</el-button
          >
          <el-button
            size="small"
            style="display: inline-block; margin-left: 10px"
            >{{ $t("cm.close") }}</el-button
          >
        </el-col>
        <el-col :span="24" style="text-align: center" v-else></el-col>
      </el-row>
    </el-col>

    <el-col :span="24" v-else>
      <div>
        <h1 style="margin: 20px 50px; line-height: 50px">
          <p>暂无使用权限</p>
        </h1>

        <div style="margin: 0px 50px; line-height: 40px">
          <h3>
            <p>使用权限申请步骤：</p>
            <p style="margin-left: 20px">
              一、登陆中台服务门户
              <a @click="hrefToCsp" href="javascript:void(0)"> https://csp </a>
            </p>
            <p style="margin-left: 20px">
              二、首页 - 购物车 - 选人部门组件注册
            </p>
            <p style="margin-left: 20px">
              三、选择系统 - 选择环境及填写系统域名 - 提交
            </p>
          </h3>
        </div>
      </div>
    </el-col>
  </el-row>
</template>

<script>
import url from "./common";
// import treeUtils from "@@/utils/treeUtils.js";
import _ from "lodash";
var fpageParam = null;
let that = "";
export default {
  name: "cudCommmOrgComponent",
  created() {
    that = this;
  },
  props: {
    showCheckBox: Boolean,
    buttonGroup: Boolean,
    appCode: String,
    lang: String,
    initOrgId: String,
    IDS: String,
    rightMenuItems: {
      type: Array,
      default() {
        return [];
      }
    }
  },

  mounted() {
    url.getEnvType2();
    /**
     * 判断是否存在父页面， 如果存在则进行统计
     * 如果不存在则
     **/
    if (top.location.host != self.location.host) {
      let isAuthority = this.initPickPersonRequestMessages(1);
      if (!isAuthority) {
        this.validata = false;
      }
    }
    //默认带出参数
    if (this.initOrgId) {
      this.deptNo = this.initOrgId;
      this.searchFnDeptNo = this.initOrgId;
    }
    that.data = that.getOrgTreeForHr();

    //是否显示按钮组;
    if (this.buttonGroup && this.buttonGroup == "none") {
      this.buttonGroup = false;
    }
    //是否多选;
    if (this.showCheckBox && this.showCheckBox == true) {
      this.showCheckBox = true;
    }

    //英文时无数据设置为 No Data;
    if (this.lang && this.lang == "en_us") {
      let nodeList = document.querySelectorAll(".el-tree__empty-text");
      for (let i = 0; i < nodeList.length; i++) {
        nodeList[i].innerHTML = "No Data";
      }
    }

    //接受父页面发送来的信息
    this.messageFunc = function(event) {
      var data = event.data;

      if (event.data == "organizationwidget") {
        that.submit();
      }

      // switch (data.cmd) {
      //   case "getFormJson":
      //     fpageParam = data.params;
      //     $("#hiddenData").html(data.params);
      //     break;
      // }
    };
    window.addEventListener("message", this.messageFunc);
  },
  data() {
    return {
      //left data===========================
      //默认key
      deptNo: "00888888",
      //搜索时使用的key
      searchFnDeptNo: "00888888",
      //搜索关键字
      keyword: "",
      //树结构
      data: [],
      defaultProps: {
        children: "children",
        label: "label"
      },
      filterText: "",
      true: true,
      treeClickCount: 0,
      //left data===========================

      //right data===========================
      //默认key
      deptNoRight: "00888888",
      //搜索时使用的key
      searchFnDeptNoRight: "00888888",
      //搜索关键字
      keywordRight: "",
      //树结构
      dataRight: [],
      defaultPropsRight: {
        children: "children",
        label: "label"
      },
      filterTextRight: "",
      trueRight: true,
      //right data===========================

      //store data===========================
      // 定义菜单数据源
      menuItems: [],
      //所有数据
      allMenu: [],
      //store data===========================

      validata: true,
      reLoadR: true,
      showBox: true,
      // 搜索数据
      keyWord: "",
      // 是否展示
      isShow: false,

      inputFilter: true,

      // 提示字符串
      tipText: this.$t("cm.tipText"),
      // 输入时长限制字符
      flag: false,
      data: [],
      props: {
        label: "name",
        children: "zones"
      },
      count: 1,
      filterText: "",
      defaultProps: {},
      dataRight: []
    };
  },
  watch: {
    // rightMenuItems(v) {
    //   this.menuItems = v;
    // },
    // 解决首次不触发问题
    rightMenuItems: {
      handler(v) {
        this.menuItems = v;
      },
      immediate: true
    },
    filterText(val) {
      this.queryDataByShowCheckBox();
      //this.$refs.childrenTreeLeft.filter(val);
    },
    /**
     * 监听input输入框内容，
     * 1如果输入事件过短则将flag值设置为flase
     * 2如果为空则返回
     * 3如果时间
     * @param {Object} nv
     */
    keyWord(nv) {
      if (that.flag) {
        window.clearTimeout(that.flag);
        that.flag = false;
      }
      if (nv == "") {
        that.isShow = true;
        return;
      }
      if ((/[\u4e00-\u9fa5]/.test(nv) && nv.length >= 2) || nv.length >= 3) {
        that.isShow = false;
        that.flag = window.setTimeout(function() {
          that.selectEmpsByKeyWord(nv);
          clearTimeout(that.flag);
        }, 700);
      } else {
        //提示输入三个字符以上查询内容
        that.tipText = /[\u4e00-\u9fa5]/.test(nv)
          ? this.$t("cm.tipText")
          : this.$t("cm.tipText1");
        that.isShow = true;
      }
    }
    // initOrgId: {
    // 	handler(newValue, oldValue) {
    // 	},
    // 	deep: true
    // },
  },
  methods: {
    blur() {
      // this.$nextTick(() => {
      //   let props;
      //   this.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$refs.form.fields.forEach(
      //     item => {
      //       item._props.rules.forEach(items => {
      //         if (items.fieldType === "department") {
      //           this.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$parent.$refs.form.clearValidate(
      //             item.prop
      //           );
      //         }
      //       });
      //     }
      //   );
      // });
    },
    initOrg() {
      url.getEnvType2();
      //默认带出参数

      if (this.initOrgId) {
        this.deptNo = this.initOrgId;
        this.searchFnDeptNo = this.initOrgId;
      }
      that.data = that.getOrgTreeForHr();

      //是否显示按钮组;
      if (this.buttonGroup && this.buttonGroup == "none") {
        this.buttonGroup = false;
      }
      //是否多选;
      if (this.showCheckBox && this.showCheckBox == true) {
        this.showCheckBox = true;
      }

      //英文时无数据设置为 No Data;
      if (this.lang && this.lang == "en_us") {
        let nodeList = document.querySelectorAll(".el-tree__empty-text");
        for (let i = 0; i < nodeList.length; i++) {
          nodeList[i].innerHTML = "No Data";
        }
      }
    },
    hrefToCsp() {
      window.open("https://csp/");
    },
    selectEmpsByKeyWord(nv) {
      that.getOrgTreeForHr(nv);
    },
    getUrlParam(paramName) {
      var reg = new RegExp("(^|&)" + paramName + "=([^&]*)(&|$)");
      var r = window.location.search.substr(1).match(reg);
      if (r != null) {
        return decodeURI(r[2]);
      } else {
        return null;
      }
    },
    handleChange(value, direction, movedKeys) {},
    handleCheckChange(data, checked, indeterminate) {},
    filterNode(value, data) {
      if (!value) {
        return true;
      }
      return data.label.indexOf(value) !== -1;
    },
    handleNodeClick(data) {},
    loadNode(node, resolve) {
      if (node.level === 0) {
        return resolve([{ name: "region1" }, { name: "region2" }]);
      }
      if (node.level > 3) return resolve([]);

      var hasChild;
      if (node.data.name === "region1") {
        hasChild = true;
      } else if (node.data.name === "region2") {
        hasChild = false;
      } else {
        hasChild = Math.random() > 0.5;
      }

      let timer = setTimeout(() => {
        var data;
        if (hasChild) {
          data = [
            {
              name: "zone" + this.count++
            },
            {
              name: "zone" + this.count++
            }
          ];
        } else {
          data = [];
        }
        resolve(data);
        clearTimeout(timer);
      }, 500);
    },
    checkedNodesToLeft() {
      this.menuItems = [];
    },
    submit() {
      let allData = this.allMenu;
      let rightData = this.menuItems;
      let resultJson = [];
      if (allData.length > 0) {
        allData.forEach((item, index) => {
          rightData.forEach((item1, index1) => {
            if (item.deptNo == item1.id) {
              resultJson.push(item);
            }
          });
        });
        this.onOk(resultJson);
      }
    },
    getData() {
      let allData = this.allMenu;
      let rightData = this.menuItems;
      let resultJson = [];
      if (allData.length > 0) {
        allData.forEach((item, index) => {
          rightData.forEach((item1, index1) => {
            if (item.deptNo == item1.id) {
              resultJson.push(item);
            }
          });
        });
        if (resultJson.length === rightData.length) {
          let returnList = [];
          let deptId = "";
          let deptIdPath = "";
          let deptLevel = "";
          let deptName = "";
          let deptNameShot = "";
          let deptNo = "";
          let deptPath = "";
          let deptRank = "";
          let checkTree = resultJson;
          for (let i = 0; i < checkTree.length; i++) {
            deptId += checkTree[i].deptNo + ";";
            deptIdPath += checkTree[i].deptIdPath + ";";
            deptLevel += checkTree[i].deptCodePath + ";";
            deptName += checkTree[i].orgName + ";";
            deptNameShot += checkTree[i].orgNameShort + ";";
            deptNo += checkTree[i].deptNo + ";";
            deptPath += checkTree[i].deptNamePath + ";";
            deptRank += checkTree[i].deptRank + ";";
          }
          returnList[0] = deptId.substr(0, deptId.length - 1);
          returnList[1] = deptNo.substr(0, deptNo.length - 1);
          returnList[2] = deptIdPath.substr(0, deptIdPath.length - 1);
          returnList[3] = deptPath.substr(0, deptPath.length - 1);
          returnList[4] = deptNameShot.substr(0, deptNameShot.length - 1);
          returnList[5] = deptName.substr(0, deptName.length - 1);
          returnList[6] = deptLevel.substr(0, deptLevel.length - 1);
          returnList[7] = deptRank.substr(0, deptRank.length - 1);

          //vue获取选中数据
          var returnArray = new Array(3);
          returnArray[0] = "orgTree"; //用于标注组件类型
          returnArray[1] = returnList;
          returnArray[2] = fpageParam; //父页面传来的参数 
          return returnArray;
        } else {
          let returnList = [],
            deptNo = [],
            deptName = [];

          rightData.forEach(item => {
            deptNo.push(item.id);
            deptName.push(item.label);
          });
          returnList[0] = "";
          returnList[1] = deptNo.join(";");
          returnList[2] = "";
          returnList[3] = "";
          returnList[4] = "";
          returnList[5] = deptName.join(";");
          returnList[6] = "";
          returnList[7] = "";
          //vue获取选中数据
          var returnArray = new Array(3);
          returnArray[0] = "orgTree"; //用于标注组件类型
          returnArray[1] = returnList;
          returnArray[2] = fpageParam; //父页面传来的参数
          return returnArray;
        } 
      } else {
        return [];
      }
    },
    onOk(resultJson) {
      let returnList = [];
      var deptId = "";
      var deptIdPath = "";
      var deptLevel = "";
      var deptName = "";
      var deptNameShot = "";
      var deptNo = "";
      var deptPath = "";
      var deptRank = "";
      var checkTree = resultJson;
      for (var i = 0; i < checkTree.length; i++) {
        deptId += checkTree[i].deptNo + ";";
        deptIdPath += checkTree[i].deptIdPath + ";";
        deptLevel += checkTree[i].deptCodePath + ";";
        deptName += checkTree[i].orgName + ";";
        deptNameShot += checkTree[i].orgNameShort + ";";
        deptNo += checkTree[i].deptNo + ";";
        deptPath += checkTree[i].deptNamePath + ";";
        deptRank += checkTree[i].deptRank + ";";
      }
      returnList[0] = deptId.substr(0, deptId.length - 1);
      returnList[1] = deptNo.substr(0, deptNo.length - 1);
      returnList[2] = deptIdPath.substr(0, deptIdPath.length - 1);
      returnList[3] = deptPath.substr(0, deptPath.length - 1);
      returnList[4] = deptNameShot.substr(0, deptNameShot.length - 1);
      returnList[5] = deptName.substr(0, deptName.length - 1);
      returnList[6] = deptLevel.substr(0, deptLevel.length - 1);
      returnList[7] = deptRank.substr(0, deptRank.length - 1);

      //vue获取选中数据
      var returnArray = new Array(3);
      returnArray[0] = "orgTree"; //用于标注组件类型
      returnArray[1] = returnList;
      returnArray[2] = fpageParam; //父页面传来的参数
      parent.postMessage(returnArray, "/");
      this.CloseWindow("ok");
    },
    CloseWindow(action) {
      if (window.CloseOwnerWindow) {
        return window.CloseOwnerWindow(action);
      } else {
        window.close();
      }
    },

    // =============================================Left methids=============================================
    // =============================================Left methids=============================================
    // =============================================Left methids=============================================
    // =============================================Left methids=============================================
    // =============================================Left methids=============================================
    handleCheckChange(data, check, indeterminate) {},
    /**
     * 树filter
     * @param {Object} value
     * @param {Object} data
     */
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    /**
     * 加载树结构，当点击某个树节点时加载子节点
     * 并将searchFnDeptNo改为当前点击节点id
     * @param {Object} data
     */
    getOrgTreeForHr(data, node) {
      // 判断是否为初始化
      if (data == undefined && node == undefined) {
        // 初始化数据
        that.queryDataByShowCheckBox(data, node, true);
      } else {
        // 记录点击次数
        that.treeClickCount++;
        // 单次点击册数超过两次不做处理，直接返回， 也可以拓展为多击事件
        if (that.treeClickCount >= 2) return;

        if (node.childNodes.length > 0) {
          that.treeClickCount = 0;
          return;
        }
        if (node.data.children.length > 0) {
          that.treeClickCount = 0;
          for (let i = 0; i < node.data.children.length; i++) {
            that.$refs.childrenTreeLeft.append(node.data.children[i], data.id);
          }
          return;
        }
        // 计时器，计算超过300毫秒为单位，可自行修改
        let timer = setTimeout(function() {
          if (that.treeClickCount == 1) {
            // 把次数归零，单机事件处理
            that.treeClickCount = 0;
            that.queryDataByShowCheckBox(data, node, true);
          } else if (that.treeClickCount > 1) {
            // 把次数归零，双击
            that.treeClickCount = 0;
            if (that.showCheckBox) {
              that.setMenuItems(that.$refs.childrenTreeLeft.getCurrentNode());
            } else {
              that.setMenuShowCheckBoxFalse(
                that.$refs.childrenTreeLeft.getCurrentNode()
              );
            }
          }
          clearTimeout(timer);
        }, 300);
      }
    },
    // 查询数据， 判断是否为多选
    queryDataByShowCheckBox(data, node, flag) {
      if (that.showCheckBox) {
        that.singleSelection(data, flag);
      } else {
        that.singleSelection(data, flag);
      }
    },
    multipleSelection(data) {
      // 1、判断是否初始化， 如没有data数据则为第一次初始化，
      let status = 0;
      let param = { orgId: that.deptNo };
      if (this.filterText && this.filterText.trim().length > 0) {
        param.keyword = this.filterText;
        status = 2;
      }
      // 2、如存在data数据则为点击树节点，此时status为 1
      if (data) {
        param.orgId = data.id;
        if (param.keyword && param.keyword.trim().length > 0) {
          status = 3;
        } else {
          status = 1;
        }
      }

      url.getOrgTreeForOrgWidget(param).then(res => {
        const totalData = res.data.data;
        let arr = [];
        if (totalData && status == 0) {
          for (let i = 0; i < totalData.length; i++) {
            arr.push({
              id: totalData[i].deptNo,
              label: totalData[i].orgName,
              children: [],
              deptIdPath: totalData[i].deptIdPath
            });
          }
          that.data = arr;
          this.allMenu = totalData;
        } else {
          that.searchFnDeptNo = data.id;
          if (data.children.length == 0) {
            let childrenArr = [];
            for (let i = 0; i < totalData.length; i++) {
              if (data.id == totalData[i].parentOrgId) {
                data.children.push({
                  id: totalData[i].deptNo,
                  label: totalData[i].orgName,
                  children: [],
                  deptIdPath: totalData[i].deptIdPath
                });
              }
            }
            this.pushToAllMenuItems(totalData);
          }
        }
      });
    },
    pushToAllMenuItems(data) {
      if (data && data.length > 0) {
        this.allMenu.forEach((item, index) => {
          data.forEach((item1, index1) => {
            if (item.deptNo == item1.deptNo) {
              data.splice(index1, 1);
            }
          });
        });
        data.forEach((item, index) => {
          this.allMenu.push(item);
        });
      }
    },
    // 没有初始化showCheckBox参数
    singleSelection(data, flag) {
      // 1、判断是否初始化， 如没有data数据则为第一次初始化，
      let status = 0;
      let param = { orgId: that.deptNo };
      if (this.filterText && this.filterText.trim().length > 0) {
        param.keyword = this.filterText;
        status = 2;
      }
      if (flag) {
        delete param.keyword;
      }
      // 2、如存在data数据则为点击树节点，此时status为 1
      if (data) {
        param.orgId = data.id;
        if (param.keyword && param.keyword.trim().length > 0) {
          status = 3;
        } else {
          status = 1;
        }
      }
      // 3、 获取左侧结构树
      url.getOrgTreeForOrgWidget(param).then(res => {
        const totalData = res.data.data;
        // 3-1、将初始化数据拼装后放入store中
        let arr = [];
        if (totalData && status == 0) {
          for (let i = 0; i < totalData.length; i++) {
            arr.push({
              id: totalData[i].deptNo,
              label: totalData[i].orgName,
              children: [],
              deptIdPath: totalData[i].deptIdPath
            });
          }
          that.data = arr;
          that.allMenu = totalData;
        } else if (totalData && status == 3) {
          if (totalData.length == 0) {
            return;
          }
          let da = this.listToTreeList(
            JSON.parse(JSON.stringify(totalData)),
            "deptNo",
            "parentOrgId"
          );
          let goDie = arrayData => {
            let result2 = [];
            for (let i = 0; i < arrayData.length; i++) {
              result2.push({
                id: arrayData[i].deptNo,
                label: arrayData[i].orgName,
                children:
                  arrayData[i].children && arrayData[i].children.length > 0
                    ? goDie(arrayData[i].children)
                    : [],
                deptIdPath: arrayData[i].deptIdPath
              });
            }
            return result2;
          };
          let temp = goDie(da);
          let goDie2 = arrayData => {
            for (let i = 0; i < arrayData.length; i++) {
              if (arrayData[i].id == param.deptNo) {
                arrayData[i].children = temp;
                break;
              } else {
                if (arrayData[i].children && arrayData[i].children.length > 0) {
                  goDie2(arrayData[i].children);
                }
              }
            }
          };
          goDie2(that.data);
          that.allMenu = totalData;
        } else if (totalData && status == 1) {
          // 3-2 此时为点击节点后加载children数据
          that.searchFnDeptNo = data.id;
          // 3-2-1 如果当前节点没有子数据则 push进去
          if (data.children.length == 0) {
            let childrenArr = [];
            for (let i = 0; i < totalData.length; i++) {
              if (data.id == totalData[i].parentOrgId) {
                data.children.push({
                  id: totalData[i].deptNo,
                  label: totalData[i].orgName,
                  children: [],
                  deptIdPath: totalData[i].deptIdPath
                });
              }
            }
            that.pushToAllMenuItems(totalData);
          }
        } else if (totalData && status == 2) {
          if (totalData.length == 0) {
            return;
          }

          // 3-2 此时为点击节点后加载children数据
          let da = this.listToTreeList(
            JSON.parse(JSON.stringify(totalData)),
            "deptNo",
            "parentOrgId"
          );
          let result = da.filter(function(val) {
            if (val.deptNo === that.deptNo || val.parentOrgId === that.deptNo) {
              return val;
            }
          });

          let goDie3 = arrayData => {
            let result2 = [];
            for (let i = 0; i < arrayData.length; i++) {
              result2.push({
                id: arrayData[i].deptNo,
                label: arrayData[i].orgName,
                children:
                  arrayData[i].children && arrayData[i].children.length > 0
                    ? goDie3(arrayData[i].children)
                    : [],
                deptIdPath: arrayData[i].deptIdPath
              });
            }
            return result2;
          };
          let temp3 = goDie3(result);
          // 3-2-1 如果当前节点没有子数据则 push进去
          //if(data.children.length == 0){
          // let childrenArr = [];
          // for(let i = 0; i < res.length; i++){
          // 	if(data.id == res[i].parentOrgId){
          // 		data.children.push({
          // 			id: res[i].deptNo,
          // 			label: res[i].orgName,
          // 			children: [],
          // 			deptIdPath : res[i].deptIdPath,
          // 		})
          // 	}
          // }
          // this.pushToAllMenuItems(res);
          //}
          // for(let i = 0; i < res.length; i++){
          // 	arr.push({
          // 		id: res[i].deptNo,
          // 		label: res[i].orgName,
          // 		children: [],
          // 		deptIdPath : res[i].deptIdPath,
          // 	});
          // }
          if (temp3 && temp3.length === 1) {
            if (temp3[0].id != that.deptNo) {
              that.data = temp3;
            } else {
              that.data = temp3[0].children;
            }

            that.allMenu = totalData;
          } else {
            that.data = [];
            that.allMenu = [];
          }
        } else {
          return;
        }
      });
    },
    /**
     * 节点被点击时将被点击的节点缓存到store里
     */
    getCheckedNodes(showCheckBox) {
      if (this.showCheckBox) {
        that.setMenuItems(that.$refs.childrenTreeLeft.getCheckedNodes());
      } else {
        that.setMenuShowCheckBoxFalse(
          that.$refs.childrenTreeLeft.getCurrentNode()
        );
      }
    },
    // 将普通列表转换为树结构的列表
    listToTreeList(list, idKey, pidKey) {
      if (!list || !list.length) {
        return [];
      }
      let treeListMap = {};
      for (let item of list) {
        treeListMap[item[idKey]] = item;
      }
      for (let i = 0; i < list.length; i++) {
        if (list[i][pidKey] && treeListMap[list[i][pidKey]]) {
          if (!treeListMap[list[i][pidKey]].children) {
            treeListMap[list[i][pidKey]].children = [];
          }
          treeListMap[list[i][pidKey]].children.push(list[i]);
          list.splice(i, 1);
          i--;
        }
      }
      return list;
    },
    setMenuItems(data) { 
      let arr = JSON.parse(JSON.stringify(this.menuItems));
      if (data instanceof Array) {
        arr = arr.concat(data); 
      } else {
        arr.push(data);
      }
      this.menuItems = Array.from(
        new Map(arr.map(item => [item.id, item]))
      ).map(item => item[1]);
    },
    setMenuShowCheckBoxFalse(data) { 
      if (data instanceof Array) {
        this.menuItems = data;
      } else {
        this.menuItems = [];
        this.menuItems.push(data);
      }
    },
    // =============================================Left methids=============================================
    // =============================================Left methids=============================================
    // =============================================Left methids=============================================
    // =============================================Left methids=============================================
    // =============================================Left methids=============================================

    // =============================================Right methids=============================================
    // =============================================Right methids=============================================
    // =============================================Right methids=============================================
    // =============================================Right methids=============================================
    // =============================================Right methids=============================================
    /**
     * 加载树结构，当点击某个树节点时加载子节点
     * 并将searchFnDeptNo改为当前点击节点id
     * @param {Object} data
     */
    getOrgTreeForHrRight(data) {
      this.removeMenuItems(data);
    },
    getStoreDataRight() {},
    rightTreeDbClickRight() {},
    // 将匹配到对象， 在menuItems数组中删除
    removeMenuItems(data) {
      this.menuItems.forEach((item, index) => {
        if (item == data) {
          this.menuItems.splice(index, 1);
        }
      });
    },
    initPickPersonRequestMessages(state) {
      var url = "";
      try {
        url = window.top.document.referrer;
      } catch (M) {
        if (window.parent) {
          try {
            url = window.parent.document.referrer;
          } catch (L) {
            url = "";
          }
        }
      }
      if (url === "") {
        url = document.referrer;
      }
      //拼接数据
      let arr = [],
        protocolArr = [],
        pathname = "",
        searchArr = [],
        params = {};
      if (url.length > 0) {
        arr = url.split("/");
        protocolArr = arr[0].split(":");
        pathname = arr[1];
        searchArr = url.split("?");
        params = {
          origin: arr[2],
          protocol: protocolArr[0],
          pathname: pathname,
          search: searchArr[1],
          href: url,
          componentType: state
        };
        let params_1 = {
          appCode: this.appCode,
          domain: arr[2]
        };
        let status = false;

        if (active_fe == "dev" || active_fe == "test") status = true;

        // let authorityUrl = this.queryAuthority+"?appCode=" + params_1.appCode + "&domain=" + params_1.domain;
        // //权限校验
        // ajax.post(authorityUrl).then(res => {
        // 	// 统计功能
        // 	if(res.data == true && res.code == 200){
        // 		ajax.post(aep_omscenter_rest_api_insertPickPersonRequestMessages);
        // 		status = true;
        // 	}
        // });

        return status;
      }
    },
    //选择全部
    selectAll() {
      let keys = [];
      this.data.forEach(item => {
        keys.push(item.id);
      });
      let leftTree = this.$refs.childrenTreeLeft;
      leftTree.setCheckedKeys(keys);
    },
    //取消全部
    selectNone() {
      let leftTree = this.$refs.childrenTreeLeft;
      leftTree.setCheckedKeys([]);
    }
  },
  beforeDestroy() {
    window.removeEventListener("message", this.messageFunc);
  }
};
</script>

<style scoped="scoped" lang="less">
/deep/.el-card__header {
  padding: 10px 15px;
  border-bottom: 1px solid #ebeef5;
  box-sizing: border-box;
  background-color: #f9f9f9;
}
/deep/.el-card__body {
  padding: 0px;
}
/deep/.el-transfer-panel__filter .el-input__inner {
  height: 32px;
  width: 100%;
  font-size: 12px;
  display: inline-block;
  box-sizing: border-box;
  border-radius: 3px;
  padding-right: 10px;
  padding-left: 30px;
}
.text {
  font-size: 14px;
}

.item {
  margin-bottom: 18px;
}
.left_tree {
  /* margin: 10px 10px; */
  border: 3px solid #f4f6f9;
  border-radius: 10px;
  background: #fff;
  height: 400px;
}
.left_tree /deep/ .el-card__header {
  padding: 15px 20px !important;
  border-bottom: 2px solid #f4f6f9 !important;
}
.left_tree /deep/ .el-card__header:hover {
  padding: 15px 20px !important;
  border-bottom: 2px solid #f4f6f9 !important;
}
.left_tree /deep/ .el-card__body {
  padding: 0;
}
.left_tree_body {
  // min-height: 350px;
  // max-height: 350px;
  // overflow: hidden;
  border: 0px solid #ebebeb;
  border-radius: 5px;
  padding: 10px 10px;
  // height: 300px;
  /* margin: 10px 15px; */
}
.left_tree::first .left_tree_body {
  // height: 250px !important;
}
// /deep/.el-button {
//  display: block;
//  line-height: 1;
//   white-space: nowrap;
//   cursor: pointer;
//   background: #fff;
//   border: 1px solid #dcdfe6;
//   color: #606266;
//   -webkit-appearance: none;
//   text-align: center;
//   box-sizing: border-box;
//   outline: 0;
//   margin: 0 auto;
//   transition: 0.1s;
//   font-weight: 500;
//   padding: 5px 8px;
//   font-size: 14px;
//   border-radius: 4px;
// }
// /deep/.el-button + .el-button {
//   margin: 0 auto;
// }
// /deep/.el-button--primary {
//   color: #fff;
//   background-color: #0c7bca;
//   border-color: #0c7bca;
// }
/deep/.el-button--primary {
  padding: 0 10px;
  display: block;
  margin: 5px auto;
}

/deep/.header-btn {
  float: right;
  .el-button--text {
    display: inline-block;
  }
}
.pd15 {
  padding: 15px;
}

/* ---------------- */
.border {
  /* width: 100%; */
  /* border: 1px solid #ebeff96e; */
  border-radius: 5px;
  height: 430px;
  text-align: center;
  padding-top: 0px;
  /* margin: 0 auto; */
}
.keywordBar {
  margin: 0 auto 0px auto;
  padding: 0px 6px;
  width: 96%;
  /* height: 65px; */
}
.left {
  /* height: 450px; */
  padding: 0px 5px;
}
.el-button--mini {
  padding: 7px 10px;
}
.border-bottom-card .el-tabs__content {
  padding-bottom: 50px;
}
.inputFilter {
  padding: 10px 15px 0 15px;
}
</style>

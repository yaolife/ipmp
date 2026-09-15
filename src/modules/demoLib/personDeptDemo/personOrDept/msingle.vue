<template>
  <el-row>
    <el-col :span="24" v-if="validata">
      <el-col class="left border" :span="contentWidthLeft">
        <el-scrollbar style="height: 100%">
          <div>
            <!-- 多选 -->
            <!-- ============================组织树部分=========================== -->
            <div v-if="orgTreeOrgIds" class="org-tree-tags">
              <div class="tag-title">常用公司</div>
              <div class="tag-list">
                <el-tag size="small"
                  v-for="item in orgTreeOrgList" :key="item.value"
                  @click="initOrgTreeClick(item.id)">{{ item.label }}</el-tag>
                <el-tag size="small" @click="initOrgTreeClick()">全部</el-tag>
              </div>
            </div>
            <el-input
              style="width: 100%"
              v-if="inputFilterShow"
              :placeholder="$t('cm.filterPlaceholder')"
              v-model="filterText"
              size="small"
            >
            </el-input>
            <div class="cud-div-scrollbar" style="width: 100%; height: 400px">
              <div style="width: 100%; text-align: left">
                <el-tree
                  :data="data"
                  :props="defaultProps"
                  @node-expand="getOrgTreeForHr"
                  :filter-node-method="filterNode"
                  :highlight-current="true"
                  :expand-on-click-node="true"
                  :lazy="true"
                  :show-checkbox="showCheckBox"
                  :check-strictly="true"
                  node-key="id"
                  ref="tree"
                  ><span
                    slot-scope="{ node }"
                    class="orgTree showName"
                    :title="node.label"
                    v-text="node.label"
                  ></span>
                </el-tree>
                <!-- @node-click="getOrgTreeForHr" -->
              </div>
            </div>
          </div>
        </el-scrollbar>
      </el-col>
      <!-- ========================================左侧功能按钮======================================== -->
      <el-col :span="1" v-if="show" style="margin-top: 168px; cursor: pointer">
        <!-- <el-tooltip class="item" effect="dark" content="重置组织范围" placement="right">
					<div @click="resetOrganization()" class="reloadButton" >
						<span style="margin-left: 2px;">
							<i class="el-icon-refresh"></i>
						</span>
						<div class="treeButton">{{ $t('cm.REOEG') }}</div>
					</div>
				</el-tooltip> -->
        <div @click="showTree()" :class="showButton" style="margin-top: 10px">
          <span style="margin-left: 2px">
            <i class="el-icon-s-unfold"></i>
          </span>
          <div class="treeButton">{{ $t("cm.openTree") }}</div>
        </div>
      </el-col>
      <el-col :span="1" v-else style="margin-top: 168px; cursor: pointer">
        <!-- <el-tooltip class="item" effect="dark" content="重置组织范围" placement="right">
					<div @click="resetOrganization()" class="reloadButton" >
						<span style="margin-left: 2px;">
							<i class="el-icon-refresh"></i>
						</span>
						<div class="treeButton">{{ $t('cm.REOEG') }}</div>
					</div>
				</el-tooltip> -->
        <div @click="showTree()" :class="showButton" style="margin-top: 10px">
          <span style="margin-left: 2px">
            <i class="el-icon-s-fold"></i>
          </span>

          <div class="treeButton">{{ $t("cm.closeTree") }}</div>
        </div>
      </el-col>
      <!-- ========================================右侧显示部分======================================== -->
      <el-col class="border" :span="contentWidthRight">
        <!-- <msingle ref="childAsingle"></msingle> -->
        <el-row>
          <el-row class="keywordBar">
            <el-input
              style="margin-top:16px"
              v-model="keyWord"
              size="small"
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
                "
                >{{ tipText }}</span
              >
            </transition>
          </el-row>
          <el-transfer
            v-loading="leftLoading"
            ref="transfer"
            style="height: 322px"
            v-model="subValue"
            :render-content="renderFunc"
            :titles="queryData"
            :filter-placeholder="filterPlaceholder"
            :format="{
              noChecked: '${total}',
              hasChecked: '${checked}/${total}',
            }"
            filterable
            :filter-method="filterMethod"
            @change="handleChange"
            :left-default-checked="leftDefaultChecked"
            :right-default-checked="rightDefaultChecked"
            @left-check-change="leftCheckChange"
            @right-check-change="rightCheckChange"
            :data="searchData"
          >
            <!-- 自定义右侧面板的每一项，添加双击事件 -->
            <!-- <template #right-item="{ option }">
              <div
                class="custom-right-item"
                @dblclick="moveToLeft(option.value)"
              >
                {{ option.label }}
              </div>
            </template> -->
            <div slot="left-footer" class="singleLeftFooter">
              <div class="singleLeftFooterBox" v-if="total > 30">
                <el-pagination
                  ref="pager"
                  size="small"
                  style="margin-top: 2px"
                  @current-change="changeCurrentPage"
                  @prev-click="prePage"
                  @next-click="nextPage"
                  :pager-count="5"
                  align="right"
                  :current-page.sync="currentPage"
                  :page-size.sync="pageSize"
                  :layout="layout"
                  :total="total"
                ></el-pagination>
              </div>
            </div>
          </el-transfer>
          <el-col :span="24" style="margin: 0px 0px" v-if="buttonGroup">
            <el-button
              size="small"
              @click="submit"
              style="display: inline-block"
              type="primary"
              >{{ $t("cm.commit") }}</el-button
            >
            <el-button
              size="small"
              @click="onCancel"
              style="display: inline-block; margin-left: 10px"
              type=""
              >{{ $t("cm.close") }}</el-button
            >
          </el-col>
          <el-col :span="24" style="text-align: center" v-else></el-col>
        </el-row>
        <el-row class="textBar">
          <el-input
            disabled="disabled"
            v-model="workDeptName"
            type="textarea"
            :rows="2"
          ></el-input>
        </el-row>
      </el-col>
    </el-col>
    <!-- ========================================权限控制======================================== -->
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
import urlAPI from "./common";
let that = "";
export default {
  name: "MSingle",
  props: {
    showCheckBox: Boolean,
    buttonGroup: Boolean,
    appCode: String,
    lang: String,
    initOrgId: String,
    IDS: String,
    //默认显示左侧组织树
    orgTreeExpand: Boolean,
    //左侧组织树常用组织ID
    orgTreeOrgIds: String,
  },
  data() {
    return {
      // tree data=======================
      filterText: "",
      //树结构
      data: [],
      defaultProps: {
        children: "children",
        label: "label",
      },

      // default data===================
      // 默认集团id
      deptNo: "00888888",
      // 树节点点击赋值
      clickTree: "",
      //左侧选择数据
      leftUserList: [],
      // 编辑
      isEditUserList: [],
      // 搜索框标题
      queryData: [this.$t("cm.queryData"), this.$t("cm.theSelectData")],
      // 搜索框placeHolder
      filterPlaceholder: this.$t("cm.filterPlaceholder"),

      // 搜索数据
      searchData: [],
      // 提交数据
      subValue: [],
      // 保存默认带出人员
      setIsEditUserList: [],
      // 所有数据
      myData: [],
      // 展示字符串
      renderFunc(h, option) {
        return <span>{option.label}</span>;
      },
      //keyword
      //树搜索数据
      // 搜索数据
      keyWord: "",
      // 提示字符串
      tipText: this.$t("cm.tipText"),
      //组织机构显示路径
      workDeptName: "",
      //左侧组织机构显示的数据
      leftWorkDeptNamePath: [],
      //右侧组织机构显示的数据
      rightWorkDeptNamePath: [],

      workDeptNamePathStatus: 0,
      // 是否展示
      isShow: false,
      // 输入时长限制字符
      flag: false,
      leftDefaultChecked: [],
      rightDefaultChecked: [],
      fpageParam: "",
      asingleClickCount: 0,

      //英文组织树样式
      showButton: "showButton",
      validata: true,
      inputFilterShow: true,
      //权限控制
      show: true,
      //组织树显示
      showBox: false,
      //宽度显示控制
      contentWidthLeft: 0,
      //宽度显示控制
      contentWidthRight: 23,
      // 分页参数
      currentPage: 1,
      pageSize: 100,
      total: 0,
      layout: "total, prev, pager, next",
      leftLoading: false,
      //左侧组织树常用列表
      orgTreeOrgList: [],
      orgTreeAllData: [],
    };
  },
  created() {
    // url = api.Url;
    that = this;
  },
  mounted() {
    urlAPI.getEnvType2();
    /**
     * 判断是否存在父页面， 如果存在则进行统计
     * 如果不存在则
     **/
    if (top.location.host != self.location.host) {
      let isAuthority = this.initPickPersonRequestMessages(1);
      console.log(isAuthority);
      if (!isAuthority) {
        this.validata = false;
      }
    }
    //英文时无数据设置为 No Data;
    if (this.lang && this.lang == "en_us") {
      this.showButton = "showButtonEn";
      this.$i18n.locale = "en-US";
      let nodeList = document.querySelectorAll(".el-transfer-panel__empty");
      for (let i = 0; i < nodeList.length; i++) {
        nodeList[i].innerHTML = "No Data";
      }
    }
    // 添加监听事件，处理 组织机构路径 显示问题。
    let buttons = document.querySelectorAll(".el-transfer__button");

    this.button0Func = function (e) {
      that.workDeptNamePathStatus++;
    }
    buttons[0].addEventListener("click", this.button0Func, true);

    this.button1Func = function (e) {
      that.workDeptNamePathStatus++;
    }
    buttons[1].addEventListener("click", this.button1Func, true);

    //checkbox;
    if (this.buttonGroup && this.buttonGroup == false) {
      this.buttonGroup = false;
    }
    // 加载默认带入人员
    if (this.IDS) {
      this.isEdit(this.IDS);
    }
    //添加统计及权限校验功能
    this.initPickPersonRequestMessages(1);
    //判断是否存在初始化部门initOrgId
    if (this.initOrgId && this.initOrgId != "") {
      this.deptNo = this.initOrgId;
      this.clickTree = this.initOrgId;
    }
    //加载组织树
    this.data = that.getOrgTreeForHr();
    //接受父页面发送来的信息
    this.messageFunc = function (event) {
      var data = event.data;
      if (event.data == "personwidget") {
        that.submit();
      }
    }
    window.addEventListener("message", this.messageFunc);
  },
  watch: {
    filterText(val) {
      this.$refs.tree.filter(val);
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
        that.flag = window.setTimeout(function () {
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
    },
    /**
     * 监听选中checkbox事件
     * @param {Object} nv
     */
    workDeptNamePathStatus(nv) {
      let arr = [];
      //这里延迟处理，不做延迟会导致querySelectorAll取空；
      let timer = setTimeout(function () {
        that.workDeptName = "";
        // let nodeList = document.querySelectorAll(
        //   ".el-checkbox.el-transfer-panel__item.is-checked"
        // );
        let nodeList = document.querySelectorAll(
          ".el-checkbox.el-transfer-panel__item"
        );
        for (var i = 0; i < nodeList.length; i++) {
          if (nodeList[i].firstChild.localName == "span") {
            arr.push(nodeList[i].firstChild.lastChild.defaultValue);
          }
        }
        let arr1 = [];
        for (var i = 0; i < that.myData.length; i++) {
          for (var j = 0; j < that.subValue.length; j++) {
            if (that.myData[i].empId == that.subValue[j]) {
              arr1.push(that.myData[i]);
            }
          }
        }

        arr1 = that.uniqueByParam(arr1, "empId");

        arr1.map((item) => {
          arr.map((item1) => {
            if (item.empId == item1) {
              that.workDeptName +=
                item.empName + "-" + item.workDeptNamePath + "\n";
            }
          });
        });
        clearTimeout(timer);
      }, 200);
    },
    initOrgId: {
      handler(newValue, oldValue) {
        this.keyWord = "";
        this.searchData = [];
      },
      deep: true,
    },
    IDS(newVal) {
      if (newVal) {
        this.isEdit(newVal);
      } else {
        this.resetData();
      }
    },
  },
  methods: {
    //翻页
    changeCurrentPage: function (current) {
      this.currentPage = current;
      this.selectEmpsByKeyWord();
    },
    //上一页
    prePage: function (current) {
      this.currentPage = current;
      this.selectEmpsByKeyWord();
    },
    //下一页
    nextPage: function (current) {
      this.currentPage = current;
      this.selectEmpsByKeyWord();
    },
    resetData() {
      this.subValue = [];
      this.keyWord = "";
      this.searchData = [];
      this.isShow = false;
    },
    initOrgTree() {
      urlAPI.getEnvType2();

      //英文时无数据设置为 No Data;
      if (this.lang && this.lang == "en_us") {
        this.showButton = "showButtonEn";
        this.$i18n.locale = "en-US";
        let nodeList = document.querySelectorAll(".el-transfer-panel__empty");
        for (let i = 0; i < nodeList.length; i++) {
          nodeList[i].innerHTML = "No Data";
        }
      }

      //checkbox;
      if (this.buttonGroup && this.buttonGroup == false) {
        this.buttonGroup = false;
      }
      // 加载默认带入人员
      if (this.IDS) {
        this.isEdit(this.IDS);
      }
      //添加统计及权限校验功能
      this.initPickPersonRequestMessages(1);
      //判断是否存在初始化部门initOrgId
      if (this.initOrgId && this.initOrgId != "") {
        this.deptNo = this.initOrgId;
        this.clickTree = this.initOrgId;
      }
      //加载组织树
      this.data = this.getOrgTreeForHr();
    },
    //===========================================Tree methods==================================================
    //===========================================Tree methods==================================================
    //===========================================Tree methods==================================================
    //===========================================Tree methods==================================================
    //===========================================Tree methods==================================================
    /**
     * 树filter
     * @param {Object} value
     * @param {Object} data
     */
    filterNode(value, data) {
      if (!value) return true;
      return data.label.indexOf(value) !== -1;
    },
    //加载常用组织
    initOrgTreeOrgData() {
      //默认展开
      if (this.orgTreeExpand == true) {
        this.showTree();
      }
      //组织树常用列表
      if (this.orgTreeOrgIds) {
        this.orgTreeAllData = JSON.parse(JSON.stringify(this.data));
        let orgIds = this.orgTreeOrgIds.split(',');
        this.orgTreeOrgList = [];
        orgIds.forEach((item) => {
          let found = this.orgTreeAllData.find((org) => org.id == item);
          if (!found) return;
          this.orgTreeOrgList.push({
            id: found.id,
            label: found.label,
            value: found.id,
            children: []
          })
        })
        this.$nextTick(() => {
          //点击第一个节点
          this.initOrgTreeClick(this.orgTreeOrgList[0].id);
        })
      }
    },
    //点击常用组织
    initOrgTreeClick(id) {
      if (id) {
        //组织id和关键字不能同时存在
        this.keyWord = '';
        this.data = this.orgTreeAllData;
        let data = this.orgTreeAllData.filter((item) => {
          return item.id == id || item.parentOrgId == id;
        });
        this.$nextTick(() => {
          this.data = data;
          this.isShow = false;
          let el = this.$refs.tree.$el;
          if (el) {
            this.$nextTick(() => {
              el.querySelector('.el-tree-node__content').click();
            })
          }
        })
      } else {
        this.data = this.orgTreeAllData;
      }
    },
    /**
     * 加载树结构，当点击某个树节点时加载子节点
     * 并将searchFnDeptNo改为当前点击节点id
     * @param {Object} data
     */
    getOrgTreeForHr(data) {
      let param = { orgId: that.deptNo, keyword: that.keyWord };
      let status = 0;
      if (data) {
        //点击树节点时
        param = {
          orgId: data.id,
          keyword: that.keyWord,
          pageNum: this.currentPage,
          pageSize: this.pageSize,
        };
        this.clickTree = data.id;
        status = 1;
        // const loading = this.$loading();
        this.leftLoading = true;
        urlAPI
          .getStaffsByOrgId(param)
          .then((res) => {
            this.total = res.data.total;
            this.currentPage = res.data.current;
            that.leftUserList = res.data.data;
            that.createData(that.leftUserList, "selectEmpsByKeyWord");
          })
          .finally(() => {
            // loading.close();
            this.leftLoading = false;
          });
        urlAPI.getOrgTreeForOrgWidget(param).then((res) => {
          const totalData = res.data.data;
          let arr = [];
          if (totalData && status == 0) {
            for (let i = 0; i < totalData.length; i++) {
              arr.push({
                id: totalData[i].deptNo,
                label: totalData[i].orgName,
                children: [],
                deptIdPath: totalData[i].deptIdPath,
              });
            }
            that.data = arr;
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
                    deptIdPath: totalData[i].deptIdPath,
                  });
                }
              }
            }
          }
        });
      } else {
        //第一次加载时
        urlAPI.getOrgTreeForOrgWidget(param).then((res) => {
          const totalData = res.data.data;
          let arr = [];
          if (totalData && status == 0) {
            for (let i = 0; i < totalData.length; i++) {
              arr.push({
                id: totalData[i].deptNo,
                label: totalData[i].orgName,
                children: [],
                deptIdPath: totalData[i].deptIdPath,
              });
            }
            that.data = arr;
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
                    deptIdPath: totalData[i].deptIdPath,
                  });
                }
              }
            }
          }
          //加载常用组织
          that.initOrgTreeOrgData();
        });
      }
    },

    //===========================================Tree methods==================================================
    //===========================================Tree methods==================================================
    //===========================================Tree methods==================================================
    //===========================================Tree methods==================================================
    //===========================================Tree methods==================================================

    //===========================================Msingle methods==================================================
    //===========================================Msingle methods==================================================
    //===========================================Msingle methods==================================================
    //===========================================Msingle methods==================================================
    //===========================================Msingle methods==================================================

    unique(arr) {
      for (var i = 0; i < arr.length; i++) {
        for (var j = i + 1; j < arr.length; j++) {
          if (arr[i] == arr[j]) {
            arr.splice(j, 1);
            j--;
          }
        }
      }
      return arr;
    },
    /**
     * 根据数组中某个字段的key进行去重
     * @param {Object} arr
     * @param {Object} key
     */
    uniqueByParam(arr, key) {
      var obj = {};
      var results = [];
      for (var i = 0; i < arr.length; i++) {
        if (!obj[arr[i][key]]) {
          results.push(arr[i]);
          obj[arr[i][key]] = true;
        }
      }
      return results;
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
    /**
     * 点击li给下方textarea显示组织机构路径
     * @param {Object} value
     */
    leftCheckChange(value, ite) {
      that.leftDefaultChecked = [];
      value.forEach((item) => {
        that.leftDefaultChecked.push(item);
      })
      //放入store
      that.AsingleUserList = that.leftDefaultChecked;
      //触发监听
      that.workDeptNamePathStatus++;

      // 添加监听事件，处理 组织机构路径 显示问题。
      let buttons = document.querySelectorAll(".el-transfer__button");
      let timer = setTimeout(function () {
        buttons[1].click();

        clearTimeout(timer);
      }, 200);
    },
    rightCheckChange(value, ite) {
      //触发监听
      // that.workDeptNamePathStatus++;
      // 添加监听事件，处理 组织机构路径 显示问题。
      let buttons = document.querySelectorAll(".el-transfer__button");
      let timer = setTimeout(function () {
        buttons[0].click();
        clearTimeout(timer);
      }, 200);
    },
    handleChange(value, direction, movedKeys) {
      let rightDefault = [];
      for (let i = 0; i < value.length; i++) {
        rightDefault.push(value[i]);
      }
      that.disRightCheckBox();
      // 右侧默认选中
      // that.rightDefaultChecked = rightDefault;
    },
    // 隐藏右侧的复选框
    disRightCheckBox() {
      that.$nextTick(() => {
        const transfer = that.$refs.transfer;
        const rightPanelHeader = transfer.$el.querySelectorAll(
          ".el-transfer-panel__list"
        )[1];
        const rightCheckboxInput = rightPanelHeader.querySelectorAll(
          ".el-checkbox__input"
        );
        const rightCheckboxLabel = rightPanelHeader.querySelectorAll(
          ".el-checkbox__label"
        );
        if (rightCheckboxInput) {
          rightCheckboxInput.forEach((item) => {
            item.style.display = "none";
          });
        }
        if (rightCheckboxLabel) {
          rightCheckboxLabel.forEach((item) => {
            item.style.marginLeft = "-24px";
          });
        }
      });
    },
    filterMethod(query, item) {
      that.disRightCheckBox();
      return item.label.indexOf(query) > -1;
    },
    /**
     * 输入框搜索输入
     * @param {Object} nv
     */
    selectEmpsByKeyWord(nv) {
      var deptNo = this.clickTree;
      if (!deptNo) {
        deptNo = this.deptNo;
      }
      // const loading = this.$loading();
      this.leftLoading = true;
      urlAPI
        .getStaffsByOrgId({
          orgId: deptNo,
          keyword: this.keyWord,
          pageNum: this.currentPage,
          pageSize: this.pageSize,
        })
        .then((res) => {
          // loading.close();
          this.leftLoading = false;
          this.total = res.data.total;
          this.currentPage = res.data.current;
          this.createData(res.data.data, "selectEmpsByKeyWord");
        })
        .catch((err) => {
          // loading.close();
          this.leftLoading = false;
        });
    },
    /**
     * 地址栏传参带出参数
     * @param {Object} ids
     */
    isEdit(ids) {
      let string = ids.replace(/;/g, ",");
      urlAPI.getStaffTysInfos({ userId: string }).then((res) => {
        let array = res;
        /** 返回字段不同,进行替换. */
        let arrayNew = JSON.parse(
          JSON.stringify(array)
            .replace(/staffNo/g, "empId")
            .replace(/staffName/g, "empName")
            .replace(/staffNamePy/g, "empNamePY")
        );
        this.createData(arrayNew.data.data, "isEdit");
        //触发监听
        that.workDeptNamePathStatus++;
      });
    },
    submit() {
      var returnArray = new Array(6);
      let xArr = [];
      returnArray[0] = "persons"; //用于标注组件类型
      if (this.myData.length > 0) {
        for (var i = 0; i < this.myData.length; i++) {
          for (var j = 0; j < this.subValue.length; j++) {
            if (this.myData[i].empId === this.subValue[j]) {
              xArr.push(this.myData[i]);
            }
          }
        }
      }
      //去重
      xArr = this.uniqueByParam(xArr, "empId");
      returnArray[1] = this.HandleDatasStructureDruingSub(xArr);
      returnArray[3] = that.fpageParam; //父页面传来的参数
      returnArray[4] = this.getDeptIdDuringSub(xArr);
      returnArray[5] = this.getDeptDuringSub(xArr);
      returnArray[6] = this.getDeptNumDuringSub(xArr);
      returnArray[7] = this.getPhoneNumDuringSub(xArr);
      parent.postMessage(returnArray, "/");
      this.CloseWindow("ok");
    },
    getData() {
      let returnArray = new Array(6);
      let xArr = [];
      returnArray[0] = "persons"; //用于标注组件类型
      if (this.myData.length > 0) {
        for (let i = 0; i < this.myData.length; i++) {
          for (let j = 0; j < this.subValue.length; j++) {
            if (this.myData[i].empId === this.subValue[j]) {
              xArr.push(this.myData[i]);
            }
          }
        }
      }
      //去重
      xArr = this.uniqueByParam(xArr, "empId");
      if (xArr && xArr.length > 0) {
        returnArray[1] = this.HandleDatasStructureDruingSub(xArr);
        returnArray[3] = that.fpageParam; //父页面传来的参数
        returnArray[4] = this.getDeptIdDuringSub(xArr);
        returnArray[5] = this.getDeptDuringSub(xArr);
        returnArray[6] = this.getDeptNumDuringSub(xArr);
        returnArray[7] = this.getPhoneNumDuringSub(xArr);
      }
      return returnArray;
    },
    /**
     * 封装数据
     * @param {Object} res
     * @param {Object} type
     */
    createData(res, type) {
      let data = res;

      if (data != null) {
        //兼容两种接口格式
        data.map((item) => {
          if (item.userId) {
            item.empId = item.userId;
          } else {
            item.userId = item.empId;
          }
          if (item.userName) {
            item.empName = item.userName;
          } else {
            item.userName = item.empName;
          }
        });
        let arr = [];

        that.searchData = [];

        //循环加入数据，与单选不同。
        for (var i = 0; i < data.length; i++) {
          this.myData.push(data[i]);
        }
        let storeMyData = this.myData;

        //右侧已选数组默认选中
        let rightDefault = [];

        for (let i = 0; i < data.length; i++) {
          let phoneNum = data[i].mobilePhone1
            ? data[i].mobilePhone1
            : this.$t("cm.noMoble");
          // let str = data[i].empId + "-" + data[i].empName.split("]")[1] + "-" + phoneNum;
          let str;
          if (data[i].empName.indexOf("]") > -1) {
            str = `[${data[i].empId}] ${data[i].empName.split("]")[1]} - ${
              data[i].workDeptName
            }`;
          } else {
            str = `[${data[i].empId}] ${data[i].empName} - ${data[i].workDeptName}`;
          }
          //这里处理初始化数据
          that.searchData.push({
            key: data[i].empId,
            label: str,
          });

          if (type == "isEdit") {
            that.subValue.push(this.myData[i].empId);
            //111111将初始化数据进行缓存到store
            that.setIsEditUserList.push(this.myData[i]);

            rightDefault.push(this.myData[i].empId);
          }
        }

        //222222取出缓存到store的数据，进行与this.subValue进行组合
        let getIsEditUserList = that.setIsEditUserList;
        let subValueArr = [];

        for (var i = 0; i < storeMyData.length; i++) {
          for (var j = 0; j < this.subValue.length; j++) {
            if (this.subValue[j] == storeMyData[i].empId) {
              subValueArr.push(storeMyData[i]);
            }
          }
        }
        //拼接数据
        subValueArr = this.uniqueByParam(subValueArr, "empId");
        getIsEditUserList = this.uniqueByParam(
          getIsEditUserList.concat(subValueArr),
          "empId"
        );

        if (getIsEditUserList) {
          for (var i = 0; i < getIsEditUserList.length; i++) {
            let phoneNum = getIsEditUserList[i].mobilePhone1
              ? getIsEditUserList[i].mobilePhone1
              : this.$t("cm.noMoble");
            // let str = getIsEditUserList[i].empId + "-" + getIsEditUserList[i].empName.split("]")[1] + "-" + phoneNum;
            let str;
            if (getIsEditUserList[i].empName.indexOf("]") > -1) {
              str = `[${getIsEditUserList[i].empId}] ${
                getIsEditUserList[i].empName.split("]")[1]
              } - ${getIsEditUserList[i].workDeptName}`;
            } else {
              str = `[${getIsEditUserList[i].empId}] ${getIsEditUserList[i].empName} - ${getIsEditUserList[i].workDeptName}`;
            }
            that.searchData.push({
              key: getIsEditUserList[i].empId,
              label: str,
            });
          }
        }
        //去重
        that.searchData = this.uniqueByParam(that.searchData, "key");
        that.disRightCheckBox();
        //右侧默认选中
        // that.rightDefaultChecked = rightDefault;
      }
    },
    HandleDatasStructureDruingSub(submitingDatasArray) {
      let returnList = [];
      returnList[0] = "";
      returnList[1] = "";
      var splitSymbol_1 = "]";
      var splitSymbol_2 = "-";
      var semicolon = ";";
      var tempParam;
      var userName;
      var submitingDatasObj = submitingDatasArray;
      if (!submitingDatasObj) {
        console.log("HandleDatasStructureDruingSub方法传入的数组参数为空!");
      }
      var num = submitingDatasObj.length;
      if (num != 0 && num > 1) {
        for (var i = 0; i < num; i++) {
          if (submitingDatasObj[i].empName.indexOf(splitSymbol_1) > -1) {
            tempParam = submitingDatasObj[i].empName.split(splitSymbol_1)[1];
          } else {
            tempParam = submitingDatasObj[i].empName;
          }
          userName = tempParam.split(splitSymbol_2)[0];
          returnList[0] += submitingDatasObj[i].empId + semicolon;
          returnList[1] += userName + semicolon;
        }
        returnList[0] = returnList[0].substr(0, returnList[0].length - 1);
        returnList[1] = returnList[1].substr(0, returnList[1].length - 1);
      } else if (num == 1) {
        for (var i = 0; i < num; i++) {
          if (submitingDatasObj[i].empName.indexOf(splitSymbol_1) > -1) {
            tempParam = submitingDatasObj[i].empName.split(splitSymbol_1)[1];
          } else {
            tempParam = submitingDatasObj[i].empName;
          }
          userName = tempParam.split(splitSymbol_2)[0];
          returnList[0] += submitingDatasObj[i].empId + semicolon;
          returnList[1] += userName + semicolon;
        }
        returnList[0] = returnList[0].substr(0, returnList[0].length - 1);
        returnList[1] = returnList[1].substr(0, returnList[1].length - 1);
      } else {
        console.log("HandleDatasStructureDruingSub方法传入的数组参数为空!");
      }
      return returnList;
    },
    getDeptDuringSub(userDataArr) {
      var deptArr = "";
      var semicolon = ";";
      if (userDataArr && userDataArr.length != 0) {
        for (var i = 0; i < userDataArr.length; i++) {
          var userObj = userDataArr[i];
          var deptNamePath = userObj["deptNamePath"];
          if (!deptNamePath) {
            deptNamePath = userObj["workDeptNamePath"];
          }
          deptArr += deptNamePath + semicolon;
        }
        deptArr = deptArr.substr(0, deptArr.length - 1);
      }
      return deptArr;
    },
    getDeptIdDuringSub(userDataArr) {
      var deptArr = "";
      var semicolon = ";";
      if (userDataArr && userDataArr.length != 0) {
        for (var i = 0; i < userDataArr.length; i++) {
          var userObj = userDataArr[i];
          var deptIdPath = userObj["deptIdPath"];
          if (!deptIdPath) {
            deptIdPath = userObj["workDeptId"];
          }
          deptArr += deptIdPath + semicolon;
        }
        deptArr = deptArr.substr(0, deptArr.length - 1);
      }
      return deptArr;
    },
    getDeptNumDuringSub(userDataArr) {
      var deptArr = "";
      var semicolon = ";";
      if (userDataArr && userDataArr.length != 0) {
        for (var i = 0; i < userDataArr.length; i++) {
          var userObj = userDataArr[i];
          var deptIdPath = userObj["workDeptIdPath"];
          if (!deptIdPath) {
            deptIdPath = userObj["workDeptIdPath"];
          }
          deptArr += deptIdPath + semicolon;
        }
        deptArr = deptArr.substr(0, deptArr.length - 1);
      }
      return deptArr;
    },
    getPhoneNumDuringSub(userDataArr) {
      var deptArr = "";
      var semicolon = ";";
      if (userDataArr && userDataArr.length != 0) {
        for (var i = 0; i < userDataArr.length; i++) {
          var userObj = userDataArr[i];
          var deptIdPath = userObj["mobilePhone1"];
          if (!deptIdPath) {
            deptIdPath = userObj["mobilePhone1"];
          }
          deptArr += deptIdPath + semicolon;
        }
        deptArr = deptArr.substr(0, deptArr.length - 1);
      }
      return deptArr;
    },
    CloseWindow(action) {
      if (window.CloseOwnerWindow) return window.CloseOwnerWindow(action);
      else window.close();
    },
    onCancel() {
      parent.postMessage("cancelPersons", "/");
      this.CloseWindow("cancel");
    },
    //===========================================Msingle methods==================================================
    //===========================================Msingle methods==================================================
    //===========================================Msingle methods==================================================
    //===========================================Msingle methods==================================================
    //===========================================Msingle methods==================================================

    reloadI18N() {
      if (this.$i18n.locale == "zh-CN") {
        this.$i18n.locale = "en_us";
      } else {
        this.$i18n.locale = "zh-CN";
      }
    },
    showTree() {
      this.show = !this.show;
      if (!this.show) {
        this.layout = "prev, pager, next";
        this.contentWidthLeft = 6;
        this.contentWidthRight = 17;
      } else {
        this.layout = "total, prev, pager, next";
        this.contentWidthLeft = 0;
        this.contentWidthRight = 23;
      }
      let timer = setTimeout(() => {
        this.showBox = !this.showBox;
        clearTimeout(timer);
      }, 200);
    },
    resetOrganization() {
      this.deptNo = "00888888";
      this.clickTree = "";
      this.keyWord = "";
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
          componentType: state,
        };
        let params_1 = {
          appCode: this.getUrlParam("appCode"),
          domain: arr[2],
        };
        let status = false;
        let active_fe = urlAPI.getActiveEnv();
        if (active_fe == "dev" || active_fe == "test") status = true;

        urlAPI.checkAuthority(params_1).then((res) => {
          // 统计功能
          if (res.data == true && res.code == 200) {
            urlAPI.insertPickPersonRequestMessages();
          }
        });

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
  },
  beforeDestroy() {
    // window.removeEventListener("message", function(event) {
    //   var data = event.data;
    //   if (event.data == "personwidget") {
    //     that.submit();
    //   }
    // });
    // let buttons = document.querySelectorAll(".el-transfer__button");
    // buttons[0].removeEventListener(
    //   "click",
    //   function(e) {
    //     that.workDeptNamePathStatus++;
    //   },
    //   true
    // );
    // buttons[1].removeEventListener(
    //   "click",
    //   function(e) {
    //     that.workDeptNamePathStatus++;
    //   },
    //   true
    // );
  },
};
</script>

<style scoped>
.custom-right-item {
  /* 隐藏右侧复选框 */
  padding-left: 10px; /* 调整文字位置，避免与左侧面板不对齐 */
}
.reloadButton {
  background-color: #0c7bca;
  color: #ffffff;
  border-radius: 3px;
  width: 17px;
  height: 15px;
  font-size: 13px;
  padding: 4px;
  letter-spacing: 2px;
  margin: 0 auto;
  z-index: 100;
}
.showButton {
  background-color: #0c7bca;
  color: #ffffff;
  border-radius: 3px;
  width: 17px;
  height: 80px;
  line-height: 17px;
  font-size: 13px;
  padding: 4px;
  letter-spacing: 2px;
  margin: 0 auto;
  z-index: 100;
}
.showButtonEn {
  background-color: #0c7bca;
  color: #ffffff;
  border-radius: 3px;
  width: 17px;
  height: 110px;
  font-size: 13px;
  padding: 4px;
  letter-spacing: 2px;
  margin: 0 auto;
  z-index: 100;
}

.border {
  /* width: 100%; */
  /* border: 1px solid #ebeff96e; */
  border-radius: 5px;
  /* height: 430px; */
  text-align: center;
  padding-top: 0px;
  /* margin: 0 auto; */
}
.border-right {
  /* width: 100%; */
  border-right: 1px solid #e9e9e9;
}
.left {
  /* height: 450px; */
  padding: 0px 5px;
}
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
.treeButton {
  -webkit-writing-mode: vertical-rl;
  writing-mode: vertical-rl;
  margin-left: 0px;
}
.transfer-footer {
  margin-left: 20px;
  padding: 6px 5px;
}
>>> .el-transfer {
  font-size: 14px;
  width: 100%;
  margin: 0 auto;
  text-align: center !important;
}
>>> .el-transfer-panel {
  /* border: 3px solid #f4f6f9; */
  border-radius: 5px;
  overflow: hidden;
  /* background: #fff; */
  display: inline-block;
  vertical-align: middle;
  width: 45%;
  text-align: left;
  max-height: 100%;
  box-sizing: border-box;
  position: relative;
}
>>> .el-transfer-panel__list.is-filterable {
  padding-top: 0;
}
>>> .el-transfer__buttons {
  display: inline-block;
  vertical-align: middle;
  padding: 0 0px;
  width: 10%;
}
/* >>> .el-button {
  display: block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;
  -webkit-appearance: none;
  text-align: center;
  box-sizing: border-box;
  outline: 0;
  margin: 0 auto;
  transition: 0.1s;
  font-weight: 500;
  font-size: 14px;
  border-radius: 4px;
} */
>>> .el-button + .el-button {
  margin: 0 auto;
}
/* >>> .el-button--primary {
  color: #fff;
  background-color: #0c7bca;
  border-color: #0c7bca;
} */
>>> .el-checkbox__input.is-checked .el-checkbox__inner,
.el-checkbox__input.is-indeterminate .el-checkbox__inner {
  background-color: #0c7bca;
  border-color: #0c7bca;
}
>>> .el-checkbox__input.is-indeterminate .el-checkbox__inner {
  background-color: #0c7bca;
  border-color: #0c7bca;
}
>>> .el-checkbox__input.is-checked + .el-checkbox__label {
  /* color: #333333 !important; */
}
>>> .el-checkbox__label {
  display: inline-block;
  padding-left: 10px;
  line-height: 19px;
  font-size: 14px;
}
>>> .el-transfer-panel .el-transfer-panel__header {
  height: 50px;
  line-height: 50px;
  /* background: #fff; */
  margin: 0;
  padding-left: 15px;
  /* border-bottom: 2px solid #f4f6f9; */
  box-sizing: border-box;
  color: #333333;
}
>>> .el-transfer-panel .el-transfer-panel__header .el-checkbox {
  line-height: 50px;
}
>>> .el-transfer-panel__filter {
  margin: 0px;
  padding: 10px;
}
>>> .el-transfer-panel__filter .el-input__inner {
  height: 32px;
  width: 100%;
  font-size: 12px;
  display: inline-block;
  box-sizing: border-box;
  border-radius: 5px;
  padding-right: 10px;
  padding-left: 30px;
}
>>> .el-transfer-panel__filter .el-input__icon {
  margin-left: 5px;
  margin-top: 2px;
}
>>> .el-transfer__button:first-child {
  /* position: absolute; */
  /* top: 170px; */
  /* left: 47.3%; */
  /* text-align: center; */
  margin-bottom: -70px;
  /* margin: 0 auto; */
}
.textBar {
  margin: 15px 0 0;
  padding: 0px 0px;
  width: 100%;
}
.keywordBar {
  margin: 0 auto 15px auto;
  padding: 0px;
  width: 100%;
  /* height: 65px; */
}
.showName {
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  display: block;
  height: 34px;
  line-height: 34px;
}
>>> .el-dialog__body {
  padding: 10px 15px 0 15px !important;
}
>>> .el-scrollbar__bar {
  display: none !important;
}
>>> .el-scrollbar__view {
  padding-bottom: 10px;
}
/* 分页 */
>>> .el-pagination .btn-next {
  padding-left: 0;
}
>>> .el-pagination__total {
  margin-right: 0;
}
>>> .el-pager li {
  border: none;
  min-width: auto;
  margin-right: 0;
}
>>> .el-pager li.active {
  background-color: #fff !important;
  color: #0c7bca !important;
}
>>> .el-pager li.active + li {
  border-left: none;
}
>>> .el-pagination .btn-prev {
  padding-right: 0;
}

.org-tree-tags {
  width: 100%;
  text-align: left;
  padding-left: 0px;
  padding-bottom: 10px
}
.org-tree-tags .tag-title {
  padding-bottom: 5px;
}
.org-tree-tags .el-tag {
  cursor: pointer;
}
</style>

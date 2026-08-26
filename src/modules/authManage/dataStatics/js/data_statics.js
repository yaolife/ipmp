import { hasPermission } from "@/permission/btn";
import api from "../api/appApi";
import { throttle } from "@/utils/funcUtil";
import breadcrumb from '@/components/common/breadcrumb'
import { calcHeight } from "@/utils/funcUtil";

export default {
  components:{
    breadcrumb
},
  data() {
    return {
      components:{
        breadcrumb
    },
      hasIcon: false,
      brand:[
          { name: 'dataAuth.auth_manage' },
          { name: 'dataAuth.data_auth_statics'},
      ],//面包屑

      activeName: "roleDimension",
      // 人员维度
      tableDataPerson: [],
      // 角色维度
      tableDataRole: [],
      // 组维度
      tableDataGroup: [],
      // 组织维度
      tableDataForm: [],
      // 岗位维度
      tableDataJob: [],
      // 功能维度
      tableDataEffect: [],
      multipleSelection: [],
      is_collapse: false,
      // activeName:[],
      advSearch: "te.advance_search",
      tableData: [],
      isSelected: [],
      mulSelect: [],
      showDisabled: true,
      showDialog: false,
      loading: false,
      total: 0,
      values: true,
      pageCount: 0,

      current: 1,
      size: 10,

      entityDetailParam: {
        entityId: "",
        entityName: ""
      },
      model: {
        roleName: "",
        staffNo:""
      },
      searchParams: { searchType: "0" },
      maxTableHeight: 0,
      fullscreenLoading: false
    };
  },
  methods: {
    // 动态计算高度
    initMaxHeight() {
      calcHeight(this);
    },
    //获取列表
    getTableData(params) {
      this.loading =true
      this.multipleSelection = []
      switch (this.activeName) {
        case "personDimension":
          api.getDataAuthPageListByUser(params).then(res => {
              this.current = res.current;
              this.total = res.total;
              this.size = res.size;
              this.tableDataPerson = res.records;
              this.loading =false
            })
            .catch(err => {
              console.log(err);
            });
          break;
        case "roleDimension":
          api.getDataAuthPageListByRole(params).then(res => {
              this.current = res.current;
              this.total = res.total;
              this.size = res.size;
              this.tableDataRole = res.records;
              this.loading =false
            })
            .catch(err => {
              console.log(err);
            });
          break;
        case "groupDimension":
          api.getDataAuthPageListByGroup(params).then(res => {
              this.current = res.current;
              this.total = res.total;
              this.size = res.size;
              this.tableDataGroup = res.records;
              this.loading =false
            })
            .catch(err => {
              console.log(err);
            });
          break;
        case "formDimension":
          api
            .getDataAuthPageListByOrg(params)
            .then(res => {
              this.current = res.current;
              this.total = res.total;
              this.size = res.size;
              this.tableDataForm = res.records;
              this.loading =false
            })
            .catch(err => {
              console.log(err);
            });
          break;
        case "postDimension":
          api.getDataAuthPageListByPost(params).then(res => {
              this.current = res.current;
              this.total = res.total;
              this.size = res.size;
              this.tableDataJob = res.records;
              this.loading =false
            })
            .catch(err => {
              console.log(err);
            });
          break;
        case "effectDimension":
          api
            .getDataAuthPageListByUser(params)
            .then(res => {
              console.log(res);
            })
            .catch(err => {
              console.log(err);
            });
          break;
        default:
          break;
      }
    },
    dataFormat(time) {
      let date = new Date(time.createDate);
      let month = date.getMonth() + 1;
      let str =
        date.getFullYear() +
        "-" +
        month +
        "-" +
        date.getDate() +
        " " +
        date.getHours() +
        ":" +
        date.getMinutes() +
        ":" +
        date.getSeconds();
      return str;
    },
    //重置数据
    resetData() {
      this.model.roleName = "";
      this.model.staffNo = "";
      this.search()
    },
    //高级搜索
    search() {
      let params = {
        // searchType: 0,
        pageIndex: 1,
        pageSize: 10,
        roleName: this.model.roleName,
        staffNo:this.model.staffNo
      };
      this.getTableData(params);
    },
    //改变每页显示数
    changeSize(size) {
      let params = {
        pageIndex: 1,
        pageSize: size,
        roleName: this.model.roleName,
        staffNo:this.model.staffNo
      };
      this.size = size;
      this.getTableData(params);
    },
    //翻页
    changeCurrentPage(current) {
      let params = {
        pageIndex: current,
        pageSize: this.size,
        roleName: this.model.roleName,
        staffNo:this.model.staffNo
      };
      this.current = current;
      this.getTableData(params);
    },
    //每行的删除操作
    delData(row) {
      let params = {
        pageIndex: 1,
        pageSize: 10,
      }
      this
        .$confirm(this.$t("cm.is_delete"), this.$t("cm.tips"), {
          type: "warning",
          confirmButtonText: this.$t("cm.confirm"),
          cancelButtonText: this.$t("cm.cancel"),
          cancelButtonClass: "cud__button--reset",
          confirmButtonClass: "cud__button--search"
        })
        .then(() => {
          switch (this.activeName) {
            case "personDimension":
              api.deleteDataAuthByUser({ staffNo: row.staffNo })
              .then(res => {
                this.getTableData(params)
              })
                .catch(err => {
                  console.log(err);
                });
              break;
            case "roleDimension":
              api.delDataAuthByRoleAndObjType({ roleId: row.roleId,objType:row.objType })
              .then(res => {
                this.getTableData(params)
              })
                .catch(err => {
                  console.log(err);
                });
              break;
            case "groupDimension":
              api.getDataAuthPageListByGroup(params).then(res => {
                  console.log(res);
                  this.current = res.current;
                  this.total = res.total;
                  this.size = res.size;
                  this.tableDataGroup = res.records;
                  this.loading =false
                })
                .catch(err => {
                  console.log(err);
                });
              break;
            case "formDimension":
              api
                .getDataAuthPageListByOrg(params)
                .then(res => {
                  console.log(res);
                  this.current = res.current;
                  this.total = res.total;
                  this.size = res.size;
                  this.tableDataForm = res.records;
                  this.loading =false
                })
                .catch(err => {
                  console.log(err);
                });
              break;
            case "postDimension":
              api.getDataAuthPageListByPost(params).then(res => {
                  console.log(res);
                  this.current = res.current;
                  this.total = res.total;
                  this.size = res.size;
                  this.tableDataJob = res.records;
                  this.loading =false
                })
                .catch(err => {
                  console.log(err);
                });
              break;
            case "effectDimension":
              api
                .getDataAuthPageListByUser(params)
                .then(res => {
                  console.log(res);
                })
                .catch(err => {
                  console.log(err);
                });
              break;
            default:
              break;
          }
        })
        .catch(error => {});
    },
    //点击修改按钮
    editPerson(row) {
      this.$router.push({
        path: "/dataStatics/person",
        query: { id: row.entityId }
      });
    },
    //打开引用详情
    entityDetail(param) {
      let _this = this;
      _this.entityDetailParam.entityId = param;
      _this.getRelationUnionIdType();
    },
    //显示按钮
    showBtn(btn) {
      return hasPermission(btn);
    },
    getRelationUnionIdType() {
      let _this = this;
      _this.loading = true;
      let param = _this.entityDetailParam;
      param = Object.assign(param, {
        current: _this.current,
        size: _this.size
      });
      api.entityDetailList(param).then(res => {
        _this.loading = false;
        if (res.code === "0") {
          alert(1);
          /*   _this.ruleDetailData = res.records
            _this.ruleDetailTotal = res.total*/
        } else {
          _this.$message({ type: "error", message: res.msg });
        }
      });
    },
    exportFile() {
      console.log(this.multipleSelection)
      let params = {
        searchType: 0,
        pageIndex: 1,
        pageSize: 10,
        roleName: this.model.roleName,
        staffNo:this.model.staffNo
    }
      switch(this.activeName){
        case 'personDimension':
          api.exportDataAuthInfoByUser(params).then(res=>{
            let elink = document.createElement('a');
            elink.download = "人员维度.xls";
            elink.style.display = 'none';
            let blob = new Blob([res]);
            elink.href = URL.createObjectURL(blob);
            document.body.appendChild(elink);
            elink.click();
            document.body.removeChild(elink);
          }).catch(err=>{
            console.log(err)
          })
          break;
        case 'roleDimension':
          api.exportDataAuthInfoByRole(params).then(res=>{
            let elink = document.createElement('a');
            elink.download = "角色维度.xls";
            elink.style.display = 'none';
            let blob = new Blob([res]);
            elink.href = URL.createObjectURL(blob);
            document.body.appendChild(elink);
            elink.click();
            document.body.removeChild(elink);
          }).catch(err=>{
            console.log(err)
          })
          break;
        default:
            break;
      }
    },
    getRole(row) {
      this.$router.push({path:'/dataStatics/role',query:{roleId:row.roleId,roleName:row.roleName}})
      // window.open("/#/dataStatics/role");
    },
    getPerson(row) {
      console.log(row)
      this.$router.push({path:"/dataStatics/person",query:{staffNo:row.staffNo,name:row.staffName,functionCode:row.functionCode}})
      // window.open("/#/dataStatics/person");
    },
    getGroup() {
      window.open(`/#/dataStatics/group`);
    },
    getOrg(){
      window.open(`/#/dataStatics/org`);
    },
    getPost(){
      window.open(`/#/dataStatics/post`);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
      console.log(this.multipleSelection)
    },
    handleClick(tab) {
      let params = {
        pageIndex: 1,
        pageSize: 10,
        entityName: "",
        searchType: 0,
        roleName: this.model.roleName,
        staffNo:this.model.staffNo
      };
      // this.size = 10
      this.current = 1;
      this.activeName = tab.name;
      this.getTableData(params);
    },
    // 复制
    authCopy(row) {
      this.$router.push({path:"/dataStatics/transfer",query: { roleType: '2' ,deliver:row.staffName,roleId:row.roleId,staffNo:row.staffNo}});
      // window.open(process.env.DOMAIN_PATH + "/#/dataStatics/copy",);
    },
    // 转移
    authMove(row) {
      // window.open(process.env.DOMAIN_PATH + "/#/dataStatics/transfer");
      this.$router.push({path:"/dataStatics/transfer",query: { roleType: '1',deliver:row.staffName,roleId:row.roleId,staffNo:row.staffNo }});
    },
    // 编辑
    editAuth(row,state) {
      //1 人员，2组，3岗位，4组织
      this.$router.push({path:"/dataStatics/update",query: { objectType: state,roleId:row.roleId,staffNo:row.staffNo,roleGroupId:row.roleGroupId,dataAuthId:row.dataAuthId }});
    },
    editRole(row){
      console.log(row)
      this.$router.push({path:"/dataStatics/roleUpdate",query:{objType:row.objType,roleId:row.roleId,dataAuthId:row.dataAuthId,staffNo:row.staffNo}})
    }
  },
  created() {
    let params = {
      searchType: 0,
      pageIndex: 1,
      pageSize: 10,
      entityName: ""
    };
    this.getTableData(params);
  },
  mounted() {
    this.initMaxHeight();
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
  },
  beforeDestroy() {
    window.removeEventListener("resize", this.throttleFunc);
  },
  computed: {
    changeCollapse: function() {
      //用于对话框的对齐
      return this.$root.COLLAPSE;
    }
  },
  watch: {
    //监听 是否显示修改按钮
    mulSelect: function() {
      if (this.mulSelect.length === 0) {
        this.showDisabled = true;
      } else {
        this.showDisabled = false;
      }
    }
  }
};

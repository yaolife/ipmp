import api from "../../userManage/api";
import breadcrumb from "@/components/common/breadcrumb";
import { throttle } from "@/utils/funcUtil";
import queryForm from "@/components/common/queryForm";
import { calcHeight } from "@/utils/funcUtil";

  export default {
    name: "deptUsers",
    components: {
      breadcrumb,
      queryForm
    },
    data: function() {
      return {
        maxTableHeight: 0,
        tableData: [],
        //分页
        tablePage: {
          current: 1,
          size: 10,
          total: 0,
        },
        queryVO: {
          userDeptId: "",
          userId: "",
          userName: "",
          userStatus: "",
          cellphoneNo: ""
        },
        loading: false,
        //搜索字段
        queryFields: [
          { name: 'userId', label: '员工号', labelKey: '', value: '', type: 'input', display: true, order: 1 },
          { name: 'userName', label: '员工姓名', labelKey: '', value: '', type: 'input', display: true, order: 2 },
          { name: 'cellphoneNo', label: '手机号', labelKey: '', value: '', type: 'input', display: true, order: 3 },
        ],
      };
    },
    mounted() {
      //获取人员
      this.getList();
      this.initMaxHeight();
      // throttleFunc记录当前的节流方法，用于在页面销毁时释放
      this.throttleFunc = throttle(this.initMaxHeight, 500);
      window.addEventListener("resize", this.throttleFunc);
    },
    computed: {
      headers() {
        return {
          token: sessionStorage.getItem('token')
        }
      }
    },
    methods: {
      // 动态计算高度
      initMaxHeight() {
        calcHeight(this, -20);
      },
      //高级搜索展开
      advanceSearch(val) {
        let _this = this;
        _this.advSearch = val ? "收起" : "展开";
        _this.iconArrow = val ? "el-icon-arrow-up" : "el-icon-arrow-down";
        setTimeout(() => {
          _this.initMaxHeight();
        }, 335);
      },

      //重置数据
      resetData() {
        this.queryVO.userId = "";
        this.queryVO.userName = "";
        this.queryVO.userStatus = "";
        this.queryVO.cellphoneNo = "";
        this.getList();
      },
      //改变每页显示数
      changeSize(size) {
        this.tablePage.size = size;
        this.getList();
      },
      changeCurrentPage(current) {
        this.tablePage.current = current;
        this.getList();
      },
      //搜索
      search: function() {
        let queryForm = this.$refs.queryForm.getQueryForm();
        this.queryVO.userId = queryForm.userId;
        this.queryVO.userName = queryForm.userName;
        this.queryVO.cellphoneNo = queryForm.cellphoneNo;
        this.getList();
      },
      //查询数据
      getList(deptId = "") {
        this.loading = true
        let _this = this;
        let params = Object.assign(_this.queryVO, _this.tablePage);
        // if (deptId === "") {
        //   return;
        // } else {
        //   params['userDeptId'] = deptId;
        // }
        if (deptId) this.queryVO.userDeptId = deptId;
        params['userDeptId'] = this.queryVO.userDeptId;
        api.userList(params).then((response) => {
          _this.tableData = response.data.records;
          _this.tablePage.total = response.data.total;
          _this.tableShow = true;
          _this.loading = false
        });
      },
      //添加
      dataAdd() {
        this.$router.push({ path: "/userManage/edit" });
      },
      // 编辑
      dataEdit(data) {
        this.$router.push({ path: "/userManage/edit", query: { userId: data.userId } });
      },
      // 删除
      dataDel(data) {
        let _this = this;
        _this.$confirm(_this.$t("dataAuth.ifdelete"), _this.$t("cm.tips"), {
            confirmButtonText: _this.$t("cm.confirm"),
            cancelButtonText: _this.$t("cm.cancel"),
            type: "warning",
          })
          .then(() => {
            let params = { ids: [data.id] }
            api.userDel(params).then((response) => {
              if (response.data.code === "0") {
                _this.$message({
                  message: response.data.msg,
                  type: "success",
                });
                _this.getList();
              } else {
                _this.$message.error(response.data.msg);
              }
            });
          })
          .catch(() => {
            let message = _this.$t("dataAuth.deletecancel");
            _this.$message({
              type: "info",
              message: message,
            });
          });
      },
    },
    beforeDestroy() {
      window.addEventListener("resize", this.throttleFunc);
    },
  };

import api from "../api";
import breadcrumb from "@/components/common/breadcrumb";
import { throttle } from "@/utils/funcUtil";
import organization from '@/components/cudCommPersonComponent/organization.vue';
import { calcHeight } from "@/utils/funcUtil";

export default {
  name: "userEdit",
  components: {
    breadcrumb,
    organization
  },
  props: {
    userId: {
      type: String
    },
    url: {
      type: String
    },
    self: {
      type: Boolean
    }
  },
  data: function() {
    var validateCellphone = (rule, value, callback) => {
      let reg = /1[0-9]{10}/;
      if (!reg.test(value)) {
        callback(new Error('手机号格式错误！'));
      } else {
        callback();
      }
    };
    return {
      hasIcon: false,
      brand: [{ name: "dataAuth.user_manage" }, { name: "用户信息" }],
      maxTableHeight: 0,
      model: {},
      isEdit: false,
      uploadUrl: envConfig.API_ROOT + "/userManage/upload",
      rules: {
        userId: [
          { required: true, message: "请填写工号", trigger: 'blur' },
          // { min: 7, max: 7, message: '员工号必须是7位', trigger: 'blur' },
          { validator: (rule, value, callback) => {
            if (this.isEdit) {
              //编辑时不验证
              callback();
              return;
            }
            let params = { userId: value };
            api.validateUserId(params).then(response => {
              let res = response.data;
              if (res.data == true) {
                callback(new Error('员工号已存在！'));
              } else {
                callback();
              }
            }).catch(err => {
              callback(new Error('验证失败，请重试！'))
            })
          }, trigger: 'blur' }
        ],
        userName: [
          { required: true, message: "请填写姓名", trigger: 'blur' },
          // { min: 2, max: 4, message: '姓名必须是2-4位', trigger: 'blur' },
        ],
        userSex: [
          { required: true, message: "请填写性别", trigger: 'blur' },
        ],
        cellphoneNo: [
          { required: true, message: "请填写手机号", trigger: 'blur' },
          { min: 11, max: 11, message: '手机号必须是11位', trigger: 'blur' },
          { validator: validateCellphone, trigger: 'blur' }
        ],
        email: [
          { required: true, message: "请填写邮箱", trigger: 'blur' },
          // { type: "email", message: "请填写正确的邮箱", trigger: 'blur' },
        ],
        userClassId: [
          { required: true, message: "请填写人员类型", trigger: 'blur' },
        ],
        userStatus: [
          { required: true, message: "请填写状态", trigger: 'blur' },
        ],
        userJoinDate: [
          { required: true, message: "请填写入职时间", trigger: 'blur' },
        ],
        userLeftDate: [
          { required: true, message: "请填写离职时间", trigger: 'blur' },
        ],
        companyName: [
          { required: true, message: "请填写公司", trigger: 'blur' },
        ],
        userDeptName: [
          { required: true, message: "请填写部门", trigger: 'blur' },
        ],
        workDeptName: [
          { required: true, message: "请填写工作部门", trigger: 'blur' },
        ],
        userPosiName: [
          { required: true, message: "请填写职位", trigger: 'blur' },
        ],
      },
      //选部门
      companyVisible: false,
      companyCallback: null,
      companyIds: [],
      companyKey: '',
      //人员类型
      userClassList: [
        { id: 0, label: "在编人员", value: "0"},
        { id: 1, label: "非在编人员", value: "1"},
        { id: 2, label: "其他", value: "2"},
      ],
      //民族
      nationList: [
      	{id: 1, label: "汉族", value: 1},
      	{id: 2, label: "壮族", value: 2},
      	{id: 3, label: "满族", value: 3},
      	{id: 4, label: "回族", value: 4},
      	{id: 5, label: "苗族", value: 5},
      	{id: 6, label: "维吾尔族", value: 6},
      	{id: 7, label: "土家族", value: 7},
      	{id: 8, label: "彝族", value: 8},
      	{id: 9, label: "蒙古族", value: 9},
      	{id: 10, label: "藏族", value: 10},
      	{id: 11, label: "布依族", value: 11},
      	{id: 12, label: "侗族", value: 12},
      	{id: 13, label: "瑶族", value: 13},
      	{id: 14, label: "朝鲜族", value: 14},
      	{id: 15, label: "白族", value: 15},
      	{id: 16, label: "哈尼族", value: 16},
      	{id: 17, label: "哈萨克族", value: 17},
      	{id: 18, label: "黎族", value: 18},
      	{id: 19, label: "傣族", value: 19},
      	{id: 20, label: "畲族", value: 20},
      	{id: 21, label: "傈僳族", value: 21},
      	{id: 22, label: "仡佬族", value: 22},
      	{id: 23, label: "东乡族", value: 23},
      	{id: 24, label: "高山族", value: 24},
      	{id: 25, label: "拉祜族", value: 25},
      	{id: 26, label: "水族", value: 26},
      	{id: 27, label: "佤族", value: 27},
      	{id: 28, label: "纳西族", value: 28},
      	{id: 29, label: "羌族", value: 29},
      	{id: 30, label: "土族", value: 30},
      	{id: 31, label: "仫佬族", value: 31},
      	{id: 32, label: "锡伯族", value: 32},
      	{id: 33, label: "柯尔克孜族", value: 33},
      	{id: 34, label: "达斡尔族", value: 34},
      	{id: 35, label: "景颇族", value: 35},
      	{id: 36, label: "毛南族", value: 36},
      	{id: 37, label: "撒拉族", value: 37},
      	{id: 38, label: "布朗族", value: 38},
      	{id: 39, label: "塔吉克族", value: 39},
      	{id: 40, label: "阿昌族", value: 40},
      	{id: 41, label: "普米族", value: 41},
      	{id: 42, label: "鄂温克族", value: 42},
      	{id: 43, label: "怒族", value: 43},
      	{id: 44, label: "京族", value: 44},
      	{id: 45, label: "基诺族", value: 45},
      	{id: 46, label: "德昂族", value: 46},
      	{id: 47, label: "保安族", value: 47},
      	{id: 48, label: "俄罗斯族", value: 48},
      	{id: 49, label: "裕固族", value: 49},
      	{id: 50, label: "乌孜别克族", value: 50},
      	{id: 51, label: "门巴族", value: 51},
      	{id: 52, label: "鄂伦春族", value: 52},
      	{id: 53, label: "独龙族", value: 53},
      	{id: 54, label: "塔塔尔族", value: 54},
      	{id: 55, label: "赫哲族", value: 55},
      	{id: 56, label: "珞巴族", value: 56}
      ],
    };
  },
  mounted() {
    if (this.$route.query.userId || this.userId) {
      this.isEdit = true;
      //编辑时要获取详情
      this.getDetail();
    }
    this.initMaxHeight();
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
  },
  beforeDestroy() {
    window.addEventListener("resize", this.throttleFunc);
  },
  methods: {
    // 动态计算高度
    initMaxHeight() {
      calcHeight(this, -125);
    },
    //获取详情
    getDetail() {
      const loading = this.$loading();
      let _this = this;
      let params = { userId: this.$route.query.userId || this.userId };
      let userApi;
      if (this.self == true) {
        //当前用户
        userApi = api.userInfo;
      } else {
        userApi = api.userDetail;
      }
      userApi(params).then(res => {
        loading.close();
        if (res.data.code === "0") {
          _this.model = { ...res.data.data };
          //取出部门信息
          if (_this.model.userDeptId) {
            _this.model.userDeptName = _this.model.userDeptEntity.deptName;
          } else {
            _this.model.userDeptName = '';
          }
          if (_this.model.workDeptId) {
            _this.model.workDeptName = _this.model.userWorkDeptEntity.deptName;
          } else {
            _this.model.workDeptName = '';
          }
        } else {
          _this.$message.error(res.data.msg);
        }
      }).catch((res) => {
        loading.close();
      });
    },
    //人员类型切换
    userClassChange(value) {
      this.userClassList.forEach((item) => {
        if (item.value === value) this.model.userClassName = item.label;
      })
    },
    //提交
    handleSubmit() {
      this.$refs['userForm'].validate((valid) => {
        if (!valid) return false;
        const loading = this.$loading();
        let _this = this;
        let params = { ..._this.model };
        //编辑
        if (this.$route.query.userId) {
          params['isEdit'] = true;
        } else {
          params['isEdit'] = false;
        }
        let userApi;
        if (this.self == true) {
          //当前用户
          userApi = api.userUpdate;
        } else {
          userApi = api.userEdit;
        }
        userApi(params).then(res => {
          loading.close();
          if (res.data.code === "0") {
            _this.$message({ message: res.data.msg, type: "success" });
            //刷新列表
            if (window.refreshData) {
              window.refreshData();
            }
            if (!_this.self) {
              //关闭页签
              _this.closeTab("/userManage");
            }
          } else {
            _this.$message.error(res.data.msg);
          }
        }).catch((res) => {
          loading.close();
        });
      });
    },
    //取消
    handleClose() {
      let _this = this;
      _this.$confirm("确定不保存修改并返回？", _this.$t("cm.tips"), {
        confirmButtonText: _this.$t("cm.confirm"),
        cancelButtonText: _this.$t("cm.cancel"),
        type: "warning",
      }).then(() => {
        //刷新列表
        if (window.refreshData) {
          window.refreshData();
        }
        if (_this.url) {
          // _this.$router.push({ path: _this.url });
          //关闭页签
          _this.closeTab(_this.url);
        } else {
          // _this.$router.push({ path: "/userManage" });
          //关闭页签
          _this.closeTab("/userManage");
        }
      }).catch(() => {
        //
      });
    },
    //上传之前判断
    uploadBefore: function(file) {
      let type = file.name.substring(file.name.lastIndexOf(".") + 1);
      if (type != "jpg" && type != "png" && type != "JPG" && type != "PNG") {
        this.$alert("请选择jpg/png文件上传", this.$t("cm.tips"));
        return false;
      } else {
        return true;
      }
    },
    //上传中
    uploading: function() {
      //
    },
    //上传失败
    uploadError: function() {
      this.$alert("上传失败!", this.$t("cm.tips"));
    },
    //上传之后的回调
    uploadSuccess: function(response) {
      if (response.code == "0") {
        this.$message({ message: "上传成功", type: "success" });
        //刷新列表页
      } else {
        this.$alert(response.msg, this.$t("cm.tips"));
      }
    },
    //选部门
    companySelect(callback, companyId, companyName) {
      this.companyVisible = true;
      this.companyCallback = callback;
      if (!companyId || !companyName) return;
      let ids = [];
      ids[1] = [companyId, companyId, '', '', '', companyName, '', ''];
      this.companyIds = ids;
      this.companyKey = Math.random();
    },
    componyCallback1(data) {
      this.$set(this.model, 'companyId', data[1][0]);
      this.$set(this.model, 'companyName', data[1][5]);
    },
    componyCallback2(data) {
      this.$set(this.model, 'userDeptId', data[1][0]);
      this.$set(this.model, 'userDeptName', data[1][5]);
    },
    componyCallback3(data) {
      this.$set(this.model, 'workDeptId', data[1][0]);
      this.$set(this.model, 'workDeptName', data[1][5]);
    },
    //关闭选择部门
    companyClose() {
      this.companyVisible = false
    },
    //提交部门选择
    companySubmit() {
      let selCompanyData = this.$refs.companyComponent.getData();
      this.companyVisible = false;
      this.companyCallback(selCompanyData);
    },
  }
};

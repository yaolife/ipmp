import api from '../api/index';
import person from '@/components/cudCommPersonComponent/msingle.vue';
import { throttle } from "@/utils/funcUtil";
import { calcHeight } from "@/utils/funcUtil";

export default {
  name: 'editDept',
  components: {
    person
  },
  data: function() {
    return {
      maxTableHeight: 0,
      isNotAble: false,
      editModel: {},
      deptId: '',
      //部门级别数据
      deptRankList: [
        { id: "001010", label: "公司级", value: "001010"},
        { id: "001020", label: "部门级", value: "001020"},
        { id: "001030", label: "处级", value: "001030"},
        { id: "001040", label: "科级", value: "001040"},
      ],
      loading: false,
      ruleValidate: {
        deptId: [
          { required: true, message: this.$t('cm.tiprequired') },
          { validator: (rule, value, callback) => {
            if (this.modelType === 'edit') {
              //编辑时不验证
              callback();
              return;
            }
            let params = { deptId: value };
            api.validateDeptId(params).then(response => {
              let res = response.data;
              if (res.data == true) {
                callback(new Error('部门ID已存在！'));
              } else {
                callback();
              }
            }).catch(err => {
              callback(new Error('验证失败，请重试！'))
            })
          }, trigger: 'blur' }
        ],
        deptName: [
          { required: true, message: this.$t('cm.tiprequired') }
        ],
        deptCode: [
          { required: true, message: this.$t('cm.tiprequired') }
        ],
        deptStatus: [
          { required: true, message: this.$t('cm.tiprequired') }
        ],
        // deptParentName: [
        //   { required: true, message: this.$t('cm.tiprequired') }
        // ]
      },
      //选人
      userVisible: false,
      userList: ''
    }
  },
  computed: {
    showReset() {
      if (this.modelType === 'add') {
        return true;
      } else {
        return false;
      }
    }
  },
  props: {
    modelType: {
      type: String
    }
  },
  mounted() {
    // this.initMaxHeight();
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    // this.throttleFunc = throttle(this.initMaxHeight, 500);
    // window.addEventListener("resize", this.throttleFunc);
  },
  methods: {
    // 动态计算高度
    initMaxHeight() {
      calcHeight(this, -105);
    },
    //获取详情
    getDetail(deptId) {
      let _this = this;
      _this.loading = true;
      let param = { deptId: deptId };
      api.getDeptDetail(param).then((response) => {
        _this.loading = false;
        let res = response.data;
        if (res.code === '0') {
          _this.editModel = res.data;
          _this.isNotAble = true;
        } else {
          _this.$message.error(res.msg);
        }
      }).catch((error) => {
        _this.loading = false;
      })
    },
    //关闭
    handleClose() {
      this.$emit('modelOpen', false);
    },
    //清除信息
    clearModel() {
      this.editModel = {}
    },
    //部门级别改变
    deptRankChange(value) {
      this.deptRankList.forEach((item) => {
        if (item.value === value) this.editModel.deptRankName = item.label;
      })
    },
    //重置
    handleReset() {
      if (this.modelType == 'add') {
        this.editModel = {}
      }
    },
    //提交
    handleSubmit() {
      let _this = this
      // 数据传递
      _this.$refs['editForm'].validate((valid) => {
        if (valid) {
          // 新增
          _this.loading = true;
          let param = { ..._this.editModel };
          api.deptEdit(param).then((response) => {
            _this.loading = false;
            if (response.data.code !== '0') {
              _this.$message.error(response.data.msg);
            } else {
              _this.$message({ message: response.data.msg, type: 'success' });
              _this.handleClose();
              _this.$emit('updateList', "");
            }
          }).catch((error) => {
            _this.loading = false;
          })
        } else {
          _this.$message.error(_this.$t('dataAuth.failedsave'))
        }
      })
    },
    //选人确认
    selectSubmit() {
      let selUserData = this.$refs.userComponent.getData();
      this.userVisible = false;
      this.userCallback(selUserData);
    },
    //选人关闭
    selectClose() {
      this.userVisible = false;
      this.userList = '';
    },
    //选人处理方法
    userSelect(callback, userId) {
      this.userVisible = true;
      //选人回调
      this.userCallback = callback;
      //回显数据
      if (userId && userId.indexOf(';') > -1) {
        let list = userId.split(';');
        this.userList = list.join(',');
      } else {
        this.userList = userId;
      }
    },
    userCallback1(data) {
      let id = data[1] && data[1][0] ? data[1][0].replace(/;/g, ',') : null;
      let name = data[1] && data[1][1] ? data[1][1].replace(/;/g, ',') : null;
      this.$set(this.editModel, 'header1', id);
      this.$set(this.editModel, 'header1Name', name);
    },
    userCallback2(data) {
      let id = data[1] && data[1][0] ? data[1][0].replace(/;/g, ',') : null;
      let name = data[1] && data[1][1] ? data[1][1].replace(/;/g, ',') : null;
      this.$set(this.editModel, 'header2', id);
      this.$set(this.editModel, 'header2Name', name);
    },
    userCallback3(data) {
      let id = data[1] && data[1][0] ? data[1][0].replace(/;/g, ',') : null;
      let name = data[1] && data[1][1] ? data[1][1].replace(/;/g, ',') : null;
      this.$set(this.editModel, 'deptSecretaryId', id);
      this.$set(this.editModel, 'deptSecretaryName', name);
    },
    userCallback4(data) {
      let id = data[1] && data[1][0] ? data[1][0].replace(/;/g, ',') : null;
      let name = data[1] && data[1][1] ? data[1][1].replace(/;/g, ',') : null;
      this.$set(this.editModel, 'assistantBuggetId', id);
      this.$set(this.editModel, 'assistantBugget', name);
    },
    userCallback5(data) {
      let id = data[1] && data[1][0] ? data[1][0].replace(/;/g, ',') : null;
      let name = data[1] && data[1][1] ? data[1][1].replace(/;/g, ',') : null;
      this.$set(this.editModel, 'assistantDeptId', id);
      this.$set(this.editModel, 'assistantDeptName', name);
    },
    userCallback6(data) {
      let id = data[1] && data[1][0] ? data[1][0].replace(/;/g, ',') : null;
      let name = data[1] && data[1][1] ? data[1][1].replace(/;/g, ',') : null;
      this.$set(this.editModel, 'assistantTrainId', id);
      this.$set(this.editModel, 'assistantTrainName', name);
    },
    userCallback7(data) {
      let id = data[1] && data[1][0] ? data[1][0].replace(/;/g, ',') : null;
      let name = data[1] && data[1][1] ? data[1][1].replace(/;/g, ',') : null;
      this.$set(this.editModel, 'assistantAssetId', id);
      this.$set(this.editModel, 'assistantAssetName', name);
    },
    userCallback8(data) {
      let id = data[1] && data[1][0] ? data[1][0].replace(/;/g, ',') : null;
      let name = data[1] && data[1][1] ? data[1][1].replace(/;/g, ',') : null;
      this.$set(this.editModel, 'assistantInfoId', id);
      this.$set(this.editModel, 'assistantInfoName', name);
    },
  },
}

<template>
  <div class="cud-commom-form-style">
    <div class="brand">
      <breadcrumb :arrayName="brand" :hasIcon="hasIcon"></breadcrumb>
    </div>
    <div class="cud__scroll--div">
      <el-card>
        <div :style="'height: ' + maxTableHeight + 'px'">
        <el-form ref="changePswForm" label-position="left" label-suffix=":" label-width="150px" :model="pswModel" :rules="pswRules" class="changePsw">
          <el-form-item :label="$t('dataAuth.enter_pw_old')" prop="pwOld">
            <el-input type="password" size="small" v-model="pswModel.pwOld" :placeHolder="$t('cm.pleaseEnter')"></el-input>
          </el-form-item>
          <el-form-item :label="$t('dataAuth.enter_pw_new')" prop="pwNew">
            <el-input type="password" size="small" v-model="pswModel.pwNew" :placeHolder="$t('cm.pleaseEnter')"></el-input>
          </el-form-item>
          <el-form-item :label="$t('dataAuth.confirm_pw_new')" prop="pwConfirm">
            <el-input type="password" size="small" v-model="pswModel.pwConfirm" :placeHolder="$t('cm.pleaseEnter')"></el-input>
          </el-form-item>
          <el-form-item style="padding-top: 20px;">
            <el-button size="small" @click="changePswSubmit" type="primary">{{$t('cm.commit')}}</el-button>
            <!-- <el-button size="small" @click="changePswClose">{{$t('cm.close')}}</el-button> -->
          </el-form-item>
        </el-form>
      </div>
      </el-card>
    </div>
  </div>
</template>

<script>
  import api from "../api/index";
  import { throttle } from "@/utils/funcUtil";
  import breadcrumb from "@/components/common/breadcrumb";
  import { calcHeight } from "@/utils/funcUtil";

  export default {
    components: {
      breadcrumb
    },
    data() {
      return {
        hasIcon: false,
        brand: [{ name: "dataAuth.user_manage" }, { name: "修改密码" }],
        maxTableHeight: 0,
        pswModel: {
          pwOld: '',
          pwNew: '',
          pwConfirm: '',
        },
        pswRules: {
          pwOld: [
            { required: true, message: '请输入旧密码', trigger: 'blur' },
          ],
          pwNew: [
            { required: true, message: '请输入新密码', trigger: 'blur' },
            { min: 12, max: 25, message: "密码长度12-25字符", trigger: 'blur' },
            { pattern: /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/, message: '密码需包含数字、大小写字母、符号' }
          ],
          pwConfirm: [
            { required: true, message: '请确认新密码', trigger: 'blur' },
            { min: 12, max: 25, message: "密码长度12-25字符", trigger: 'blur' },
            { pattern: /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/, message: '密码需包含数字、大小写字母、符号' }
          ]
        }
      }
    },
    mounted() {
      //设置表格高度
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
        calcHeight(this, -40);
      },
      //修改密码
      changePsw: function() {
        this.showChangePw = true;
      },
      //关闭
      changePswClose: function() {
        this.showChangePw = false;
        this.pswModel.pwOld = '';
        this.pswModel.pwNew = '';
        this.pswModel.pwConfirm = '';
      },
      //提交
      changePswSubmit: function() {
        let _this = this;
        _this.$refs.changePswForm.validate((valid) => {
          if (!valid) return;
          if (_this.pswModel.pwNew !== _this.pswModel.pwConfirm) {
            _this.$message({message: '两次密码不一致！', type: 'error'});
            return;
          }
          let params = {
            id: sessionStorage.getItem('uid'),
            newPassword: _this.pswModel.pwNew,
            oldPassword: _this.pswModel.pwOld
          }
          api.changePsw(params).then((result) => {
            let res = result.data;
            if (res.code === "0") {
              _this.$message({message: '密码修改成功！', type: 'success'});
              _this.showChangePw = false;
            } else {
              _this.$message({message: res.msg, type: 'error'});
            }
          });
        })
      },
    }
  };
</script>
<style lang="less" scoped>
  // @import "src/assets/css/style";
  .changePsw {
    padding-top: 50px;
    width: 600px;
    margin: 0 auto;
  }
  .el-form-item {
    padding: 10px 0;
  }
</style>

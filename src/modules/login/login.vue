<template>
  <!-- 登录页面 -->
  <div style="width:100%;" :style="{height:cilentHeight+'px', backgroundColor: '#fefefe'}">
    <img src="../../assets/img/login_logo.png" class="login_logo" />
    <img src="../../assets/img/login_bg.png" class="login_bg" />
    <div class="login">
      <img src="../../assets/img/login_img.png" class="login_img" />
      <div class="login_box">
        <h1>系统登录</h1>
        <el-form label-width="0px" :model="model" :rules="rules" ref="loginForm" class="login_form">
          <el-row>
            <el-col :span="24">
              <el-form-item label="" prop="username">
                <el-input v-model="model.username" placeholder="请输入用户名" maxlength="50" class="form-input" @keyup.enter.native="login">
                  <i slot="prefix" class="el-input__icon fa fa-user"></i>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="" prop="pw">
                <el-input class="password-clear form-input" v-model="model.pw" maxlength="50" placeholder="请输入密码" show-password @keyup.enter.native="login">
                  <i slot="prefix" class="el-input__icon fa fa-lock"></i>
                </el-input>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col :span="24">
              <el-form-item label="" prop="vaildcode">
                <el-row style="padding: 0;">
                  <el-col :span="14">
                    <el-input v-model="model.vaildcode" placeholder="请输入验证码" maxlength="4" @keyup.enter.native="login">
                      <i slot="prefix" class="el-input__icon fa fa-check-square"></i>
                    </el-input>
                  </el-col>
                  <el-col :span="10">
                    <img :src="codeUrl" ref="code" @click="getCode" class="login_code" title="点击刷新" alt="点击刷新" />
                  </el-col>
                </el-row>
              </el-form-item>
            </el-col>
          </el-row>
          <!-- <el-row>
            <el-col>
              <el-form-item label="">
                <el-checkbox v-model="model.remember" @keyup.enter.native="login">记住密码</el-checkbox>
              </el-form-item>
            </el-col>
          </el-row> -->
          <el-row>
            <el-col :span="24" align="center" style="padding-top: 10px;">
              <el-form-item label="">
                <el-button type="primary" class="login_btn" @click="login">
                  <i class="fa fa-check-circle"></i> 登录
                </el-button>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </div>
      <div class="login_copy">
        Copyright © 2023 中国广核集团有限公司 All rights reserved
      </div>
    </div>
  </div>
</template>

<script>
  import login from './js/login.js'
  export default login
</script>

<style scoped>
  .login_logo {
    position: absolute;
    width: 236px;
    height: 39px;
    padding-top: 4.8%;
    padding-left: 6.6%;
  }

  .login_bg {
    position: absolute;
    z-index: 0;
    top: 25.8%;
    width: 100%;
    height: 525px;
  }

  .login {
    position: absolute;
    top: 30%;
    width: 70%;
    margin-left: 15%;
  }

  .login_img {
    float: left;
    padding-left: 18px;
    padding-top: 38px;
    max-width: 50%;
  }

  .login_box {
    float: right;
    margin-top: 2px;
    margin-right: -22px;
    width: 450px;
    height: 440px;
    background: rgba(255, 255, 255, 1);
    border-radius: 5px;
    box-shadow: 2px 3px 3px rgba(0, 0, 0, 0.1);
  }

  .login_box h1 {
    padding-top: 20px;
    padding-bottom: 15px;
    font-size: 24px;
    text-align: center;
    color: #006AAF;
  }

  .login_code {
    float: right;
    padding-right: 2px;
    width: 120px;
    height: 40px;
    cursor: pointer;
  }

  .login_btn {
    margin-top: 10px;
    width: 100%;
    padding-top: 10px;
  }

  .login_form {
    width: 340px;
    margin: 0 auto;
  }

  .login_form .el-row {
    padding: 10px 0;
  }

  .login_copy {
    top: 26%;
    left: 0;
    width: 100%;
    text-align: center;
    padding-top: 510px;
    font-size: 14px;
    color: #CACACA;
  }

  .el-input__icon {
    margin-top: 5px;
  }

  @media screen and (max-width: 1600px) {
    .login_logo {
      padding-top: 3%;
    }
    .login_bg {
      top: 15.8%;
      height: 490px;
    }
    .login {
      top: 20%;
    }
    .login_img {
      margin-left: -50px;
    }
    .login_box {
      width: 400px;
      margin-top: -10px;
      height: 420px;
    }
  }
</style>

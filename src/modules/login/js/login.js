import api from "../api";
import CryptoJS from 'crypto-js'

export default {
  data() {
    return {
      cilentHeight: 0,
      codeUrl: envConfig.API_ROOT + '/auth/login/kaptch',
      model: {
        username: '',
        pw: '',
        vaildcode: '',
        remember: false
      },
      rules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
        ],
        pw: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 12, max: 50, message: '密码长度12-50字符', trigger: 'blur' },
          { pattern: /(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])(?=.*\W)/, message: '密码需包含数字、大小写字母、符号' }
        ],
        vaildcode: [
          { required: true, message: '请输入验证码', trigger: 'blur' },
          { min: 4, max: 4, message: '验证码长度4个字符', trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    //设定一个高度
    this.cilentHeight = window.innerHeight;
    //取出保存的密码
    // let remember = localStorage.getItem('cud_auth_remember');
    // if (remember !== null) {
    //   let [username, pw] = remember.split(';');
    //   if (username && pw) {
    //     this.model.username = username;
    //     this.model.pw = pw;
    //     this.model.remember = true;
    //   }
    // }
  },
  methods: {
    //登录
    login() {
      let _this = this;
      _this.$refs.loginForm.validate((valid) => {
        if (valid) {
          const loading = _this.$loading();
          let params = {
            userId: _this.model.username,
            //password: _this.model.pw,
            password: CryptoJS.MD5(_this.model.pw).toString(),
            code: _this.model.vaildcode,
          };
          api.loginAPI(params).then((res) => {
            loading.close();
            if (res.code === "0") {
              //将token存在storage
              sessionStorage.setItem('token', res.data.token);
              //将id存在storage
              sessionStorage.setItem('uid', res.data.id);
              //保存用户信息
              // if (_this.model.remember) {
              //   //保存账号和密码
              //   let remember = _this.model.username + ';' + _this.model.pw;
              //   localStorage.setItem('cud_auth_remember', remember);
              // } else {
              //   //清除保存的密码
              //   localStorage.removeItem('cud_auth_remember');
              // }
              if (res.data.firstLoginFlag == true) {
                _this.$router.push('/pipeDatabase');
                this.$alert('首次登录请修改密码', '提示', {
                  confirmButtonText: '确定',
                  type: 'warning',
                  callback: () => {
                    _this.$router.push('/password');
                  }
                });
              } else {
                _this.$message({ type: 'success', message: '登录成功！' });
                _this.$router.push('/pipeDatabase');
              }
              //刷新验证码
              _this.getCode();
            } else {
              _this.getCode();
              _this.model.vaildcode = '';
              _this.$message({ type: 'error', message: res.msg });
            }
          }).catch((err) => {
            loading.close();
          })
        } else {
          return false;
        }
      });
    },
    //获取验证码
    getCode() {
      this.$refs.code.src = this.codeUrl + '?' + Math.random();
    },
  },
}

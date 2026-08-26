
import breadcrumb from '@/components/common/breadcrumb'
import TinymceEditor from '@/components/editor/tinymce-vue'
import api from '../api'
import { getUserInfo } from '@/api/api.js'
import osUtil from '@/utils/osUtil';


export default {
  components: {
    breadcrumb,
    TinymceEditor
  },
  data: function () {
    let checkTemplateName = (rule, value, callback) => {
      let reg = /^[a-zA-Z0-9\u4e00-\u9fa5-\_]+$/g
      if (!value) {
        callback(new Error(this.$t('cm.tiprequired')))
      } else {
        if (!reg.test(value)) {
          callback(new Error(this.$t('cm.name_valid')))
        } else {
          callback()
        }
      }
    };
    let checkEmailTopic = (rule, value, callback) => {
      let reg = /^[a-zA-Z0-9\u4e00-\u9fa5-\_]+$/g
      if (!value) {
        callback(new Error(this.$t('cm.tiprequired')))
      } else {
        if (!reg.test(value)) {
          callback(new Error(this.$t('cm.name_valid')))
        } else {
          callback()
        }
      }
    };
    return {
      brand: [
        { name: 'tm.template_manage' },
        { name: 'tm.email_template' }
      ],
      updateUserName: '',
      hasIcon: false,
      isOpen: '1',
      showDialog: false,
      ruleForm: {
        id: '',
        templateCode: '',
        templateName: '',
        emailTopic: '',
        templateStatus: '',
        templateType: '',
        publicFlag: false
      },
      loading: false,
      editorContent: '',
      disabled: false,
      basicRules: {
        templateName: [
          { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' },
          { required: true, validator: checkTemplateName, trigger: "blur" }
        ],
        emailTopic: [
          { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' },
          { required: true, validator: checkEmailTopic, trigger: "blur" }
        ],
        templateType: [
          { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' },
        ],
        publicFlag: [
          { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' },
        ],
      },
      // powerpaste
      plugins: 'lists table wordcount code fullscreen link image',
      toolbar: 'undo redo | formatselect | fontselect fontsizeselect bold italic forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | lists table link | removeformat code fullscreen  image',
    }
  },
  methods: {
    //获取当前用户
    getNowUser() {
      getUserInfo({ t: Math.random() }).then((result) => {
        this.updateUserName = result.data.data.nowUserName;
      })
    },
    previewEmailTemplate: function () {
      this.showDialog = true;
    },
    cancel: function () {
      //关闭页签
      this.closeTab('/email_template');
    },
    showEmailTemplate: function (params) {
      var _this = this;
      api.getEmailTemplateById(params).then((result) => {
        if (result.data.code == "0") {
          var data = result.data.data;
          _this.ruleForm.templateCode = data.templateCode;
          _this.ruleForm.templateName = data.templateName;
          _this.ruleForm.emailTopic = data.emailTopic;
          _this.editorContent = data.templateContent;
          _this.ruleForm.templateStatus = data.templateStatus;
          _this.ruleForm.templateType = data.templateType;
          _this.ruleForm.publicFlag = data.publicFlag;
        } else {
          _this.$message({
            message: result.data.msg,
            type: 'warning'
          })
        }
      }).catch((err) => {
        _this.$message({
          message: err,
          type: 'warning'
        })
      });
    },
    htmlUnEscape: function (str) { //反转义
      var unescapes = {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&quot;': '"',
        '&#39;': "'",
        '&Tab;': " "
      },
        reEscapedHtml = new RegExp(/&(?:amp|lt|gt|quot|#39|Tab);/g);
      return (str && reEscapedHtml.test(str)) ? str.replace(reEscapedHtml, function (entity) {
        return unescapes[entity];
      }) : (str || '')
    },
    updateEmailTemplate: function (formName) {
      var _this = this;
      this.$refs[formName].validate((valid) => {
        if (valid) {
          if (_this.editorContent === '') {
            _this.$message({
              message: '请填写模板内容！',
              type: 'warning'
            })
            return
          }
          _this.loading = true;
          let emailParams = {
            id: _this.$route.query.id,
            templateCode: this.ruleForm.templateCode,
            templateName: this.ruleForm.templateName,
            emailTopic: this.ruleForm.emailTopic,
            templateStatus: this.ruleForm.templateStatus,
            templateType: this.ruleForm.templateType,
            templateContent: this.editorContent,
            // updateUserName: this.updateUserName,
            publicFlag: this.ruleForm.publicFlag
          };
          api.updateEmailTemplate(emailParams).then((result) => {
            if (result.data.code == "0") {
              _this.$message({
                message: _this.$t('dict.dict_update_succ'),
                type: 'success'
              })
              _this.loading = false;
              //等提示框弹出后再关闭窗口
              let timer = setTimeout(() => {
                if (window.opener) {
                  window.opener.postMessage('fushEmailData', '/');
                } else {
                  window.postMessage('fushEmailData', '/');
                }
                clearTimeout(timer);
                //关闭页签
                this.closeTab('/email_template');
              }, 500);
            } else {
              _this.loading = false;
              _this.$message({
                message: result.data.msg,
                type: 'warning'
              })
            }
          }).catch((err) => {
            _this.loading = false;
            _this.$message({
              message: '模板内容不能为空！',
              type: 'warning'
            })
          });
        } else {
          _this.$message({
            message: '请检查填写内容！',
            type: 'warning'
          })
          return false;
        }
      });
    }
  },
  computed: {
    templateStatusOptions: function () {
      return [
        {
          label: this.$t('tm.disable'),
          value: '0'
        },
        {
          label: this.$t('tm.available'),
          value: '1'
        }
      ]
    },
    templateTypeOptions: function () {
      return [
        {
          label: this.$t('tm.private'),
          value: '0'
        },
        {
          label: this.$t('tm.public'),
          value: '1'
        }
      ]
    }
  },
  mounted() {
    let params = {
      id: this.$route.query.id
    }
    this.showEmailTemplate(params);
    // this.getNowUser();
  }
}

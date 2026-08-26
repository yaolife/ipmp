import breadcrumb from '@/components/common/breadcrumb'
import TinymceEditor from '@/components/editor/tinymce-vue'
import api from '../api'
import { getUserInfo } from '@/api/api.js'
import osUtil from '@/utils/osUtil';
import { getHeadersOptions } from "@/utils/funcUtil.js";

export default {
  components: {
    breadcrumb,
    TinymceEditor
  },
  data: function () {
    var checkTemplateCode = (rule, value, callback) => {
      var reg = /^[a-zA-Z0-9-\_]+$/g;
      if (!reg.test(value)) {
        callback(new Error(this.$t('tm.template_code_error')));
      } else {
        let params = { templateCode: value };
        api.checkEmailTemplateByCode(params).then((result) => {
          if (result.data.code == "0") {
            callback();
          } else {
            callback(new Error(result.data.msg));
          }
        }).catch((err) => {
          callback(new Error(err));
        });
      }
    };
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
      hasIcon: false,
      isOpen: '1',
      showDialog: false,
      ruleForm: {
        templateCode: '',
        templateName: '',
        templateType: '',
        emailTopic: '',
        publicFlag: false
      },
      loading: false,
      editorContent: '',
      disabled: false,
      basicRules: {
        templateCode: [
          { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' },
          { required: true, validator: checkTemplateCode, trigger: 'blur' }
        ],
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
      plugins: 'lists table wordcount code fullscreen link',
      toolbar: 'undo redo | formatselect | fontselect fontsizeselect bold italic forecolor backcolor | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | lists table link | removeformat code fullscreen',
      fileLists: [],
      headersOptions: getHeadersOptions()
    }
  },
  computed: {
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
    },
    changeCollapse: function () {
      return this.$root.COLLAPSE;
    }
  },
  mounted() {
    // this.getNowUser();
  },
  created() {
    this.ruleForm.templateType = this.templateTypeOptions[0].value;
  },
  methods: {
    //获取当前用户
    getNowUser() {
      getUserInfo({ t: Math.random() }).then((result) => {
        this.createUserName = result.data.data.nowUserName;
      })
    },
    previewEmailTemplate: function () {
      this.showDialog = true;
    },
    addEmailTemplate: function (formName) {
      var _this = this;
      _this.loading = true;
      this.$refs[formName].validate((valid) => {
        if (valid) {
          //方法一传递参数
          if (_this.editorContent === '') {
            _this.$message({
              message: '请填写模板内容！',
              type: 'warning'
            })
            _this.loading = false;
            return
          }
          let params = {
            templateCode: this.ruleForm.templateCode,
            templateName: this.ruleForm.templateName,
            templateType: this.ruleForm.templateType,
            emailTopic: this.ruleForm.emailTopic,
            templateContent: this.editorContent,
            // createUserName: this.createUserName
          };
          api.addEmailTemplate(params).then((result) => {
            if (result.data.code == "0") {
              _this.$message({
                message: '保存成功！',
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
          _this.loading = false;
          _this.$message({
            message: '请检查填写内容！',
            type: 'warning'
          })
          return false;
        }
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
    cancel:function() {
      //关闭页签
      this.closeTab('/email_template');
    },
    choseFile(file) {
      let reader = new FileReader();
      reader.onload = () => {
        let content = reader.result;
        this.editorContent = content;
      };
      reader.readAsText(file.raw, 'utf-8');
    },
    changeFile(file, fileList) {
      if (file.status === 'ready') {
        this.choseFile(file)
        this.$refs.upload.clearFiles()
      } else if (file.status === 'fail') {
        this.$message({
          message: '上传文件失败！',
          type: 'warning'
        })
      }
    }
  }
}

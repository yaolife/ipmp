import breadcrumb from '@/components/common/breadcrumb'
import TinymceEditor from '@/components/editor/tinymce-vue'
import api from '../api'
import { getUserInfo } from '@/api/api.js'
import osUtil from '@/utils/osUtil';


export default {
  data() {
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
    let checkMessageTopic = (rule, value, callback) => {
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
        { name: 'tm.message_template' }
      ],
      updateUserName: '',
      hasIcon: false,
      isOpen: '1',
      showDialog: false,
      ruleForm: {
        id: '',
        templateCode: '',
        templateName: '',
        messageTopic: '',
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
        messageTopic: [
          { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' },
          { required: true, validator: checkMessageTopic, trigger: "blur" }
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
      templateTypeOptions: [
        {
          label: this.$t('cgnTask.field.shortMessage'),
          value: "0"
        },
        {
          label: this.$t('tm.ding_talk'),
          value: "1"
        },
        {
          label: this.$t('tm.sys_notice'),
          value: "2"
        }

      ]
    }
  },
  components: {
    breadcrumb,
    TinymceEditor
  },
  methods: {
    //获取当前用户
    getNowUser() {
      getUserInfo({ t: Math.random() }).then((result) => {
        this.updateUserName = result.data.data.nowUserName;
      })
    },

    previewMessageTemplate: function () {
      this.showDialog = true;
    },
    cancel:function(){
      //关闭页签
      this.closeTab('/message_template');
    },
    showMessageTemplate: function (params) {
      var _this = this;
      api.getMessageTemplateById(params).then((result) => {
        if (result.data.code == "0") {
          var data = result.data.data;
          _this.ruleForm.templateCode = data.templateCode;
          _this.ruleForm.templateName = data.templateName;
          _this.ruleForm.messageTopic = data.messageTopic;
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
    updateMessageTemplate: function (formName) {
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
          let messageParams = {
            id: _this.$route.query.id,
            templateCode: this.ruleForm.templateCode,
            templateName: this.ruleForm.templateName,
            messageTopic: this.ruleForm.messageTopic,
            templateStatus: this.ruleForm.templateStatus,
            templateType: this.ruleForm.templateType,
            templateContent: this.editorContent,
            // updateUserName: this.updateUserName,
            publicFlag: this.ruleForm.publicFlag
          };
          api.updateMessageTemplate(messageParams).then((result) => {
            if (result.data.code == "0") {
              _this.$message({
                message: _this.$t('dict.dict_update_succ'),
                type: 'success'
              })
              _this.loading = false;
              //等提示框弹出后再关闭窗口
              let timer = setTimeout(() => {
                if (window.opener) {
                  window.opener.postMessage('fushMessageData', '/');
                } else {
                  window.postMessage('fushMessageData', '/');
                }
                clearTimeout(timer);
                //关闭页签
                this.closeTab('/message_template');
              }, 500);
            } else {
              _this.loading = false;
              _this.$message({
                message: '保存失败！',
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
  },
  mounted() {
    let params = {
      id: this.$route.query.id
    }
    this.showMessageTemplate(params);
    // this.getNowUser();
  }
}

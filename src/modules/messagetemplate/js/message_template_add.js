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
        api.checkMessageTemplateByCode(params).then((result) => {
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
      // fileUploadUrl: process.env.UPDOWN_ROOT,
      brand: [
        { name: 'cgnTask.field.shortMessage' },
        { name: 'tm.message_template' }
      ],
      hasIcon: false,
      isOpen: '1',
      showDialog: false,
      ruleForm: {
        templateCode: '',
        templateName: '',
        templateType: '',
        messageTopic: '',
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
      fileLists: [],
      headersOptions: getHeadersOptions()
    }
  },
  computed: {
    templateTypeOptions: function () {
      return [
        {
          label: this.$t('tm.message'),
          value: 0
        },
        {
          label: this.$t('tm.ding_talk'),
          value: 1
        },
        {
          label: this.$t('tm.sys_notice'),
          value: 2
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
    previewMessageTemplate() {
      this.showDialog = true;
    },
    addMessageTemplate: function (formName) {
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
            messageTopic: this.ruleForm.messageTopic,
            templateContent: this.editorContent,
            // createUserName: this.createUserName,
            publicFlag: this.ruleForm.publicFlag
          };
          api.addMessageTemplate(params).then((result) => {
            if (result.data.code == "0") {
              _this.$message({
                message: '保存成功！',
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
          _this.loading = false;
          _this.$message({
            message: '请检查填写内容！',
            type: 'warning'
          })
          return false;
        }
      });
    },
    cancel:function() {
      //关闭页签
      this.closeTab('/message_template');
    },
    choseFile(file) {
      let reader = new FileReader();
      reader.onload = () => {
        let content = reader.result;
        this.editorContent = content;
      };
      reader.readAsText(file.raw, 'utf-8');
    },
    changeFile(file) {
      if (this.$refs.upload.uploadFiles.length > 1) {
        this.$refs.upload.uploadFiles.shift()
      }
      if (file.status === 'ready') {
        let type = file.name.substring(file.name.lastIndexOf(".") + 1);
        if (type != "html") {
          this.$message({
            message: '请上传正确的文件!',
            type: 'warning'
          })
          return false;
        } else {
          this.choseFile(file)
          this.$refs.upload.clearFiles()
        }
      } else if (file.status === 'fail') {
        this.$message({
          message: '上传文件失败！',
          type: 'warning'
        })
      }
    }
  },
}

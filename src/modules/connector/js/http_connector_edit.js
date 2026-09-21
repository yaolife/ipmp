import breadcrumb from '@/components/common/breadcrumb'
import { Filters } from '@/assets/js/Utils';
import { throttle } from '@/utils/funcUtil'
import api from '../api'
import osUtil from "@/utils/osUtil";
import MonacoEditor from "@/utils/monaco-editor";
import X2JS from 'x2js'
import { calcHeight } from "@/utils/funcUtil";

export default {
  components: {
    breadcrumb,
    MonacoEditor
  },
  data: function () {
    return {
      hasIcon: false,
      brand: [
        { name: 'sys.system_manage' },
        { name: 'hc.http_connector' },
        { name: 'cm.edit' }
      ],
      step: 1,
      showTabs: 'basic',
      minHeight: 0,
      options: {
        theme: 'vs',
        value: '',
        language: 'json',
        minimap: {
          enabled: false
        },
      },
      //基本信息
      model1: {
        classId: '',
        name: '',
        description: '',
        domain: '',
        protocol: '0',
        authType: '0',
        baseUrl: '/',
        username: '',
        //password: ''  //敏感词
        interfaceType: 1,
        soapType: 1
      },
      originName: '', //原始名称
      //当前动作
      actionIndex: 0,
      //动作列表
      actionList: [],
      //当前动作信息
      model2: {},
      //新增动作数据
      newModel2: {
        connectorId: '',
        id: '',
        actionId: '',
        originId: '',   //原始唯一标识
        isEdit: false,  //编辑标识
        actionName: '未命名动作',
        actionDesc: '动作描述',
        actionUrl: '',
        actionMethod: '0',
        queryParams: [],
        bodyParams: [],
        headerParams: [],
        pathParams: [],
        responseParams: [],
        activeTab: 'query',
        showBody: false,
        showTest: false,
        bodyInput: '',
        responseInput: '',
      },
      //规则
      rules1: {
        name: [
          { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' },
          { min: 3, max: 50, message: this.$t('hc.http_limit_length') + '3-50' + this.$t('hc.http_limit_char'), trigger: 'blur' },
          {
            validator: (rule, value, callback) => {
              //连接器名称验证
              if (this.originName && this.originName == value) {
                //名称没修改时不需要验证
                callback()
                return
              }
              let params = { connectorName: value };
              api.getValidateAPI(params).then(res => {
                if (res.code === "0" && res.data == true) {
                  callback()
                } else {
                  callback(new Error(this.$t('hc.http_limit_name_exited')))
                }
              }).catch(err => {
                callback(new Error(this.$t('hc.http_limit_name_failed')))
              })
            }, trigger: 'blur'
          }
        ],
        domain: [
          { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' },
          { min: 3, max: 50, message: this.$t('hc.http_limit_length') + '3-50' + this.$t('hc.http_limit_char'), trigger: 'blur' },
          { pattern: /^[0-9a-zA-Z\.\-\:\@]+$/, message: this.$t('hc.http_limit_domain') }
        ],
        protocol: [
          { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' }
        ],
        authType: [
          { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' }
        ],
        baseUrl: [
          { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' },
          { min: 1, max: 50, message: this.$t('hc.http_limit_length') + '1-50' + this.$t('hc.http_limit_char'), trigger: 'blur' },
          { pattern: /^\/([0-9a-zA-Z\.\-\/\?\#]?)+$/, message: this.$t('hc.http_limit_baseUrl') }
        ],
        username: [
          { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' },
          { min: 1, max: 50, message: this.$t('hc.http_limit_length') + '1-50' + this.$t('hc.http_limit_char'), trigger: 'blur' }
        ],
        password: [
          { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' },
          { min: 1, max: 50, message: this.$t('hc.http_limit_length') + '1-50' + this.$t('hc.http_limit_char'), trigger: 'blur' }
        ],
      },
      rules2: {
        actionId: [
          { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' },
          { min: 3, max: 20, message: this.$t('hc.http_limit_length') + '3-20' + this.$t('hc.http_limit_char'), trigger: 'blur' },
          { pattern: /^([0-9a-zA-Z]?)+$/, message: this.$t('hc.http_limit_actionId') },
          {
            validator: (rule, value, callback) => {
              //唯一标识验证
              if (this.model2.originId && this.model2.originId == value) {
                //没修改时不需要验证
                callback()
                return
              }
              //检查所有动作有没有该id
              let found = this.actionList.find((item) => {
                return item.actionId == value && item.id != this.model2.id  //排除自己
              })
              if (found) {
                callback(new Error(this.$t('hc.http_limit_name_exited')))
                return
              }
              //检查数据库是否存在该id
              let params = { requestId: value };
              api.getValidateIdAPI(params).then(res => {
                if (res.code === "0" && res.data == true) {
                  callback()
                } else {
                  callback(new Error(this.$t('hc.http_limit_name_exited')))
                }
              }).catch(err => {
                callback(new Error(this.$t('hc.http_limit_name_failed')))
              })
            }, trigger: 'blur'
          }
        ],
        actionName: [
          { required: true, message: this.$t('cm.tiprequired'), trigger: 'change' },
          { min: 1, max: 50, message: this.$t('hc.http_limit_length') + '1-50' + this.$t('hc.http_limit_char'), trigger: 'change' }
        ],
        actionDesc: [
          { required: true, message: this.$t('cm.tiprequired'), trigger: 'change' },
          { min: 1, max: 50, message: this.$t('hc.http_limit_length') + '1-50' + this.$t('hc.http_limit_char'), trigger: 'change' }
        ],
        actionUrl: [
          { required: true, message: this.$t('cm.tiprequired'), trigger: 'change' },
          { min: 1, max: 50, message: this.$t('hc.http_limit_length') + '1-50' + this.$t('hc.http_limit_char'), trigger: 'change' },
          { pattern: /^([0-9a-zA-Z\/\.\:\-\@\#\?\&\=\{\}]?)+$/, message: this.$t('hc.http_limit_actionUrl') }
        ],
        paramName: [
          { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' }
        ],
        paramDesc: [
          { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' }
        ],
        paramValue: [
          { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' }
        ],
      },
      rules3: {
        paramDesc: [
          { required: true, message: this.$t('cm.tiprequired'), trigger: 'blur' }
        ],
      }
    }
  },
  mounted() {
    if (!this.$route.query.connectorId) {
      //新增页面，初始化数据
      this.model2 = JSON.parse(JSON.stringify(this.newModel2))
      this.actionList[0] = this.model2
    }
    //获取待编辑的信息
    this.getDetail()
    //设置高度
    this.initMaxHeight()
  },
  computed: {
    //
  },
  watch: {
    // 隐藏Body参数
    'model2.actionMethod': {
      handler(val) {
        //this.model2.showBody = (val == 0) ? false : true
        if (!this.model2) return
        if (val == 0) {
          this.model2.showBody = false
          this.model2.activeTab = 'query'
        } else {
          this.model2.showBody = true
          this.model2.activeTab = 'body'
          this.setEditorValue('bodyInput', this.model2.bodyInput);
        }
      },
      deep: true
    },
    //步骤切换
    step: {
      handler(val) {
        if (val == 2) {
          this.setEditorValue('bodyInput', this.model2.bodyInput);
        } else if (val == 3) {
          this.setEditorValue('responseInput', this.model2.responseInput);
        }
      }
    }
  },
  methods: {
    // 动态计算高度
    initMaxHeight() {
      calcHeight(this);
    },
    // 加载中
    setLoading() {
      return this.$loading({
        target: 'el-main',
        lock: true,
        text: '加载中',
        spinner: 'el-icon-loading',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    },
    //获取详情
    getDetail: function () {
      let _this = this
      if (!this.$route.query.connectorId) {
        return
      }
      let params = {
        connectorId: this.$route.query.connectorId
      }
      const loading = _this.setLoading()
      api.getDetailAPI(params).then(res => {
        loading.close()
        if (res.code === "0") {
          let data = res.data
          //console.log(data)
          //基本信息
          let model1 = {
            classId: data.classId,
            name: data.connectorName,
            description: data.description,
            domain: data.domain,
            protocol: data.protocol.toString(),
            baseUrl: data.baseUrl,
            authType: data.authType.toString(),
            username: data.username ? data.username : '',
            password: data.password ? data.password : '',
            interfaceType: data.interfaceType ? data.interfaceType : 1,
            soapType: data.soapType ? data.soapType : 1,
          }
          _this.model1 = model1
          _this.originName = model1.name
          //遍历动作列表，重新组装数据
          let actionList = []
          data.cudConnectorDetailVOList.forEach((item, index) => {
            let action = JSON.parse(JSON.stringify(_this.newModel2))
            action.id = item.id
            action.connectorId = item.connectorId
            action.actionId = item.requestId
            action.originId = item.requestId
            action.isEdit = true  //编辑标识
            action.actionName = item.requestName
            action.actionDesc = item.description
            action.actionUrl = item.requestUrl
            action.actionMethod = item.requestMethod.toString()
            action.activeTab = 'query'
            action.showBody = false
            action.showTest = false

            action.queryParams = item.queryParams
            action.bodyParams = item.bodyParams
            action.headerParams = item.headerParams
            action.pathParams = item.pathParams
            action.responseParams = item.resultParams

            action.bodyInput = item.requestPayload
            action.responseInput = item.resultBody ? JSON.stringify(item.resultBody) : ''

            //组装好存到动作列表
            actionList.push(action)
          })
          //如果已有动作则加载，没有则新增
          if (actionList.length > 0) {
            _this.actionList = actionList
          } else {
            _this.actionList[0] = JSON.parse(JSON.stringify(_this.newModel2))
            _this.actionList[0].connectorId = data.connectorId
          }
          //取出第一个动作
          _this.model2 = _this.actionList[0]
        } else {
          _this.$message({ type: 'error', message: res.msg })
        }
      }).catch(err => {
        loading.close()
        _this.$message({ type: 'error', message: err.msg })
      })
    },
    // 识别url中的参数
    getParam() {
      let val = this.model2.actionUrl
      if (val == '' || val == '?') return
      //查找query参数
      let indexof = val.indexOf('?')
      if (indexof < 0) {
        //this.model2.queryParams = []
      } else {
        let url = val.slice(indexof + 1)
        let query = url.split('&')
        let list = []
        query.forEach((item, index) => {
          let keyval = item.split('=')
          list[index] = {
            'id': this.getRandom(),
            'name': keyval[0] ? keyval[0] : '',
            'value': keyval[1] ? keyval[1] : ''
          }
        })
        this.model2.queryParams = list
      }
      //查找path参数
      let path = val.match(/{(.*?)}/g)
      if (path == null) {
        //this.model2.pathParams = []
      } else {
        this.model2.pathParams = []
        path.forEach((item, index) => {
          this.model2.pathParams.push({
            id: this.getRandom(),
            name: item.replace('{', '').replace('}', ''),
            describe: ''
          })
        })
      }
    },
    //随机数
    getRandom: function () {
      return Math.floor(Math.random() * 10000)
    },
    //解析json格式的参数，转换成定义数组
    jsonParse: function (json, maxLevel = 5) {
      try {
        json = JSON.parse(json)
      } catch (e) {
        //console.log(e)
        this.$message({ type: 'error', message: this.$t('hc.http_parse_failed') })
        return
      }
      //多层解析
      let params = []
      let _this = this
      function parse(obj, level) {
        //obj：要解析的对象
        let res = []
        let index = 0
        for (let item in obj) {
          if (obj && obj.constructor === Array && index > 2) {
            //数组只取前3条
            break
          }
          let type
          if (obj[item] === null || obj[item] === "") {
            type = 'string'
          } else if (obj[item].constructor === Array) {
            type = 'array'
          } else {
            type = typeof (obj[item])
          }
          let length = res.push({
            id: item + _this.getRandom(),
            level: level,
            name: item,
            type: type,
            describe: ''
          })
          if ((type === 'array' || type === 'object') && level < maxLevel) {
            res[length - 1].children = parse(obj[item], level + 1)
          }
          index++
        }
        return res
      }
      params = parse(json, 1)
      return params
    },
    //编辑query参数
    addQueryParam: function () {
      this.model2.queryParams.push({
        id: this.getRandom(),
        name: '',
        describe: ''
      });
    },
    delQueryParam: function (id) {
      this.model2.queryParams.splice(id, 1);
    },
    //编辑body参数
    addBodyParam: function () {
      this.model2.bodyParams.push({
        id: this.getRandom(),
        name: '',
        describe: '',
        type: ''
      });
    },
    //删除body参数
    delBodyParam: function (id) {
      //多层 根据id删除
      function search(list) {
        //console.log(list)
        list.forEach((item, index) => {
          if (item.id == id) {
            list.splice(index, 1)
            return
          }
          if (typeof item.children == 'object') {
            search(item.children)
          }
        })
      }
      search(this.model2.bodyParams)
    },
    //格式化
    bodyFormat: function () {
      if (!this.model2.bodyInput) return
      let bodyInput = JSON.parse(this.model2.bodyInput)
      this.model2.bodyInput = JSON.stringify(bodyInput, null, 4)
      this.setEditorValue('bodyInput', this.model2.bodyInput);
    },
    //解析body参数
    getBodyParam: function () {
      let code = this.$refs.bodyInput.value
      let params = this.jsonParse(code, 5)
      if (params && params.length > 0) {
        this.model2.bodyParams = params
        this.$message({ type: 'success', message: this.$t('hc.http_parse_success') })
      }
      //console.log(this.model2.bodyParams)
    },
    //编辑header参数
    addHeaderParam: function () {
      this.model2.headerParams.push({
        id: this.getRandom(),
        name: '',
        value: ''
      });
    },
    delHeaderParam: function (id) {
      this.model2.headerParams.splice(id, 1);
    },
    //编辑path参数
    delPathParam: function (id) {
      this.model2.pathParams.splice(id, 1);
    },
    //编辑动作
    addAction: function () {
      let _this = this
      _this.$refs['model2'].validate((valid) => {
        if (!valid) {
          _this.$message({ type: 'error', message: _this.$t('hc.http_form_empty') })
          return false
        } else {
          let model2 = JSON.parse(JSON.stringify(_this.newModel2))
          model2.connectorId = _this.actionList[0].connectorId
          _this.model2 = model2
          //将新增的对象添加的action列表
          let index = _this.actionList.push(_this.model2)
          _this.actionIndex = index - 1
          _this.setEditorValue('bodyInput', '');
        }
      })
    },
    //切换动作
    changeAction: function (index) {
      let _this = this
      _this.$refs['model2'].validate((valid) => {
        if (!valid) {
          _this.$message({ type: 'error', message: _this.$t('hc.http_form_empty') })
          return false
        } else {
          //记录当前动作索引
          this.actionIndex = index
          //切换到该动作
          this.model2 = this.actionList[index]
          this.setEditorValue('bodyInput', this.model2.bodyInput);
        }
      })
    },
    //删除动作
    delAction: function (index) {
      let _this = this
      if (_this.actionList.length <= 1) {
        _this.$message({ type: 'error', message: _this.$t('hc.http_last_one') })
        return
      }
      _this.$confirm(_this.$t('cm.is_delete'), _this.$t('cm.tips'), {
        type: 'warning'
      }).then(() => {
        if (_this.actionList[index].id == '') {
          //id为空表示当前动作还未保存
          _this.actionList.splice(index, 1)
          _this.actionIndex = 0
          _this.model2 = _this.actionList[0]
          _this.setEditorValue('bodyInput', _this.model2.bodyInput);
          _this.$message({ type: 'success', message: _this.$t('cm.operator_success') })
          return
        }
        //已保存的动作需要先调用删除接口
        const loading = _this.setLoading()
        let params = {
          ids: [_this.actionList[index].id]
        }
        //console.log(params)
        api.delActionAPI(params).then(res => {
          //console.log(res)
          loading.close()
          if (res.code === "0") {
            _this.actionList.splice(index, 1)
            _this.actionIndex = 0
            _this.model2 = _this.actionList[0]
            _this.setEditorValue('bodyInput', _this.model2.bodyInput);
            _this.$message({ type: 'success', message: _this.$t('cm.operator_success') })
          } else {
            _this.$message({ type: 'warning', message: res.msg })
          }
        }).catch(err => {
          loading.close()
          //console.log(err)
          _this.$message({ type: 'error', message: err.msg })
        })
      }).catch((err) => {
        //console.log(err)
      })
    },
    //上一步
    stepPrev: function () {
      if (this.step === 2) {
        this.step = 1
      } else {
        this.step = 2
      }
    },
    //下一步
    stepNext: function () {
      let _this = this
      if (this.step === 1) {
        _this.$refs['model1'].validate((valid) => {
          if (!valid) {
            _this.$message({ type: 'error', message: _this.$t('hc.http_form_empty') })
            return false
          } else {
            _this.step = 2
          }
        })
      } else {
        _this.$refs['model2'].validate((valid) => {
          if (!valid) {
            _this.$message({ type: 'error', message: _this.$t('hc.http_form_empty') })
            return false
          } else {
            _this.step = 3
          }
        })
      }
    },
    //显示测试
    testShow: function () {
      let _this = this
      _this.$refs['model2'].validate((valid) => {
        if (!valid) {
          _this.$message({ type: 'error', message: _this.$t('hc.http_form_empty') })
          return false
        } else {
          _this.model2.showTest = true
          this.setEditorValue('testInput', this.model2.bodyInput);
        }
      })
    },
    //动作测试
    testAction: function () {
      let _this = this
      _this.$refs['model2'].validate((valid) => {
        if (!valid) {
          _this.$message({ type: 'error', message: _this.$t('hc.http_form_empty') })
          return false
        } else {
          const loading = _this.setLoading()
          let connectorId = _this.model2.connectorId
          let protocol = _this.model1.protocol == 0 ? 'http://' : 'https://'
          let url = protocol + _this.model1.domain + _this.model1.baseUrl + _this.model2.actionUrl
          let method = parseInt(_this.model2.actionMethod)
          let authType = parseInt(_this.model1.authType)
          let interfaceType = parseInt(_this.model1.interfaceType)

          let params = {
            "connectorId": connectorId,
            "requestUrl": url,
            "requestType": method,
            "authType": authType,
            "interfaceType": interfaceType
          }

          if (_this.model1.interfaceType == 2) {
            //SOAP连接器
            let header = {}
            _this.model2.headerParams.forEach((item, index) => {
              if (item.name !== "")
                header[item.name] = item.value
            })
            //请求参数赋值
            params["requestHeader"] = header
            params["soapType"] = _this.model1.soapType
            params["soapXmlText"] = _this.model2.bodyInput
          } else {
            //JSON连接器
            //后端要求数据为键值对，此处需要将三个对象数组重新组装
            //"name":"xxx", "value":"xxx" => "name":"value"
            let query = {}
            _this.model2.queryParams.forEach((item, index) => {
              if (item.name !== "")
                query[item.name] = item.value
            })
            let body = {}
            if (_this.model2.bodyInput) {
              try {
                body = JSON.parse(_this.model2.bodyInput)
              } catch (e) {
                _this.$message({ type: 'error', message: 'JSON解析错误' })
              }
            }
            let header = {}
            _this.model2.headerParams.forEach((item, index) => {
              if (item.name !== "")
                header[item.name] = item.value
            })
            let path = {}
            _this.model2.pathParams.forEach((item, index) => {
              if (item.name !== "")
                path[item.name] = item.value
            })
            //4个请求参数赋值
            params["requestQuery"] = query
            params["requestBody"] = body
            params["requestHeader"] = header
            params["pathParams"] = path
          }
          api.testAPI(params).then(res => {
            loading.close()
            if (res.code === "0") {
              _this.model2.showTest = false
              _this.model2.responseInput = JSON.stringify(res.data)
              _this.$message({ type: 'success', message: _this.$t('cm.operator_success') })
              _this.step = 3
              this.setEditorValue('responseInput', this.model2.responseInput);
            } else {
              _this.$message({ type: 'error', message: res.msg })
            }
          }).catch(err => {
            loading.close()
            _this.$message({ type: 'error', message: err.msg })
          })
        }
      })
    },
    //将XML转换成后端需要的模板
    setTemplate: function (xml) {
      let x2js = new X2JS({
        useDoubleQuotes: true
      });
      let json = x2js.xml2js(xml);
      //设置header模板
      if (json.Envelope.Header) {
        let prefix = json.Envelope.Header.__prefix
        json.Envelope.Header = {
          headerTemplate: '',
        }
        if (prefix) {
          json.Envelope.Header['__prefix'] = prefix;
        }
      }
      //设置body模板
      let body = json.Envelope.Body;
      //保留Body里的第一个对象
      Object.keys(body).map((item) => {
        let xmlns = body[item]._xmlns;
        if (!item.startsWith('_') && xmlns) {
          body[item] = {
            _xmlns: xmlns,
            bodyTemplate: '',
          }
        }
      })
      let xmlTemp = '';
      //x2js不能解析xml头，直接从原始xml数据取
      let match = xml.match(/<\?xml.*?\?>/);
      if (match && match.length > 0) {
        xmlTemp += match[0];
      }
      xmlTemp += x2js.js2xml(json);
      return xmlTemp;
    },
    //新增、更新动作
    saveAction: function () {
      let _this = this
      const loading = _this.setLoading()
      let params = []
      //循环列表取出所有动作
      _this.actionList.forEach((action, index) => {
        let param = {
          "id": action.id,
          "connectorId": action.connectorId,
          "requestId": action.actionId,
          "requestName": action.actionName,
          "description": action.actionDesc,
          "requestUrl": action.actionUrl,
          "requestMethod": action.actionMethod,
          "queryParams": action.queryParams,
          "headerParams": action.headerParams,
          "pathParams": action.pathParams,
          "bodyParams": action.bodyParams,
          "resultParams": action.responseParams,
          "requestPayload": action.bodyInput,
          "soapType": _this.model1.soapType,
        }
        if (action.responseInput) {
          //保存原始返回数据
          param['resultBody'] = JSON.parse(action.responseInput);
        }
        if (_this.model1.interfaceType == "2" && action.bodyInput) {
          //保存SOAP模板
          param['soapXmlTemplate'] = _this.setTemplate(action.bodyInput)
        }
        params.push(param)
      })
      //console.log(params)
      api.setActionAPI(params).then(res => {
        //console.log(res)
        loading.close()
        if (res.code === "0") {
          _this.$alert(_this.$t('cm.operator_success'), _this.$t('cm.tips'), { confirmButtonText: _this.$t('cm.confirm') }).then(()=>{
            if (window.opener && window.opener.getDataList) {
              window.opener.getDataList();
              window.opener.getDataList = null
            } else if (window.getDataList) {
              window.getDataList();
            }
            //关闭页签
            this.closeTab('/httpConnector');
          })
        } else {
          _this.$message({ type: 'error', message: res.msg })
        }
      }).catch(err => {
        loading.close();
        _this.$message({ type: 'error', message: err.msg })
      })
    },
    //更新连接器
    saveConnector: function () {
      let _this = this
      if (_this.model2.responseParams.length < 1) {
        _this.$message({ type: 'error', message: _this.$t('hc.http_form_empty') })
        return false
      }
      //保存基本信息
      //let _this = this
      const loading = _this.setLoading()
      let params = {
        "classId": _this.model1.classId,
        "connectorName": _this.model1.name,
        "description": _this.model1.description,
        "domain": _this.model1.domain,
        "protocol": _this.model1.protocol,
        "baseUrl": _this.model1.baseUrl,
        "authType": parseInt(_this.model1.authType),
        "username": _this.model1.username,
        "password": _this.model1.password,
        "interfaceType": _this.model1.interfaceType,
        "soapType": _this.model1.soapType,
      }
      if (_this.$route.query.classId) {
        //新增需带上分类ID
        params["classId"] = _this.$route.query.classId
      } else {
        //更新需带上连接器ID
        params["connectorId"] = _this.$route.query.connectorId
      }
      api.setDetailAPI(params).then(res => {
        //console.log(res)
        loading.close()
        if (res.code === "0") {
          //如果返回connectorId
          if (res.data) {
            //_this.model2.connectorId = res.data
            //给所有动作赋值connectorId
            _this.actionList.map((item) => {
              item.connectorId = res.data
            })
          }
          //保存动作
          _this.saveAction()
        } else {
          _this.$message({ type: 'error', message: res.msg })
        }
      }).catch(err => {
        //console.log(err)
        loading.close()
        _this.$message({ type: 'error', message: err.msg })
      })
    },
    //格式化返回数据
    responseFormat: function () {
      if (!this.model2.responseInput) return
      let response = JSON.parse(this.model2.responseInput)
      this.model2.responseInput = JSON.stringify(response, null, 4)
      this.setEditorValue('responseInput', this.model2.responseInput);
    },
    //解析返回数据
    responseParse: function () {
      //let code = this.$refs.response.value
      let code = this.model2.responseInput
      let params = this.jsonParse(code, 5)
      if (params && params.length > 0) {
        params.map((item) => {
          item.type = false
          item.value = ''
        })
        this.model2.responseParams = params
        this.$message({ type: 'success', message: this.$t('hc.http_parse_success') })
      }
      //console.log(this.model2.responseParams)
    },
    //删除返回参数
    delResponseParam: function (id) {
      //多层 根据id删除
      function search(list) {
        //console.log(list)
        list.forEach((item, index) => {
          if (item.id == id) {
            list.splice(index, 1)
            return
          }
          if (typeof item.children == 'object') {
            search(item.children)
          }
        })
      }
      search(this.model2.responseParams)
    },
    //解析XML数据
    soapParse: function () {
      let _this = this
      let loading = _this.setLoading()
      let params = {
        xmlText: _this.model2.bodyInput
      }
      api.xmlToJsonAPI(params).then((res) => {
        loading.close()
        if (res.code === '0') {
          //console.log(res.data)
          let code = JSON.stringify(res.data)
          let params = this.jsonParse(code, 5)
          //console.log(params)
          _this.model2.bodyParams = params
          _this.$message({ type: 'success', message: this.$t('hc.http_parse_success') })
        } else {
          _this.$message({ type: 'error', message: res.msg })
        }
      }).catch((err) => {
        loading.close()
        _this.$message({ type: 'error', message: err.msg })
      })
    },
    //手动更新编辑器
    setEditorValue(ref, value) {
      this.$nextTick(() => {
        if (this.$refs[ref]) this.$refs[ref]._setValue(value)
      })
    },
  },
}

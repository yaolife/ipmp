import {mapActions, mapState} from "vuex";

const regex = /^i18n(:[a-zA-Z0-9]+){2}$/
export default {
  computed: mapState({
    i18nLang: (state) => state.i18n.language, i18nObj: (state) => state.i18n.i18nObj
  }),
  methods: {

    /**
     * 动态多语言渲染
     * @param key 转换key
     * @param bool 是否转换，默认TRUE
     * @returns {*}
     */
    $i18nn(key, bool = true) {
      if (!regex.test(key) || !bool) return key
      const strs = key.split(":")
      if (!!this.i18nObj[this.i18nLang] && !!this.i18nObj[this.i18nLang][strs[2]]) {
        return this.i18nObj[this.i18nLang][strs[2]]
      }
      // 请求多语言
      this.reqI18n(strs[1])
      return key
    },

    /**
     * 对象属性值多语言转换
     * @param obj 需转换的对象
     * @returns {*}
     */
    $i18nO(obj) {
      if (!obj) return obj
      let _o = obj
      const keys = Object.keys(_o)
      for (const i in keys) {
        let v = _o[keys[i]]
        const vType = typeof v
        if (vType === 'string') {
          _o[keys[i]] = this.$i18nn({key: v})
        } else if (v && vType === 'object') {
          _o[keys[i]] = this.$i18nO(v)
        }
      }
      return _o
    },
    ...mapActions(["reqI18n"])
  },
}

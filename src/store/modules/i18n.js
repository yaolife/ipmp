const itemUrl = "/sys/i18n/item/list",
  cacheKey = 'i18nObj',
  cacheVersionKey = 'i18nVersions',
  _i18nObj = localStorage.getItem(cacheKey),
  _i18nVersions = localStorage.getItem(cacheVersionKey)
let i18nObj = {cn: {}}
let i18nVersions = {}
if (!!_i18nObj) i18nObj = JSON.parse(_i18nObj)
if (!!_i18nVersions) i18nVersions = JSON.parse(_i18nVersions)

export default {
  state: {
    language: localStorage.getItem("language") == null ? "cn" : localStorage.getItem("language"),//当前语言， TODO 需整合静态多语言，且默认值从库中读取
    languages: [], i18nObj,
    i18nVersions,
    look: {}
  }, getters: {}, mutations: {
    /**
     * 语言切换
     * @param state
     * @param lang
     */
    setLanguage(state, lang) {
      state.language = lang;
    },
    /**
     * 设置支持的多语言分类
     * @param state
     * @param languages
     */
    setLanguages(state, languages) { 
      state.languages = languages;
    },
    /**
     * 版本比较
     * 用于多语言在浏览器中的缓存更新
     * @param state
     * @param list
     */
    diffVersion(state, list) {
      const v = state.i18nVersions
      const cleanKeys = Object.keys(v).filter(k => !!list[k] && list[k] > v[k])
      this.commit("cleanCacheI18nObj", cleanKeys);
      state.versions = list
      localStorage.setItem(cacheVersionKey, JSON.stringify(state.versions))
    },
    /**
     * 缓存失效处理
     * @param state
     * @param cleanKeys
     */
    cleanCacheI18nObj(state, cleanKeys) {
      const _obj = state.i18nObj
      Object.keys(_obj).forEach(lang => {
        Object.keys(_obj[lang]).filter(key => {
          const exists = cleanKeys.findIndex(_key => key === _key);
          if (exists !== -1) delete _obj[lang][key]
        })
      })
      state.i18nObj = {...i18nObj}
      localStorage.setItem(cacheKey, JSON.stringify(state.i18nObj))
    },
    /**
     * 翻译项合并
     * @param state
     * @param list
     */
    mergeI18nObj(state, list) {
      list.map(item => {
        if (!state.i18nObj[item.lang]) state.i18nObj[item.lang] = {}
        state.i18nObj[item.lang][item.k] = item.v
      })
      state.i18nObj = {...state.i18nObj}
      localStorage.setItem(cacheKey, JSON.stringify(state.i18nObj))
    },
    /**
     * 请求锁
     * @param state
     * @param key
     */
    lookReq(state, key) {
      state.look[key] = true
    },
    setLook(state, look) {
      state.look = look;
    },
    /**
     * 解解锁
     * @param state
     * @param key
     */
    unLookReq(state, key) {
      delete state.look[key]
    }
  }, actions: {
    /**
     * 异步请求多语言翻译项数据
     * @param state
     * @param commit
     * @param groupCode
     * @returns {Promise<void>}
     */
    async reqI18n({state, commit}, groupCode) { 
      if (!!state.look[groupCode]) return
      commit("lookReq", groupCode)
      const http = require("@/api/http").default || require("@/api/http")
      const {data} = await http.get(`${itemUrl}/${groupCode}`)
      if (data.code === '0') {
        commit("mergeI18nObj", data.data)
      }
    },
  }
}

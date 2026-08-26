export default {
    state: {
        //应用列表
        sysAppInfos: [],
        // 是否是超级管理员1是，0否， 空 否
        isAdminRootRole: '',
        currentAdminRoleId: '',
        //密码策略
        userPwRule: '',
        //当前应用标识
        appId: '',
        appCode: '',
        userId: '',
        userCode: '',
        userName: '',
        orgId: '',
        orgName: '',
        ifMultiApp: '1',
        langConfig: [],
        locale:'',
        language: ''
    },
    getters:{
        getterUserCode (state) {
            return state.userCode
        },
        getterUserName (state) {
            return state.userName
        },
        getterUserId (state) {
            return state.userId
        },
        getterCurrAppId (state) {
            return state.appId
        },
        getterCurrOrgId (state) {
            return state.orgId
        },
        getterCurrentAdminRoleId (state) {
            return state.currentAdminRoleId
        }
    },
    mutations:{
        setIfMultiApp: function (state, ifMultiApp) {
            state.ifMultiApp = ifMultiApp
        },
        setSysAppInfos: function (state, sysAppInfos) {
            state.sysAppInfos = sysAppInfos
        },
        setISAdminRootRole: function (state, isAdminRootRole) {
            state.isAdminRootRole = isAdminRootRole
        },
        setCurrentAdminRoleId: function (state, currentAdminRoleId) {
            state.currentAdminRoleId = currentAdminRoleId
        },
        setuserPwRule: function (state, userPwRule) {
            state.userPwRule = userPwRule
        },
        setAppId: function (state, appId) {
            state.appId = appId
        },
        setAppCode: function (state, appCode) {
            state.appCode = appCode
        },
        setUserId: function (state, userId) {
            state.userId = userId
        },
        setUserName: function (state, userName) {
            state.userName = userName
        },
        setUserCode: function (state, userCode) {
            state.userCode = userCode
        },
        setOrgId: function (state, orgId) {
            state.orgId = orgId
        },
        setOrgCode: function (state, orgCode) {
            state.orgCode = orgCode
        },
        setOrgName: function (state, orgName) {
            state.orgName = orgName
        },
        setLangConfig: function (state, langConfig) {
            state.langConfig = langConfig
        },
        setLocale: function (state, locale) {
            state.locale = locale
        },
        setLanguage: function (state, language) {
            state.language = language
        }
    },
    actions: {
        setSessionStore ({ state, commit }, obj) {
            let data = obj
            let sysAppInfos = []
            if(data['sysAppInfos']) {
                sysAppInfos = data['sysAppInfos']
            }
            let isAdminRootRole = data['isAdminRootRole']
            let adminRoleId = data['adminRoleId']
            let userPwRule = data['userPwRule']
            let appIdCurr = data['appIdCurr']
            let userId = data['userId']
            let userCode = data['userCode']
            let userName = data['userName']
            let orgId = data['orgId']
            let orgName = data['orgName']
            let ifMultiApp = data['ifMultiApp']
            let langConfig = data['langConfig']
            let locale = data['locale']
            commit('setUserId', userId)
            commit('setUserCode', userCode)
            commit('setUserName', userName)
            commit('setOrgId', orgId)
            commit('setSysAppInfos', sysAppInfos)
            commit('setISAdminRootRole', isAdminRootRole)
            commit('setCurrentAdminRoleId', adminRoleId)
            commit('setuserPwRule', userPwRule)
            commit('setAppId', appIdCurr)
            commit('setOrgName', orgName)
            commit('setIfMultiApp', ifMultiApp)
            commit('setLangConfig', langConfig)
            commit('setLocale', locale)
        },
        getCurrAppId ({ state, commit }) {
            return new Promise((resolve, reject) => {
                try {
                    resolve(state.appId)
                } catch (error) {
                    reject(error)
                }
            })
        }
    }
}

const install = (Vue) => {
  //全局调用方法
  Vue.prototype.$businessMsg = (msgKey, defaultLang, defaultMsg) => {
    if (!defaultMsg) defaultMsg = '';
    if (!defaultLang) {
      let lang = localStorage.getItem('language');
      if (lang) defaultLang = lang;
    }
    let storage = localStorage.getItem('business_msg');
    if (storage) {
      let business_msg = JSON.parse(storage);
      let msg = business_msg.find((item) => item.msgKey === msgKey && item.langCode === defaultLang);
      return msg ? msg.msgValue : defaultMsg;
    }
    return defaultMsg;
  }
};

export default {
  install
}

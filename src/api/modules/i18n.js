const i18nLangBase = '/sys/i18n/lang';
const i18nItemBase = '/sys/i18n/item';
const i18nCategoryBase = '/sys/i18n/category';
const i18nLang = {
  list: `${i18nLangBase}/list`,
  add: `${i18nLangBase}/add`,
  update: `${i18nLangBase}/update`,
  delete: `${i18nLangBase}/delete`
}
const i18nItem = {
  list: `${i18nItemBase}/list`,
  page: `${i18nItemBase}/page`,
  add: `${i18nItemBase}/add`,
  delete: `${i18nItemBase}/delete`,
  lastTime: `${i18nItemBase}/last-time`,
  getByKey: `${i18nItemBase}/get`,
  save: `${i18nItemBase}/save`,

}
const i18nCategory = {
  list: `${i18nCategoryBase}/list`,
  save: `${i18nCategoryBase}/save`,
  delete: `${i18nCategoryBase}/delete`,
  checkCode: `${i18nCategoryBase}/checkCode`,
  checkName: `${i18nCategoryBase}/checkName`,
}
/**
 * i18n 动态多语言相关接口地址
 */
export default {
  i18nLang, // 多语言类别
  i18nItem, // 翻译项
  i18nCategory // 翻译项分类
}

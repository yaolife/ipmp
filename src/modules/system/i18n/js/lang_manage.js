import i18n_item_manage from "../i18n_item_manage.vue";
import i18n_lang_manage from "../i18n_lang_manage.vue";
import breadcrumb from "@/components/common/breadcrumb";
export default {
  components: { i18n_item_manage, i18n_lang_manage, breadcrumb },
  data() {
    return {
      hasIcon: false,
      brand: [{ name: "sys.system_manage" }, { name: "sys.i18n_lang_manage" }],
      activeNameState: "i18n_item"
    };
  },
  props: {
    activeName: { type: String, default: "i18n_lang" }
  },
  methods: {
    handleClick(tab) {
      this.resetActivePosition(this.$refs.tabs.$el);
      let manage;
      if (tab.name === "i18n_lang") {
        this.activeNameState = "i18n_lang";
        manage = this.$refs['lang-manage'];
      }
      if (tab.name === "i18n_item") {
        this.activeNameState = "i18n_item";
        manage = this.$refs['item-manage'];
      }
      let timer = setTimeout(() => {
        clearTimeout(timer)
        manage.tabsChange();
      }, 335);
    },
    resetActivePosition($el) {
      this.$nextTick(() => {
        const activeEl = $el.querySelector(".el-tabs__item.is-active");
        const lineEl = $el.querySelector(".el-tabs__active-bar");
        const style = getComputedStyle(activeEl);
        const pl = style.paddingLeft.match(/\d+/)[0] * 1;
        const pr = style.paddingRight.match(/\d+/)[0] * 1;
        const w = style.width.match(/\d+/)[0] * 1;
        lineEl.style.transform =
          "translateX(" + (activeEl.offsetLeft + pl - 6) + "px)";
        lineEl.style.width = w - pl - pr + "px";
      });
    },
  }
};

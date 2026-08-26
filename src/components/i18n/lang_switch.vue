<!-- 多语言切换组件-->
<template>
  <el-select v-model="localLang" size="small" :popper-append-to-body="false" popper-class="cud-lang-dropdown">
    <el-option
      v-for="item in languages"
      :key="item.code"
      :value="item.code"
      :label="$i18nn(item.name)"
    />
  </el-select>
</template>

<script>
import { mapMutations, mapState } from "vuex";
import axios from "@/api/http";

export default {
  name: "langSwitch",
  created() {
    if (localStorage.getItem("langList")) {
      if (process.env.AUTH_TYPE !== "AEP") {
        //语言列表
        this.setLanguages([
          { code: "pt", name: "葡萄牙语" },
          { code: "en", name: "English" },
          { code: "cn", name: "中文" },
        ]);
      } else {
        let langList = JSON.parse(localStorage.getItem("langList"));
        this.setLanguages(langList);
      }
    } else {
      this.init();
    }
  },
  data() {
    return {
      langList: [],
    };
  },
  computed: {
    ...mapState({ languages: (state) => state.i18n.languages }),
    localLang: {
      get() {
        return this.i18nLang;
      },
      set(val) {
        this.setLanguage(val);
        if ("en" === val) {
          this.$i18n.locale = "en-US";
          localStorage.setItem("language", "en");
        } else if ("pt" === val) {
          this.$i18n.locale = "pt";
          localStorage.setItem("language", "pt");
        } else {
          this.$i18n.locale = "zh-CN";
          localStorage.setItem("language", "cn");
        }
      },
    },
  },

  mounted() {
    //console.log(this.$store.state);
    let val = localStorage.getItem("language");
    if (val == null) {
      //默认中文
      val = "cn";
    }
    this.setLanguage(val);
    if ("en" === val) {
      this.$i18n.locale = "en-US";
      localStorage.setItem("language", "en");
    } else if ("pt" === val) {
      this.$i18n.locale = "pt";
      localStorage.setItem("language", "pt");
    } else {
      this.$i18n.locale = "zh-CN";
      localStorage.setItem("language", "cn");
    }
  },
  methods: {
    ...mapMutations(["setLanguage", "setLanguages"]),
    init() {
      //解耦版本
      if (process.env.AUTH_TYPE !== "AEP") {
        //语言列表
        this.setLanguages([
          { code: "pt", name: "葡萄牙语" },
          { code: "en", name: "English" },
          { code: "cn", name: "中文" },
        ]);
      } else {
        axios.post(this.$api.i18n.i18nLang.list, {}).then((res) => {
          if (res.data.code === "0") {
            this.langList = [];
            res.data.data.forEach((item) => {
              this.langList.push({ code: item.langCode, name: item.langName });
            });
            localStorage.setItem("langList", JSON.stringify(this.langList));
            this.setLanguages(this.langList);
          }
          // if (res.data.code === "0") {
          //   this.setLanguages(
          //     res.data.data.map(item => ({
          //       code: item.langCode,
          //       name: item.langName
          //     }))
          //   );
          // }
        });
      }
    },
  },
};
</script>

<style scoped></style>

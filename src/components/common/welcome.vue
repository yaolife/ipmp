<!--欢迎页面  系统进入的默认页面 不被拦截-->
<template>
  <div class="cud-commom-form-style box">
    <el-card class="container" :key="index">
      <customPreview
        v-if="firstDataId"
        :firstDataId="firstDataId"
      ></customPreview>
    </el-card>
  </div>
</template>

<script>
import { throttle } from "@/utils/funcUtil";
import { calcHeight } from "@/utils/funcUtil";
import {
  getPageList,
  getChiefPageAPI,
} from "@/modules/customPortal/api/pageManagement";
import customPreview from "@/modules/customGraph/preview.vue";
import { getUserInfo, getOnlineUsers } from "@/api/api.js";
export default {
  components: {
    customPreview,
  },
  data() {
    return {
      computedHeight: 0,
      seconds: 0,
      firstDataId: null,
      index: 0,
      nowUser: "",
      userGroup: "中国广核集团",
      userDept: "",
      shortName: "",
      tableData: [],
    };
  },
  watch: {
    $route: {
      handler(to) {
        if (to.meta === "welcome") {
          this.index = Math.random();
          // console.log("to", to.params.id, this.$route);
          if (to.params.id) {
            this.firstDataId = to.params.id;
          } else {
            //this.getPageList();
            this.getChiefPage();
          }
        }
      },
      immediate: true,
    },
  },
  created() {
    this.$nextTick(async () => {
      await this.getNowUser(); //获取当前用户信息，右上角展示
      //await this.getOnline();
    });
  },
  mounted() {
    // console.log(222, this.$route.params.id);
    this.initMaxHeight();
    // this.checkSeconds();
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    this.throttleFunc = throttle(this.initMaxHeight, 500);
    window.addEventListener("resize", this.throttleFunc);
  },
  beforeDestroy() {
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    window.removeEventListener("resize", this.throttleFunc);
  },
  methods: {
    // 默认显示自定义第一条数据 获取id
    getPageList() {
      getPageList({
        pages: { current: 1, pageSize: 10 },
        params: {},
      }).then((res) => {
        this.firstDataId = res.records[0].id;
        // console.log(this.firstDataId, "res", res);
      });
    },
    // 计算列表高度
    initMaxHeight() {
      calcHeight(this, -40);
    },
    // 首次进入欢迎页跳转
    checkSeconds() {
      if (!sessionStorage.getItem("redirected")) {
        sessionStorage.setItem("redirected", 1);
        this.seconds = 3;
        let timer = window.setInterval(() => {
          this.seconds--;
          if (this.seconds == 0) {
            window.clearInterval(timer);
            this.$router.push("/office");
          }
        }, 1000);
      }
    },
    async getNowUser() {
      //获取用户信息
      let _this = this;
      if (sessionStorage.getItem("user")) {
        _this.nowUser = sessionStorage.getItem("user");
        _this.userDept = sessionStorage.getItem("userDept");
        this.getShortName();
      } else {
        const result = await getUserInfo({ t: Math.random() });
        _this.nowUser = result.data.data.nowUserName;
        _this.userDept = result.data.data.userDeptName;
        sessionStorage.setItem("user", result.data.data.nowUserName);
        sessionStorage.setItem("userDept", result.data.data.userDeptName);
        sessionStorage.setItem("userDeptId", result.data.data.userDeptId);

        this.getShortName();
      }
    },
    //名字缩写
    getShortName() {
      if (this.nowUser) {
        let indexof = this.nowUser.indexOf("]");
        let shortName =
          indexof > -1 ? this.nowUser.substring(indexof + 1) : this.nowUser;
        shortName = shortName.length > 2 ? shortName.substring(1) : shortName;
        this.shortName = shortName;
      }
    },

    //获取首页id
    getChiefPage() {
      getChiefPageAPI().then((res) => {
        console.log(res.data, "res.data");
        if (res.code == "0") {
          this.firstDataId = res.data;
        }
      });
    },
  },
};
</script>

<style scoped lang="less">
.box {
  display: flex;
}
.container {
  background-color: #fff;
  height: calc(100vh - 125px);
  width: 100%;
}
/deep/ .preview-container .canvas-area .grid-layout {
  padding: 15px 15px 0;
  box-sizing: border-box;
  // background: url("~@/assets/img/bg.jpg") no-repeat center !important;
  background-size: cover;
  // .item-header {
  //   display: none !important;
  // }
}
/deep/ .el-card__body {
  padding: 0;
  height: 100%;
  .home-class {
    height: 100% !important;
  }
}
/deep/ .grid-layout {
  margin-bottom: 10px !important;
}
/deep/ .grid-item-content {
  margin: 10px 0 10px 0 !important;
}

.welcome {
  padding: 15% 200px;
  text-align: center;
}
.interval {
  padding-top: 20px;
  color: #d9001b;
}
.aside-right {
  max-width: 376px;
  margin: 10px 20px 0px 0px;
}
.userInfo {
  color: #fff;
  font-size: 14px;
  line-height: 20px;
  padding: 16px 20px 24px;
  border-radius: 4px;
  height: 126px;
  display: flex;
  align-items: center;
  background: url("/static/img/userInfo-bg.png");
  .avatar {
    font-size: 24px;
    min-width: 80px;
    height: 80px;
    border-radius: 80px;
    background-color: #0775db;
    color: #fff;
    margin-right: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .name {
    display: flex;
    margin-bottom: 16px;
  }
  .group {
    margin-bottom: 8px;
  }
}
.onlineTable {
  max-height: 250px;
  background-color: #eaf2ff;
  margin-top: 10px;
  padding: 10px 15px;
  .onlineTitle {
    font-size: 20px;
    font-weight: 800;
    margin-bottom: 15px;
  }
}
/deep/.el-table {
  .cell {
    text-align: center;
  }
  th {
    background-color: #dbe6fa;
  }
}
</style>

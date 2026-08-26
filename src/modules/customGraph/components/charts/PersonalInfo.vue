<template>
  <div class="aside-right">
    <div class="userInfo">
      <!-- <img :src="avatar" alt="" class="avatar" /> -->
      <div class="avatar">{{ shortName }}</div>
      <div>
        <div class="name">{{ nowUser }}</div>
        <div class="group">{{ userGroup }}</div>
        <div>{{ userDept }}</div>
      </div>
    </div>
  </div>
</template>

<script>
import { getUserInfo } from "@/api/api.js";
export default {
  name: "PersonalInfo",
  data() {
    return {
      nowUser: "",
      userGroup: "中国广核集团",
      userDept: "",
      shortName: "",
      tableData: [],
    };
  },
  created() {
    this.$nextTick(async () => {
      await this.getNowUser(); //获取当前用户信息，右上角展示
    });
  },
  watch: {},
  methods: {
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
  },
};
</script>

<style scoped lang="less">
.userInfo {
  color: #fff;
  font-size: 14px;
  line-height: 20px;
  padding: 0px 24px;
  border-radius: 4px;
  height: 100%;
  display: flex;
  align-items: center;
  background: url("/static/img/userInfo-bg.png");
  background-size: cover;
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
</style>
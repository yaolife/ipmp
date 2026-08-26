<template>
  <el-card>
    <div class="main">
      <div class="title">选人组件</div>
      <div class="block">
        <div class="card">
          <div class="valShow" @click="$refs.personComponent.clear()">
            值:{{ userInfo }}
          </div>
          <div class="valShow">选人组件( 单选 ):</div>
          <person-select style="width: 280px" v-model="userInfo" />
          <div style="margin-top: 20px" class="valShow">值:{{ userInfo1 }}</div>
          <div class="valShow">选人组件( 多选 ):</div>
          <person-select
            ref="personComponent"
            style="width: 280px"
            v-model="userInfo1"
            multiple
          />
          <div style="margin-top: 20px" class="valShow">值:{{ userInfo2 }}</div>
          <div class="valShow">选人组件( 中台 ):</div>
          <person-select-aep
            style="width: 180px"
            v-model="userInfo2"
            @change="change1"
          />
          <div class="valShow" style="margin-top: 20px">
            我是选人的弹出框组件,我有源码 ,
            可在\src\modules\demoLib\components\personOrDept中找到我:
          </div>
          <div>
            <personOrDept
              ref="wfCommPersonComponentId"
              :personOrDept="true"
              :multiple="false"
              :initUserId="initUserId"
              @callback="callback"
              style="width: 280px"
            ></personOrDept>
          </div>
          <div style="margin-top: 20px" class="valShow">
            值:{{ userInfo10 }}
          </div>
          <div class="valShow" style="margin-top: 20px">
            新版样式选人组件(单选)
          </div>
          <person-select-input style="width: 280px" v-model="userInfo10" />
          <div style="margin-top: 20px" class="valShow">
            值:{{ userInfo11 }}
          </div>

          <div class="valShow" style="margin-top: 20px">
            新版样式选人组件(多选)
          </div>
          <person-select-input
            style="width: 280px"
            v-model="userInfo11"
            multiple
          />
        </div>

        <div v-if="!show" class="meta">
          <div class="highligh" style="width: 100%">
            <pre v-highlightjs>
            <code class="vue code-css">
          {{htmlContent}}
            </code>
         </pre>
          </div>
        </div>

        <div v-if="show" class="demo-block-control show" @click="isShow">
          <i class="el-icon-caret-bottom hovering"></i>
          <span class="show-content">显示代码</span>
        </div>
        <div v-else class="demo-block-control show" @click="isShow">
          <i class="el-icon-caret-top hovering"></i>
          <span class="show-content">隐藏代码</span>
        </div>
      </div>

      <div class="title" style="margin-top: 30px">选部门组件</div>
      <div class="block">
        <div class="card">
          <div class="valShow">值:{{ userInfo3 }}</div>
          <div class="valShow">选部门组件( 多选 ):</div>
          <dept-select style="width: 280px" v-model="userInfo3" />
          <div style="margin-top: 20px" class="valShow">值:{{ userInfo4 }}</div>
          <div class="valShow">选部门组件( 中台单选 ):</div>
          <dept-select-aep style="width: 280px" v-model="userInfo4" />
        </div>
        <div v-if="!show1" class="meta">
          <div class="highligh" style="width: 100%">
            <pre v-highlightjs>
            <code class="vue code-css">
          {{htmlContent1}}
            </code>
         </pre>
          </div>
        </div>

        <div v-if="show1" class="demo-block-control show" @click="isShow1">
          <i class="el-icon-caret-bottom hovering"></i>
          <span class="show-content">显示代码</span>
        </div>
        <div v-else class="demo-block-control show" @click="isShow1">
          <i class="el-icon-caret-top hovering"></i>
          <span class="show-content">隐藏代码</span>
        </div>
      </div>
    </div>
  </el-card>
</template>
<script>
import hljs from "highlight.js";
// import hljs from "highlight.js/lib/highlight";
// import "highlight.js/styles/github.css";
import { codeList } from "./personDemo";
import { codeList1 } from "./deptDemo";
import personOrDept from "./personOrDept/index";
// import wfPersonDeptComponent from "@/components/cudCommPersonComponent/wfCommPersonComponent.vue";
// import "highlight.js/styles/github-gist.css";
import { setFollow, unsetFollow } from "../components/scrollFollow.js";
import personSelectNew from "./personSelectNew/index.vue";
import personSelectInput from "./personSelectNew/personSelect.vue";

export default {
  components: {
    // wfPersonDeptComponent,
    personOrDept,
    personSelectNew,
    personSelectInput,
  },
  data() {
    return {
      userInfo: {
        userName: "",
        userId: "",
      },
      userInfo1: {
        userName: "",
        userId: "",
      },
      userInfo10: {
        userName: "",
        userId: "",
      },
      userInfo11: {
        userName: "",
        userId: "",
      },
      userInfo10: {
        userNmae: "",
        userId: "",
      },
      userInfo11: {
        userNmae: "",
        userId: "",
      },
      userInfo2: {
        userName: "",
        userId: "",
      },
      userInfo3: {
        deptName: "",
        deptNo: "",
      },
      userInfo4: {
        deptName: "",
        deptNo: "",
      },
      htmlContent: codeList,
      htmlContent1: codeList1,
      show: true,
      show1: true,
      showDialog: false,
      initUserId: "",
      currentUser1: "",
      showDialog1: false,
    };
  },
  directives: {
    highlightjs: {
      bind: (el) => {
        let blocks = el.querySelectorAll("pre code");
        blocks.forEach((block) => {
          hljs.highlightBlock(block);
        });
      },
    },
  },
  mounted() {
    hljs.highlightAll();
    // let userInfo1 = {
    //   userName:"[P631038]杨旭,[630445]陈汉武",
    //   userId:"P631038,P630445"
    // }
    // this.$set(this, "userInfo1", userInfo1);
    // setTimeout(() => {
    //   let userInfo3 = {
    //     deptName: "50359648;23000000-岭湾核电有限公司;岭东核电有限公司",
    //     deptNo: "50359648;23000000",
    //   };
    //   this.$set(this, "userInfo3", userInfo3);
    // }, 1000);

    //设置滚动跟随
    setFollow(this);
  },
  beforeDestroy() {
    //取消滚动跟随
    unsetFollow(this);
  },
  methods: {
    callback(val) {
      console.log("[ callback  ]", val);
    },
    change1(val) {
      console.log("[ val ]", val);
    },
    isShow() {
      this.show = !this.show;
    },
    isShow1() {
      this.show1 = !this.show1;
    },
  },
};
</script>
<style lang="less" scoped>
.main {
  padding: 20px;
  .title {
    font-size: 20px;
    margin-bottom: 20px;
    // margin-left: 15px;
  }
  .valShow {
    margin-bottom: 10px;
  }
  .card {
    padding: 20px 20px 40px 20px;
    border: 1px solid #ebebeb;
    border-radius: 3px;
    transition: 0.2s;
  }
  .demo-block-control {
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #eaeefb;
    height: 44px;
    box-sizing: border-box;
    background-color: #fff;
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
    text-align: center;
    margin-top: -1px;
    color: #d3dce6;
    cursor: pointer;
    position: relative;
    .demo-block-control > span {
      position: absolute;
      transform: translateX(-30px);
      font-size: 14px;
      line-height: 44px;
      transition: 0.3s;
      display: inline-block;
    }
    i.hovering {
      transform: translateX(-10px);
    }
  }
  .demo-block-control:hover {
    color: #409eff;
  }
  .demo-block-control.is-fixed {
    position: fixed;
    bottom: 0;
    width: calc(100% - 295px);
  }
  .el-icon-caret-bottom {
    font-size: 16px;
    line-height: 44px;
    transition: 0.3s;
  }
  .el-icon-caret-bottom:before {
    content: "\e790";
  }
  .hljs {
    font-family: Menlo, Monaco, Consolas, Courier, monospace;
    font-size: 16px;
    padding: 0px 24px 0 110px;
    background-color: #fafafa;
    border-radius: 4px;
    -webkit-font-smoothing: auto;
  }
}
pre {
  background-color: #f8f8f8;
  margin: 0;
  overflow-x: auto;
}
code {
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
  font-size: 13px;
  color: #333;
}
/deep/ .el-card__body {
  padding: 15px;
}
.code-css {
  position: relative;
  top: 0px;
  left: -80px;
  font-size: 18px;
}
.show-content {
  display: none;
}
.show:hover .show-content {
  display: block;
}
</style>

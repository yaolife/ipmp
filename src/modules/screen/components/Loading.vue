<template>
  <div class="loadingContainer" :style="containerStyle">
    <div class="mask"></div>
    <div class="contentWrapper">
      <div class="contentContainer">
        <p class="content">{{ text }}</p>
        <div class="spin"></div>
        <p class="text">loading...</p>
        <p v-if="hint" class="hint">{{ hint }}</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "PixelStreamLoading",
  props: {
    progress: {
      type: Number,
      default: 0
    },
    text: {
      type: String,
      default: ""
    },
    bgImage: {
      type: String,
      default: ""
    },
    hint: {
      type: String,
      default: ""
    }
  },
  computed: {
    containerStyle() {
      if (!this.bgImage) return {};
      return {
        backgroundImage: "url('" + this.bgImage + "')"
      };
    }
  }
};
</script>

<style lang="less" scoped>
@keyframes spinRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.loadingContainer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2147483000;
  width: 100%;
  height: 100%;
  background-size: 100% 100%;
  background-image: url("~@/assets/images/bg-loading.png");
  background-repeat: no-repeat;
  .mask {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.3);
    z-index: 0;
  }
  .contentWrapper {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    position: absolute;
    z-index: 1;
    .contentContainer {
      width: 100%;
      height: auto;
      padding-top: 30px;
      padding-bottom: 30px;
      background-color: rgba(0, 0, 0, 0.4);
      display: flex;
      flex-direction: column;
      align-items: center;
      .content {
        color: #fff !important;
        font-weight: bolder;
        font-family: "Microsoft YaHei";
        font-size: 62px !important;
        letter-spacing: 2px;
        line-height: 1.2;
        margin: 0;
        user-select: none;
      }
      .spin {
        position: relative;
        margin-top: 30px;
        width: 200px;
        height: 200px;
      }
      .spin::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-image: url("~@/assets/images/spinMain.png");
        background-size: cover;
        z-index: 1;
        animation: spinRotate 5s linear infinite;
      }
      .text {
        margin: 20px 0 0;
        font-size: 20px !important;
        color: #fff !important;
        font-family: "Microsoft YaHei";
      }
      .hint {
        max-width: 80%;
        margin: 16px 0 0;
        font-size: 16px !important;
        line-height: 1.6;
        color: #ffd666 !important;
        text-align: center;
      }
    }
  }
}

@media only screen and (max-width: 767px) {
  .loadingContainer {
    .contentWrapper {
      .contentContainer {
        padding-top: 15px;
        padding-bottom: 15px;
        .content {
          font-size: 24px !important;
        }
        .spin {
          margin-top: 10px;
          width: 100px;
          height: 100px;
        }
        .text {
          margin-top: 10px;
          font-size: 20px !important;
        }
      }
    }
  }
}
</style>

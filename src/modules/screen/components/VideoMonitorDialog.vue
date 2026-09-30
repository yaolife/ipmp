<template>
  <div
    v-if="visible"
    ref="dialog"
    class="video-monitor-dialog"
    :class="{ 'is-fullscreen': isFullScreen }"
    :style="dialogStyle"
    @mousedown.stop
    @pointerdown.stop
  >
    <div class="video-monitor-header">
      <span class="video-monitor-title">视频监控</span>
      <div class="video-monitor-actions">
        <button
          type="button"
          class="video-monitor-action"
          :aria-label="isFullScreen ? '退出全屏' : '全屏'"
          :title="isFullScreen ? '退出全屏' : '全屏'"
          @click="toggleFullScreen"
        >
          <svg v-if="!isFullScreen" viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M2.5 6.2V2.5H6.2M9.8 2.5h3.7v3.7M13.5 9.8v3.7H9.8M6.2 13.5H2.5V9.8"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
          <svg v-else viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M6.2 2.5v3.7H2.5M9.8 2.5v3.7h3.7M13.5 9.8H9.8v3.7M2.5 9.8h3.7v3.7"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
        <button
          type="button"
          class="video-monitor-action"
          aria-label="关闭"
          title="关闭"
          @click="close"
        >
          <svg viewBox="0 0 16 16" aria-hidden="true">
            <path
              d="M3.2 3.2l9.6 9.6M12.8 3.2l-9.6 9.6"
              fill="none"
              stroke="currentColor"
              stroke-width="1.6"
              stroke-linecap="round"
            />
          </svg>
        </button>
      </div>
    </div>
    <div class="video-monitor-body">
      <div :id="playerId" class="video-monitor-player"></div>
      <div v-if="errorText" class="video-monitor-error">{{ errorText }}</div>
    </div>
  </div>
</template>

<script>
var PLAYER_ID = "ipmp-video-monitor-player";
var TREE_RIGHT_RATIO = 0.0156 + 0.1656;

export default {
  name: "VideoMonitorDialog",
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    videoUrl: {
      type: String,
      default: ""
    }
  },
  data: function() {
    return {
      playerId: PLAYER_ID,
      player: null,
      errorText: "",
      isFullScreen: false,
      dialogStyle: {
        left: "0px",
        top: "0px",
        width: "33.333vw",
        height: "24vw"
      }
    };
  },
  watch: {
    visible: function(value) {
      if (value) {
        this.openPlayer();
      } else {
        this.exitFullScreen();
        this.stopPlayer();
      }
    },
    videoUrl: function() {
      if (this.visible) this.openPlayer();
    }
  },
  mounted: function() {
    window.addEventListener("resize", this.onResize);
    document.addEventListener("fullscreenchange", this.onFullScreenChange);
    document.addEventListener("webkitfullscreenchange", this.onFullScreenChange);
    document.addEventListener("mozfullscreenchange", this.onFullScreenChange);
    document.addEventListener("MSFullscreenChange", this.onFullScreenChange);
    if (this.visible) this.openPlayer();
  },
  beforeDestroy: function() {
    window.removeEventListener("resize", this.onResize);
    document.removeEventListener("fullscreenchange", this.onFullScreenChange);
    document.removeEventListener("webkitfullscreenchange", this.onFullScreenChange);
    document.removeEventListener("mozfullscreenchange", this.onFullScreenChange);
    document.removeEventListener("MSFullscreenChange", this.onFullScreenChange);
    this.exitFullScreen();
    this.stopPlayer();
  },
  methods: {
    layout: function() {
      var vw = window.innerWidth || document.documentElement.clientWidth || 0;
      var vh = window.innerHeight || document.documentElement.clientHeight || 0;
      var treeRight = Math.round(vw * TREE_RIGHT_RATIO) + 16;
      var width = Math.round(vw / 3);
      var header = 36;
      var height = Math.round(width * 9 / 16) + header;
      var maxHeight = Math.round(vh * 0.86);
      if (height > maxHeight) height = maxHeight;
      var left = Math.round((vw - width) / 2);
      if (left < treeRight) left = treeRight;
      if (left + width > vw - 8) left = Math.max(8, vw - width - 8);
      var top = Math.round((vh - height) / 2);
      if (top < 8) top = 8;
      this.dialogStyle = {
        left: left + "px",
        top: top + "px",
        width: width + "px",
        height: height + "px"
      };
    },
    openPlayer: function() {
      var self = this;
      this.errorText = "";
      this.layout();
      this.$nextTick(function() {
        self.layout();
        self.play();
      });
    },
    play: function() {
      var url = String(this.videoUrl || "").trim();
      if (!url) return;
      if (typeof window.JSPlugin !== "function") {
        this.errorText = "视频播放组件未加载";
        return;
      }
      this.stopPlayer();
      var player;
      try {
        player = new window.JSPlugin({
          szId: this.playerId,
          iMaxSplit: 1,
          iCurrentSplit: 1,
          openDebug: false,
          oStyle: {
            borderSelect: "transparent"
          }
        });
      } catch (e) {
        this.errorText = "视频播放器初始化失败";
        return;
      }
      this.player = player;
      var self = this;
      var task = player.JS_Play(
        url,
        { playURL: url, mode: 0, keepDecoder: 0, token: "" },
        0
      );
      if (task && typeof task.then === "function") {
        task.then(
          function() {
            self.resizePlayer();
          },
          function() {
            self.errorText = "视频流打开失败";
          }
        );
      } else {
        this.resizePlayer();
      }
    },
    resizePlayer: function() {
      var player = this.player;
      if (player && typeof player.JS_Resize === "function") {
        try {
          player.JS_Resize();
        } catch (e) {}
      }
    },
    stopPlayer: function() {
      var player = this.player;
      this.player = null;
      if (!player) return;
      try {
        if (typeof player.JS_Stop === "function") player.JS_Stop(0);
      } catch (e) {}
      try {
        if (typeof player.JS_Destroy === "function") player.JS_Destroy();
      } catch (e) {}
      var el = document.getElementById(this.playerId);
      if (el) el.innerHTML = "";
    },
    onResize: function() {
      if (!this.visible || this.isFullScreen) return;
      this.layout();
      this.resizePlayer();
    },
    currentFullScreenElement: function() {
      return (
        document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement ||
        null
      );
    },
    toggleFullScreen: function() {
      var el = this.$refs.dialog;
      if (!el) return;
      if (this.currentFullScreenElement() === el) {
        this.exitFullScreen();
        return;
      }
      var request =
        el.requestFullscreen ||
        el.webkitRequestFullscreen ||
        el.mozRequestFullScreen ||
        el.msRequestFullscreen;
      if (!request) return;
      var result = request.call(el);
      if (result && typeof result.catch === "function") {
        result.catch(function() {});
      }
    },
    exitFullScreen: function() {
      var el = this.$refs.dialog;
      if (!el || this.currentFullScreenElement() !== el) return;
      var exit =
        document.exitFullscreen ||
        document.webkitExitFullscreen ||
        document.mozCancelFullScreen ||
        document.msExitFullscreen;
      if (!exit) return;
      var result = exit.call(document);
      if (result && typeof result.catch === "function") {
        result.catch(function() {});
      }
    },
    onFullScreenChange: function() {
      var el = this.$refs.dialog;
      this.isFullScreen = !!(el && this.currentFullScreenElement() === el);
      var self = this;
      this.$nextTick(function() {
        if (!self.isFullScreen && self.visible) self.layout();
        self.resizePlayer();
      });
    },
    close: function() {
      this.exitFullScreen();
      this.stopPlayer();
      this.$emit("close");
    }
  }
};
</script>

<style lang="less" scoped>
.video-monitor-dialog {
  position: fixed;
  z-index: 6000;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  overflow: hidden;
  border: 1px solid rgba(73, 234, 252, 0.85);
  border-radius: 6px;
  background: rgba(6, 18, 32, 0.94);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
  pointer-events: auto;
}
.video-monitor-header {
  flex: 0 0 36px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 36px;
  padding: 0 8px 0 14px;
  background: rgba(8, 28, 46, 0.98);
  color: #fff;
}
.video-monitor-title {
  font-size: 14px;
  line-height: 36px;
  letter-spacing: 1px;
}
.video-monitor-dialog:fullscreen,
.video-monitor-dialog:-webkit-full-screen,
.video-monitor-dialog.is-fullscreen {
  left: 0 !important;
  top: 0 !important;
  width: 100% !important;
  height: 100% !important;
  border-radius: 0;
}
.video-monitor-actions {
  display: flex;
  align-items: center;
  gap: 2px;
}
.video-monitor-action {
  width: 28px;
  height: 28px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 4px;
  background: transparent;
  color: #fff;
  cursor: pointer;
}
.video-monitor-action:hover {
  background: rgba(255, 255, 255, 0.16);
}
.video-monitor-action svg {
  width: 14px;
  height: 14px;
  display: block;
}
.video-monitor-body {
  position: relative;
  flex: 1;
  min-height: 0;
  background: #000;
}
.video-monitor-player {
  width: 100%;
  height: 100%;
}
.video-monitor-error {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  color: #fff;
  text-align: center;
  font-size: 14px;
}
</style>

<template>
  <div>
    <div class="cud-nav-right">
      <el-popover placement="bottom" width="200" trigger="hover">
        <div style="margin-left: 20px; font-weight: 700">
          {{ $t('lang.role_current_user') }}
        </div>
        <ul v-if="role && role.length > 0">
          <li v-for="(item, index) in role" :key="index">{{ item }}</li>
        </ul>
        <div v-else style="margin-left: 20px; #a6a6a6">
          {{ $t('lang.role_no_result') }}
        </div>
        <div style="text-align: center;" v-if="showProBtn">
          <el-button type="text" size="small" @click="proBtnClick('/permission')">
            {{ $t('dataAuth.permission') }}
          </el-button>
        </div>
        <el-button slot="reference" type="text" class="nav-right-button">
          <i class="el-icon-user"></i>
          {{ userName }}
        </el-button>
      </el-popover>

      <el-button type="text" @click="userCenter" class="nav-right-button nav-icon-rotate">
        <i class="el-icon-setting"></i>
      </el-button>
    </div>
    <el-drawer
      title=""
      :withHeader="false"
      :visible.sync="showUserCenter"
      append-to-body
      size="320px"
      direction="rtl"
      destroy-on-close
      :close-on-press-escape="false"
      :wrapperClosable="true"
      ref="userCenterDrawer"
    >
      <div
        class="cud-user-center"
        :style="
          'background-image: url(' +
          require('@/assets/img/userCenter/user-center.png') +
          ')'
        "
      >
        <div class="user-center-logout">
          <el-button
            type="text"
            class="user-center-rotate"
            @click="triggerUser"
            v-if="showTriggerUser"
          >
            <i class="el-icon-refresh"></i> {{ $t("lang.change_text") }}
          </el-button>
          <el-button type="text" class="user-center-rotate" @click="logout">
            <i class="el-icon-circle-close-outline"></i> {{ $t("lang.logout") }}
          </el-button>
        </div>
        <div class="user-center-info">
          <el-button class="user-center-icon" type="primary">{{
            shortName
          }}</el-button>
          <div>
            <span class="user-center-name">{{ userName }}</span>
            <span class="user-center-dept">{{ userDept }}</span>
          </div>
          <div class="user-center-base-info" v-if="showProBtn">
            <el-button type="text" size="small" @click="proBtnClick('/userinfo')">
              <i class="el-icon-document"></i> {{ $t('dataAuth.base_info') }}
            </el-button>
            <el-button type="text" size="small" @click="proBtnClick('/password')">
              <i class="el-icon-edit-outline"></i> {{ $t('dataAuth.change_pw') }}
            </el-button>
          </div>
        </div>
        <div class="user-center-card">
          <div class="user-center-card-title">{{ $t('lang.setting_personal') }}</div>
          <div class="user-center-card-desc">
            <el-button
              type="text"
              class="user-center-rotate"
              @click="resetSetting"
            >
              <i class="el-icon-refresh"></i> {{ $t('lang.setting_reset') }}</el-button
            >
          </div>
          <!--主题颜色-->
          <div class="user-center-card-item">
            <p><i class="el-icon-menu"></i> {{ $t('lang.setting_theme') }}</p>
            <!-- <span>{{ themeName }}</span> -->
            <ul class="user-center-item-list">
              <li
                v-for="item in themeList"
                :key="item.value"
                @click="changeTheme(item)"
              >
                <div
                  class="user-center-theme-block1"
                  :class="
                    item.value === settings.themeColor
                      ? 'user-center-theme-check'
                      : ''
                  "
                >
                  <i :style="{ backgroundColor: item.color }"></i>
                </div>
                <span>{{ item.label }}</span>
              </li>
            </ul>
          </div>
          <!--背景设置-->
          <div
            class="user-center-card-item"
            :class="
              settings.themeColor === 'light' || settings.themeColor === 'icp' ? '' : 'user-center-card-disabled'
            "
          >
            <p><i class="el-icon-menu"></i> {{ $t('lang.setting_background') }}</p>
            <ul class="user-center-item-list">
              <li
                v-for="item in bgColorList"
                :key="item.value"
                @click="changeBgColor(item)"
              >
                <div
                  class="user-center-theme-block2"
                  :class="
                    item.value === settings.backgroundSettings.bgColor
                      ? 'user-center-theme-check'
                      : ''
                  "
                >
                  <i :style="{ backgroundColor: item.color }"></i>
                </div>
              </li>
            </ul>
          </div>
          <!--头部设置-->
          <div
            class="user-center-card-item"
            :class="
              settings.themeColor === 'light' ? '' : 'user-center-card-disabled'
            "
          >
            <!-- <div class="user-center-card-title">{{ $t('lang.setting_header') }}</div> -->
            <p><i class="el-icon-menu"></i> {{ $t('lang.setting_header') }}</p>
            <ul class="user-center-item-list">
              <li class="large" @click="changeHeaderStyle('light')">
                <div
                  class="user-center-theme-image"
                  :class="
                    settings.headerSettings === 'light'
                      ? 'user-center-theme-check'
                      : ''
                  "
                >
                  <img
                    :src="require('@/assets/img/userCenter/menu1.png')"
                    alt=""
                    class="user-center-img-rotate"
                  />
                </div>
                <span>{{ $t('lang.setting_light') }}</span>
              </li>
              <li class="large" @click="changeHeaderStyle('dark')">
                <div
                  class="user-center-theme-image"
                  :class="
                    settings.headerSettings === 'dark'
                      ? 'user-center-theme-check'
                      : ''
                  "
                >
                  <img
                    :src="require('@/assets/img/userCenter/menu2.png')"
                    alt=""
                    class="user-center-img-rotate"
                  />
                </div>
                <span>{{ $t('lang.setting_dark') }}</span>
              </li>
              <li class="large" @click="changeHeaderStyle('theme')">
                <div
                  class="user-center-theme-image"
                  :class="
                    settings.headerSettings === 'theme'
                      ? 'user-center-theme-check'
                      : ''
                  "
                >
                  <img
                    :src="require('@/assets/img/userCenter/menu3.png')"
                    alt=""
                    class="user-center-img-rotate"
                  />
                </div>
                <span>{{ $t('lang.setting_blue') }}</span>
              </li>
            </ul>
          </div>
          <!--菜单设置-->
          <div
            class="user-center-card-item"
            :class="
              settings.themeColor === 'light' ? '' : 'user-center-card-disabled'
            "
          >
            <!-- <div class="user-center-card-title">{{ $t('lang.setting_menu') }}</div> -->
            <p><i class="el-icon-menu"></i> {{ $t('lang.setting_menu') }}</p>
            <ul class="user-center-item-list">
              <li class="large" @click="changeMenuStyle('light')">
                <div
                  class="user-center-theme-image"
                  :class="
                    settings.quickMenuSettings === 'light'
                      ? 'user-center-theme-check'
                      : ''
                  "
                >
                  <img
                    :src="require('@/assets/img/userCenter/menu1.png')"
                    alt=""
                  />
                </div>
                <span>{{ $t('lang.setting_light') }}</span>
              </li>
              <li class="large" @click="changeMenuStyle('dark')">
                <div
                  class="user-center-theme-image"
                  :class="
                    settings.quickMenuSettings === 'dark'
                      ? 'user-center-theme-check'
                      : ''
                  "
                >
                  <img
                    :src="require('@/assets/img/userCenter/menu2.png')"
                    alt=""
                  />
                </div>
                <span>{{ $t('lang.setting_dark') }}</span>
              </li>
              <li class="large" @click="changeMenuStyle('theme')">
                <div
                  class="user-center-theme-image"
                  :class="
                    settings.quickMenuSettings === 'theme'
                      ? 'user-center-theme-check'
                      : ''
                  "
                >
                  <img
                    :src="require('@/assets/img/userCenter/menu3.png')"
                    alt=""
                  />
                </div>
                <span>{{ $t('lang.setting_blue') }}</span>
              </li>
            </ul>
          </div>
          <!--界面缩放-->
          <div class="user-center-card-item">
            <p><i class="el-icon-menu"></i> {{ $t('lang.setting_zoom') }}</p>
            <span>
              <el-select
                v-model="settings.interfaceZoom"
                size="small"
                @change="changeZoom"
                :popper-append-to-body="false"
              >
                <el-option label="自适应" :value="0"></el-option>
                <el-option label="75%" :value="75"></el-option>
                <el-option label="100%" :value="100"></el-option>
                <el-option label="125%" :value="125"></el-option>
                <!-- <el-option label="150%" :value="150"></el-option> -->
              </el-select>
            </span>
          </div>
          <!--字体大小-->
          <div class="user-center-card-item">
            <p><i class="el-icon-menu"></i> 字体大小</p>
            <span>
              <el-select
                v-model="settings.fontSize"
                size="small"
                @change="changeFontSize"
                :popper-append-to-body="false"
              >
                <el-option label="小" value="small"></el-option>
                <el-option label="中" value="normal"></el-option>
                <el-option label="大" value="large"></el-option>
              </el-select>
            </span>
          </div>
          <div class="user-center-card-more">
            <el-button type="text" @click="showMoreSetting = !showMoreSetting">
              {{ $t('lang.setting_more') }}
            </el-button>
            <p>{{ $t('lang.setting_more_text')}}</p>
          </div>
        </div>
        <!--设置语言-->
        <div class="user-center-card">
          <div class="user-center-card-title">{{ $t('lang.setting_workbench') }}</div>
          <div class="user-center-card-item">
            <p><i class="el-icon-menu"></i> {{ $t('lang.setting_language') }}</p>
            <span>
              <lang-switch />
            </span>
          </div>
          <!-- <div class="user-center-card-item">
            <p><i class="el-icon-menu"></i> 工作台设置</p>
          </div> -->
        </div>
      </div>
    </el-drawer>
    <el-drawer
      title=""
      :withHeader="false"
      :visible.sync="showMoreSetting"
      append-to-body
      size="320px"
      direction="rtl"
      destroy-on-close
      :close-on-press-escape="false"
      :wrapperClosable="true"
    >
      <div class="cud-user-center user-center-pb">
        <!--页面宽度-->
        <div class="user-center-card" style="margin-top: 0">
          <div class="user-center-card-title">{{ $t('lang.setting_page') }}</div>
          <div class="user-center-card-item">
            <ul class="user-center-item-list">
              <li class="large" @click="changeWidthMode('responsive')">
                <div
                  class="user-center-theme-image"
                  :class="
                    settings.pageWidthMode === 'responsive'
                      ? 'user-center-theme-check'
                      : ''
                  "
                >
                  <img
                    :src="require('@/assets/img/userCenter/width1.png')"
                    alt=""
                  />
                </div>
                <span>{{ $t('lang.setting_responsive') }}</span>
              </li>
              <li class="large" @click="changeWidthMode('fixed')">
                <div
                  class="user-center-theme-image"
                  :class="
                    settings.pageWidthMode === 'fixed'
                      ? 'user-center-theme-check'
                      : ''
                  "
                >
                  <img
                    :src="require('@/assets/img/userCenter/width2.png')"
                    alt=""
                  />
                </div>
                <span>{{ $t('lang.setting_fixed') }}</span>
              </li>
            </ul>
          </div>
        </div>
        <!--表格设置-->
        <div class="user-center-card">
          <div class="user-center-card-title">{{ $t('lang.setting_table') }}</div>
          <div class="user-center-card-item">
            <ul class="user-center-item-list">
              <li class="large" @click="changeTableStyle('compact')">
                <div
                  class="user-center-theme-image"
                  :class="
                    settings.tableSettings.layout === 'compact'
                      ? 'user-center-theme-check'
                      : ''
                  "
                >
                  <img
                    :src="require('@/assets/img/userCenter/table1.png')"
                    alt=""
                  />
                </div>
                <span>{{ $t('lang.setting_compact') }}</span>
              </li>
              <li class="large" @click="changeTableStyle('standard')">
                <div
                  class="user-center-theme-image"
                  :class="
                    settings.tableSettings.layout === 'standard'
                      ? 'user-center-theme-check'
                      : ''
                  "
                >
                  <img
                    :src="require('@/assets/img/userCenter/table2.png')"
                    alt=""
                  />
                </div>
                <span>{{ $t('lang.setting_standard') }}</span>
              </li>
              <li class="large" @click="changeTableStyle('loose')">
                <div
                  class="user-center-theme-image"
                  :class="
                    settings.tableSettings.layout === 'loose'
                      ? 'user-center-theme-check'
                      : ''
                  "
                >
                  <img
                    :src="require('@/assets/img/userCenter/table3.png')"
                    alt=""
                  />
                </div>
                <span>{{ $t('lang.setting_loose') }}</span>
              </li>
            </ul>
          </div>
          <div class="user-center-card-item">
            <p>{{ $t('lang.setting_stripe') }}</p>
            <span>
              <el-switch class="user-center-card-switch"
                v-model="settings.tableSettings.zebraStriping"
                @change="changeTableStrip"
              ></el-switch>
            </span>
          </div>
          <div class="user-center-card-item">
            <p>{{ $t('lang.setting_border') }}</p>
            <span>
              <el-switch class="user-center-card-switch"
                v-model="settings.tableSettings.verticalBorders"
                @change="changeTableBorder"
              ></el-switch>
            </span>
          </div>
          <!-- <div class="user-center-card-item">
            <p>{{ $t('lang.setting_button') }}</p>
            <span>
              <el-radio
                class="user-center-card-radio"
                v-model="settings.tableSettings.actionButtonDisplay"
                label="onHover"
              >
                {{ $t('lang.button_hover') }}
              </el-radio>
              <el-radio
                class="user-center-card-radio"
                v-model="settings.tableSettings.actionButtonDisplay"
                label="fixed"
              >
                {{ $t('lang.button_fixed') }}
              </el-radio>
            </span>
          </div> -->
        </div>
        <!--卡片设置-->
        <div class="user-center-card">
          <div class="user-center-card-title">{{ $t('lang.setting_card') }}</div>
          <div class="user-center-card-item">
            <p>{{ $t('lang.setting_spacing') }}</p>
            <div class="user-center-card-slider" :style="zoomStyle">
              <el-slider
                v-model="settings.cardSettings.spacing"
                :min="4"
                :max="24"
                :step="4"
                :format-tooltip="formatTooltip"
                :marks="spacingMarks"
                show-stops
                :show-tooltip="false"
                @change="changeCardSpace"
              >
              </el-slider>
            </div>
          </div>
          <div class="user-center-card-item">
            <p>{{ $t('lang.setting_radius') }}</p>
            <div class="user-center-card-slider" :style="zoomStyle">
              <el-slider
                v-model="settings.cardSettings.cornerRadius"
                :min="0"
                :max="20"
                :step="4"
                :format-tooltip="formatTooltip"
                :marks="radiusMarks"
                show-stops
                :show-tooltip="false"
                @change="changeCardRadius"
              >
              </el-slider>
            </div>
          </div>
        </div>
        <!--表单按钮设置-->
        <div class="user-center-card">
          <div class="user-center-card-title">{{ $t('lang.setting_form') }}</div>
          <div class="user-center-card-item">
            <p>{{ $t('lang.setting_height') }}</p>
            <div class="user-center-card-slider" :style="zoomStyle">
              <el-slider
                v-model="settings.buttonFormSettings.height"
                @change="changeButtonHeight"
                :min="24"
                :max="44"
                :step="4"
                :format-tooltip="formatTooltip"
                :marks="heightMarks"
                show-stops
                :show-tooltip="false"
              >
              </el-slider>
            </div>
          </div>
          <div class="user-center-card-item">
            <p>{{ $t('lang.setting_radius') }}</p>
            <div
              class="user-center-card-slider"
              style="--border-radius: 22px"
              :style="zoomStyle"
            >
              <el-slider
                v-model="settings.buttonFormSettings.borderRadius"
                @change="changeButtonRadius"
                :min="0"
                :max="20"
                :step="4"
                :format-tooltip="formatTooltip"
                :marks="radiusMarks"
                show-stops
                :show-tooltip="false"
              >
              </el-slider>
            </div>
          </div>
        </div>
        <div class="user-center-btn">
          <el-button type="default" size="small" @click="backSetting">{{ $t('cm.return') }}</el-button>
          <!-- <el-button size="small" @click="cancelSetting">{{ $t('lang.button_cancel') }}</el-button>
          <el-button size="small" @click="resetSetting">{{ $t('lang.button_reset') }}</el-button>
          <el-button size="small" type="primary" @click="saveSetting(true)">{{ $t('lang.button_apply') }}</el-button> -->
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script>
import Vue from 'vue';
import LangSwitch from "../i18n/lang_switch";
import osUtil from "@/utils/osUtil";
import { throttle } from "@/utils/funcUtil";
import { getUserTheme, setUserTheme } from "@/api/api.js";

export default {
  props: {
    userName: String,
    userDept: String,
    role: Array,
  },
  components: {
    LangSwitch,
  },
  data() {
    return {
      borderRadius: "{'--borderRadius':'22px'}",
      //名字
      shortName: "",
      //显示切换用户
      showTriggerUser: false,
      //显示个人中心
      showUserCenter: false,
      //默认设置
      defaultSettings: {
        //主题
        themeColor: "light",
        backgroundSettings: {
          type: "color",
          bgColor: "color-3",
          imageBlurLevel: 5,
          imageMaskShape: "#ecf0f9",
          imageMaskShapeLevel: 5,
          imageUrl: null,
        },
        //界面缩放
        interfaceZoom: document.body.clientWidth <= 1280 ? 0 : 100,
        //字体大小
        fontSize: 'normal',
        //页面宽度
        pageWidthMode: "responsive", //responsive(自适应) fixed(固定宽度)
        //头部设置
        headerSettings: "theme", //light(默认浅), dark(默认深), theme(跟随主色)
        //快捷菜单设置
        quickMenuSettings: "light", //light(默认浅), dark(默认深), theme(跟随主色)
        //卡片设置
        cardSettings: {
          spacing: 12, //卡片间距 (px)
          cornerRadius: 4, //卡片圆角(px)
        },
        //表格设置
        tableSettings: {
          layout: "standard", //表格布局: compact(紧凑), standard(标准), loose(宽松)
          zebraStriping: true, //斑马线
          verticalBorders: true, //纵向分割线
          actionButtonDisplay: "fixed", //fixed(固定常驻), onHover(悬停展开)
        },
        //按钮表单设置
        buttonFormSettings: {
          height: 32, //按钮高度(px)
          borderRadius: 4, //按钮圆角(px)
        },
      },
      //个人中心设置
      settings: {
        backgroundSettings: {},
        cardSettings: {},
        tableSettings: {},
        buttonFormSettings: {},
      },
      //主题名称
      themeName: this.$t('lang.setting_light'),
      //主题列表
      themeList: [
        { label: this.$t('lang.setting_light'), value: "light", color: "#ecf0f9" },
        { label: this.$t('lang.setting_dark'), value: "dark", color: "#555555" },
        { label: this.$t('lang.setting_icp'), value: "icp", color: "#112857" },
      ],
      bgColorList: [
        { value: "color-1", color: "#F2F7FB" },
        { value: "color-2", color: "#F0F0F6" },
        { value: "color-3", color: "#E5EDFF" },
        { value: "color-4", color: "#FFF2FA" },
        { value: "color-5", color: "#EFFFFA" },
        { value: "color-6", color: "#FFFFFF" },
      ],
      //卡片间距
      spacingMarks: {
        4: "4px",
        8: "8px",
        12: "12px",
        16: "16px",
        20: "20px",
        24: "24px",
      },
      //卡片/按钮圆角
      radiusMarks: {
        0: "0px",
        4: "4px",
        8: "8px",
        12: "12px",
        16: "16px",
        20: "20px",
      },
      //按钮圆角
      heightMarks: {
        24: "24px",
        28: "28px",
        32: "32px",
        36: "36px",
        40: "40px",
        44: "44px",
      },
      //更多设置
      showMoreSetting: false,
      //是否显示授权系统按钮
      showProBtn: false,
      //解决zoom缩放后拖拽失效问题
      zoomStyle: {
        zoom: '100%'
      }
    };
  },
  mounted() {
    //能否切换用户
    if (
      process.env.NODE_ENV === "development" ||
      process.env.NODE_ENV === "test"
    ) {
      this.showTriggerUser = true;
    }
    if (
      process.env.AUTH_TYPE !== "AEP"
    ) {
      this.showProBtn = true;
    }
    //加载个人中心配置
    this.getSetting();
    //名字缩写
    this.getShortName();
    this.$nextTick(() => {
      //预加载drawer语言组件（解决刷新不自动切换语言问题）
      this.$refs.userCenterDrawer.rendered = true;
    });
    //解决zoom缩放后拖拽失效问题
    this.zoomFunc = throttle(this.resetZoom, 500);
    window.addEventListener("resize", this.zoomFunc);
    this.resetZoom();
  },
  watch: {
    userName: {
      handler(val) {
        this.getShortName();
      },
    },
    // settings: {
    //   handler(val, old) {
    //     this.saveSetting(val);
    //   },
    //   deep: true,
    // },
  },
  methods: {
    //解决zoom缩放后拖拽失效问题
    resetZoom() {
      this.zoomStyle = {
        zoom: 100 / this.settings.interfaceZoom * 100 + '%',
        // transform: 'scale(' + this.settings.interfaceZoom / 100 + ')',
        // transformOrigin: 'left top',
        // width: this.$el.getBoundingClientRect().width + 'px'
      }
    },
    //名字缩写
    getShortName() {
      if (this.userName) {
        let indexof = this.userName.indexOf("]");
        let shortName =
          indexof > -1 ? this.userName.substring(indexof + 1) : this.userName;
        shortName = shortName.length > 2 ? shortName.substring(1) : shortName;
        this.shortName = shortName;
      }
    },
    //切换用户
    triggerUser: function () {
      this.$emit("triggerUser");
    },
    //退出登录
    logout() {
      this.$emit("logout");
    },
    //切换语言
    changeLanguage() {
      this.$emit("changeLanguage");
    },
    //显示个人中心
    userCenter() {
      this.showUserCenter = true;
    },
    //加载个人中心配置
    async getSetting() {
      let userSetting = sessionStorage.getItem("userSetting");
      if (userSetting) {
        // console.log('userSetting', userSetting);
        this.settings = JSON.parse(userSetting);
        //应用个性化配置
        this.applySetting();
        return;
      }
      //读取配置
      await getUserTheme()
        .then((res) => {
          if (res.code === "0") {
            userSetting = res.data;
            //只有拿到配置才缓存起来
            sessionStorage.setItem("userSetting", JSON.stringify(userSetting));
          } else {
            userSetting = JSON.parse(JSON.stringify(this.defaultSettings));
          }
        })
        .catch((err) => {
          userSetting = JSON.parse(JSON.stringify(this.defaultSettings));
        });
      this.settings = userSetting;
      //应用个性化配置
      this.applySetting();
    },
    //切换主题
    changeTheme(item) {
      this.settings.themeColor = item.value;
      this.themeName = item.label;
      //默认浅 默认深
      if (item.value === "dark") {
        //默认深取消背景
        this.settings.backgroundSettings.bgColor = '';
        this.settings.headerSettings = item.value;
      } else if (item.value === "icp") {
        this.settings.backgroundSettings.bgColor = 'color-3';
      } else {
        this.settings.backgroundSettings.bgColor = 'color-1';
        this.settings.headerSettings = 'theme';
      }
      this.settings.quickMenuSettings = item.value;
      this.applySetting();
      // this.saveSetting();
    },
    //切换背景颜色
    changeBgColor(item) {
      this.settings.backgroundSettings.bgColor = item.value;
      this.applySetting();
      // this.saveSetting();
    },
    //界面缩放
    changeZoom(value) {
      //解决zoom缩放后拖拽失效问题
      this.resetZoom();
      this.applySetting();
      // this.saveSetting();
    },
    //字体大小
    changeFontSize(value) {
      this.applySetting();
      // this.saveSetting();
    },
    //页面宽度
    changeWidthMode(value) {
      this.settings.pageWidthMode = value;
      this.applySetting();
    },
    //头部设置
    changeHeaderStyle(value) {
      this.settings.headerSettings = value;
      this.applySetting();
    },
    //菜单设置
    changeMenuStyle(value) {
      this.settings.quickMenuSettings = value;
      this.applySetting();
    },
    //卡片间距
    changeCardSpace(value) {
      this.applySetting();
    },
    //卡片圆角
    changeCardRadius(value) {
      this.applySetting();
    },
    //表格设置
    changeTableStyle(value) {
      this.settings.tableSettings.layout = value;
      this.applySetting();
    },
    //表格斑马线
    changeTableStrip(value) {
      this.settings.tableSettings.zebraStriping = value;
      this.applySetting();
    },
    //表格分割线
    changeTableBorder(value) {
      this.settings.tableSettings.verticalBorders = value;
      this.applySetting();
    },
    //按钮高度
    changeButtonHeight(value) {
      this.settings.buttonFormSettings.height = value;
      this.applySetting();
    },
    //按钮圆角
    changeButtonRadius(value) {
      this.settings.buttonFormSettings.borderRadius = value;
      this.applySetting();
    },
    //格式化slider文字
    formatTooltip(value) {
      return value + "px";
    },
    //应用个人设置
    applySetting() {
      let className = "";
      // 主题
      className += "cud-" + this.settings.themeColor;
      if (this.settings.themeColor !== 'dark') {
        // 背景色
        className += " bg-" + this.settings.backgroundSettings.bgColor;
      }
      //字体大小
      className += " font-size-" + this.settings.fontSize;
      //页面宽度
      className += " page-" + this.settings.pageWidthMode;
      //头部设置
      className += " header-" + this.settings.headerSettings;
      //菜单设置
      className += " menu-" + this.settings.quickMenuSettings;
      //卡片间距
      className += " card-spacing-" + this.settings.cardSettings.spacing;
      // 卡片圆角
      let cardRadius = this.settings.cardSettings.cornerRadius
      className += ` cud-card-radius${cardRadius}`;
      // 按钮高度
      let borderHeight = this.settings.buttonFormSettings.height;
      className += ` cud-btn-height${borderHeight}`;
      //按钮圆角
      let borderRadius = this.settings.buttonFormSettings.borderRadius;
      className += ` cud-btn-radius${borderRadius}`;
      // 表格样式
      if (this.settings.tableSettings.zebraStriping) {
        className += " cud-table-striped";
      }
      if (this.settings.tableSettings.verticalBorders) {
        className += " cud-table-border";
      }
      if (this.settings.tableSettings.layout === "compact") {
        className += " cud-table-height32";
      } else if (this.settings.tableSettings.layout === "standard") {
        className += " cud-table-height42";
      } else if (this.settings.tableSettings.layout === "loose") {
        className += " cud-table-height52";
      }
      let body = document.getElementById("body");
      body.className = className;
      // 缩放
      let zoom = this.settings.interfaceZoom;
      if (zoom == 0) {
        this.autoResetZoom();
        // throttleFunc记录当前的节流方法，用于在页面销毁时释放
        this.throttleFunc = throttle(this.autoResetZoom, 500);
        window.addEventListener("resize", this.throttleFunc);
      } else {
        this.$root.zoom = zoom;
        body.style.zoom = zoom + "%";
      }
      // 触发resize事件调整
      window.dispatchEvent(new Event('resize'));
      // IE zoom hack
      if (osUtil.getBrowserInfo().browser.indexOf("IE") === 0) {
        body.style.width = (1 + (100 - zoom) / zoom) * 100 + "%";
        body.style.height = (1 + (100 - zoom) / zoom) * 100 + "%";
        document.documentElement.style.overflow = "hidden";
      }
      //保存设置
      this.saveSetting();
    },
    //自适应宽度
    autoResetZoom() {
      if (this.settings.interfaceZoom !== 0) return;
      //页面宽度以1440像素为准，小于该值放大页面，超过则缩小
      let width = document.documentElement.clientWidth || document.body.clientWidth;
      let zoom = 100 + (width - 1440) / width * 100;
      let ele = document.getElementById("body");
      this.$root.zoom = zoom;
      ele.style.zoom = zoom + "%";

      // 1. 获取 zoom 值并更新 CSS 变量
      const root = document.documentElement;
      const zoomRate = parseFloat(window.getComputedStyle(document.body).zoom || 1);
      root.style.setProperty('--zoom-value', zoomRate);
    },
    //保存个人配置
    saveSetting(reload) {
      let settings = this.settings;
      //关闭弹窗
      // this.showMoreSetting = false;
      //数据没有变动不需要保存
      if (JSON.stringify(settings) == sessionStorage.getItem("userSetting")) {
        return;
      }
      //保存缓存
      sessionStorage.setItem("userSetting", JSON.stringify(settings));
      //保存配置
      setUserTheme(settings)
        .then((res) => {
          // this.$message({ type: 'success', message: '保存配置成功！' });
        })
        .catch((err) => {
          console.error(err);
        });
      //刷新页面
      // if (reload) {
      //   this.$confirm("某些功能需要刷新页面，是否立即刷新？", "提示", {
      //     confirmButtonText: "确定",
      //     cancelButtonText: "取消",
      //     type: "warning",
      //   })
      //   .then(() => {
      //     window.location.reload();
      //   })
      //   .catch(() => {
      //     //
      //   });
      // }
    },
    //恢复默认配置
    resetSetting() {
      this.$confirm("是否要恢复默认配置?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.settings = JSON.parse(JSON.stringify(this.defaultSettings));
          this.applySetting();
          // this.saveSetting();
        })
        .catch(() => {
          //
        });
    },
    //取消设置
    cancelSetting() {
      let settings = sessionStorage.getItem("userSetting");
      if (settings) {
        //如果有缓存，恢复成缓存的配置
        this.settings = JSON.parse(settings);
      } else {
        //没有就恢复默认配置
        this.settings = JSON.parse(JSON.stringify(this.defaultSettings));
      }
      this.applySetting();
      //关闭弹窗
      this.showMoreSetting = false;
    },
    // 返回
    backSetting() {
      this.showMoreSetting = false;
    },
    //按钮点击
    proBtnClick(url) {
      this.showUserCenter = false;
      this.$router.push(url);
    },
  },
  beforeDestroy() {
    // throttleFunc记录当前的节流方法，用于在页面销毁时释放
    window.removeEventListener("resize", this.throttleFunc);
  }
};
</script>

<style lang="less" scoped>
/deep/.cud-nav-right {
  text-align: right;

  .cud-nav-search {
    margin-right: 10px;
    width: 200px;

    .el-input__inner {
      height: 28px;
    }
  }
  .el-button--text {
    color: #FFF;
  }
  .el-button--text:hover {
    text-decoration: none;
  }
  .nav-right-button {
    margin: 0 3px;
    padding: 5px 7px;
    font-size: 15px;
    background-color: rgba(255, 255, 255, 0.2);
  }
  .nav-icon-rotate i:hover {
    transform: rotate(90deg);
    transition: all .3s;
  }
}
/deep/ .cud-user-center {
  width: 320px;
  height: 100%;
  overflow: auto;
  padding: 10px;
  background-color: #f6f6f6;
  background-repeat: no-repeat;
  background-size: 400px 240px;
  animation: user-center-float 10s infinite;

  .user-center-bg {
    position: absolute;
    z-index: 0;
    width: 400px;
  }
  .user-center-logout {
    position: relative;
    z-index: 1;
    padding-right: 10px;
    margin-top: -10px;
    text-align: right;
  }
  .user-center-rotate:hover {
    i {
      transform: rotate(180deg);
      transition: all 0.5s;
    }
  }
  .user-center-info {
    height: 90px;
    position: relative;
    margin-top: 10px;

    .user-center-icon {
      position: absolute;
      top: 0px;
      left: 15px;
      width: 50px;
      height: 50px;
      padding: 0;
      border-radius: 50%;
      border: none;
      background-color: #0775DB !important;
      color: #FFF !important;
    }
    .user-center-name {
      position: absolute;
      top: 5px;
      left: 80px;
      font-size: 14px;
      font-weight: bold;
    }
    .user-center-dept {
      position: absolute;
      top: 28px;
      left: 80px;
      font-size: 13px;
    }
    .user-center-base-info {
      position: absolute;
      top: 65px;
      left: 80px;
      .el-button {
        height: 25px;
        line-height: 5px;
      }
    }
  }
  .user-center-card {
    position: relative;
    padding: 10px;
    margin-top: 10px;
    background-color: #fff;
    border-radius: 5px;

    .user-center-card-title {
      padding: 5px 4px;
      font-size: 14px;
      font-weight: bold;
    }
    .user-center-card-desc {
      position: absolute;
      top: 0px;
      right: 10px;
    }
    .user-center-card-item {
      padding: 10px 5px;
      position: relative;

      > p {
        padding: 0;
        margin: 0;
        color: #333;
        font-size: 13px;
      }
      > span {
        position: absolute;
        top: 10px;
        right: 0;
        color: #333;
        font-size: 13px;
      }
    }
    .user-center-item-list {
      list-style: none;
      padding: 0;
      margin: 0;
      padding-top: 5px;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;

      li {
        min-width: 40px;
        max-width: 60px;
        padding: 2px 2px;
        font-size: 13px;
        text-align: center;
        line-height: 28px;
      }
      li.large {
        width: 55px;
        padding: 2px 23px;
      }
      li.large:first-child {
        padding-left: 2px;
      }
      li.large:last-child {
        padding-right: 3px;
      }
      .user-center-theme-block1 {
        width: 32px;
        height: 32px;
        margin: 0 auto;
        border: 1px solid rgba(0, 0, 0, 0);
        border-radius: 6px;
        cursor: pointer;

        i {
          display: block;
          width: 28px;
          height: 28px;
          margin: 2px;
          border-radius: 5px;
        }
      }
      .user-center-theme-block2 {
        width: 32px;
        height: 32px;
        margin: 0 auto;
        border: 1px solid rgba(0, 0, 0, 0);
        border-radius: 6px;
        cursor: pointer;

        i {
          display: block;
          width: 26px;
          height: 26px;
          margin: 2px;
          border: 1px solid #ddd;
          border-radius: 5px;
        }
      }
      .user-center-theme-image {
        width: 48px;
        height: 48px;
        margin: 0 auto;
        border: 1px solid rgba(0, 0, 0, 0);
        border-radius: 8px;
        cursor: pointer;

        img {
          display: block;
          width: 44px;
          height: 44px;
          margin: 2px;
          border-radius: 5px;
        }
        .user-center-img-rotate {
          transform: rotate(90deg);
        }
      }
      .user-center-theme-block1:hover,
      .user-center-theme-block2:hover,
      .user-center-theme-image:hover{
        box-shadow: 0px 0px 5px #CCC;
      }
      .user-center-theme-check {
        position: relative;
        border: 1px solid #f33;
        border-radius: 6px;
        overflow: hidden;
        transition: all 0.5s;

        &::before {
          content: "";
          width: 30px;
          height: 12px;
          background-color: #f33;
          position: absolute;
          z-index: 2;
          top: 0;
          right: 0;
          margin-top: -2px;
          margin-right: -10px;
          transform: rotate(45deg);
        }
        &::after {
          content: "√";
          font-family: Cochin, Georgia;
          color: #fff;
          font-size: 10px;
          line-height: 10px;
          position: absolute;
          z-index: 2;
          top: 0;
          right: 0;
          margin-top: 1px;
          margin-right: 0px;
        }
      }
    }
    .user-center-card-more {
      margin-top: 5px;
      height: 45px;
      color: #666;
      text-align: center;
      border-top: 1px solid #eee;
    }
    .user-center-card-more p {
      color: #aaa;
      font-size: 12px;
      padding: 0px;
      margin: 0px;
      margin-top: -12px;
      line-height: 20px;
    }
    /* 滑块 */
    .user-center-card-slider {
      margin-left: 10px;
      margin-right: 10px;

      .el-slider__runway {
        background-color: #e4e7ed !important;
      }
      .el-slider__bar {
        background-color: #409eff !important
      }
      .el-slider__stop {
        margin-top: -2px;
        border: 2px solid #ddd;
      }
      .el-slider__marks-stop {
        border: 2px solid #409eff;
      }
      .el-slider__button {
        width: 12px;
        height: 12px;
        border: 2px solid #409eff !important;
      }
      .el-slider__marks {
        position: relative;
        padding-top: 15px;

        .el-slider__marks-text {
          position: absolute;
          width: 20px;
          margin-left: -10px;
          font-size: 12px;
          color: #666;
        }
      }
    }
    /* 输入框 */
    .el-input--suffix .el-input__inner {
      max-width: 100px;
      height: 25px;
      color: #333 !important;
      font-size: 13px !important;
      border: 1px solid #DDD !important;
    }
    /* 下拉 */
    .el-select .el-input .el-select__caret {
      margin-top: 5px;
    }
    .el-select-dropdown {
      background-color: #FFF !important;
      border: none !important;
    }
    .el-select-dropdown .el-select-dropdown__item {
      background-color: #FFF !important;
    }
    .el-select-dropdown .el-select-dropdown__item.hover,
    .el-select-dropdown .el-select-dropdown__item.selected {
      color: #333 !important;
      background-color: #f5f7fa !important;
    }
    .el-select-dropdown .popper__arrow {
      background-color: transparent !important;
      border-bottom-color: #FFF !important;
    }
    .el-select-dropdown .popper__arrow::after {
      border-bottom-color: #FFF !important;
    }
    /* 单选 */
    .user-center-card-radio {
      .el-radio__label {
        padding: 0 2px;
        font-size: 12px;
      }
      .el-radio__inner {
        border: 1px solid #dcdfe6 !important;
      }
      .el-radio__input.is-checked .el-radio__inner {
        background-color: #409eff !important;
        border-color: #409eff !important;
      }
      .el-radio__input.is-checked+.el-radio__label {
        color: #409eff !important;
      }
    }
    /* 开关 */
    .user-center-card-switch .el-switch__core {
      border-color: #dcdfe6 !important;
      background-color: #dcdfe6 !important;
    }
    .user-center-card-switch.is-checked .el-switch__core {
      border-color: #409eff !important;
      background-color: #409eff !important;
    }
  }
  /* 文字按钮 */
  .el-button--text {
    color: #333 !important;
  }
  .el-button--text span, .el-button--default span, .el-button--primary span {
    font-size: 14px !important;
  }
  .user-center-card-disabled {
    &::after {
      content: "";
      display: flex;
      position: absolute;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: #fff;
      opacity: 0.7;
    }
    .user-center-theme-check {
      border: none !important;
      &::before {
        display: none;
      }
      &::after {
        display: none;
      }
    }
  }
}
/* 工具条 */
.user-center-pb {
  padding-bottom: 60px;
  // padding-right: 3px;
}
.user-center-btn {
  position: fixed;
  z-index: 2000;
  bottom: 0;
  width: 320px;
  height: 50px;
  background-color: #FFF;
  margin-left: -10px;
  display: inline-block;
  text-align: center;
  border-top: 1px solid #EEE;
}
.user-center-btn button {
  height: 30px;
  padding: 6px 10px;
  margin: 10px 5px;
  font-size: 13px !important;
  border-radius: 3px;
}
.user-center-btn button:hover {
  // animation: user-center-scale .2s;
}
.user-center-btn .el-button--default {
  background-color: transparent !important;
  border-color: #0775DB !important;
  color: #0775DB !important;
}
.user-center-btn .el-button--primary {
  background-color: #0775DB !important;
}
.user-center-btn .el-button--primary:hover,
.user-center-btn .el-button--default:hover {
  color: #fff !important;
  background: #0775DB !important;
}
@keyframes user-center-float {
  0% {
    background-position: 0px 0px;
  }
  30% {
    background-position: -20px -10px;
  }
  80% {
    background-position: 10px 0px;
  }
}
@keyframes user-center-scale {
  50% {
    transform: scale(1.1, 1.1);
  }
  100% {
    transform: scale(1, 1);
  }
}
</style>

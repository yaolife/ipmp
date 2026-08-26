<template>
  <div>
    <el-form
      class="cud-entity-form-wrap"
      size="small"
      label-suffix="："
      label-width="170px"
      :rules="procApproveRules"
      ref="procApprove"
    >
      <el-row>
        <!--当前处理环节-->
        <el-col :span="12" class="cud__mtb-10">
          <el-form-item :label="$t('pw.now_deal_actor')">
            {{ flow_access.act_name }}
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <!--处理结论-->
        <el-col :span="12" class="cud__mtb-10" v-if="!isStartAct">
          <el-form-item :label="$t('pw.deal_result')" prop="dealResult">
            <!-- <span style="color:red">*</span>  -->
            <el-radio
              @change="triggerAgree()"
              v-model="flow_access.deal_answer"
              label="1"
              >{{ $t("pw.aggre") }}</el-radio
            >
            <el-radio
              @change="triggerBack()"
              v-if="procObj.showBack"
              v-model="flow_access.deal_answer"
              label="2"
              >{{ $t("pw.reback") }}</el-radio
            >
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <!--下一步处理环节-->
        <el-col :span="12" class="cud__mtb-10">
          <el-form-item :label="$t('pw.next_b_actor')" prop="nextBActor">
            <!-- <span style="color:red">*</span> -->
            <el-select
              v-model="flow_access.next_deal_act"
              @change="changeAct"
              size="small"
            >
              <el-option
                v-for="i in options"
                :label="i.actName"
                :key="i.actMetadata"
                :value="i.actMetadata"
              >
              </el-option>
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <!--下一步处理人-->
        <el-col :span="12" class="cud__mtb-10">
          <el-form-item :label="$t('pw.next_deal_man')" prop="nextDealMan">
            <!-- <span style="color:red">*</span>  -->
            <PersonSelect
              v-if="!procObj.isEnd && flow_access.deal_answer == 1 && showResel"
              size="small"
              key="1"
              id="appMan"
              :value="dealer"
              :selectedValue="dealerId"
              v-bind:multiple="true"
            ></PersonSelect>
            <div
              v-else-if="
                !procObj.isEnd && flow_access.deal_answer == 1 && !showResel
              "
            >
              <el-checkbox-group v-model="flow_access.next_deal_name">
                <el-checkbox v-for="i in dealmans" :label="i" :key="i">{{
                  i
                }}</el-checkbox>
              </el-checkbox-group>
            </div>
            <div v-else-if="flow_access.deal_answer == 1 && procObj.isEnd">
              流程结束
            </div>
            <div v-else>{{ procObj.showBackMan }}</div>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <!--抄送-->
        <el-col :span="12" class="cud__mtb-10">
          <el-form-item :label="$t('pw.write_send')">
            <PersonSelect
              size="small"
              key="2"
              id="sendToMan"
              v-bind:multiple="true"
            ></PersonSelect>
          </el-form-item>
        </el-col>
      </el-row>
      <el-row>
        <!--处理结论-->
        <el-col :span="12" class="cud__mtb-10">
          <el-form-item :label="$t('pw.approve_suggest')">
            <el-input
              type="textarea"
              v-model="flow_access.deal_suggest"
            ></el-input>
            <div class="cud__mtb-10">
              <el-tag
                class="cud__tag"
                type="info"
                @click="selectText($event)"
                effect="dark"
                >同意!</el-tag
              >
              <el-tag
                class="cud__tag"
                type="info"
                @click="selectText($event)"
                effect="dark"
                >同意，请快速处理，谢谢!</el-tag
              >
              <el-tag
                class="cud__tag"
                type="info"
                @click="selectText($event)"
                effect="dark"
                >退回!</el-tag
              >
              <el-tag
                class="cud__tag"
                type="info"
                @click="selectText($event)"
                effect="dark"
                >不同意，请确认材料无误后再申请！</el-tag
              >
            </div>
          </el-form-item>
        </el-col>
      </el-row>
    </el-form>
  </div>
</template>

<script>
import PersonSelect from "@/components/asc/PersonSelect";
import { mixinsComp } from "@/mixins/index";

export default {
  mixins: [mixinsComp],
  //参数说明  procObj 下一环节处理人以及处理环节  flow_access 流程基本信息  isStartAct 是否开始节点
  props: {
    procObj: { type: Object, default: null },
    flow_access: { type: Object, default: null },
    isStartAct: { type: Boolean, default: false },
    isDraft: { type: Boolean, default: false }
  },
  components: {
    PersonSelect
  },
  data() {
    return {
      mixinsCmptCode: "procapprove",
      mixinsCmptName: "流程审批",
      //下一环节处理  这个应该从服务端获取
      options:
        this.procObj.determinate == 2
          ? this.procObj.actOptions
          : this.procObj.nextActOptions,
      //下一处理人  这个应该根据流程从服务端获取
      dealmans: [],
      dealerId: "",
      dealer: "",
      showResel: false
    };
  },
  methods: {
    selectText: function(e) {
      let text = e.currentTarget.innerHTML;
      this.flow_access.deal_suggest = text;
    },
    changeAct: function(val) {
      // 判断是否退回节点 找到option所在的位置
      let index = 0;
      if (!this.procObj.showBack) {
        //非退回节点
        this.procObj.nextActOptions.some(o => {
          if (o.actMetadata != val) {
            ++index;
          }
          return o.actMetadata == val;
        });
        //匹配处理人
        this.procObj.personOptions = this.procObj.approvePerson[index];
        this.dealmans = this.procObj.personOptions;
        this.dealer = this.procObj.approvePerson[index].join(",");
        this.procObj.isFastApprove =
          this.procObj.nextActOptions[index].isReselFastDealer == "1"
            ? true
            : false;
        this.showResel =
          this.procObj.nextActOptions[index].isReselFastDealer == "1"
            ? true
            : false;
      } else {
        //退回节点
        this.procObj.backAct.some(o => {
          if (o != val) {
            ++index;
          }
          return o == val;
        });
        //匹配处理人
        this.procObj.showBackMan =
          "[" +
          this.procObj.backMan[index] +
          "]" +
          this.procObj.backManName[index];
      }
    },
    triggerAgree: function() {
      //切换下一环节和下一审批人
      this.options = this.procObj.nextActOptions;
      this.procObj.personOptions = this.procObj.approvePerson[0];
      this.flow_access.next_deal_act = this.options[0].actMetadata;
      this.flow_access.deal_suggest = "同意!";
      this.dealmans = this.procObj.personOptions;
    },
    triggerBack: function() {
      //切换下一环节和下一处理人
      //:label="i.actName" :key="i.actMetaData" :value="i.actMetaData"
      this.options = [];
      for (let i = 0; i < this.procObj.backAct.length; i++) {
        let option = {
          actName: this.procObj.backActName[i],
          actMetadata: this.procObj.backAct[i]
        };
        this.options.push(option);
      }
      this.flow_access.next_deal_act = this.options[0].actMetadata;
      this.procObj.showBackMan =
        this.procObj.backManName[0] + "[" + this.procObj.backMan[0] + "]";
      this.flow_access.deal_suggest = "退回!";
    },
    initData: function() {
      //处理环节默认第一个
      //下一步处理人activityName 通过下一节点的会签类型和是否重选快速审批来判断
      // this.showResel = this.procObj.nextActOptions[0].isReselFastDealer == "1" ? true : false;
      if (this.procObj.activityName.indexOf("010") > -1) {
        //开始节点
        this.dealmans = this.procObj.approvePerson[0];
        console.log(this.procObj);
        this.flow_access.next_deal_act = this.procObj.nextActOptions[0].actMetadata;
        this.dealerId = this.procObj.approvePersonId.join(",");
        this.dealer = this.procObj.approvePerson.join(",");
        if (typeof this.flow_access.draftId != "undefined") {
          //代表草稿
          if (document.getElementById("appMan") != null) {
            this.dealer = this.flow_access.next_deal_name.join(",");
            document.getElementById(
              "appMan"
            ).value = this.flow_access.next_deal_name.join(",");
          }
          this.dealerId = this.flow_access.next_deal_id.join(",");
        } else {
          //设置下一步处理人  暂时不考虑串行会签和并行会签
          if (document.getElementById("appMan") != null) {
            document.getElementById(
              "appMan"
            ).value = this.procObj.approvePerson.join(",");
          }
        }
      } else {
        this.flow_access.deal_answer = this.procObj.determinate;
        this.flow_access.next_deal_act = this.procObj.next_actor;
        // this.dealmans = this.procObj.personOptions;
        console.log(this.procObj);
        this.dealmans = this.procObj.approvePerson;
        // this.dealmans = this.procObj.approvePerson[0];
        this.dealer = this.procObj.personOptions;
      }
    },
    sleep(millsecond) {
      let _this = this;
      return new Promise(resolve => {
        let timer = setTimeout(() => {
          _this.initData();
          clearTimeout(timer);
        }, millsecond);
      });
    }
  },
  created() {},
  mounted() {
    this.$nextTick(function() {
      //初始化数据
      this.sleep(1000);
    });
  },
  computed: {
    nowUser: function() {
      return this.$root.NOW_USER;
    },
    procApproveRules: function() {
      return {
        nextBActor: [
          { required: true, message: this.$t("cm.pselect"), trigger: "change" }
        ],
        dealResult: [
          { required: true, message: this.$t("cm.pselect"), trigger: "blur" }
        ],
        nextDealMan: [
          { required: true, message: this.$t("cm.pselect"), trigger: "blur" }
        ]
      };
    }
  },
  watch: {
    nowUser: function(val) {
      document.getElementById("appMan").value = document.getElementById(
        "nowUser"
      ).innerText;
    },
    "this.procObj": function() {
      console.log("ccc");
      this.initData();
    },
    "this.procObj.nextActOptions": function() {
      this.initData();
    },
    "this.procObj.approvePerson": function(arr) {
      document.getElementById("appMan").value = this.procObj.approvePerson.join(
        ","
      );
      this.dealer = this.procObj.approvePerson.join(",");
    },
    "this.procObj.approvePersonId": function() {
      if (typeof this.flow_access.draftId == "undefined") {
        this.dealerId = this.procObj.approvePersonId.join(",");
      }
    }
  }
};
</script>

<style scoped>
.flow-collapse-deal1 {
  cursor: default;
  color: #9f988d;
  border: 1px solid #e7ddce;
  padding-left: 10px;
  padding-right: 10px;
}
.flow-collapse-deal2 {
  cursor: default;
  color: #9f988d;
  border: 1px solid #e7ddce;
  padding-left: 10px;
  padding-right: 10px;
}
.flow-collapse-deal3 {
  cursor: default;
  color: #9f988d;
  border: 1px solid #e7ddce;
  padding-left: 9px;
  padding-right: 9px;
}
.flow-collapse-deal4 {
  cursor: default;
  color: #9f988d;
  border: 1px solid #e7ddce;
  padding-left: 10px;
  padding-right: 59px;
}

.chk-br {
  display: table;
  margin-left: 0px;
}
.cud__tag {
  border-radius: 14px;
  cursor: pointer;
  margin-right: 5px;
  font-weight: 400;
}
</style>

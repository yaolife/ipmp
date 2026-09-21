<!-- 组织机构选择 -->
<template>
    <div>
        <el-input
                ref="input"
                :value="currentValue"
                :placeholder="placeholder"
                :name="name"
                size="small"
                :id="id"
                :disabled="inputDisabled"
                :readonly="readonly"
                class="form-input"
        >
        <el-button size="small" slot="append" icon="el-icon-plus" @click="show" style="color:#ffffff !important; background-color: #0C7BCA !important;border-radius: 0 5px 5px 0;"></el-button>
        </el-input>

        <el-dialog :title="title"  :append-to-body="toBody"  :visible.sync="visible"  width="850px"
                   :close-on-click-modal="false" v-dragMove="{DragButton:'.el-dialog__header',DragWindow:'.el-dialog'}">
            <asc-base v-bind:width="800"  :src="src" v-bind:height="600" :selected="selected"
                      @handle="handle"></asc-base>
        </el-dialog>

    </div>
</template>

<script>
import {mixinsComp} from '@/mixins/index'
import ascBase from '../asc/ascBase'
export default {
    mixins:[mixinsComp],
    name: "org-select",
    components: {
        ascBase
    },
    props: {
        id: String,
        name: String,
        value: [String, Number],
        text: [String, Number],
        disabled: {
            type: Boolean,
            default: false
        },
        multiple: Boolean,
        multipleLimit: {
            type: Number,
            default: 0
        },
        placeholder: {
            type: String,
            default() {
                return this.$t('el.select.placeholder');
            }
        },
        handleCallback:{
            type: Boolean,
            default: false,
        }
    },
    inject: {
        elForm: {
            default: ''
        },
        elFormItem: {
            default: ''
        }
    },
    data() {
        return {
            mixinsCmptCode: 'orgselect',
            mixinsCmptName: '选部门',
            currentValue: this.value === undefined || this.value === null
                ? ''
                : this.value,
            src: '',
            visible: false,
            readonly: true,
            toBody:true,
            size:'small',
            title: this.multiple ? this.$t('el.select.placeholder') : this.$t('el.select.placeholder')
        }
    },
    watch: {
        value: {
            immediate: true,
            handler(val) {
                this.setSelected(val);
            }
        }
    },
    mounted() {
    },
    computed: {
        inputDisabled() {
            return this.disabled || (this.elForm || {}).disabled;
        },
        inputSrc() {
            var src = '/organizationwidget.html';
            return src;
        }
    },
    methods: {
        load() {
        },
        //无效
        setSelected(value) {
            this.currentValue = value === undefined || value === null ? '' : value;
            this.selected = new Array();
            let changeValue = "";
            if(this.currentValue != ""){
                let array = this.currentValue.split(",");
                let arr = [];
                for(let i = 0; i < array.length; i++){
                    arr.push(array[i].substr(1,array[i].indexOf("]") - 1));
                }
                changeValue = arr.join(",");
            }

            if (this.multiple) {
                this.selected[0] = "";
                this.selected[1] = "";
                this.selected[2] = "";
                this.selected[3] = "";
                this.selected[4] = "";
                this.selected[5] = changeValue;
            } else {
                this.selected[0] = "";
                this.selected[1] = "";
                this.selected[2] = "";
                this.selected[3] = "";
                this.selected[4] = "";
                this.selected[5] = changeValue;
            }
        },
        handle(data) {
            if (data === "close") {
                this.visible = false;
            } else {
                if (data !== "cancelOrg") {
                    let orgId = data[0];
                    let orgName = data[5];
                    let value = [];
                    value.push(orgId + "-" + orgName);
                    if (data[0] === "" ) {
                        this.setSelected("");
                    } else {
                        this.setSelected(value.join(','));
                    }

                    //是否进行回调  2020-06-17 增
                    if (this.handleCallback) {
                        this.$emit('callback', value);
                    }
                } else {

                }
                this.visible = false;
            }
        },
        messageListener(messageEvent) {
            this.visible = false;
            this.value = messageEvent.data[0];

        },
        show() {
            this.visible = true;
            var src = this.$i18n.locale == 'zh-CN' ? this.inputSrc + "?lang=zh_CN" : this.inputSrc + "?lang=en_US";
            this.src = src + "&time=" + new Date().getTime() + "&rDept=true&sourceUrl=" + this.$i18n.locale;
        }
    },
    destroyed() {
        //this.$refs.ascframe.contentWindow.removeEventListener('message', this.messageListener, false);
    },
}
</script>

<style scoped>

</style>

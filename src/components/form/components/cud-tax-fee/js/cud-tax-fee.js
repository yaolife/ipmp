import Bus from "../../../../../bus.js";
import FsscApplyCompany from '../../../widget/cud-fssc-apply-company.vue'
export default {
    components: { FsscApplyCompany },
    name: 'TaxFee',
    // set自定义校验的方法
    inject: ['setCustomRule'],
    props: [
        'value',
        'rules',
        ],
    data () {
        return {
            // 标题卡片body样式
            ascUrl: envConfig.ASC_ROOT,
            status: false,
            cardTitleStyle: {
                textAlign: 'center',
                alignItems: 'center',
                display: 'flex',
                justifyContent: 'center',
                width: this.titleWidth + 'px'
            },
            billTypeArr : [],
            formData : {
                taxpayer: "一般纳税人",  //纳税人属性
                billType : "",          //票据类型
                isOverseasPayment: "",  //是否涉及境外支付
                isAgentTaxFee: "",      //是否代扣代缴税费
                inputTax: "",           //进项税可抵扣情况
                deductionTax: "",       //可抵扣税额
                noDeductionTax: "",     //不可抵扣税额
                agentTaxFee: "",        //代扣代缴增值税select选择
                vat: "",                //增值税
                uct: "",                //城建税
                eduSurcharge: "",       //地方教育附加税
                localEduSurcharge: "",  //教育附加税
                stampTax: "",           //代扣代缴印花税select选择
                stampTaxAmount: "",     //代扣代缴印花税
                isAmountTax: "",        //金额是否含税
                totalAmount:"60.00",    //合计金额
                taxPlace: "",           //纳税地点
                tableData: [{
                    invoiceAmount: "",
                    taxIncluded: "",
                    vat: "",
                    uct: "",
                    eduSurcharge: "",
                    localEduSurcharge: "",
                    otherTax: "",
                    raise: "",
                    taxationTotal: "",
                    taxableIncome: "",
                    taxableAmount: "",
                    payAmount: "",
                    priceTaxTotal: "",
                    taxselect: "",
                }]
            },
            isAgentTaxFeeTypeOption: [
                {
                    value: "0",
                    label: "代扣代缴增值税"
                },
                {
                    value: "1",
                    label: "代扣代缴印花税"
                }
            ],
            taxPlaceOption: [
                {
                    value: "0",
                    label: "深圳(福田、龙岗)"
                }
            ],
            formRules: {
                billType: [
                    {required: true, message: "请选择票据类型", trigger:"blur"}
                ],
                deductionTax: [
                    {required: true, message: "请输入可抵扣税额", trigger:"blur"}
                ],
            }
        }
    },
    watch: {
        billTypeArr: {
            handler(n, o) {
                this.formData.billType = n.toString();
            }
        },
        formData: {
            handler(n, o) {
                this.$emit('input', n);
            },
            deep: true
        },
        value: {
            handler(n, o) {
                if (n != null && o == null) {
                    Object.assign(this.formData, n);
                    this.billTypeArr = n.billType ? n.billType.split(",") : [];
                }
            },
            deep: true
        }
    },
    created () {

    },
    mounted () {
        // set自定义的校验
        this.setCustomRule(this.formValidate)
    },
    methods: {

        /*
        * 限制input只能输入数字 且为两位小数
        */
        limitInput(flag, value, row) {
            row[flag] =
            ("" + value) // 第一步：转成字符串
                .replace(/[^\d^\.]+/g, "") // 第二步：把不是数字，不是小数点的过滤掉
                .replace(/^0+(\d)/, "$1") // 第三步：第一位0开头，0后面为数字，则过滤掉，取后面的数字
                .replace(/^\./, "0.") // 第四步：如果输入的第一位为小数点，则替换成 0. 实现自动补全
                .match(/^\d*(\.?\d{0,2})/g)[0] || ""; // 第五步：最终匹配得到结果 以数字开头，只有一个小数点，而且小数点后面只能有0到2位小数
      },

     // 自定义的校验方法
     formValidate(callback) {
          this.$refs["taxFeeForm"].validate((valid) => {
            if(valid){
                // 校验成功
                callback(true)
            } else {
                // 校验失败
                callback(false)
            }
          })
      },
    }
};

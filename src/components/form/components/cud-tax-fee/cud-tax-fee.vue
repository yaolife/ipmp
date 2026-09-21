<template>
    <div>
        <el-form :model="formData" :rules="formRules" ref="taxFeeForm">
            <el-row>
                <el-col :span="12">
                    <el-form-item label="$t('components.tax_fee_info_title')">
                        <button>{{ $t('components.out_project') }}</button>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="$t('components.tax_payer_prop')">
                        <cgn-asc-person-select  v-model="formData.taxpayer" :multiple="false" :asc-url="ascUrl"
                            :props="{userId: 'srcUserId', userName: 'srcUserName'}" ref="taxpayerRef"></cgn-asc-person-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="申请公司：">
                        <cud-fssc-apply-company
                            v-bind:controlData="controlData"
                            ref="applyCompanyRef"
                            @change="companyDatas"
                          />
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="票据类型: " prop="billType">
                        <el-checkbox-group v-model="billTypeArr" >
                            <el-checkbox label="0">增值税专用发票(含电子发票)</el-checkbox>
                            <el-checkbox label="1">机动车销售统一发票</el-checkbox>
                            <el-checkbox label="2">通行费增值税电子普通发票(含过路过桥费)</el-checkbox>
                            <el-checkbox label="3">客运增值税电子普通发票</el-checkbox>
                            <el-checkbox label="4">飞机行程单、火车票、客车票、船票等</el-checkbox>
                            <el-checkbox label="5">海关进口增值税专用缴款书</el-checkbox>
                            <el-checkbox label="6">代扣代缴税款的完税凭证</el-checkbox>
                            <el-checkbox label="7">可以计算抵扣的农产品票据</el-checkbox>
                            <el-checkbox label="8">增值税普通发票</el-checkbox>
                            <el-checkbox label="9">其他票据(含无票据)</el-checkbox>
                        </el-checkbox-group>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="是否涉及境外支付: ">
                        <el-radio-group v-model="formData.isOverseasPayment">
                            <el-radio label="0">是</el-radio>
                            <el-radio label="1">否</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="是否代扣代缴税费: ">
                        <el-radio-group v-model="formData.isAgentTaxFee">
                            <el-radio label="0">是</el-radio>
                            <el-radio label="1">否</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="进项税可抵扣情况: ">
                        <el-radio-group v-model="formData.inputTax">
                            <el-radio label="0">可抵扣</el-radio>
                            <el-radio label="1">不可抵扣</el-radio>
                            <el-radio label="2">部分可抵扣</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item v-if="formData.inputTax == '0' || formData.inputTax == '2'" label="可抵扣税额: " prop="deductionTax">
                        <el-input v-model="formData.deductionTax" placeholder=""></el-input>
                    </el-form-item>
                    <el-form-item v-if="formData.inputTax == '1'" label="不可抵扣税额: ">
                        <el-input v-model="formData.noDeductionTax" placeholder=""></el-input>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="增值税: ">
                        <el-input v-model="formData.vat" placeholder="" required></el-input>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="城建税: ">
                        <el-input v-model="formData.vat" placeholder="" required></el-input>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="代扣代缴税种: ">
                        <el-select v-model="formData.stampTax" placeholder="">
                            <el-option v-for="item in isAgentTaxFeeTypeOption" :key="item.value" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="代扣代缴税额">
                        <el-input v-model.number="formData.stampTaxAmount" placeholder=""></el-input>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="金额是否含税: ">
                        <el-radio-group v-model="formData.isAmountTax">
                        <el-radio label="0">是</el-radio>
                        <el-radio label="1">否</el-radio>
                        </el-radio-group>
                    </el-form-item>
                </el-col>
                <el-col :span="12">
                    <el-form-item label="合计金额: ">
                        {{formData.totalAmount}}
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="24">
                    个税计算器
                </el-col>
            </el-row>
            <el-row>
                <el-col :span="12">
                    <el-form-item label="纳税地点: ">
                        <el-select v-model="formData.taxPlace" placeholder="">
                            <el-option v-for="item in taxPlaceOption" :key="item.value" :label="item.label" :value="item.value"></el-option>
                        </el-select>
                    </el-form-item>
                </el-col>
            </el-row>
            <el-row>
                <el-table
                    :data="formData.tableData"
                    show-summary
                    :summary-method="getSummaries"
                    v-loading="table.loading"
                    highlight-current-row
                    header-row-class-name="cud-office-table-header"
                    class="cud-office-table"
                    @selection-change="hadleSelectionChange"
                    @select="onTableSelect"
                    >
                    <el-table-column prop="invoiceNo" label="开票号">
                        <template slot-scope="scope">
                            <el-input v-model="scope.row.invoiceNo" placeholder=""></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column prop="invoiceAmount" label="开票金额">
                        <template slot-scope="scope">
                            <el-input v-model="scope.row.invoiceAmount" placeholder=""></el-input>
                        </template>
                    </el-table-column>
                    <el-table-column prop="taxIncluded" label="含税">
                        <template slot-scope="scope">
                            <el-checkbox :true-label="'1'" :false-label="'0'" v-model="scope.row.taxIncluded" ></el-checkbox>  
                        </template>
                    </el-table-column>
                    <el-table-column prop="taxableAmount" label="计税金额"></el-table-column>
                    <el-table-column prop="payAmount" label="实付金额"></el-table-column>
                    <el-table-column align="center" :label="操作" width="150">
                        <template slot-scope="scope">
                            <el-button size="small" icon="el-icon-plus" class="button-plain" type="primary" @click="addRow(scope.row,scope.$index)" plain></el-button>
                            <el-button size="small" icon="el-icon-minus" class="button-plain" type="warning" @click="delRow(scope.row,scope.$index)" plain></el-button>
                        </template>
                    </el-table-column>
                </el-table>
            </el-row>
        </el-form>
    </div>
</template>

<script>
import cudTaxFee from "./js/cud-tax-fee.js";
export default cudTaxFee;

</script>

<style scoped>

</style>
<!-- 记账凭证 -->
<template>
    <div v-loading="bookingVoucherLoading" ref="dmCom">
        <div>
            <!-- <h2 style="display: inline-block; margin-left: 15px">记账凭证</h2> -->
            <el-form ref="voucherForm" :model="voucherFormData">
                <div v-if="isShowProcInfo">
                    <el-row>
                        <el-col :span="12">
                            <el-form-item :label="$t('components.procDefName')">
                                <el-input size="small" v-model="procDefName" readonly/>
                            </el-form-item>
                        </el-col>
                        <el-col :span="12">
                            <el-form-item :label="$t('components.procActName')">
                                <el-input size="small" v-model="procActName" readonly/>
                            </el-form-item>
                        </el-col>
                    </el-row>
                </div>
                <el-row>
                    <el-col :span="12">
                        <el-form-item :label="$t('components.Category')" prop="businessCategory" v-if="businessCategoryCtrl.display !== false" 
                        :rules="businessCategoryCtrl && businessCategoryCtrl.rules 
                        && businessCategoryCtrl.rules.length > 0 ? businessCategoryCtrl.rules : formRules.businessCategory">
                            <el-input size="small" v-model="voucherFormData.businessCategory" :disabled="businessCategoryCtrl.detail" @change="categoryChange"/>
                        </el-form-item>
                    </el-col>
                    <el-col :span="12">
                        <el-form-item :label="$t('components.SubCategory')" prop="businessSubCategory" v-if="businessSubCategoryCtrl.display !== false"  :rules="businessSubCategoryCtrl && businessSubCategoryCtrl.rules && businessSubCategoryCtrl.rules.length ? businessSubCategoryCtrl.rules :formRules.businessSubCategory">
                            <el-input size="small" v-model="voucherFormData.businessSubCategory" :disabled="businessSubCategoryCtrl.detail" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <div >
                    <template v-for="(item, index) in voucherFormData.voucherData">
                        <el-card shadow="never" style="margin-top: 10px" :key="index" :id="'voucher' + index">
                            <el-row>
                                <el-col :span="23">
                                    <el-form :model="item.formData" label-width="100px" label-position="right">
                                        <el-row>
                                            <el-col :span="8">
                                                <el-form-item :label="$t('components.companyCode')" prop="companyCode"  v-if="companyCodeCtrl.display !== false">
                                                    <fssc-apply-company size="small" v-model="item.formData.companyCode" :disabled="companyCodeCtrl.detail" ></fssc-apply-company>
                                                </el-form-item>
                                            </el-col>
                                            <el-col :span="12" style="margin-left: 10px">
                                                <el-button size="small" @click="copyVoucher(index)" :disabled="copyBtnCtrl.detail">{{ $t('components.copyVoucher') }}</el-button>
                                                <el-button size="small" @click="delVoucher(index)" :disabled="delBtnCtrl.detail">{{ $t('components.delVoucher') }}</el-button>
                                            </el-col>
                                        </el-row>
                                        <el-row>
                                            <el-col :span="8">
                                                <el-form-item :label="$t('components.headerText')" v-if="headerTextCtrl.display !== false">
                                                    <el-input size="small" v-model="item.formData.headerText" :disabled="headerTextCtrl.detail"/>
                                                </el-form-item>
                                            </el-col>
                                            <el-col :span="8" style="margin-left: 20px">
                                                <el-form-item :label="$t('components.voucherNo')" v-if="voucherNoCtrl.display !== false">
                                                    <el-input size="small" v-model="item.formData.voucherNo" :disabled="voucherNoCtrl.detail"/>
                                                </el-form-item>
                                            </el-col>
                                        </el-row>
                                    </el-form>
                                    <el-table :data="item.tableData">
                                        <el-table-column :label="$t('components.lendDirection')" v-if="lendDirectionCtrl.display !== false">
                                            <template slot-scope="scope" >
                                                <el-select v-model="scope.row.lendDirection">
                                                    <el-option v-for="item in borrowLendData" :key="item.value" :value="item.value" :disabled="lendDirectionCtrl.detail"
                                                        :label="item.label"></el-option>
                                                </el-select>
                                            </template>
                                        </el-table-column>
                                        <el-table-column :label="$t('components.accountCode')" v-if="accountCodeCtrl.display !== false">
                                            <template slot-scope="scope">
                                                <el-input size="small" v-model="scope.row.accountCode" :disabled="accountCodeCtrl.detail"/>
                                            </template>
                                        </el-table-column>
                                        <el-table-column :label="$t('components.amount')" v-if="amountCtrl.display !== false">
                                            <template slot-scope="scope">
                                                <el-input size="small" v-model="scope.row.amount" :disabled="amountCtrl.detail"/>
                                            </template>
                                        </el-table-column>
                                        <el-table-column :label="$t('components.lineItemText')" v-if="lineItemTextCtrl.display !== false" >
                                            <template slot-scope="scope">
                                                <el-input size="small" v-model="scope.row.lineItemText" :disabled="lineItemTextCtrl.detail"/>
                                            </template>
                                        </el-table-column>
                                        <el-table-column :label="$t('components.operate')" width="150">
                                            <template slot-scope="scope">
                                                <el-button type="text" size="small" class="cud-common-operate-edit" @click="addTableRow(item, scope.$index)" :disabled="addItemCtrl.detail">
                                                    <i class="el-icon-circle-plus font-size-20" />
                                                </el-button>
                                                <el-button type="text" size="small" class="cud-common-operate-delete"
                                                    :disabled="item.tableData.length == 1 || delItemCtrl.detail" @click="removeTableRow(item.tableData, scope.$index)"> 
                                                    <i class="el-icon-remove font-size-20" />
                                                </el-button>
                                            </template>
                                        </el-table-column>
                                    </el-table>
                                </el-col>
                            </el-row>
                        </el-card>
                    </template> 
                </div>
            </el-form>
        </div>
    </div>
</template>
<script>
import cudBookingVoucher from "./js/cud-booking-voucher.js";
export default cudBookingVoucher;

</script>
<style scoped>
</style>
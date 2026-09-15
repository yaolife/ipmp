import axios from '@/api/http';

//复制新凭证
const copyVoucherUrl = '/bookingVoucher/copyVoucher';

export default {
  //复制新凭证接口
  copyVoucherAPI: function (params) {
    return axios.post(copyVoucherUrl, params, { apiTitle: "复制新凭证" }).then(res => res.data);
  },

}


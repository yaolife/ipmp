import axios from '@/api/http';

const loginUrl = '/login/userLogin';

export default{
    loginAPI: function(params) {
        return axios.post(loginUrl, params).then(res => res.data);
    },
} 

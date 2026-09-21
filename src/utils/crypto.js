'use strict'
import encUtf8 from 'crypto-js/enc-utf8.js'

import aes from 'crypto-js/aes.js'
import hex from 'crypto-js/enc-hex.js'
import base64 from 'crypto-js/enc-base64.js'
import cryptojs from 'crypto-js/crypto-js.js'
// import cryptojs from 'crypto-js'



export default{
  getASPro(obj){
    let objStr = JSON.stringify(obj)
    //密钥 (需要前端和后端保持一致)十六位作为密钥
    let KEY = "43799a659a2a1800";
    //密钥偏移量 (需要前端和后端保持一致)十六位作为密钥偏移量
    let IV = "151ca4d103eeb200";
    let key = encUtf8.parse(KEY);  //十六位十六进制数作为密钥
    let iv = encUtf8.parse(IV);   //十六位十六进制数作为密钥偏移量
    let srcs = encUtf8.parse(objStr);
    let encrypted = aes.encrypt(srcs, key, { iv: iv, mode: cryptojs.mode.CBC, padding: cryptojs.pad.Pkcs7 });
    let enDatastr = encrypted.ciphertext.toString();
    let encryptedHexStr = hex.parse(enDatastr);
    let encryptedBase64Str = base64.stringify(encryptedHexStr);
    return encryptedBase64Str;
  },
  settext(){
  },
  getMd5(str){
    return cryptojs.MD5(str).toString();
  }
}
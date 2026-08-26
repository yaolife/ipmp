'use strict'
export default {
    swapArr(arr, index1, index2) {
        arr[index1] = arr.splice(index2, 1, arr[index1])[0];
        return arr;
    },
    toTop(fieldData,index) {
        if(index!=0){
            fieldData.unshift(fieldData.splice(index , 1)[0]);
        }
    },
    toUp(fieldData,index){
        if(index!=0){
            fieldData[index] = fieldData.splice(index-1, 1, fieldData[index])[0];
        }else{
            fieldData.push(fieldData.shift());
        }
    },
    toDown(fieldData,index) {
        if(index!=fieldData.length-1){
            fieldData[index] = fieldData.splice(index+1, 1, fieldData[index])[0];
        }else{
            fieldData.unshift( fieldData.splice(index,1)[0]);
        }
    }
}

import loadingManager from "@/api/loading";

/**
 * 为API 请求添加Loading 效果并处理相应数据高阶函数
 * @params { string } key -- Loading 实例的唯一标识符
 * @params { Promise } apiCall -- API 请求 Promise
 * @reutrn { Promise } 处理后的Promise  
 */ 

// 示例  withLoading(key, apicall)
export const withLoading = async (key,apiCall,isLoading = true) => {
    try {
        
        isLoading&&loadingManager.show(key)
        const response = await apiCall
        return response? response.data : response
    }catch(error) {
        console.log('API Error:', error)
    } finally {
        loadingManager.close(key)
    }
}

// 导出 loadingManager 以便需要时可以直接使用
export {loadingManager }
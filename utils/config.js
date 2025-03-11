// 基础配置信息
module.exports = {
    // 服务器地址配置
    baseURL: 'http://180.100.199.30:9090/mock/72',

    // 请求超时时间（毫秒）
    timeout: 10000,

    // 其他全局配置
    appName: 'MAI Lawyer',
    version: '1.0.0',
    
    // 分页配置
    pageSize: 10,
    
    // 文件上传配置
    upload: {
        maxSize: 5 * 1024 * 1024, // 5MB
        acceptTypes: ['image/jpeg', 'image/png', 'application/pdf']
    },
    appId: "wxb7f2a8c8c8ea8c73",
    appSecret: "592dc14581988e4dadca20a5d0ab887c",
    IM: {
        userID: "laywer3", // User ID
        SECRETKEY:
          "ba92e763ab7975718da625afa6f60465dee472f0e4524f2028f83e161e5e1f8b", // Your secretKey
        SDKAPPID: 1600075596, // Your SDKAppID
        EXPIRETIME: 604800,
      },
};

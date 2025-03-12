// 基础配置信息
module.exports = {
  // 服务器地址配置
  baseURL: "http://218.78.129.237:8081",

  // 请求超时时间（毫秒）
  timeout: 10000,

  // 其他全局配置
  appName: "迈小律",
  version: "1.0.0",

  // 分页配置
  pageSize: 10,

  // 文件上传配置
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    acceptTypes: ["image/jpeg", "image/png", "application/pdf"],
  },
  appId: "wxb7f2a8c8c8ea8c73",
  appSecret: "592dc14581988e4dadca20a5d0ab887c",
  IM: {
    userID: "laywer3", // User ID
    SECRETKEY:
      "3aebef5623822d13d3124b10687cbf1c46cc4928583af930bb74270160b76cc4", // Your secretKey
    SDKAPPID: 1600076169, // Your SDKAppID
    EXPIRETIME: 604800,
  },
};

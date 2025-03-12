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
  appId: "wx1a652f95e596a237",
  appSecret: "199d397867dde3dfc723c7147e35c201",
  IM: {
    userID: "laywer3", // User ID
    SECRETKEY:
      "ba92e763ab7975718da625afa6f60465dee472f0e4524f2028f83e161e5e1f8b", // Your secretKey
    SDKAPPID: 1600075596, // Your SDKAppID
    EXPIRETIME: 604800,
  },
};

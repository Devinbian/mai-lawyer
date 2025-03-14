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

  //法律文书类型
  docType: ["contract", "complaint", "defense", "legal_opinion", "application", "general"],

  //支持的文件后缀
  fileExt: {
    doc: "word",
    docx: "word",
    pdf: "pdf",
    xls: "excel",
    xlsx: "excel",
    ppt: "ppt",
    pptx: "ppt",
  },
  // 文件上传配置
  upload: {
    maxSize: 5 * 1024 * 1024, // 5MB
    acceptTypes: ["image/jpeg", "image/png", "application/pdf"],
  },
  appId: "wx1a652f95e596a237",
  IM: {
    userID: "laywer3", // User ID
    SECRETKEY: "3aebef5623822d13d3124b10687cbf1c46cc4928583af930bb74270160b76cc4", // Your secretKey
    SDKAPPID: 1600076169, // Your SDKAppID
    EXPIRETIME: 604800,
  },
};

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
  //订单类型
  orderType: {
    1: { title: "图文咨询", icon: "text" },
    2: { title: "下载文档", icon: "text" },
    3: { title: "电话咨询", icon: "phone" },
    4: { title: "见面咨询", icon: "text" },
    5: { title: "代制诉立案", icon: "text" },
    6: { title: "律师函", icon: "text" },
  },

  //订单状态
  //退款中的状态做了特殊处理，逻辑见订单页面
  //退款中的时候给后台传了2来获取所有的退款中的子状态数据
  orderStatus: {
    0: { val: "pending", txt: "待支付" },
    1: { val: "paid", txt: "已支付" },
    2: { val: "canceled", txt: "已取消" },
    3: { val: "approving", txt: "退款审核中" },
    4: { val: "approve_failed", txt: "审核未通过" },
    5: { val: "refunding", txt: "退款中" },
    6: { val: "refunded", txt: "已退款" },
    7: { val: "refund_failed", txt: "退款失败" },
    99: { val: "all", txt: "全部" },
  },

  //tips图标
  tipsIcon: {
    1: { txt: "successNotice" },
    2: { txt: "errorNotice" },
    3: { txt: "couponNotice" },
    4: { txt: "defaultNotice" },
    5: { txt: "alertNotice" },
    6: { txt: "alertInfo" },
    7: { txt: "successInfo" },
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

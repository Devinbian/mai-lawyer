const imageUtil = require("../../../../utils/image.js");

Page({
  data: {
    orderId: "",
    orderTime: "",
    cancelTime: "",
    lawyer: "",
    refundDesc: "",
    refundAmount: "",
    refundTime: "",
    imgUrls: null,
    refundStatus: 2, // 1: 提交申请, 2: 正在处理, 3: 退款成功
  },

  onLoad(options) {
    this.setImagesByPixelRatio();

    if (options.id) {
      // 模拟获取订单数据
      this.setData({
        orderId: "202502000714000300000",
        orderTime: "2025-02-07 14:00:03",
        cancelTime: "2025-02-07 14:00:03",
        lawyer: "雷军",
        refundDesc: "这是一条退款说明，最多显示两行",
        refundAmount: "64",
        refundTime: "2025-02-07 14:00:03",
        refundStatus: options.status ? parseInt(options.status) : 2,
      });
    }
  },

  setImagesByPixelRatio() {
    this.setData({
      imgUrls: imageUtil.getCommonImages(["profile", "default"]),
    });
  },

  // 查看订单列表
  goToOrderList() {
    wx.navigateBack({
      delta: 1,
    });
  },

  // 返回首页
  goToHome() {
    wx.switchTab({
      url: "/pages/index/index",
    });
  },
});

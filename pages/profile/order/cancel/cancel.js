const imageUtil = require("../../../../utils/image.js");

Page({
  data: {
    orderId: "",
    orderTime: "",
    cancelTime: "",
    lawyer: "",
    cancelReason: "",
    refundAmount: "",
    imgUrls: null,
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
        cancelReason: "系统自动取消",
        refundAmount: "64",
      });
    }
  },

  setImagesByPixelRatio() {
    this.setData({
      imgUrls: imageUtil.getCommonImages("profile"),
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

  // 删除订单
  deleteOrder() {
    wx.showModal({
      title: "提示",
      content: "确定要删除该订单吗？",
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用删除订单接口
          wx.navigateBack({
            delta: 1,
          });
        }
      },
    });
  },

  // 再次购买
  buyAgain() {
    wx.navigateTo({
      url: "/pages/service/detail/detail",
    });
  },
});

const imageUtil = require("../../../../utils/image.js");
const config = require("../../../../utils/config.js");

Page({
  data: {
    orderId: "",
    orderNo: "",
    orderTime: "",
    cancelTime: "",
    orderType: 1,
    lawyer: "",
    refundDesc: "",
    refundAmount: "",
    refundTime: "",
    imgUrls: null,
    refundStatus: 2, // 1: 提交申请, 2: 正在处理, 3: 退款成功 4: 退款审核不通过
  },

  onLoad(options) {
    this.setImagesByPixelRatio();

    const userInfo = wx.getStorageSync("userInfo");

    if (options.id) {
      wx.request({
        url: `${config.baseURL}/api/order/refund-progress`,
        method: "GET",
        data: {
          orderId: options.id,
          token: userInfo.token,
        },
        success: (res) => {
          console.log("/api/order/refund-progress", res.data);
          this.setData({
            orderId: options.id,
            orderNo: res.data.data.orderNo,
            orderTime: res.data.data.createTime,
            cancelTime: res.data.data.refundRequestTime,
            orderType: res.data.data.orderType,
            lawyer: res.data.data.lawyer,
            refundDesc: res.data.data.refundReason,
            refundAmount: res.data.data.refundPrice,
            refundTime: res.data.data.refundProgressTime,
            refundStatus: res.data.data.refundProgress,
            refundAuditMessage: res.data.data.refundAuditMessage,
          });
        },
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

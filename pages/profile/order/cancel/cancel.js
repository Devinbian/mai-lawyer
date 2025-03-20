const imageUtil = require("../../../../utils/image.js");
const config = require("../../../../utils/config.js");

Page({
  data: {
    orderId: "",
    orderNo: "",
    orderTime: "",
    cancelTime: "",
    lawyer: "",
    lawyerAvatar: "",
    lawyerTitle: "",
    documentTitle: "",
    cancelReason: "",
    refundAmount: "",
    imgUrls: null,
    orderType: null,
  },

  onLoad(options) {
    this.setImagesByPixelRatio();
    if (options.id) {
      // 模拟获取订单数据
      wx.request({
        url: `${config.baseURL}/api/order/cancel-detail`,
        data: {
          orderId: options.id,
          token: getApp().globalData.userInfo.token,
        },
        success: (res) => {
          console.log("取消订单详情", res);
          if (res.data.success) {
            console.log("++++++++++++++++++++++++++", res.data.data);
            if (res.data.data.orderType === 1) {
              this.setData({
                orderId: res.data.data.orderId,
                orderNo: res.data.data.orderNo,
                orderTime: res.data.data.createTime,
                cancelTime: res.data.data.cancelTime,
                lawyer: res.data.data.lawyerName,
                lawyerAvatar: res.data.data.lawyerAvatarUrl,
                lawyerTitle: res.data.data.lawyerTitle,
                cancelReason: res.data.data.cancelReason,
                refundAmount: res.data.data.totalFee,
                orderType: config.orderType[res.data.data.orderType],
                orderTypeIndex: res.data.data.orderType,
                fileExtIcon: config.fileExt[res.data.data.fileExtension],
              });
            } else {
              this.setData({
                orderId: res.data.data.orderId,
                orderNo: res.data.data.orderNo,
                orderTime: res.data.data.createTime,
                cancelTime: res.data.data.cancelTime,
                documentTitle: res.data.data.documentTitle,
                cancelReason: res.data.data.cancelReason,
                refundAmount: res.data.data.totalFee,
                orderType: config.orderType[res.data.data.orderType],
                orderTypeIndex: res.data.data.orderType,
                fileExtIcon: config.fileExt[res.data.data.fileExtension],
              });
            }
          }
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

  // 删除订单
  deleteOrder() {
    const token = getApp().globalData.userInfo.token;
    wx.showModal({
      title: "提示",
      content: "确定要删除该订单吗？",
      success: (res) => {
        if (res.confirm) {
          wx.request({
            url: `${config.baseURL}/api/order/delete?token=${token}`,
            method: "POST",
            header: {
              "Content-Type": "application/json",
            },
            data: {
              orderId: this.data.orderId,
            },
            success: (res) => {
              console.log("删除订单", res.data, this.data.orderId);
              wx.navigateBack({
                delta: 1,
                success: () => {},
              });
            },
          });
        }
      },
    });
  },

  // 再次购买
  buyAgain() {
    const token = getApp().globalData.userInfo.token;
    wx.request({
      url: `${config.baseURL}/api/order/again-add?token=${token}`,
      method: "POST",
      header: {
        "Content-Type": "application/json",
      },
      data: {
        orderId: this.data.orderId,
      },
      success: (res) => {
        console.log("再次购买", res.data);
        if (res.data.success) {
          wx.navigateBack({
            delta: 1,
            success: () => {},
          });
        }
      },
    });
  },
});

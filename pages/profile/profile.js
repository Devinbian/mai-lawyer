const imageUtil = require("../../utils/image.js");
// pages/profile/profile.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    imgUrls: null,
    isLogin: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setImagesByPixelRatio();
    const userInfo = wx.getStorageSync("userInfo");
    if (userInfo) {
      this.setData({
        userInfo,
        isLogin: true,
      });
    }
  },

  // 根据设备像素比选择图片
  setImagesByPixelRatio() {
    this.setData({
      imgUrls: imageUtil.getCommonImages(["profile", "default"]),
    });
  },

  // 点击登录/注册
  handleLogin() {
    if (!this.data.isLogin) {
      wx.navigateTo({
        url: "/pages/login/login",
      });
    } else {
      wx.navigateTo({
        url: "./account/account",
      });
    }
  },

  // 处理订单状态点击
  handleOrderStatusTap(e) {
    if (!this.data.isLogin) {
      wx.navigateTo({
        url: "/pages/login/login",
      });
      return;
    }
    const status = e.currentTarget.dataset.status;
    wx.navigateTo({
      url: `/pages/profile/order/order?status=${status}`,
    });
  },

  // 点击内容项
  handleContentTap(e) {
    const { type } = e.currentTarget.dataset;

    if (!this.data.isLogin) {
      wx.navigateTo({
        url: "/pages/login/login",
      });
      return;
    }

    switch (type) {
      case "favorite":
        wx.navigateTo({
          url: "/pages/profile/favorite/favorite",
        });
        break;
      case "download":
        wx.navigateTo({
          url: "/pages/profile/download/download",
        });
        break;
      case "history":
        wx.navigateTo({
          // url: "/pages/profile/history/history",
          url: "../../tim-conversation/pages/index",
        });
        break;
    }
  },

  // 点击功能项
  handleFunctionTap(e) {
    const type = e.currentTarget.dataset.type;
    switch (type) {
      case "help":
        wx.navigateTo({
          url: "/pages/profile/feedback/feedback",
        });
        break;
      case "about":
        wx.navigateTo({
          url: "/pages/profile/about/about",
        });
        break;
      case "contact":
        wx.makePhoneCall({
          phoneNumber: "021-50280097",
          fail(err) {
            wx.showToast({
              title: "拨号失败",
              icon: "none",
            });
          },
        });
        break;
      case "account":
        wx.navigateTo({
          url: "/pages/profile/account/account",
        });
        break;
      case "logout":
        if (this.data.isLogin) {
          this.handleLogout();
        }
        break;
    }
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: "提示",
      content: "确定要退出登录吗？",
      success: (res) => {
        if (res.confirm) {
          // 清除登录信息
          wx.removeStorageSync("userInfo");
          // 更新页面状态
          this.setData({
            userInfo: null,
            isLogin: false,
          });

          wx.showToast({
            title: "已退出登录",
            icon: "success",
          });
        }
      },
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
});

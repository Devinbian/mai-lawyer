Page({
  data: {
    isAgree: false,
    loading: false,
  },

  // 切换协议同意状态
  onAgreementChange(e) {
    this.setData({
      isAgree: e.detail.value,
    });
  },

  // 微信一键登录
  handleWechatLogin() {
    if (!this.data.isAgree) {
      wx.showToast({
        title: "请先同意用户协议和隐私政策",
        icon: "none",
      });
      return;
    }

    this.setData({ loading: true });
    try {
      wx.getUserProfile({
        desc: '用于完善用户资料',
        success: (res) => {
          const app = getApp();
          app.globalData.userInfo = res.userInfo;
          app.globalData.isLogin = true;
          
          wx.navigateBack();
        }
      });
    } catch (error) {
      wx.showToast({
        title: error.message,
        icon: "none",
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 跳转到手机号登录
  goToPhoneLogin() {
    if (!this.data.isAgree) {
      wx.showToast({
        title: "请先同意用户协议和隐私政策",
        icon: "none",
      });
      return;
    }
    // TODO: 实现手机号登录页面后打开
    wx.showToast({
      title: "功能开发中",
      icon: "none",
    });
  },

  // 查看隐私政策
  viewPrivacy() {
    wx.navigateTo({
      url: "/pages/privacy/privacy",
    });
  },

  gotoAgreement() {
    wx.navigateTo({
      url: '/pages/agreement/agreement'
    });
  }
});

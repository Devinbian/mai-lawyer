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
  async handleWechatLogin() {
    if (!this.data.isAgree) {
      wx.showToast({
        title: "请先同意用户协议和隐私政策",
        icon: "none",
      });
      return;
    }

    this.setData({ loading: true });
    try {
      const app = getApp();
      const loginResult = await app.login();
      // TODO: 处理登录成功后的逻辑
      wx.switchTab({
        url: "/pages/index/index",
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

  // 查看协议
  viewAgreement() {
    wx.navigateTo({
      url: "/pages/agreement/agreement",
    });
  },

  // 查看隐私政策
  viewPrivacy() {
    wx.navigateTo({
      url: "/pages/privacy/privacy",
    });
  },
});

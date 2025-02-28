Page({
  data: {
    isAgree: false,
    loading: false,
  },

  // 切换协议同意状态
  toggleAgree() {
    this.setData({
      isAgree: !this.data.isAgree,
    });
  },

  // 微信登录
  handleWechatLogin() {
    if (!this.data.isAgree) {
      wx.showToast({
        title: "请先同意用户协议和隐私政策",
        icon: "none",
      });
      return;
    }

    if (this.data.loading) return;
    this.setData({ loading: true });

    // 先获取用户信息
    wx.getUserProfile({
      desc: "用于完善用户资料",
      success: (userRes) => {
        // 获取用户信息成功后，再调用登录接口
        wx.login({
          success: (loginRes) => {
            if (loginRes.code) {
              // 这里可以把code和用户信息传给后端
              console.log("登录成功", {
                code: loginRes.code,
                userInfo: userRes.userInfo,
              });

              // 存储用户信息
              const app = getApp();
              app.globalData.userInfo = userRes.userInfo;
              app.globalData.isLogin = true;

              // 登录成功后返回
              wx.navigateBack();
            } else {
              console.error("登录失败", loginRes);
              wx.showToast({
                title: "登录失败",
                icon: "none",
              });
            }
          },
          fail: (err) => {
            console.error("wx.login 调用失败", err);
            wx.showToast({
              title: "登录失败，请稍后重试",
              icon: "none",
            });
          },
        });
      },
      fail: (err) => {
        console.error("获取用户信息失败", err);
        wx.showToast({
          title: "获取用户信息失败",
          icon: "none",
        });
      },
      complete: () => {
        this.setData({ loading: false });
      },
    });
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

  // 跳转到协议页面
  gotoAgreement() {
    wx.navigateTo({
      url: "/pages/agreement/agreement",
    });
  },
});

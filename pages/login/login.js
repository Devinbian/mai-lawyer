const config = require("../../utils/config.js");

Page({
  data: {
    isAgree: false,
    appId: config.appId,
    appSecret: config.appSecret,
  },

  wechatAuth(e) {
    // console.log(e.detail.code); // 动态令牌
    // console.log(e.detail.errMsg); // 回调信息（成功失败都会返回）
    // console.log(e.detail.errno); // 错误码（失败时返回）
    wx.request({
      url: config.baseURL + "/api/auth/wechat/auth",
      method: "GET",
      data: {
        code: e.detail.code,
      },
      dataType: "json",
      success: (res) => {
        console.log(res);
        wx.setStorageSync("openid", res.data.data);
        wx.setStorageSync("code", res.data.code);
        const app = getApp();
        wx.request({
          url: config.baseURL + "/api/auth/wechat/login",
          method: "GET",
          data: {
            openid: res.data.data,
            code: res.data.code,
          },
          dataType: "json",
          success: (res) => {
            app.globalData.isLogin = true;
            app.globalData.userInfo = res.data.data;
            wx.setStorageSync("userinfo", res.data.data);
            console.log(res);
          },
          fail: (err) => {
            console.log("登录失败" + err);
          },
        });
        wx.navigateBack();
      },
      fail: (err) => {
        console.log("获取授权失败" + err);
      },
    });
  },

  // 切换协议同意状态
  toggleAgree() {
    this.setData({
      isAgree: !this.data.isAgree,
    });
  },

  // 在小程序启动时（app.js 的 onLaunch 中）检查登录状态
  checkLoginStatus() {
    // 先检查本地是否有登录态存储
    const openid = wx.getStorageSync("openid");
    const app = getApp();

    if (openid) {
      // 有登录记录，检查登录态是否过期
      wx.checkSession({
        success: () => {
          // 登录态有效，直接使用现有登录态
          app.globalData.isLogin = true;
          console.log("登录态有效，无需重新登录");
        },
        fail: () => {
          // 登录态已过期，需要重新登录
          console.log("登录态已过期，需要重新登录");
          wx.removeStorageSync("openid");
          app.globalData.isLogin = false;
        },
      });
    } else {
      // 无登录记录，未登录状态
      app.globalData.isLogin = false;
    }
  },

  // 登录按钮点击事件
  login() {
    // 检查登录状态和协议同意
    if (getApp().globalData.isLogin) {
      wx.showToast({ title: "您已登录", icon: "success" });
      wx.navigateBack();
      return;
    }

    if (!this.data.isAgree) {
      wx.showToast({ title: "请先同意用户协议", icon: "none" });
      return;
    }

    // 直接调用getUserProfile（必须在用户点击事件中直接调用）
    wx.getUserProfile({
      desc: "用于完善用户资料",
      success: (userRes) => {
        // 获取用户信息成功后，再调用login
        wx.login({
          success: (loginRes) => {
            if (loginRes.code) {
              // 发送到后端
              // wx.request({
              //   url: "/your-server/auth",
              //   data: {
              //     code: loginRes.code,
              //     userInfo: userRes.userInfo,
              //   },
              //   success: (res) => {
              //     if (res.data.openid) {
              //       getApp().globalData.isLogin = true;
              //       wx.setStorageSync("openid", res.data.openid);
              //       wx.showToast({ title: "登录成功" });
              //       wx.navigateBack();
              //     } else {
              //       wx.showToast({ title: res.data.msg || "登录失败" });
              //     }
              //   },
              //   fail: (err) => {
              //     wx.showToast({ title: "服务器连接失败", icon: "none" });
              //   },
              // });

              getApp().globalData.isLogin = true; //临时测试，待后端接口通了，删掉
            } else {
              wx.showToast({ title: "登录失败", icon: "none" });
            }
          },
          fail: (err) => {
            wx.showToast({ title: "获取登录凭证失败", icon: "none" });
          },
        });
      },
      fail: (err) => {
        // 用户拒绝授权处理
        wx.showModal({
          title: "提示",
          content: "您需要授权才能使用完整功能，是否重新授权？",
          confirmText: "去授权",
          cancelText: "暂不使用",
          success: (res) => {
            if (res.confirm) {
              // 用户再次确认，但这里不要递归调用login()
              // 应该向用户提示再次点击登录按钮
              wx.showToast({
                title: "请再次点击登录按钮",
                icon: "none",
              });
            }
          },
        });
      },
    });
  },

  // 在需要登录才能访问的页面中添加登录检查
  onLoad() {},

  // 查看隐私政策
  viewPrivacy() {
    wx.navigateTo({
      url: "/pages/privacy/privacy",
    });
  },

  // 合并协议页面跳转
  gotoProtocol(e) {
    const type = e.currentTarget.dataset.type; // "agreement" 或 "privacy"
    wx.navigateTo({ url: `/pages/${type}/${type}` });
  },
});

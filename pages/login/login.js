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
    console.log(e.detail);
    wx.login({
      success: (res) => {
        console.log("开始登录");
        console.log(res);
        wx.request({
          url: config.baseURL + "/api/auth/wechat/auth",
          method: "GET",
          data: {
            code: res.code,
          },
          dataType: "json",
          success: (res) => {
            console.log("获取授权成功");
            console.log(res.data);
            if (res.data.success) {
              wx.setStorageSync("openid", res.data.data);
              const app = getApp();
              wx.request({
                url: config.baseURL + "/api/auth/wechat/login",
                method: "GET",
                data: {
                  openid: res.data.data,
                  code: e.detail.code,
                },
                dataType: "json",
                success: (res) => {
                  app.globalData.isLogin = true;
                  app.globalData.userInfo = res.data.data;
                  wx.setStorageSync("userinfo", res.data.data);
                  console.log("登录成功");
                  console.log(res.data.data);
                },
                fail: (err) => {
                  console.log("登录失败" + err);
                },
              });
              wx.navigateBack();
            }
          },
          fail: (err) => {
            console.log("获取授权失败" + err);
          },
        });
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

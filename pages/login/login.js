const config = require("../../utils/config.js");

Page({
  data: {
    isAgree: false,
    appId: config.appId,
    appSecret: config.appSecret,
  },

  wechatAuth(e) {
    // console.log(e.detail.code); // 动态令牌，换取手机号
    // console.log(e.detail.errMsg); // 回调信息（成功失败都会返回）
    // console.log(e.detail.errno); // 错误码（失败时返回）
    // console.log(e.detail);
    wx.login({
      success: (res) => {
        console.log("开始登录");
        console.log("返回了wx.login的code",res.code);
        wx.request({
          url: config.baseURL + "/api/auth/wechat/auth",
          method: "GET",
          data: {
            code: res.code,
          },
          dataType: "json",
          success: (res) => {
            console.log("/api/auth/wechat/auth执行成功了",res.data);
            if (res.data.success) {
              console.log("==================");
              console.log(res.data.data);
              console.log(e.detail.code);
              wx.request({
                url: config.baseURL + "/api/auth/wechat/login",
                method: "GET",
                data: {
                  openid: res.data.data,
                  code: e.detail.code,
                },
                dataType: "json",
                success: (res) => {
                  wx.setStorageSync("userinfo", res.data.data);
                  console.log("登录成功");
                  console.log(res.data.data);
                },
                fail: (err) => {
                  console.log("登录失败" + err);
                },
              });
              wx.navigateBack();
            }else{
              console.log("获取授权失败" + res.data.message);
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

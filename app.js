// app.js
App({
  globalData: {
    userInfo: null,
    isLogin: false,
    token: "",
  },

  onLaunch() {
    // 检查登录状态
    this.checkLoginStatus();
  },

  checkLoginStatus() {
    const token = wx.getStorageSync("token");
    if (token) {
      this.globalData.isLogin = true;
      this.globalData.token = token;
      // 获取用户信息
      this.getUserInfo();
    }
  },

  getUserInfo() {
    // 从后端获取用户信息
    // ...
  },

  login() {
    return new Promise((resolve, reject) => {
      wx.login({
        success: (res) => {
          if (res.code) {
            // 发送 code 到后端换取 token
            // ...
            resolve(res);
          } else {
            reject(new Error("登录失败"));
          }
        },
        fail: reject,
      });
    });
  },
});

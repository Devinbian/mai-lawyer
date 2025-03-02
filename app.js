// app.js
const imageUtil = require('./utils/image.js');

App({
  globalData: {
    userInfo: null,
    isLogin: false,
    token: "",
  },

  onLaunch() {
    this.setTabBarIcons();
    // 检查登录状态
    this.checkLoginStatus();
  },

  setTabBarIcons() {
    const tabBarIcons = imageUtil.getCommonImages('tabBar');
    
    wx.setTabBarItem({
      index: 0,
      iconPath: tabBarIcons.home,
      selectedIconPath: tabBarIcons.homeActive
    });
    
    wx.setTabBarItem({
      index: 1,
      iconPath: tabBarIcons.expert,
      selectedIconPath: tabBarIcons.expertActive
    });
    
    wx.setTabBarItem({
      index: 2,
      iconPath: tabBarIcons.doc,
      selectedIconPath: tabBarIcons.docActive
    });
    
    wx.setTabBarItem({
      index: 3,
      iconPath: tabBarIcons.profile,
      selectedIconPath: tabBarIcons.profileActive
    });
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

// app.js
const imageUtil = require("./utils/image.js");

App({
  globalData: {
    userInfo: null,
    isLogin: false,
    token: "",
  },

  onLaunch() {
    // 延迟设置TabBar图标
    wx.nextTick(() => {
      this.setTabBarIcons();
    });

    // 异步检查登录状态
    setTimeout(() => {
      this.checkLoginStatus();
    }, 0);
  },

  setTabBarIcons() {
    // 预加载所有图标
    const tabBarIcons = imageUtil.getCommonImages(["tabBar", "default"]);

    // 批量设置TabBar图标
    Promise.all([
      wx.setTabBarItem({
        index: 0,
        iconPath: tabBarIcons.home,
        selectedIconPath: tabBarIcons.homeActive,
      }),
      wx.setTabBarItem({
        index: 1,
        iconPath: tabBarIcons.expert,
        selectedIconPath: tabBarIcons.expertActive,
      }),
      wx.setTabBarItem({
        index: 2,
        iconPath: tabBarIcons.doc,
        selectedIconPath: tabBarIcons.docActive,
      }),
      wx.setTabBarItem({
        index: 3,
        iconPath: tabBarIcons.profile,
        selectedIconPath: tabBarIcons.profileActive,
      }),
    ]).catch((err) => {
      console.error("设置TabBar图标失败:", err);
    });
  },

  checkLoginStatus() {
    try {
      const token = wx.getStorageSync("token");
      if (token) {
        this.globalData.isLogin = true;
        this.globalData.token = token;
        // 异步获取用户信息
        wx.nextTick(() => {
          this.getUserInfo();
        });
      }
    } catch (err) {
      console.error("检查登录状态失败:", err);
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

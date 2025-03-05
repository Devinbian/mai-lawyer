// app.js
const imageUtil = require("./utils/image.js");
import TencentCloudChat from "@tencentcloud/chat";
import TIMUploadPlugin from "tim-upload-plugin";
import TIMProfanityFilterPlugin from "tim-profanity-filter-plugin";
import { genTestUserSig } from "./debug/GenerateTestUserSig";

App({
  globalData: {
    userInfo: null,
    isLogin: false,
    token: "",
    config: {
      userID: "laywer2", // User ID
      SECRETKEY:
        "ba92e763ab7975718da625afa6f60465dee472f0e4524f2028f83e161e5e1f8b", // Your secretKey
      SDKAPPID: 1600075596, // Your SDKAppID
      EXPIRETIME: 604800,
    },
  },

  onLaunch() {
    wx.$TUIKit = TencentCloudChat.create({
      SDKAppID: this.globalData.config.SDKAPPID,
      
    });
    const userSig = genTestUserSig(this.globalData.config).userSig;

    console.log("==============onLaunch=================", userSig);

    wx.$chat_SDKAppID = this.globalData.config.SDKAPPID;
    wx.TencentCloudChat = TencentCloudChat;
    wx.$chat_userID = this.globalData.config.userID;
    wx.$chat_userSig = userSig;
    wx.$TUIKit.registerPlugin({ "tim-upload-plugin": TIMUploadPlugin });
    wx.$TUIKit.registerPlugin({
      "tim-profanity-filter-plugin": TIMProfanityFilterPlugin,
    });
    wx.$TUIKit.login({
      userID: this.globalData.config.userID,
      userSig,
    });

    // 监听系统级事件
    wx.$TUIKit.on(wx.TencentCloudChat.EVENT.SDK_READY, () => {
      console.log("TUIKit SDK_READY");
      // SDK 已经初始化完成，可以进行后续操作
    });

    // 延迟设置TabBar图标
    wx.nextTick(() => {
      this.setTabBarIcons();
    });

    // 异步检查登录状态
    setTimeout(() => {
      this.checkLoginStatus();
    }, 0);
  },

  onUnload() {
    wx.$TUIKit.off(wx.TencentCloudChat.EVENT.SDK_READY, this.onSDKReady, this);
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

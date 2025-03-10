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
      userID: "laywer3", // User ID
      SECRETKEY:
        "ba92e763ab7975718da625afa6f60465dee472f0e4524f2028f83e161e5e1f8b", // Your secretKey
      SDKAPPID: 1600075596, // Your SDKAppID
      EXPIRETIME: 604800,
    },
  },

  onLaunch() {
    this.initSDKInstance();

    this.checkLoginStatus();

    // 延迟设置TabBar图标
    wx.nextTick(() => {
      this.setTabBarIcons();
    });

    // 异步检查登录状态
    setTimeout(() => {
      this.checkLoginStatus();
    }, 0);

    this.enableShare();
  },

  initSDKInstance() {
    if (!wx.$TUIKit) {
      console.log("全局初始化 SDK 实例...");
      wx.$TUIKit = TencentCloudChat.create({
        SDKAppID: this.globalData.config.SDKAPPID,
      });

      // 注册插件
      wx.$TUIKit.registerPlugin({ "tim-upload-plugin": TIMUploadPlugin });
      wx.$TUIKit.registerPlugin({
        "tim-profanity-filter-plugin": TIMProfanityFilterPlugin,
      });

      // 设置日志级别
      wx.$TUIKit.setLogLevel(1);

      // 设置全局变量
      wx.TencentCloudChat = TencentCloudChat;
      wx.$chat_SDKAppID = this.globalData.config.SDKAPPID;
    }
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
    const openid = wx.getStorageSync("openid");
    if (openid) {
      wx.checkSession({
        success: () => {
          // 登录态有效
          this.globalData.isLogin = true;
        },
        fail: () => {
          // 登录态过期，清除存储
          wx.removeStorageSync("openid");
          this.globalData.isLogin = false;
        },
      });
    } else {
      this.globalData.isLogin = false;
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

  enableShare() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ["shareAppMessage", "shareTimeline"],
    });

    // 自定义分享内容
    this.onShareAppMessage = this.onShareAppMessage.bind(this);
    this.onShareTimeline = this.onShareTimeline.bind(this);
  },

  onShareAppMessage() {
    return {
      title: "邀请好友加入",
      imageUrl: this.data.userInfo.avatarUrl,
      path: "https://imgapi.cn/api.php?zd=mobile&fl=meizi&gs=images",
    };
  },

  onShareTimeline() {
    return {
      title: "我在小程序发现了这个好东西",
      imageUrl: "https://imgapi.cn/api.php?zd=mobile&fl=meizi&gs=images",
    };
  },

  // 分享成功事件
  bindShareSendSuccess(e) {
    wx.showToast({
      title: "分享成功！",
      icon: "success",
    });
  },
});

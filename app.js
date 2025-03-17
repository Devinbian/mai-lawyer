// app.js
import TencentCloudChat from "@tencentcloud/chat";
import TIMUploadPlugin from "tim-upload-plugin";
import TIMProfanityFilterPlugin from "tim-profanity-filter-plugin";
import { genTestUserSig } from "./debug/GenerateTestUserSig";
const imageUtil = require("./utils/image.js");
const config = require("./utils/config.js");

App({
  globalData: {
    userInfo: null,
    config: config.IM,
    isConnected: true,
    networkType: "wifi",
  },

  onLaunch() {
    console.log("=== App onLaunch ===");
    this.initSDKInstance();

    // 初始化网络状态监听
    console.log("初始化网络状态监听");
    this.networkStatusListeners = new Set(); // 初始化监听器集合
    this.checkNetworkStatus(); // 检查当前网络状态
    this.listenNetworkChange(); // 开始监听网络变化

    // this.checkLoginStatus();

    // 延迟设置TabBar图标
    wx.nextTick(() => {
      this.setTabBarIcons();
    });

    this.enableShare();
  },

  initSDKInstance() {
    if (!wx.$TUIKit) {
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
    const userInfo = wx.getStorageSync("userInfo");
    if (userInfo) {
      wx.checkSession({
        success: () => {
          // 登录态有效
          this.globalData.userInfo = userInfo;
        },
        fail: () => {
          // 登录态过期，清除存储
          wx.removeStorageSync("userInfo");
          wx.navigateTo({
            url: "/pages/login/login",
          });
        },
      });
    } else {
      wx.removeStorageSync("userInfo");
    }
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
      imageUrl: this.globalData.userInfo?.avatarUrl || "",
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

  // 检查当前网络状态
  checkNetworkStatus() {
    console.log("app.js 检查当前网络状态");
    wx.getNetworkType({
      success: (res) => {
        console.log("app.js 检查当前网络状态成功:", res);
        const networkType = res.networkType;
        const isConnected = networkType !== "none";
        console.log("app.js 当前网络状态:", { isConnected, networkType });
        this.setGlobalNetworkStatus(isConnected, networkType);
      },
      fail: (error) => {
        console.error("app.js 获取网络状态失败:", error);
      },
    });
  },

  // 监听网络状态变化
  listenNetworkChange() {
    console.log("app.js 开始监听网络状态变化");
    wx.onNetworkStatusChange((res) => {
      const isConnected = res.isConnected;
      const networkType = res.networkType;
      console.log("app.js 网络状态发生变化:", { isConnected, networkType });
      this.setGlobalNetworkStatus(isConnected, networkType);
    });
  },

  // 更新全局网络状态
  setGlobalNetworkStatus(isConnected, networkType) {
    console.log("app.js 更新全局网络状态:", { isConnected, networkType });
    this.globalData.isConnected = isConnected;
    this.globalData.networkType = networkType;

    // 触发所有注册的监听器
    if (this.networkStatusListeners) {
      console.log(`执行 ${this.networkStatusListeners.size} 个网络状态监听器`);
      this.networkStatusListeners.forEach((listener) => {
        try {
          listener(isConnected, networkType);
        } catch (error) {
          console.error("app.js 执行网络状态监听器出错：", error);
        }
      });
    }
  },

  // 添加网络状态监听器
  addNetworkStatusListener(callback) {
    if (!this.networkStatusListeners) {
      this.networkStatusListeners = new Set();
    }
    this.networkStatusListeners.add(callback);
  },

  // 移除网络状态监听器
  removeNetworkStatusListener(callback) {
    if (this.networkStatusListeners) {
      this.networkStatusListeners.delete(callback);
    }
  },
});

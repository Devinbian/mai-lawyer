// pages/chat/chat.js
import TencentCloudChat from "@tencentcloud/chat";
import TIMUploadPlugin from "tim-upload-plugin";
import { genTestUserSig } from "../../debug/GenerateTestUserSig";

Page({
  /**
   * 页面的初始数据
   */
  data: {
    config: {
      userID: "laywer2", // User ID
      SDKAPPID: 1600075596, // Your SDKAppID
      SECRETKEY:
        "ba92e763ab7975718da625afa6f60465dee472f0e4524f2028f83e161e5e1f8b",
      EXPIRETIME: 604800,
    },
    conversationID: "C2Claywer2",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log("==============options=================", options);
    this.setData({
      conversationID: options.conversationID,
    });

    // 检查登录状态并绑定事件
    this.checkLoginStatusAndInit();
  },

  checkLoginStatusAndInit() {
    if (wx.$TUIKit) {
      console.log("开始检查登录状态");
      // 先绑定事件监听
      this.bindTIMEvents();

      // 检查是否已经是 ready 状态
      if (wx.$TUIKit.isReady()) {
        console.log("SDK 已经是 ready 状态，直接初始化");
        this.initTUIKit();
      } else {
        console.log("SDK 未就绪，等待 ready 事件");
        // 如果未就绪，尝试重新登录
        const userSig = genTestUserSig(this.data.config).userSig;
        wx.$TUIKit
          .login({
            userID: this.data.config.userID,
            userSig,
          })
          .then(() => {
            console.log("重新登录成功");
          })
          .catch((error) => {
            console.error("登录失败：", error);
          });
      }
    } else {
      console.error("TUIKit 未初始化");
      wx.showToast({
        title: "聊天服务未准备好",
        icon: "none",
      });
    }

    wx.setStorage({
      key: "currentUserID",
      data: [],
    });
  },

  bindTIMEvents() {
    try {
      // 先解绑之前可能存在的事件监听
      wx.$TUIKit.off(
        wx.TencentCloudChat.EVENT.SDK_READY,
        this.onSDKReady,
        this,
      );
      wx.$TUIKit.off(wx.TencentCloudChat.EVENT.ERROR, this.onError, this);
      wx.$TUIKit.off(
        wx.TencentCloudChat.EVENT.KICKED_OUT,
        this.onKickedOut,
        this,
      );

      // 重新绑定事件
      wx.$TUIKit.on(wx.TencentCloudChat.EVENT.SDK_READY, this.onSDKReady, this);
      wx.$TUIKit.on(wx.TencentCloudChat.EVENT.ERROR, this.onError, this);
      wx.$TUIKit.on(
        wx.TencentCloudChat.EVENT.KICKED_OUT,
        this.onKickedOut,
        this,
      );
      console.log("TIM 事件绑定成功");
    } catch (error) {
      console.error("绑定 TIM 事件失败：", error);
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    console.log("done");
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时检查状态
    if (wx.$TUIKit && !wx.$TUIKit.isReady()) {
      console.log("页面显示时 SDK 未就绪，重新检查状态");
      this.checkLoginStatusAndInit();
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    wx.$TUIKit.logout();
    wx.$TUIKit.off(wx.TencentCloudChat.EVENT.SDK_READY, this.onSDKReady, this);
    wx.$TUIKit.off(wx.TencentCloudChat.EVENT.ERROR, this.onError, this);
    wx.$TUIKit.off(
      wx.TencentCloudChat.EVENT.KICKED_OUT,
      this.onKickedOut,
      this,
    );
  },

  initTUIKit() {
    console.log("开始初始化 TUIKit 组件");
    const TUIKit = this.selectComponent("#TUIKit");
    if (TUIKit) {
      try {
        // 确保在初始化前先获取会话信息
        wx.$TUIKit
          .getConversationProfile(this.data.conversationID)
          .then((res) => {
            console.log("获取会话信息成功：", res);
            TUIKit.init();
            console.log("TUIKit 组件初始化成功");
          })
          .catch((error) => {
            console.error("获取会话信息失败：", error);
            // 如果是会话不存在，也继续初始化
            if (error.code === 2301) {
              console.log("会话不存在，继续初始化");
              TUIKit.init();
            } else {
              wx.showToast({
                title: "获取会话信息失败",
                icon: "none",
              });
            }
          });
      } catch (error) {
        console.error("TUIKit 初始化失败：", error);
        wx.showToast({
          title: "聊天组件初始化失败",
          icon: "none",
        });
      }
    } else {
      console.error("找不到 TUIKit 组件");
      wx.showToast({
        title: "找不到聊天组件",
        icon: "none",
      });
    }
  },

  onSDKReady() {
    console.log("SDK Ready 事件触发，开始初始化组件");
    // SDK 就绪后再初始化组件
    this.initTUIKit();
  },

  onError(event) {
    console.error("SDK ERROR:", event);
    wx.showToast({
      title: "发生错误",
      icon: "none",
    });
  },

  onKickedOut(event) {
    console.log("被踢下线：", event);
    wx.showToast({
      title: "您的账号在其他设备登录",
      icon: "none",
    });
    setTimeout(() => {
      wx.navigateBack();
    }, 2000);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
});

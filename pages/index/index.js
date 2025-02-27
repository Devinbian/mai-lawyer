// index.js
const defaultAvatarUrl =
  "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0";

Page({
  data: {
    userInfo: null,
    messages: [],
    inputValue: "",
    suggestions: [
      "起诉状如何写",
      "恶意拖欠劳动工资，如何申请仲裁处理？",
      "律师费如何计算",
    ],
    loading: false,
  },

  onLoad() {
    // 添加欢迎消息
    this.addMessage({
      type: "ai",
      content: "您好，我是小麦，您的全天候智能法律顾问。请问有什么可以帮您？",
    });

    // 获取用户信息（如果已登录）
    const app = getApp();
    if (app.globalData.isLogin) {
      this.setData({
        userInfo: app.globalData.userInfo,
      });
    }
  },

  // 检查登录状态
  checkLogin() {
    const app = getApp();
    if (!app.globalData.isLogin) {
      wx.navigateTo({
        url: "/pages/login/login",
      });
      return false;
    }
    return true;
  },

  // 发送消息
  async handleSend() {
    if (!this.data.inputValue.trim()) return;

    // 发送消息前检查登录状态
    if (!this.checkLogin()) return;

    const userMessage = this.data.inputValue;
    this.setData({
      inputValue: "",
      loading: true,
    });

    // 添加用户消息
    this.addMessage({
      type: "user",
      content: userMessage,
    });

    try {
      // TODO: 调用AI接口获取回复
      const response = "这是AI的模拟回复...";

      // 添加AI回复
      this.addMessage({
        type: "ai",
        content: response,
      });
    } catch (error) {
      wx.showToast({
        title: "发送失败，请重试",
        icon: "none",
      });
    } finally {
      this.setData({ loading: false });
    }
  },

  // 点击建议问题
  handleTapSuggestion(e) {
    // 点击建议问题前检查登录状态
    if (!this.checkLogin()) return;

    const { text } = e.currentTarget.dataset;
    this.setData({ inputValue: text }, () => {
      this.handleSend();
    });
  },

  // 输入框变化
  onInput(e) {
    this.setData({
      inputValue: e.detail.value,
    });
  },

  // 添加消息到列表
  addMessage(message) {
    this.setData({
      messages: [...this.data.messages, message],
    });
  },

  // 调用AI接口
  async getAIResponse(message) {
    // TODO: 实现实际的AI接口调用
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve("这是AI的模拟回复，请实现实际的接口调用。");
      }, 1000);
    });
  },

  bindViewTap() {
    wx.navigateTo({
      url: "../logs/logs",
    });
  },
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;
    const { nickName } = this.data.userInfo;
    this.setData({
      "userInfo.avatarUrl": avatarUrl,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    });
  },
  onInputChange(e) {
    const nickName = e.detail.value;
    const { avatarUrl } = this.data.userInfo;
    this.setData({
      "userInfo.nickName": nickName,
      hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
    });
  },
  getUserProfile(e) {
    // 推荐使用wx.getUserProfile获取用户信息，开发者每次通过该接口获取用户个人信息均需用户确认，开发者妥善保管用户快速填写的头像昵称，避免重复弹窗
    wx.getUserProfile({
      desc: "展示用户信息", // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        console.log(res);
        this.setData({
          userInfo: res.userInfo,
          hasUserInfo: true,
        });
      },
    });
  },
});

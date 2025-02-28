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
    navHeight: 0,
    statusBarHeight: 20,
    keyboardHeight: 0,
    isKeyboardShow: false,
    scrollToView: "",
    messageList: [], // 用于存储消息列表
  },

  onLoad: function () {
    console.warn("页面加载 - 测试日志");

    // 直接尝试获取组件
    const nav = this.selectComponent("#customNav");
    console.log("直接获取导航组件：", nav);

    // 延迟获取组件
    setTimeout(() => {
      const nav2 = this.selectComponent("#customNav");
      console.log("延迟获取导航组件：", nav2);
    }, 1000);

    const app = getApp();
    // 添加欢迎消息
    this.addMessage({
      type: "ai",
      content: "您好，我是小麦，您的全天候智能法律顾问。请问有什么可以帮您？",
    });

    // 获取用户信息（如果已登录）
    if (app.globalData.isLogin) {
      this.setData({
        userInfo: app.globalData.userInfo,
      });
    }

    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      statusBarHeight: systemInfo.statusBarHeight,
    });
  },

  onReady: function () {
    console.log("页面ready");
  },

  onShow: function () {
    console.log("页面show");
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

  // 监听导航高度变化
  onNavHeight(e) {
    console.warn("收到导航高度:", e.detail.height);
    this.setData({
      navHeight: e.detail.height,
    });
  },

  // 输入框获得焦点
  onInputFocus(e) {
    const { height } = e.detail;
    // 键盘高度可能需要稍微调整以消除间距
    const adjustedHeight = height - 82; // 微调高度
    wx.nextTick(() => {
      this.setData({
        isKeyboardShow: true,
        keyboardHeight: adjustedHeight,
        // 使用绝对定位，确保紧贴键盘
        inputStyle: `position: fixed; left: 0; right: 0; bottom: ${adjustedHeight}px;`,
      });
    });

    this.scrollToBottom();
  },

  // 输入框失去焦点
  onInputBlur() {
    this.setData({
      isKeyboardShow: false,
      keyboardHeight: 0,
      inputStyle: "position: fixed; left: 0; right: 0; bottom: 0;",
    });
  },

  // 发送消息
  sendMessage() {
    if (!this.data.inputValue.trim()) return;

    // 这里添加发送消息的逻辑
    const message = {
      id: `msg_${Date.now()}`,
      content: this.data.inputValue,
      // 其他消息属性...
    };

    this.setData(
      {
        messageList: [...this.data.messageList, message],
        inputValue: "",
      },
      () => {
        this.scrollToBottom();
      },
    );
  },

  // 滚动到底部
  scrollToBottom() {
    const messages = this.data.messageList;
    if (messages.length > 0) {
      const lastMessageId = messages[messages.length - 1].id;
      this.setData({
        scrollToView: lastMessageId,
      });
    }
  },

  // scroll-view 滚动到底部时触发
  onScrollToLower() {
    console.log("已滚动到底部");
  },

  // scroll-view 滚动时触发
  onScroll(e) {
    // 可以记录滚动位置
    const scrollTop = e.detail.scrollTop;
  },
});

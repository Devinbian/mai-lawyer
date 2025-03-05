const imageUtils = require("../../utils/image.js");
// index.js
// const defaultAvatarUrl =
//   "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0";

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
    messageList: [], // 消息列表
    imgUrls: null,
    navBarHeight: 44,
  },

  onLoad: function () {
    // 根据设备像素比选择合适的图片
    this.setImagesByPixelRatio();

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

    // 获取窗口信息
    const windowInfo = wx.getWindowInfo();
    this.setData({
      statusBarHeight: windowInfo.statusBarHeight,
      navBarHeight: windowInfo.navigationBarHeight || 44,
    });
  },

  onReady: function () {
    console.log("页面ready");
  },

  onShow: function () {
    console.log("页面show");
  },

  // 根据设备像素比选择图片
  setImagesByPixelRatio() {
    this.setData({
      imgUrls: imageUtils.getCommonImages(["index", "default"]),
    });
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
  sendMessage() {
    if (!this.data.inputValue.trim()) return;

    const userMessage = {
      id: Date.now().toString(), // 简化ID格式
      type: "user",
      content: this.data.inputValue,
      time: this.formatTime(new Date()),
    };

    this.setData({
      messageList: [...this.data.messageList, userMessage],
      inputValue: "",
      scrollToView: `msg${userMessage.id}`,
    });

    // 模拟AI回复
    setTimeout(() => {
      const aiMessage = {
        id: Date.now().toString(),
        type: "ai",
        content: this.getAIResponse(userMessage.content),
        time: this.formatTime(new Date()),
      };

      this.setData({
        messageList: [...this.data.messageList, aiMessage],
        scrollToView: `msg${aiMessage.id}`,
      });
    }, 500);
  },

  // 添加消息到列表
  addMessage(message) {
    const messageId = Date.now().toString();
    const newMessage = {
      ...message,
      id: messageId,
    };

    this.setData({
      messageList: [...this.data.messageList, newMessage],
      scrollToView: `msg${messageId}`,
    });
  },

  // 格式化时间
  formatTime(date) {
    const hour = date.getHours();
    const minute = date.getMinutes();
    return `${hour.toString().padStart(2, "0")}:${minute
      .toString()
      .padStart(2, "0")}`;
  },

  // 模拟AI回复
  getAIResponse(userInput) {
    const responses = [
      "我明白您的问题，让我为您解答。",
      "这是一个很好的问题，我的建议是...",
      "根据相关法律法规，我建议您...",
      "您说得对，关于这一点，我补充几点建议...",
      "这个问题比较复杂，需要考虑以下几个方面...",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  },

  // 输入框内容变化
  onInput(e) {
    this.setData({
      inputValue: e.detail.value,
    });
  },

  // 点击建议问题
  handleTapSuggestion(e) {
    if (!this.checkLogin()) return;

    const { text } = e.currentTarget.dataset;
    this.setData(
      {
        inputValue: text,
      },
      () => {
        this.sendMessage();
        // 点击建议问题后也需要滚动
        this.scrollToBottom();
      },
    );
  },

  bindViewTap() {
    wx.navigateTo({
      url: "../logs/logs",
    });
  },
  // onChooseAvatar(e) {
  //   const { avatarUrl } = e.detail;
  //   const { nickName } = this.data.userInfo;
  //   this.setData({
  //     "userInfo.avatarUrl": avatarUrl,
  //     hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
  //   });
  // },
  // onInputChange(e) {
  //   const nickName = e.detail.value;
  //   const { avatarUrl } = this.data.userInfo;
  //   this.setData({
  //     "userInfo.nickName": nickName,
  //     hasUserInfo: nickName && avatarUrl && avatarUrl !== defaultAvatarUrl,
  //   });
  // },
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
    const adjustedHeight = height - 80;

    this.setData(
      {
        isKeyboardShow: true,
        keyboardHeight: adjustedHeight,
        inputStyle: `position: fixed; left: 0; right: 0; bottom: ${adjustedHeight}px; background: #fff;`,
      },
      () => {
        // 延迟执行滚动
        setTimeout(() => {
          const messages = this.data.messageList;
          if (messages.length > 0) {
            const lastMessage = messages[messages.length - 1];
            this.setData({
              scrollToView: `msg${lastMessage.id}`,
            });
          }
        }, 300);
      },
    );
  },

  // 输入框失去焦点
  onInputBlur() {
    this.setData(
      {
        isKeyboardShow: false,
        keyboardHeight: 0,
        inputStyle: "position: fixed; left: 0; right: 0; bottom: 0;",
      },
      () => {
        // 键盘收起后也需要调整滚动位置
        setTimeout(() => {
          const messages = this.data.messageList;
          if (messages.length > 0) {
            const lastMessageId = messages[messages.length - 1].id;
            this.setData({
              scrollToView: lastMessageId,
            });
          }
        }, 100);
      },
    );
  },

  // 滚动到底部的方法
  scrollToBottom() {
    const query = wx.createSelectorQuery();
    query
      .select("#scrollView")
      .node()
      .exec((res) => {
        const scrollView = res[0].node;
        scrollView.scrollTo({
          top: 99999, // 一个足够大的数字，确保滚动到底部
          behavior: "auto",
        });
      });
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

const imageUtils = require("../../utils/image.js");
const util = require("../../utils/util.js");

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
    isAiResponding: false,
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

    this.buffer = ""; // 初始化buffer为实例属性
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
  async sendMessage() {
    const userInput = this.data.inputValue.trim();
    if (!userInput) return;

    this.setData({
      inputValue: "",
      isAiResponding: true,
    });

    try {
      await this.getAIStreamResponse(userInput);
    } catch (error) {
      console.error("获取AI响应失败:", error);

      // 更新最后一条AI消息为错误提示
      const messages = this.data.messages;
      for (let i = messages.length - 1; i >= 0; i--) {
        if (messages[i].type === "ai") {
          messages[i].content = "抱歉，我暂时无法回答您的问题，请稍后再试。";
          this.setData({ messages });
          break;
        }
      }

      wx.showToast({
        title: "网络请求失败",
        icon: "none",
      });
    }
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
  getAIStreamResponse(userInput) {
    return new Promise((resolve, reject) => {
      this.buffer = ""; // 重置缓冲区
      let fullResponse = "";

      wx.showLoading({ title: "思考中...", mask: true });

      // // 创建用户消息
      this.addMessage({
        type: "user",
        content: userInput,
        time: this.formatTime(new Date()),
      });

      // 添加空的AI消息
      this.addMessage({
        type: "ai",
        content: "",
        time: this.formatTime(new Date()),
      });

      const requestTask = wx.request({
        url: "http://218.78.129.237:8081/api/aichat/stream",
        method: "POST",
        enableChunked: true,
        header: {
          "Content-Type": "application/json",
        },
        data: {
          prompt: userInput,
        },
        success: (res) => {
          console.log("请求完成");
          resolve(fullResponse);
        },
        fail: (err) => {
          console.error("请求失败:", err);
          reject(err);
        },
        complete: () => {
          wx.hideLoading();
          this.setData({ isAiResponding: false });
        },
      });

      // 处理流式数据
      requestTask.onChunkReceived((res) => {
        try {
          // 获取并解码数据块
          let chunk = "";
          console.log("res.data类型:", typeof res.data);

          if (typeof res.data === "string") {
            chunk = res.data;
          } else if (res.data instanceof ArrayBuffer) {
            // 使用我们定义的辅助函数
            chunk = util.arrayBufferToString(res.data);

            // 如果数据是UTF-8编码的，可能需要额外处理
            try {
              // 尝试解码为JSON，如果成功则说明是正确的UTF-8字符串
              JSON.parse(chunk);
            } catch (e) {
              // 如果解析失败，可能是编码问题，尝试其他解码方法
              console.warn("JSON解析失败，尝试其他解码方法");
            }
          }

          console.log("解析后数据块:", chunk);

          // 处理数据块
          this.processDataChunk(chunk);
        } catch (error) {
          console.error("处理数据块失败:", error);
        }
      });
    });
  },

  // 处理数据块
  processDataChunk(chunk) {
    console.log("处理数据块:", chunk);
    this.buffer += chunk;

    let extractedContent = this.extractJsonObjects();
    console.log("提取的内容:", extractedContent);

    if (extractedContent) {
      console.log("准备更新AI消息");
      const messageList = this.data.messageList; // 使用正确的变量名
      console.log("当前消息列表:", messageList);

      let updated = false;
      for (let i = messageList.length - 1; i >= 0; i--) {
        if (messageList[i].type === "ai") {
          console.log("找到AI消息，索引:", i);
          messageList[i].content += extractedContent;
          updated = true;
          break;
        }
      }

      if (updated) {
        console.log("更新消息列表");
        this.setData({ messageList }); // 更新正确的变量
      } else {
        console.warn("未找到AI消息，无法更新");
      }

      this.scrollToBottom();
    } else {
      console.log("没有提取到内容");
    }
  },

  // 从缓冲区提取完整的JSON对象
  extractJsonObjects() {
    let extractedText = "";

    // 分割可能的多个JSON对象（以分号或换行符分隔）
    const parts = this.buffer.split(/;|\n/).filter((part) => part.trim());

    let processedParts = [];

    for (let part of parts) {
      part = part.trim();
      if (!part) continue;

      console.log("处理部分:", part);

      // 确保它是一个以 data: 开头的JSON对象
      if (part.startsWith("data:{") && part.endsWith("}")) {
        try {
          // 去掉前缀 "data:" 再解析
          const jsonStr = part.substring(5); // "data:".length = 5
          console.log("去掉前缀后:", jsonStr);

          const jsonObj = JSON.parse(jsonStr);
          console.log("解析的JSON:", jsonObj);

          // 只处理包含response字段的对象
          if (jsonObj.response !== undefined) {
            extractedText += jsonObj.response;
            processedParts.push(part);
            console.log("提取的响应:", jsonObj.response);
          }

          // 检查是否流结束
          if (jsonObj.done === true) {
            console.log("流结束，原因:", jsonObj.done_reason);
            processedParts.push(part);
          }
        } catch (e) {
          console.error("JSON解析失败:", e, part);
        }
      }
    }

    // 从缓冲区中移除已处理的部分
    for (const part of processedParts) {
      this.buffer = this.buffer.replace(part + ";", "").replace(part, "");
    }

    this.buffer = this.buffer.trim();
    console.log("提取的文本:", extractedText);
    return extractedText;
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

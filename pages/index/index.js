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
    currentTypingMessage: "", // 当前正在打字的消息
    isTyping: false, // 是否正在打字
    typingSpeed: 50, // 打字速度（毫秒）
    userNickname: "", // 用户昵称
  },

  onLoad: function () {
    // 根据设备像素比选择合适的图片
    this.setImagesByPixelRatio();
    const app = getApp();

    // 获取用户信息
    if (app.globalData.isLogin) {
      this.setData({
        userInfo: app.globalData.userInfo,
        userNickname: app.globalData.userInfo.nickName || "用户",
      });
    } else {
      this.setData({
        userNickname: "用户",
      });
    }

    // 获取缓存的聊天记录
    this.loadChatHistory();

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

  // 加载聊天记录
  loadChatHistory() {
    const chatHistory = wx.getStorageSync("chatHistory") || [];
    this.setData(
      {
        messageList: chatHistory,
      },
      () => {
        // 加载历史记录后滚动到最后一条消息
        this.scrollToBottom();
      },
    );
  },

  // 保存聊天记录
  saveChatHistory() {
    wx.setStorageSync("chatHistory", this.data.messageList);
  },

  // 长按消息处理函数
  handleLongPress(e) {
    const { index } = e.currentTarget.dataset;
    // 更新消息列表，显示当前消息的菜单
    const messageList = this.data.messageList.map((msg, i) => ({
      ...msg,
      showMenu: i === index,
    }));
    this.setData({ messageList });

    // 点击空白处关闭菜单
    this.closeMenuTimeout = setTimeout(() => {
      this.closeAllMenus();
    }, 3000); // 3秒后自动关闭
  },

  // 关闭所有菜单
  closeAllMenus() {
    const messageList = this.data.messageList.map((msg) => ({
      ...msg,
      showMenu: false,
    }));
    this.setData({ messageList });
  },

  // 复制单条消息
  handleCopy(e) {
    const { content } = e.currentTarget.dataset;
    wx.setClipboardData({
      data: content,
      success: () => {
        wx.showToast({
          title: "复制成功",
          icon: "success",
          duration: 1500,
        });
        this.closeAllMenus();
      },
    });
  },

  // 删除消息
  handleDelete(e) {
    const { index } = e.currentTarget.dataset;
    wx.showModal({
      title: "提示",
      content: "确定要删除这条消息吗？",
      success: (res) => {
        if (res.confirm) {
          const messageList = [...this.data.messageList];
          messageList.splice(index, 1);
          this.setData({ messageList }, () => {
            this.saveChatHistory();
            wx.showToast({
              title: "删除成功",
              icon: "success",
              duration: 1500,
            });
          });
        }
        this.closeAllMenus();
      },
    });
  },

  // 页面触摸开始时关闭菜单
  onPageTouch() {
    this.closeAllMenus();
  },

  // 发送消息
  async sendMessage() {
    if (!this.checkLogin()) return;

    const userInput = this.data.inputValue.trim();
    if (!userInput) return;

    this.setData({
      inputValue: "",
      isAiResponding: true,
    });

    try {
      // 创建用户消息
      this.addMessage({
        type: "user",
        content: userInput,
        time: this.formatTime(new Date()),
      });

      // 先添加一个空的AI消息，不显示思考状态
      const aiMessageId = Date.now().toString();
      const aiMessage = {
        type: "ai",
        content: "",
        time: this.formatTime(new Date()),
        isStreaming: true,
        isThinking: false,
        id: aiMessageId,
        nickname: "小麦", // 添加 AI 的昵称
      };

      const messageList = [...this.data.messageList, aiMessage];
      this.setData({ messageList });

      try {
        const response = await this.getAIStreamResponse(userInput);
        if (!response) {
          // 如果响应开始但没有内容，显示思考状态
          const updatedMessageList = this.data.messageList.map((msg) => {
            if (msg.id === aiMessageId) {
              return { ...msg, isThinking: true };
            }
            return msg;
          });
          this.setData({ messageList: updatedMessageList });
        }
      } catch (error) {
        console.error("获取AI响应失败:", error);
        // 更新最后一条AI消息为错误提示
        const messageList = this.data.messageList;
        for (let i = messageList.length - 1; i >= 0; i--) {
          if (messageList[i].type === "ai") {
            messageList[i].content =
              "抱歉，我暂时无法回答您的问题，请稍后再试。";
            messageList[i].isThinking = false;
            this.setData({ messageList });
            this.saveChatHistory();
            break;
          }
        }

        wx.showToast({
          title: "网络请求失败",
          icon: "none",
        });
      }
    } catch (error) {
      console.error("发送消息失败:", error);
    } finally {
      this.setData({ isAiResponding: false });
    }
  },

  // 添加消息到列表
  addMessage(message) {
    const messageId = Date.now().toString();
    const newMessage = {
      ...message,
      id: messageId,
      isThinking: message.type === "ai" && message.isThinking, // 只在AI响应且明确设置isThinking时显示
      nickname: message.type === "ai" ? "小麦" : this.data.userNickname,
      time: message.time || this.formatTime(new Date()),
    };

    // 创建新的消息列表
    const messageList = [...this.data.messageList, newMessage];

    // 更新状态并滚动
    this.setData(
      {
        messageList,
      },
      () => {
        // 使用nextTick确保DOM更新后再滚动
        wx.nextTick(() => {
          // 增加延迟时间，确保内容完全渲染
          setTimeout(() => {
            this.setData({
              scrollToView: `msg${messageId}`,
            });
          }, 300);
        });
      },
    );

    // 保存到缓存
    this.saveChatHistory();
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
      let isComplete = false;

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
          if (!isComplete) {
            console.warn("请求完成但流未结束");
          }
          resolve(fullResponse);
        },
        fail: (err) => {
          console.error("请求失败:", err);
          reject(err);
        },
        complete: () => {
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
            // 直接使用 arrayBufferToString 转换
            chunk = util.arrayBufferToString(res.data);
          }

          console.log("解析后数据块:", chunk);

          // 处理数据块
          const { content, done } = this.processDataChunk(chunk);
          if (content) {
            fullResponse += content;
          }
          if (done) {
            isComplete = true;
          }
        } catch (error) {
          console.error("处理数据块失败:", error);
        }
      });
    });
  },

  // 处理数据块
  processDataChunk(chunk) {
    // 确保 chunk 是字符串
    if (typeof chunk !== "string") {
      console.warn("收到非字符串数据块，跳过处理");
      return { content: "", done: false };
    }

    // 添加数据到缓冲区
    this.buffer += chunk;

    // 提取并处理完整的JSON对象
    const { content, done } = this.extractJsonObjects();
    if (content) {
      const messageList = this.data.messageList;
      // 找到最后一条AI消息
      for (let i = messageList.length - 1; i >= 0; i--) {
        if (messageList[i].type === "ai" && messageList[i].isStreaming) {
          // 创建新的消息列表，避免直接修改原数组
          const updatedMessageList = [...messageList];
          const currentMessage = { ...updatedMessageList[i] };

          // 更新消息内容和状态
          currentMessage.content = currentMessage.content + content;
          currentMessage.isThinking = false; // 一旦有内容就关闭思考指示器

          updatedMessageList[i] = currentMessage;

          // 更新状态并滚动
          this.setData(
            {
              messageList: updatedMessageList,
            },
            () => {
              // 使用nextTick确保DOM更新后再滚动
              wx.nextTick(() => {
                // 增加延迟时间，确保内容完全渲染
                setTimeout(() => {
                  this.setData({
                    scrollToView: `msg${currentMessage.id}`,
                  });
                }, 300);
              });
            },
          );
          break;
        }
      }
    }

    return { content, done };
  },

  // 从缓冲区提取完整的JSON对象
  extractJsonObjects() {
    let extractedText = "";
    let isDone = false;

    // 按行分割数据，并过滤掉空行
    const lines = this.buffer.split("\n").filter((line) => line.trim());

    for (const line of lines) {
      let jsonStr = line;

      // 处理带有 data: 前缀的行
      if (line.startsWith("data:")) {
        jsonStr = line.substring(5).trim();
      }

      // 跳过空字符串
      if (!jsonStr) continue;

      try {
        // 尝试解析 JSON
        const jsonObj = JSON.parse(jsonStr);

        // 处理响应内容
        if (jsonObj.response !== undefined) {
          extractedText += jsonObj.response;
        }

        // 检查是否结束
        if (jsonObj.done === true) {
          isDone = true;
        }
      } catch (e) {
        // 如果解析失败，可能是数据不完整，跳过这一行
        console.warn("跳过无效的 JSON 数据:", line);
        continue;
      }
    }

    // 清理已处理的数据
    this.buffer = this.buffer
      .split("\n")
      .filter((line) => !line.trim()) // 只保留空行
      .join("\n")
      .trim();

    // 如果流结束，更新最后一条AI消息的状态
    if (isDone) {
      const messageList = this.data.messageList;
      // 创建新的消息列表，避免直接修改原数组
      const updatedMessageList = [...messageList];
      for (let i = updatedMessageList.length - 1; i >= 0; i--) {
        if (updatedMessageList[i].type === "ai") {
          updatedMessageList[i] = {
            ...updatedMessageList[i],
            isThinking: false,
            isStreaming: false,
          };
          this.setData({ messageList: updatedMessageList });
          break;
        }
      }
    }

    return { content: extractedText, done: isDone };
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
    const adjustedHeight = height - 86;

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
            const lastMessage = messages[messages.length - 1];
            this.setData({
              scrollToView: `msg${lastMessage.id}`,
            });
          }
        }, 300);
      },
    );
  },

  // 滚动到底部的方法
  scrollToBottom() {
    const messageList = this.data.messageList;
    if (messageList.length > 0) {
      const lastMessageId = messageList[messageList.length - 1].id;
      // 使用nextTick确保DOM更新后再滚动
      wx.nextTick(() => {
        // 增加延迟时间，确保内容完全渲染
        setTimeout(() => {
          this.setData({
            scrollToView: `msg${lastMessageId}`,
          });
        }, 300);
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

  // 获取当前时间
  getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  },
});

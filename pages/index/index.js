const config = require("../../utils/config.js");
const imageUtils = require("../../utils/image.js");
const util = require("../../utils/util.js");

Page({
  data: {
    userInfo: null, // 用户信息，用于登录检查
    // messages: [], // 已被 messageList 替代，不再使用
    inputValue: "", // 输入框的值
    showSuggestions: true, // 是否显示建议问题
    suggestions: [
      "起诉状如何写",
      "恶意拖欠劳动工资，如何申请仲裁处理？",
      "律师费如何计算",
    ],
    // loading: false, // 已被 isLoading 替代，不再使用
    navHeight: 0, // 导航栏高度
    statusBarHeight: 20, // 状态栏高度
    keyboardHeight: 0, // 键盘高度
    isKeyboardShow: false, // 键盘是否显示
    scrollToView: "", // 要滚动到的消息ID
    messageList: [], // 消息列表
    imgUrls: null, // 图片资源URL
    navBarHeight: 44, // 导航栏高度
    isAiResponding: false, // AI是否正在响应
    // currentTypingMessage: "", // 当前正在打字的消息
    // isTyping: false, // 是否正在打字
    // typingSpeed: 50, // 打字速度（毫秒）
    userNickname: "", // 用户昵称
    showScrollBtn: false, // 是否显示滚动按钮
    scrollTop: 0, // 滚动位置
    isAutoScrolling: false, // 是否正在自动滚动
    buffer: "", // 数据缓冲区
    documentTypes: [
      {
        id: 1,
        name: "起诉状",
        icon: "case",
        type: "lawsuit",
      },
      {
        id: 2,
        name: "申请文书",
        icon: "document",
        type: "application",
      },
      {
        id: 3,
        name: "通用文书",
        icon: "document",
        type: "general",
      },
    ],
    pageSize: 10, // 每页显示的消息数量，改为10条
    currentPage: 1, // 当前页码
    totalPages: 1, // 总页数
    isLoading: false, // 是否正在加载更多
    hasMoreData: true, // 是否还有更多数据
    maxMessageCount: 50, // 最大消息数量限制
  },

  onLoad: function () {
    console.log("++++++++++++++++index++++++++++++++++");
    const userInfo = wx.getStorageSync("userInfo");
    console.log(userInfo);

    this.setData({
      userInfo: userInfo,
      userNickname: userInfo.name || "用户",
      imgUrls: imageUtils.getCommonImages([
        "index",
        "default",
        "expertsDetail",
      ]),
    });

    // 获取缓存的聊天记录时进行数量限制
    this.loadLatestChatHistory();

    // // 获取窗口信息
    // const windowInfo = wx.getWindowInfo();
    // this.setData({
    //   statusBarHeight: windowInfo.statusBarHeight,
    //   navBarHeight: windowInfo.navigationBarHeight || 44,
    // });
  },

  // 检查登录状态
  checkLogin() {
    console.log("++++++++++++++++checkLogin++++++++++++++++");
    console.log(typeof this.data.userInfo);
    console.log(this.data.userInfo);
    const userInfo = wx.getStorageSync("userInfo");
    if (!this.data.userInfo || !userInfo) {
      wx.navigateTo({
        url: "/pages/login/login",
      });
      return false;
    }
    return true;
  },

  // 加载最新的聊天记录
  loadLatestChatHistory() {
    try {
      const chatHistory = wx.getStorageSync("chatHistory") || [];
      const totalMessages = chatHistory.length;
      const totalPages = Math.ceil(totalMessages / this.data.pageSize);

      // 从最后一页开始加载
      const startIndex = Math.max(0, totalMessages - this.data.pageSize);
      const initialMessages = chatHistory.slice(startIndex);

      wx.nextTick(() => {
        this.setData(
          {
            messageList: initialMessages,
            currentPage: 1,
            totalPages: totalPages,
            hasMoreData: totalPages > 1,
          },
          () => {
            this.scrollToBottom(false);
          },
        );
      });
    } catch (error) {
      console.error("加载历史记录失败:", error);
    }
  },

  // 保存聊天记录
  saveChatHistory() {
    // 使用防抖优化存储频率
    if (this._saveHistoryTimer) {
      clearTimeout(this._saveHistoryTimer);
    }

    this._saveHistoryTimer = setTimeout(() => {
      const messageList = this.data.messageList;
      // 只存储必要的字段
      const simplifiedList = messageList.map((msg) => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        time: msg.time,
        nickname: msg.nickname,
        isCard: msg.isCard,
        cardData: msg.cardData,
      }));
      wx.setStorageSync("chatHistory", simplifiedList);
    }, 1000);
  },

  // 长按消息处理函数
  handleLongPress(e) {
    const { index } = e.currentTarget.dataset;
    // 更新消息列表，显示当前消息的菜单
    const messageList = this.data.messageList.map((msg, i) => ({
      ...msg,
      showMenu: i === index,
    }));
    this.setData({
      messageList,
    });

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
    this.setData({
      messageList,
    });
  },

  // 复制单条消息
  handleCopy(e) {
    const { content } = e.currentTarget.dataset;
    wx.setClipboardData({
      data: content,
      success: () => {
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
          this.setData(
            {
              messageList,
            },
            () => {
              this.saveChatHistory();
              this.closeAllMenus();
            },
          );
        } else {
          this.closeAllMenus();
        }
      },
    });
  },

  // 页面触摸开始时关闭菜单
  onPageTouch() {
    this.closeAllMenus();
  },

  // 检查消息文本安全
  checkMessage(message) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: config.baseURL + "/api/aichat/textcheck",
        method: "POST",
        data: {
          prompt: message,
        },
        success: (result) => {
          if (result.data.success) {
            resolve(result.data.data);
          } else {
            resolve("Normal");
          }
        },
        fail: (err) => {
          reject(err);
        },
      });
    });
  },

  // 发送消息
  async sendMessage() {
    if (!this.checkLogin()) return;
    if (this.data.isAiResponding) return; // 防止重复发送

    const userInput = this.data.inputValue.trim();
    if (!userInput) return;

    const checkValue = await this.checkMessage(userInput);
    if (checkValue !== "Normal") {
      wx.showToast({
        title: "提问中含有违规词",
        icon: "none",
      });
      return;
    }

    try {
      // 检查消息类型并分发到不同的处理函数
      if (userInput.includes("起诉状是什么")) {
        await this.handleWhatIsLawsuitResponse(userInput); // 传入userInput
        this.setData({ inputValue: "" }); // 移到这里清空输入框
        return;
      } else if (
        userInput.includes("生成起诉状") ||
        userInput.includes("起诉状生成")
      ) {
        await this.handleLawsuitResponse(userInput);
        this.setData({ inputValue: "" }); // 移到这里清空输入框
        return;
      }

      this.setData({
        inputValue: "", // 其他情况下的清空输入框
        isAiResponding: true,
      });

      // 创建用户消息
      const messageId = Date.now().toString();
      const userMessage = {
        id: messageId,
        type: "user",
        content: userInput,
        time: util.formatTime(new Date()),
        nickname: this.data.userNickname,
      };

      // 使用一次setData添加用户消息
      await this.addMessage(userMessage);
      this.scrollToBottom();
      this.saveChatHistory();

      // 创建AI消息
      const aiMessageId = Date.now().toString();
      const aiMessage = {
        id: aiMessageId,
        type: "ai",
        content: "",
        time: util.formatTime(new Date()),
        isStreaming: true,
        isThinking: false,
        nickname: "小迈",
      };

      // 使用一次setData添加AI消息
      await this.addMessage(aiMessage);
      this.scrollToBottom();

      try {
        const response = await this.getAIStreamResponse(userInput);
        if (!response) {
          this.updateAIMessage(aiMessageId, { isThinking: true });
        }
      } catch (error) {
        console.error("获取AI响应失败:", error);
        this.updateAIMessage(aiMessageId, {
          content: "抱歉，我暂时无法回答您的问题，请稍后再试。",
          isThinking: false,
        });

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

  // 更新AI消息的辅助方法
  updateAIMessage(messageId, updates) {
    const messageList = this.data.messageList.map((msg) => {
      if (msg.id === messageId) {
        return { ...msg, ...updates };
      }
      return msg;
    });

    this.setData({ messageList }, () => {
      this.saveChatHistory();
    });
  },

  // 获取AI流式响应
  getAIStreamResponse(userInput) {
    return new Promise((resolve, reject) => {
      this.data.buffer = ""; // 重置缓冲区
      let fullResponse = "";
      let isComplete = false;

      const requestTask = wx.request({
        url: config.baseURL + "/api/aichat/stream",
        method: "POST",
        enableChunked: true,
        header: {
          "Content-Type": "application/json",
        },
        data: {
          prompt: userInput,
        },
        success: (res) => {
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
          this.setData({
            isAiResponding: false,
          });
        },
      });

      // 处理流式数据
      requestTask.onChunkReceived((res) => {
        try {
          // 获取并解码数据块
          let chunk = "";
          if (typeof res.data === "string") {
            chunk = res.data;
          } else if (res.data instanceof ArrayBuffer) {
            chunk = util.arrayBufferToString(res.data);
          }

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

  // 优化的消息添加方法
  addMessage(message) {
    return new Promise((resolve) => {
      // 使用数据路径方式更新
      const index = this.data.messageList.length;
      const updateData = {};
      updateData[`messageList[${index}]`] = message;

      // 更新总页数和分页状态
      const chatHistory = wx.getStorageSync("chatHistory") || [];
      const totalMessages = chatHistory.length + 1; // 加1是因为要添加新消息
      const totalPages = Math.ceil(totalMessages / this.data.pageSize);

      updateData.totalPages = totalPages;
      // 如果在第一页，直接更新消息列表
      if (this.data.currentPage === 1) {
        wx.nextTick(() => {
          this.setData(updateData, () => {
            // 使用节流进行存储
            if (!this._saveTimer) {
              this._saveTimer = setTimeout(() => {
                this.saveChatHistory();
                this._saveTimer = null;
              }, 1000);
            }
            resolve();
          });
        });
      } else {
        // 如果不在第一页，需要重新加载第一页
        this.setData(
          {
            currentPage: 1,
            messageList: [message],
            hasMoreData: totalPages > 1,
          },
          () => {
            if (!this._saveTimer) {
              this._saveTimer = setTimeout(() => {
                this.saveChatHistory();
                this._saveTimer = null;
              }, 1000);
            }
            resolve();
          },
        );
      }
    });
  },

  // 处理数据块
  processDataChunk(chunk) {
    if (typeof chunk !== "string") {
      console.warn("收到非字符串数据块，跳过处理");
      return { content: "", done: false };
    }

    this.data.buffer += chunk;
    const { content, done } = this.extractJsonObjects();

    if (content) {
      // 使用缓存找到最后一条AI消息
      if (!this._lastAiMessageIndex) {
        const messageList = this.data.messageList;
        for (let i = messageList.length - 1; i >= 0; i--) {
          if (messageList[i].type === "ai" && messageList[i].isStreaming) {
            this._lastAiMessageIndex = i;
            break;
          }
        }
      }

      // 使用缓存的索引直接更新消息
      if (this._lastAiMessageIndex !== undefined) {
        // 使用本地变量累积内容，减少setData调用
        if (!this._accumulatedContent) {
          this._accumulatedContent =
            this.data.messageList[this._lastAiMessageIndex].content || "";
        }
        this._accumulatedContent += content;

        // 使用计数器控制更新频率
        if (!this._updateCounter) this._updateCounter = 0;
        this._updateCounter++;

        // 每累积2次内容就更新一次界面，使更新更及时
        if (this._updateCounter >= 2) {
          const updateData = {};
          updateData[`messageList[${this._lastAiMessageIndex}].content`] =
            this._accumulatedContent;
          updateData[
            `messageList[${this._lastAiMessageIndex}].isThinking`
          ] = false;

          // 使用Promise确保状态更新完成
          new Promise((resolve) => {
            this.setData(updateData, () => {
              // 只在非显示滚动按钮时执行滚动
              if (!this.data.showScrollBtn && !this._isScrolling) {
                this._isScrolling = true;
                this.handleScrollToBottom();
                setTimeout(() => {
                  this._isScrolling = false;
                  resolve();
                }, 300);
              } else {
                resolve();
              }
            });
          });

          this._updateCounter = 0;
        }
      }
    }

    if (done) {
      // 清理缓存
      if (this._accumulatedContent) {
        const updateData = {};
        updateData[`messageList[${this._lastAiMessageIndex}].content`] =
          this._accumulatedContent;
        updateData[
          `messageList[${this._lastAiMessageIndex}].isThinking`
        ] = false;
        updateData[
          `messageList[${this._lastAiMessageIndex}].isStreaming`
        ] = false;

        // 使用Promise确保状态更新完成
        new Promise((resolve) => {
          this.setData(updateData, () => {
            this.saveChatHistory();
            // 确保最后一次更新后正确滚动
            if (!this.data.showScrollBtn) {
              this.handleScrollToBottom();
            }
            resolve();
          });
        });
      }

      // 重置所有缓存变量
      this._lastAiMessageIndex = undefined;
      this._accumulatedContent = undefined;
      this._updateCounter = 0;
      this._isScrolling = false;
    }

    return { content, done };
  },

  // 统一的消息滚动处理函数
  scrollToMessage(messageId) {
    this.setData({
      scrollToView: `msg${messageId}`,
    });
  },

  // 从缓冲区提取完整的JSON对象
  extractJsonObjects() {
    let extractedText = "";
    let isDone = false;

    // 按行分割数据，并过滤掉空行
    const lines = this.data.buffer.split("\n").filter((line) => line.trim());

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
    this.data.buffer = this.data.buffer
      .split("\n")
      .filter((line) => !line.trim()) // 只保留空行
      .join("\n")
      .trim();

    // 如果流结束，更新最后一条AI消息的状态
    if (isDone) {
      const messageList = this.data.messageList;
      const updatedMessageList = [...messageList];
      for (let i = updatedMessageList.length - 1; i >= 0; i--) {
        if (updatedMessageList[i].type === "ai") {
          updatedMessageList[i] = {
            ...updatedMessageList[i],
            isThinking: false,
            isStreaming: false,
          };
          this.setData(
            {
              messageList: updatedMessageList,
            },
            () => {
              // 消息流结束时保存聊天记录
              this.saveChatHistory();
            },
          );
          break;
        }
      }
    }

    return {
      content: extractedText,
      done: isDone,
    };
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

  // 优化的输入框焦点处理
  onInputFocus(e) {
    const { height } = e.detail;
    const adjustedHeight = height - 86;

    wx.nextTick(() => {
      this.setData(
        {
          isKeyboardShow: true,
          keyboardHeight: adjustedHeight,
          inputStyle: `position: fixed; left: 0; right: 0; bottom: ${adjustedHeight}px; background: #fff;`,
        },
        () => {
          setTimeout(() => {
            this.scrollToBottom(true);
          }, 100);
        },
      );
    });
  },

  // 优化的输入框失焦处理
  onInputBlur() {
    wx.nextTick(() => {
      this.setData(
        {
          isKeyboardShow: false,
          keyboardHeight: 0,
          inputStyle: "position: fixed; left: 0; right: 0; bottom: 0;",
        },
        () => {
          setTimeout(() => {
            this.scrollToBottom(true);
          }, 100);
        },
      );
    });
  },

  // 处理下拉箭头点击
  handleScrollToBottom() {
    const query = wx.createSelectorQuery();
    query
      .select(".message-list")
      .boundingClientRect((listRect) => {
        if (!listRect) return;

        this.setData(
          {
            isAutoScrolling: true,
            scrollTop: listRect.height + 1000, // 增加额外高度确保滚动到底
            showScrollBtn: false,
          },
          () => {
            setTimeout(() => {
              this.setData({
                isAutoScrolling: false,
              });
            }, 500); // 增加动画时间
          },
        );
      })
      .exec();
  },

  // scroll-view 滚动时触发
  onScroll(e) {
    // 如果是自动滚动，不处理滚动事件
    if (this.data.isAutoScrolling) {
      return;
    }

    // 使用节流，避免频繁触发
    if (this.scrollTimer) {
      clearTimeout(this.scrollTimer);
    }

    this.scrollTimer = setTimeout(() => {
      const scrollTop = e.detail.scrollTop;
      const query = wx.createSelectorQuery();

      query
        .select("#scrollView")
        .boundingClientRect((scrollViewRect) => {
          if (!scrollViewRect) return;

          query
            .select(".message-list")
            .boundingClientRect((listRect) => {
              if (!listRect) return;

              const scrollViewHeight = scrollViewRect.height;
              const listHeight = listRect.height;
              const distanceToBottom =
                listHeight - (scrollTop + scrollViewHeight);

              // 当距离底部超过200rpx时显示按钮
              const shouldShow = distanceToBottom > 200;

              if (this.data.showScrollBtn !== shouldShow) {
                this.setData({
                  showScrollBtn: shouldShow,
                });
              }
            })
            .exec();
        })
        .exec();
    }, 200); // 增加节流时间到200ms
  },

  // 优化的滚动方法
  scrollToBottom(useAnimation = true) {
    if (this._scrollTimer) {
      clearTimeout(this._scrollTimer);
    }

    // 使用防抖优化滚动
    if (!this._scrollDebounce) {
      this._scrollDebounce = this.debounce(() => {
        const query = wx.createSelectorQuery();
        query
          .select(".message-list")
          .boundingClientRect((listRect) => {
            if (!listRect) return;

            const scrollHeight = listRect.height + 1000;

            // 使用Promise确保状态更新完成
            new Promise((resolve) => {
              this.setData(
                {
                  isAutoScrolling: true,
                  scrollTop: scrollHeight,
                  showScrollBtn: false,
                },
                () => {
                  if (!useAnimation) {
                    this.setData({ isAutoScrolling: false }, resolve);
                  } else {
                    setTimeout(() => {
                      this.setData({ isAutoScrolling: false }, resolve);
                    }, 300);
                  }
                },
              );
            });
          })
          .exec();
      }, 100);
    }

    this._scrollDebounce();
  },

  // 防抖函数
  debounce(fn, delay) {
    let timer;
    return function () {
      const context = this;
      const args = arguments;
      clearTimeout(timer);
      timer = setTimeout(() => {
        fn.apply(context, args);
      }, delay);
    };
  },

  // 获取当前时间
  getCurrentTime() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, "0");
    const minutes = now.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  },

  // 优化的消息处理方法
  async handleWhatIsLawsuitResponse(userInput) {
    const userMessage = {
      id: Date.now().toString(),
      type: "user",
      content: userInput,
      time: util.formatTime(new Date()),
      nickname: this.data.userNickname,
    };

    await this.addMessage(userMessage);
    this.scrollToBottom();

    const cardMessage = {
      id: Date.now().toString(),
      type: "ai",
      content: "",
      time: util.formatTime(new Date()),
      isCard: true,
      nickname: "小迈",
      cardData: {
        type: "explanation",
        content:
          "起诉状是启动民事诉讼的重要法律文书，需包含明确的当事人信息、清晰的诉讼请求、准确的事实陈述与理由阐述以及合法的证据支持等内容，以确保诉求得到法院有效受理和审理。",
        showHelpButton: true,
        buttonText: "求助人工",
      },
    };

    await this.addMessage(cardMessage);
    this.scrollToBottom(true);
    this.setData({ isAiResponding: false });
  },

  // 修改模板消息处理方法
  async handleLawsuitResponse(userInput) {
    const userMessage = {
      id: Date.now().toString(),
      type: "user",
      content: userInput,
      time: util.formatTime(new Date()),
      nickname: this.data.userNickname,
    };

    await this.addMessage(userMessage);

    const cardMessage = {
      id: Date.now().toString(),
      type: "ai",
      content: "",
      time: util.formatTime(new Date()),
      isCard: true,
      nickname: "小迈",
      cardData: {
        title: "猜您需要以下法律文书模版",
        items: this.data.documentTypes,
      },
    };

    await this.addMessage(cardMessage);

    // 使用Promise确保状态更新和滚动的正确顺序
    await new Promise((resolve) => {
      wx.nextTick(() => {
        this.scrollToBottom(true);
        this.setData(
          {
            isAiResponding: false,
            isAutoScrolling: false,
          },
          resolve,
        );
      });
    });
  },

  // 处理起诉状类型选择
  handleDocumentTypeSelect(e) {
    const { typeId } = e.currentTarget.dataset;
    const selectedType = this.data.documentTypes.find(
      (type) => type.id === typeId,
    );

    if (selectedType) {
      wx.navigateTo({
        url: `/pages/documents/document-list/document-list?docType=${selectedType.name}&id=${typeId}`,
      });
    }
  },

  // 优化的历史记录加载
  loadMoreHistory() {
    if (this.data.isLoading || !this.data.hasMoreData) return;

    this.setData({ isLoading: true });

    try {
      const chatHistory = wx.getStorageSync("chatHistory") || [];
      const totalMessages = chatHistory.length;
      const nextPage = this.data.currentPage + 1;

      // 计算下一页的起始和结束索引
      const endIndex =
        totalMessages - this.data.currentPage * this.data.pageSize;
      const startIndex = Math.max(0, endIndex - this.data.pageSize);

      if (startIndex >= 0) {
        const moreMessages = chatHistory.slice(startIndex, endIndex);

        wx.nextTick(() => {
          this.setData({
            messageList: [...moreMessages, ...this.data.messageList],
            currentPage: nextPage,
            isLoading: false,
            hasMoreData: startIndex > 0,
          });
        });
      } else {
        this.setData({
          isLoading: false,
          hasMoreData: false,
        });
      }
    } catch (error) {
      console.error("加载更多历史记录失败:", error);
      this.setData({
        isLoading: false,
      });
    }
  },
});

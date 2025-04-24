const config = require("../../utils/config.js");
const imageUtils = require("../../utils/image.js");
const util = require("../../utils/util.js");

Page({
  data: {
    inputValue: "", // 输入框的值
    showSuggestions: true, // 是否显示建议问题
    suggestions: ["起诉状如何写", "恶意拖欠劳动工资，如何申请仲裁处理？", "律师费如何计算"],
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
        type: "1",
      },
      {
        id: 2,
        name: "申请文书",
        icon: "document",
        type: "4",
      },
      {
        id: 3,
        name: "通用文书",
        icon: "document",
        type: "5",
      },
    ],
    pageSize: 10, // 每页显示的消息数量，改为10条
    currentPage: 1, // 当前页码
    totalPages: 1, // 总页数
    isLoading: false, // 是否正在加载更多
    hasMoreData: true, // 是否还有更多数据
    maxMessageCount: 50, // 最大消息数量限制
    hideTop: false, // 是否隐藏顶部区域
    shouldFocus: false, // 控制是否自动获取焦点
    isNearMaxHeight: false, // 是否接近最大高度
    cursorPosition: 0, // 光标位置
  },

  onLoad: function () {
    const userInfo = getApp().globalData.userInfo;
    const userNickname = userInfo ? userInfo.name : "用户";
    this.setData({
      userNickname: userNickname,
      imgUrls: imageUtils.getCommonImages(["index", "default", "expertsDetail"]),
    });

    // 获取缓存的聊天记录时进行数量限制
    this.loadLatestChatHistory();
  },

  // 检查登录状态
  checkLogin() {
    if (!getApp().globalData.userInfo) {
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
          }
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

    // 获取长按的触摸位置
    const touch = e.touches && e.touches[0] ? e.touches[0] : e.changedTouches[0];

    // 根据用户消息还是AI消息，设置不同的菜单位置
    const isUserMessage = this.data.messageList[index].type === "user";
    const menuPosition = isUserMessage ? `right: 20rpx; top: ${touch.clientY - 80}px;` : `left: 20rpx; top: ${touch.clientY - 80}px;`;

    // 更新消息列表，显示当前消息的菜单并设置位置
    const messageList = this.data.messageList.map((msg, i) => ({
      ...msg,
      showMenu: i === index,
      menuPosition: i === index ? menuPosition : "",
    }));

    this.setData({
      messageList,
    });

    // 移除自动关闭菜单的定时器
    if (this.closeMenuTimeout) {
      clearTimeout(this.closeMenuTimeout);
      this.closeMenuTimeout = null;
    }
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
            }
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

  // 阻止事件冒泡
  stopPropagation(e) {
    // 阻止事件冒泡
    return false;
  },

  // 阻止消息项点击事件冒泡
  stopMessageItemClick(e) {
    // 如果当前有菜单显示，则阻止点击事件冒泡
    if (this.data.messageList.some((msg) => msg.showMenu)) {
      return false;
    }
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
    this.setData({
      isAiResponding: true,
    });

    const userInput = this.data.inputValue.trim();
    if (!userInput) return;

    // const checkValue = await this.checkMessage(userInput);
    // if (checkValue !== "Normal") {
    //   wx.showToast({
    //     title: "提问中含有违规词",
    //     icon: "none",
    //   });
    //   return;
    // }

    try {
      // 检查消息类型并分发到不同的处理函数
      // if (userInput.includes("起诉状是什么")) {
      //   await this.handleWhatIsLawsuitResponse(userInput); // 传入userInput
      //   this.setData({ inputValue: "" }); // 移到这里清空输入框
      //   return;
      // } else
      if (userInput.includes("生成")) {
        await this.handleLawsuitResponse(userInput);
        this.setData({ inputValue: "" }); // 移到这里清空输入框
        return;
      }

      this.setData({
        inputValue: "", // 其他情况下的清空输入框
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
          }
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
          this._accumulatedContent = this.data.messageList[this._lastAiMessageIndex].content || "";
        }
        this._accumulatedContent += content;

        // 使用计数器控制更新频率
        if (!this._updateCounter) this._updateCounter = 0;
        this._updateCounter++;

        // 每累积2次内容就更新一次界面，使更新更及时
        if (this._updateCounter >= 2) {
          const updateData = {};
          updateData[`messageList[${this._lastAiMessageIndex}].content`] = this._accumulatedContent;
          updateData[`messageList[${this._lastAiMessageIndex}].isThinking`] = false;

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
        updateData[`messageList[${this._lastAiMessageIndex}].content`] = this._accumulatedContent;
        updateData[`messageList[${this._lastAiMessageIndex}].isThinking`] = false;
        updateData[`messageList[${this._lastAiMessageIndex}].isStreaming`] = false;

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
            }
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
    // 获取输入前的内容长度，用于判断是否是删除操作
    const prevLength = this.data.inputValue.length;
    const newValue = e.detail.value;
    const newLength = newValue.length;
    const isDelete = newLength < prevLength;

    // 检查是否有换行
    const hasLineBreak = newValue.includes("\n");

    // 保存光标位置（在更新数据前）
    this.cursorPosition = e.detail.cursor;

    // 计算行数（粗略估计）
    const lineCount = newValue.split("\n").length;
    const isMultiLine = lineCount > 1;

    // 先更新内容
    this.setData({
      inputValue: newValue,
      shouldFocus: true, // 保持焦点确保可以继续输入
    });

    // 检查是否接近最大高度
    const query = wx.createSelectorQuery();
    query
      .select(".chat-input")
      .boundingClientRect((rect) => {
        if (!rect) return;

        // 判断是否接近最大高度（350rpx）
        const isNearMaxHeight = rect.height > 300;

        // 更新状态
        if (this.data.isNearMaxHeight !== isNearMaxHeight) {
          this.setData({ isNearMaxHeight: isNearMaxHeight });
        }

        // 确保光标可见的策略选择
        if (isNearMaxHeight || isMultiLine) {
          // 多行或接近最大高度时，使用更精确的滚动策略
          setTimeout(() => {
            this.tryDirectScrollBottom();
          }, 10);
        } else if (hasLineBreak || !isDelete) {
          // 普通情况，使用常规滚动策略
          this.scrollInputToBottom();
        }
      })
      .exec();

    // 输入的是最后一个字符时，确保一定可见
    const isAtEnd = this.cursorPosition >= newLength - 1;
    if (isAtEnd && !isDelete) {
      // 连续尝试滚动，确保光标可见
      [10, 50, 100].forEach((delay) => {
        setTimeout(() => {
          this.tryDirectScrollBottom();
        }, delay);
      });
    }
  },

  // 处理键盘按键事件，处理回车键
  onKeyboardConfirm(e) {
    // 回车键只用于换行，不发送消息
    const cursorPos = this.cursorPosition || this.data.inputValue.length;
    const newValue = this.data.inputValue.slice(0, cursorPos) + "\n" + this.data.inputValue.slice(cursorPos);

    this.setData({
      inputValue: newValue,
      shouldFocus: true,
    });

    // 更新光标位置到换行符后
    this.cursorPosition = cursorPos + 1;

    // 确保输入框滚动到新的位置
    setTimeout(() => {
      this.scrollInputToBottom();
      this.tryDirectScrollBottom();
    }, 10);

    return false; // 阻止默认行为
  },

  // 确保输入框滚动到底部，光标可见
  scrollInputToBottom() {
    // 即时滚动一次
    this.tryScrollToBottom();

    // 连续多次尝试滚动，确保内容变化后也能滚动到底部
    [10, 30, 70, 150, 300].forEach((delay) => {
      setTimeout(() => {
        this.tryScrollToBottom();

        // 如果处于最大高度状态，使用更直接的滚动方法
        if (this.data.isNearMaxHeight) {
          this.tryDirectScrollBottom();
        }
      }, delay);
    });
  },

  // 尝试滚动到底部的具体实现
  tryScrollToBottom() {
    try {
      const query = wx.createSelectorQuery();
      query
        .select(".chat-input")
        .boundingClientRect((rect) => {
          if (!rect) return;

          // 检查是否接近最大高度
          const isNearMax = rect.height > 350;

          if (isNearMax) {
            // 接近最大高度时的特殊处理
            this.forceRefreshWithCursor(this.data.inputValue, this.cursorPosition);

            // 使用节点API直接设置scrollTop
            this.tryDirectScrollBottom();
          }
        })
        .exec();
    } catch (e) {
      console.error("处理输入框滚动失败:", e);
    }
  },

  // 直接滚动到底部的方法 - 增强版
  tryDirectScrollBottom() {
    try {
      // 方法1: 直接设置scrollTop - 保持光标位置始终可见
      const textareaNode = wx.createSelectorQuery().select(".chat-input");
      textareaNode
        .node((res) => {
          if (res && res.node) {
            const textarea = res.node;

            // 确保节点已获取到
            if (textarea.scrollHeight) {
              // 获取当前光标位置对应的垂直位置
              const cursorPosition = this.data.cursorPosition;
              const textValue = this.data.inputValue;

              // 计算估计的每行高度 (像素)
              const lineHeight = 38; // 根据 CSS 中的 line-height: 38rpx

              // 确保滚动足够显示最后一行
              const scrollPosition = textarea.scrollHeight;
              textarea.scrollTop = scrollPosition;

              // 额外确认滚动生效
              setTimeout(() => {
                textarea.scrollTop = scrollPosition;
              }, 10);
            } else if (textarea.setScrollTop) {
              textarea.setScrollTop(99999); // 设置一个足够大的值
            }

            // 使用平滑滚动
            if (textarea.style) {
              textarea.style.scrollBehavior = "smooth";
            }
          }
        })
        .exec();

      // 方法2: 使用fields更精确获取信息并滚动
      wx.createSelectorQuery()
        .select(".chat-input")
        .fields(
          {
            node: true,
            size: true,
            scrollOffset: true,
            properties: ["scrollHeight", "scrollTop", "clientHeight"],
            computedStyle: ["height", "paddingBottom", "lineHeight"],
          },
          (res) => {
            if (!res || !res.node) return;

            // 确保 computedStyle 存在
            if (!res.computedStyle) {
              console.warn("computedStyle 不存在", res);
              return;
            }

            // 使用node和scrollHeight进行更精确的滚动
            if (res.scrollHeight && res.node) {
              // 确保滚动到底部，但留出足够空间显示光标所在行
              const lineHeight = parseInt(res.computedStyle.lineHeight || "38");
              // 计算应滚动的位置: 总高度减去可视区域高度，再加上一行高度的缓冲
              const scrollPos = res.scrollHeight - (res.clientHeight || 0) + lineHeight;
              res.node.scrollTop = scrollPos > 0 ? scrollPos : 0;
            }
          }
        )
        .exec();
    } catch (e) {
      console.error("直接滚动失败:", e);
    }
  },

  // 强制刷新输入框内容触发滚动
  forceRefreshWithCursor(value, cursorPosition) {
    if (!value) return;

    // 如果光标接近末尾，则使用特殊处理确保光标可见
    if (cursorPosition && value && cursorPosition >= value.length - 20) {
      // 通过添加和移除不可见字符触发重新计算
      this.setData({
        inputValue: value + "\u200B", // 零宽空格
        shouldFocus: true,
      });

      // 短暂延迟后恢复原内容
      setTimeout(() => {
        this.setData({
          inputValue: value,
          shouldFocus: true,
        });
      }, 10);
    }
  },

  // 优化的输入框焦点处理
  onInputFocus(e) {
    const { height } = e.detail;
    const adjustedHeight = height - 86;

    // 立即设置键盘显示状态，避免延迟
    this.setData({
      isKeyboardShow: true,
      keyboardHeight: adjustedHeight,
      inputStyle: `position: fixed; left: 0; right: 0; bottom: ${adjustedHeight}px; background: #fff; padding: 12rpx 20rpx; z-index: 999; transition: bottom 0.2s ease; min-height: 100rpx; width: 100%; box-sizing: border-box;`,
    });

    // 使用requestAnimationFrame确保在下一帧渲染前执行
    setTimeout(() => {
      // 聚焦后立即触发滚动确保光标可见
      this.scrollInputToBottom();

      // 检查输入框高度是否接近最大值，调整滚动策略
      const query = wx.createSelectorQuery();
      query
        .select(".chat-input")
        .boundingClientRect((rect) => {
          if (rect && rect.height > 320) {
            // 接近最大高度时，标记为需要特殊处理
            this.setData({ isNearMaxHeight: true });

            // 使用更激进的滚动策略确保光标可见
            this.tryDirectScrollBottom();
          } else {
            this.setData({ isNearMaxHeight: false });
          }
        })
        .exec();
    }, 50); // 使用较短的延迟时间
  },

  // 调整textarea布局
  adjustTextareaLayout() {
    const query = wx.createSelectorQuery();
    query
      .select(".chat-input")
      .boundingClientRect((rect) => {
        if (!rect) return;

        // 找出textarea元素
        const textarea = this.createSelectorQuery().select(".chat-input");
        textarea
          .fields(
            {
              node: true,
              size: true,
              dataset: true,
              computedStyle: ["paddingTop", "paddingBottom"],
            },
            (res) => {
              if (!res) return;

              // 检查节点是否存在
              if (!res.node) {
                console.warn("textarea节点不存在", res);
                return;
              }

              // 手动设置样式确保上下边距一致
              const node = res.node;
              if (node && node.style) {
                node.style.paddingTop = "16rpx";
                node.style.paddingBottom = "16rpx";
              }
            }
          )
          .exec();
      })
      .exec();
  },

  // 确保输入框内容可见，更强大的实现
  ensureInputVisible() {
    // 立即尝试一次滚动
    this.tryDirectScrollBottom(); // 使用更直接的滚动方法

    // 稍后再次尝试，确保内容更新后仍然滚动到底部
    setTimeout(() => {
      const query = wx.createSelectorQuery();
      query
        .select(".chat-input")
        .fields(
          {
            node: true,
            size: true,
            scrollOffset: true,
            properties: ["scrollHeight", "scrollTop", "clientHeight"],
            computedStyle: ["height", "lineHeight"],
          },
          (res) => {
            if (!res) return;

            // 确保 computedStyle 存在
            if (!res.computedStyle) {
              console.warn("computedStyle 不存在", res);
              return;
            }

            // 当输入框内容很多时采取更激进的滚动策略
            const height = parseFloat(res.computedStyle.height || "0");
            const scrollHeight = res.scrollHeight || 0;
            const clientHeight = res.clientHeight || height;
            const lineHeight = parseInt(res.computedStyle.lineHeight || "38");

            // 更新近最大高度状态
            const isNearMaxHeight = height > 300;
            if (this.data.isNearMaxHeight !== isNearMaxHeight) {
              this.setData({ isNearMaxHeight });
            }

            if (scrollHeight > clientHeight) {
              // 计算滚动位置：确保光标所在行完全可见
              // 总高度减去可视区域高度，再加上一行高度的缓冲，确保最后一行完全可见
              const node = res.node;
              if (node) {
                const scrollPosition = scrollHeight - clientHeight + lineHeight + 10;
                node.scrollTop = scrollPosition > 0 ? scrollPosition : 0;

                // 200ms后再次确认滚动位置
                setTimeout(() => {
                  node.scrollTop = scrollPosition > 0 ? scrollPosition : 0;
                }, 200);
              }

              // 如果是接近最大高度，且光标在文本末尾，使用更强的方法
              if (isNearMaxHeight && this.cursorPosition && this.data.inputValue && this.cursorPosition >= this.data.inputValue.length - 5) {
                this.forceRefreshWithCursor(this.data.inputValue, this.cursorPosition);

                // 连续尝试多次滚动
                [50, 150, 250].forEach((delay) => {
                  setTimeout(() => {
                    if (node) {
                      node.scrollTop = scrollHeight;
                    }
                  }, delay);
                });
              }
            }
          }
        )
        .exec();
    }, 30);
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
      }
    );
  },

  bindViewTap() {
    wx.navigateTo({
      url: "../logs/logs",
    });
  },

  // 监听导航高度变化
  onNavHeight(e) {
    console.warn("收到导航高度:", e.detail.height);
    this.setData({
      navHeight: e.detail.height,
    });
  },

  // 优化的输入框失焦处理
  onInputBlur() {
    // 立即设置状态，避免延迟
    this.setData({
      isKeyboardShow: false,
      keyboardHeight: 0,
      inputStyle:
        "position: fixed; left: 0; right: 0; bottom: 0; transition: bottom 0.2s ease; background: #fff; padding: 12rpx 20rpx; z-index: 999; min-height: 100rpx; width: 100%; box-sizing: border-box;",
    });

    // 短暂延迟后进行滚动
    setTimeout(() => {
      this.scrollInputToBottom();
    }, 100);
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
          }
        );
      })
      .exec();
  },

  // 处理滚动事件
  onScroll(e) {
    // 使用节流函数限制滚动事件的触发频率
    if (!this._throttleTimeout) {
      this._throttleTimeout = setTimeout(() => {
        this._throttleTimeout = null;

        const scrollTop = e.detail.scrollTop;

        // 根据滚动位置控制顶部区域显示隐藏
        if (scrollTop > 150 && !this.data.hideTop) {
          this.setData({ hideTop: true });
        } else if (scrollTop <= 150 && this.data.hideTop) {
          this.setData({ hideTop: false });
        }

        // 记录当前滚动位置
        this._lastScrollTop = scrollTop;

        // 滚动到底部按钮的显示逻辑
        if (scrollTop < this._lastScrollTop - 50) {
          // 向上滚动超过50px，显示滚动到底部按钮
          if (!this.data.showScrollBtn) {
            this.setData({
              showScrollBtn: true,
            });
          }
        } else if (scrollTop > this._lastScrollTop + 50) {
          // 向下滚动超过50px，隐藏滚动到底部按钮
          if (this.data.showScrollBtn) {
            this.setData({
              showScrollBtn: false,
            });
          }
        }

        // 更新记录的滚动位置
        this._lastScrollTop = scrollTop;

        // 如果是自动滚动引起的，不执行后续逻辑
        if (this.data.isAutoScrolling) {
          this.setData({ isAutoScrolling: false });
          return;
        }

        // 设置正在滚动标记，避免多余的滚动
        this.isScrolling = true;
      }, 50); // 50ms的节流时间
    }
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
                }
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
        content: "起诉状是启动民事诉讼的重要法律文书，需包含明确的当事人信息、清晰的诉讼请求、准确的事实陈述与理由阐述以及合法的证据支持等内容，以确保诉求得到法院有效受理和审理。",
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
          resolve
        );
      });
    });
  },

  // 处理起诉状类型选择
  handleDocumentTypeSelect(e) {
    const { typeId } = e.currentTarget.dataset;
    const selectedType = this.data.documentTypes.find((type) => type.id === typeId);

    if (selectedType) {
      wx.navigateTo({
        url: `/pages/documents/document-list/document-list?docType=${selectedType.type}&title=${selectedType.name}`,
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
      const endIndex = totalMessages - this.data.currentPage * this.data.pageSize;
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
  navigateToExperts() {
    wx.switchTab({
      url: "/pages/experts/experts",
    });
  },

  // 处理键盘高度变化
  onKeyboardHeightChange(e) {
    const { height } = e.detail;
    if (height > 0) {
      // 键盘弹出
      const adjustedHeight = height - 86;
      this.setData({
        isKeyboardShow: true,
        keyboardHeight: adjustedHeight,
        inputStyle: `position: fixed; left: 0; right: 0; bottom: ${adjustedHeight}px; background: #fff; padding-bottom: 12rpx; z-index: 999;`,
      });

      // 立即滚动确保输入区域可见
      setTimeout(() => {
        this.scrollInputToBottom();
      }, 10);
    } else {
      // 键盘收起
      this.setData({
        isKeyboardShow: false,
        keyboardHeight: 0,
      });
    }
  },

  // 插入换行符
  insertNewline() {
    // 获取当前光标位置
    const cursorPos = this.cursorPosition || this.data.inputValue.length;

    // 在光标处插入换行符
    const newValue = this.data.inputValue.slice(0, cursorPos) + "\n" + this.data.inputValue.slice(cursorPos);

    // 更新输入内容并确保光标位置正确
    this.setData({
      inputValue: newValue,
      shouldFocus: true,
    });

    // 更新光标位置到换行符后
    this.cursorPosition = cursorPos + 1;

    // 确保输入框滚动到新位置
    setTimeout(() => {
      this.scrollInputToBottom();
      this.tryDirectScrollBottom();
    }, 10);
  },
});

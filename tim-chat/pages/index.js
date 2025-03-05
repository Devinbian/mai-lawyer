// pages/chat/chat.js
import TencentCloudChat from "@tencentcloud/chat";
import TIMUploadPlugin from "tim-upload-plugin";
import { genTestUserSig } from "../../debug/GenerateTestUserSig";

const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    config: {
      userID: "laywer1", // 当前登录用户（咨询方）
      SDKAPPID: 1600075596,
      SECRETKEY:
        "ba92e763ab7975718da625afa6f60465dee472f0e4524f2028f83e161e5e1f8b",
      EXPIRETIME: 604800,
    },
    targetUserID: "laywer2", // 目标用户（专家）
    conversationID: "", // 会话ID将在创建会话时设置
    percent: 0,
    isSDKReady: false,
    isLoggedIn: false, // 新增登录状态标记
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log("页面加载，options:", options);

    // 如果传入了目标用户ID，则更新
    if (options.targetUserID) {
      this.setData({ targetUserID: options.targetUserID });
    }

    // 初始化SDK和登录
    this.initSDKAndLogin();
  },

  onShow() {
    // 只在SDK未就绪时检查状态
    if (wx.$TUIKit && !this.data.isSDKReady) {
      console.log("SDK未就绪，等待SDK就绪事件");
      // 不主动检查状态，等待SDK_READY事件
    }
  },

  async initSDKAndLogin() {
    try {
      wx.showLoading({ title: "正在初始化..." });
      wx.reportEvent("debug_point", { step: "initSDKAndLogin" });
      // 确保SDK实例存在
      if (!wx.$TUIKit) {
        console.log("创建SDK实例...");
        wx.reportEvent("debug_point", { step: "start_create_sdk" });

        // 先检查网络状态
        const networkType = await new Promise((resolve) => {
          wx.getNetworkType({
            success: (res) => {
              console.log("当前网络状态:", res.networkType);
              wx.reportEvent("debug_point", {
                step: "check_network_status",
                networkType: res.networkType,
              });
              resolve(res.networkType);
            },
            fail: (error) => {
              wx.reportEvent("debug_point", {
                step: "check_network_status_fail",
                error: error,
              });
              resolve("unknown");
            },
          });
        });

        // 检查网络连接
        const isConnected = await new Promise((resolve) => {
          wx.getNetworkType({
            success: (res) => {
              const connected = res.networkType !== "none";
              wx.reportEvent("debug_point", {
                step: "check_network_connection",
                isConnected: connected,
                networkType: res.networkType,
              });
              resolve(connected);
            },
            fail: (error) => {
              wx.reportEvent("debug_point", {
                step: "check_network_connection_fail",
                error: error,
              });
              resolve(false);
            },
          });
        });

        if (!isConnected) {
          wx.reportEvent("debug_point", {
            step: "network_not_connected",
            networkType: networkType,
          });
          throw new Error("网络连接不可用");
        }

        wx.$TUIKit = TencentCloudChat.create({
          SDKAppID: this.data.config.SDKAPPID,
          networkConfig: {
            timeout: 60000,
            retryTimes: 5,
            retryInterval: 2000,
            onNetworkStatusChange: (status) => {
              console.log("网络状态变化:", status);
              wx.reportEvent("debug_point", {
                step: "sdk_network_status_change",
                status: status,
              });
              if (status === "connected") {
                this.initSDKAndLogin();
              }
            },
          },
        });

        wx.reportEvent("debug_point", { step: "sdk_instance_created" });

        // 注册网络状态监听
        wx.onNetworkStatusChange((res) => {
          console.log("微信网络状态变化:", res);
          wx.reportEvent("debug_point", {
            step: "wx_network_status_change",
            isConnected: res.isConnected,
            networkType: res.networkType,
          });
          if (res.isConnected) {
            this.initSDKAndLogin();
          }
        });
      }

      // 设置日志级别
      wx.$TUIKit.setLogLevel(1);
      wx.reportEvent("debug_point", { step: "sdk_log_level_set" });

      // 先注销可能存在的旧事件
      this.unregisterSDKEvents();
      wx.reportEvent("debug_point", { step: "sdk_events_unregistered" });

      // 注册事件
      this.registerSDKEvents();
      wx.reportEvent("debug_point", { step: "sdk_events_registered" });

      // 检查登录状态
      try {
        const currentUserID = await wx.$TUIKit.getLoginUser();
        wx.reportEvent("debug_point", {
          step: "check_login_status",
          currentUserID: currentUserID,
          targetUserID: this.data.config.userID,
        });

        if (currentUserID === this.data.config.userID) {
          console.log("已经登录目标用户");
          this.setData({
            isLoggedIn: true,
            isSDKReady: true,
          });
          wx.hideLoading();
          return;
        }
      } catch (error) {
        console.log("获取登录状态失败:", error);
        wx.reportEvent("debug_point", {
          step: "check_login_status_fail",
          error: error.message || error.msg,
          code: error.code,
        });
      }

      // 生成UserSig并登录
      const userSig = genTestUserSig(this.data.config).userSig;
      console.log("准备登录用户:", this.data.config.userID);
      wx.reportEvent("debug_point", {
        step: "prepare_login",
        userID: this.data.config.userID,
      });

      // 添加登录重试机制
      let retryCount = 0;
      const maxRetries = 5;
      let loginResult;

      while (retryCount < maxRetries) {
        try {
          // 每次重试前检查网络状态
          const isConnected = await new Promise((resolve) => {
            wx.getNetworkType({
              success: (res) => {
                const connected = res.networkType !== "none";
                wx.reportEvent("debug_point", {
                  step: "retry_check_network",
                  retryCount: retryCount,
                  isConnected: connected,
                  networkType: res.networkType,
                });
                resolve(connected);
              },
              fail: (error) => {
                wx.reportEvent("debug_point", {
                  step: "retry_check_network_fail",
                  retryCount: retryCount,
                  error: error,
                });
                resolve(false);
              },
            });
          });

          if (!isConnected) {
            throw new Error("网络连接不可用");
          }

          // 添加登录请求前的日志
          wx.reportEvent("debug_point", {
            step: "before_login_request",
            retryCount: retryCount,
            userID: this.data.config.userID,
            SDKAppID: this.data.config.SDKAPPID,
            timestamp: new Date().getTime(),
          });

          loginResult = await wx.$TUIKit.login({
            userID: this.data.config.userID,
            userSig: userSig,
          });

          // 添加登录请求后的日志
          wx.reportEvent("debug_point", {
            step: "after_login_request",
            retryCount: retryCount,
            userID: this.data.config.userID,
            timestamp: new Date().getTime(),
          });

          wx.reportEvent("debug_point", {
            step: "login_success",
            retryCount: retryCount,
          });
          break;
        } catch (error) {
          retryCount++;
          console.log(`登录失败，第${retryCount}次重试，错误:`, error);
          wx.reportEvent("debug_point", {
            step: "login_retry",
            retryCount: retryCount,
            error: error.message || error.msg,
            code: error.code,
            userID: this.data.config.userID,
            SDKAppID: this.data.config.SDKAPPID,
            timestamp: new Date().getTime(),
            // 添加更多错误详情
            errorDetail: {
              name: error.name,
              stack: error.stack,
              type: error.type,
              message: error.message,
              msg: error.msg,
              code: error.code,
              data: error.data,
            },
          });

          if (error.code === 2801 || error.message === "网络连接不可用") {
            if (retryCount < maxRetries) {
              const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
              console.log(`等待${delay}ms后重试...`);
              wx.reportEvent("debug_point", {
                step: "login_retry_wait",
                retryCount: retryCount,
                delay: delay,
              });
              await new Promise((resolve) => setTimeout(resolve, delay));
              continue;
            }
          }
          throw error;
        }
      }

      console.log("登录成功:", loginResult);
      this.setData({
        isLoggedIn: true,
        isSDKReady: true, // 添加SDK就绪状态
      });
      wx.reportEvent("debug_point", { step: "initSDKAndLogin_success" });
      wx.hideLoading();
    } catch (error) {
      console.error("初始化失败:", error);
      wx.hideLoading();
      wx.reportEvent("initSDKAndLogin", { step: error });
      const errorMsg = error.message || error.msg || "初始化失败";
      console.error("详细错误信息:", {
        message: errorMsg,
        code: error.code,
        stack: error.stack,
      });

      // 根据错误类型处理
      switch (error.code) {
        case 2000:
          console.log("SDK内部错误，尝试重新初始化");
          setTimeout(() => {
            this.initSDKAndLogin();
          }, 3000);
          break;
        case 2801:
          console.log("网络请求超时，尝试重新连接");
          wx.reportEvent("debug_point", { step: "initSDKAndLogin_timeout" });
          wx.showToast({
            title: "网络连接超时，正在重试...",
            icon: "none",
            duration: 2000,
          });
          setTimeout(() => {
            this.initSDKAndLogin();
          }, 3000);
          break;
        case 60020:
          console.log("不支持的功能:", error.message);
          wx.showToast({
            title: "当前环境不支持此功能",
            icon: "none",
            duration: 2000,
          });
          break;
        case 70001:
          console.log("签名过期，需要重新登录");
          wx.showToast({
            title: "登录已过期，请重新登录",
            icon: "none",
            duration: 2000,
          });
          setTimeout(() => {
            this.initSDKAndLogin();
          }, 2000);
          break;
        case 70003:
          console.log("用户身份校验失败");
          wx.showToast({
            title: "身份验证失败，请检查配置",
            icon: "none",
            duration: 2000,
          });
          break;
        case 70004:
          console.log("网络连接失败");
          wx.showToast({
            title: "网络连接失败，请检查网络",
            icon: "none",
            duration: 2000,
          });
          setTimeout(() => {
            this.initSDKAndLogin();
          }, 3000);
          break;
        default:
          wx.showToast({
            title: errorMsg,
            icon: "none",
            duration: 2000,
          });
      }

      wx.reportEvent("debug_point", {
        step: "initSDKAndLogin_error",
        code: error.code,
        error: errorMsg,
      });
    }
  },

  async checkSDKStatus() {
    try {
      const currentUserID = await wx.$TUIKit.getLoginUser();
      if (currentUserID) {
        console.log("已登录用户:", currentUserID);
        this.setData({
          isLoggedIn: true,
          isSDKReady: true,
        });
        if (currentUserID === this.data.config.userID) {
          this.createConversation();
        }
      }
    } catch (error) {
      console.log("检查SDK状态失败:", error);
    }
  },

  registerSDKEvents() {
    try {
      // 定义事件和处理函数的映射
      const eventHandlers = {
        [TencentCloudChat.EVENT.SDK_READY]: this.handleSDKReady.bind(this),
        [TencentCloudChat.EVENT.SDK_NOT_READY]:
          this.handleSDKNotReady.bind(this),
        [TencentCloudChat.EVENT.KICKED_OUT]: this.handleKickedOut.bind(this),
        [TencentCloudChat.EVENT.ERROR]: this.handleError.bind(this),
      };

      // 保存事件处理函数的引用，用于后续注销
      this._eventHandlers = eventHandlers;

      // 注册所有事件
      Object.entries(eventHandlers).forEach(([event, handler]) => {
        console.log("注册事件:", event);
        // 先注销可能存在的旧事件处理函数
        wx.$TUIKit.off(event, handler);
        // 再注册新的事件处理函数
        wx.$TUIKit.on(event, handler);
      });

      console.log("SDK 事件注册完成");
    } catch (error) {
      console.error("注册事件失败:", error);
    }
  },

  unregisterSDKEvents() {
    try {
      // 注销之前保存的所有事件处理函数
      if (this._eventHandlers) {
        Object.entries(this._eventHandlers).forEach(([event, handler]) => {
          console.log("注销事件:", event);
          wx.$TUIKit.off(event, handler);
        });
      }
    } catch (error) {
      console.error("注销事件失败:", error);
    }
  },

  handleSDKReady() {
    console.log("SDK Ready");
    this.setData(
      {
        isSDKReady: true,
      },
      () => {
        if (this.data.isLoggedIn) {
          this.createConversation();
        }
      },
    );
  },

  handleSDKNotReady(event) {
    console.log("SDK Not Ready:", event);
    this.setData({
      isSDKReady: false,
      isLoggedIn: false,
    });
  },

  handleKickedOut(event) {
    console.log("被踢下线:", event);
    this.setData({
      isSDKReady: false,
      isLoggedIn: false,
    });
    wx.showToast({
      title: "您的账号在其他设备登录",
      icon: "none",
    });
    setTimeout(() => {
      wx.navigateBack();
    }, 2000);
  },

  handleError(event) {
    console.error("SDK Error:", event);

    // 根据错误类型处理
    switch (event.code) {
      case 2000:
        console.log("SDK内部错误，尝试重新初始化");
        this.initSDKAndLogin();
        break;
      case 60020:
        console.log("不支持的功能:", event.message);
        // 不显示错误提示，因为这是正常的
        break;
      case 70001:
        console.log("签名过期，需要重新登录");
        wx.showToast({
          title: "登录已过期，请重新登录",
          icon: "none",
        });
        this.initSDKAndLogin();
        break;
      case 70003:
        console.log("用户身份校验失败");
        wx.showToast({
          title: "身份验证失败",
          icon: "none",
        });
        break;
      case 70004:
        console.log("网络连接失败");
        wx.showToast({
          title: "网络连接失败",
          icon: "none",
        });
        break;
      default:
        // 其他错误显示通用提示
        wx.showToast({
          title: "SDK错误，请重试",
          icon: "none",
        });
    }
  },

  getLoginErrorMessage(code) {
    const errorMessages = {
      70001: "签名过期",
      70003: "用户身份校验失败",
      70004: "网络无法连接",
      70005: "登录被限制",
      default: "登录失败，请重试",
    };
    return errorMessages[code] || errorMessages.default;
  },

  async createConversation() {
    if (!this.data.isLoggedIn) {
      console.log("尚未登录，等待登录完成");
      return;
    }

    try {
      console.log("开始创建与用户", this.data.targetUserID, "的会话");
      // 创建 C2C 会话
      const conversationID = `C2C${this.data.targetUserID}`;

      // 获取会话实例
      const {
        data: { conversation },
      } = await wx.$TUIKit.getConversationProfile(conversationID);
      console.log("获取到会话：", conversation);

      // 更新会话ID
      this.setData(
        {
          conversationID: conversationID,
        },
        () => {
          console.log("会话创建完成，ID:", this.data.conversationID);
          // 初始化 TUIKit 组件
          this.initTUIKit();
        },
      );
    } catch (error) {
      console.error("创建会话失败：", error);
      if (error.code === 2000) {
        // 会话不存在，创建新会话
        await this.createNewConversation();
      } else {
        wx.showToast({
          title: "创建会话失败",
          icon: "none",
        });
      }
    }
  },

  async createNewConversation() {
    try {
      const {
        data: { conversation },
      } = await wx.$TUIKit.createConversation({
        userID: this.data.targetUserID,
        type: wx.TencentCloudChat.TYPES.CONV_C2C,
      });

      this.setData(
        {
          conversationID: conversation.conversationID,
        },
        () => {
          console.log("新会话创建完成，ID:", this.data.conversationID);
          this.initTUIKit();
        },
      );
    } catch (error) {
      console.error("创建新会话失败：", error);
      wx.showToast({
        title: "创建新会话失败",
        icon: "none",
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    console.log("done");
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {
    if (wx.$TUIKit) {
      // 注销事件
      this.unregisterSDKEvents();
      // 登出
      wx.$TUIKit
        .logout()
        .then(() => {
          console.log("登出成功");
        })
        .catch((error) => {
          console.error("登出失败:", error);
        });
    }
  },

  initTUIKit() {
    if (!this.data.isSDKReady) {
      console.log("SDK 未就绪，等待 ready 事件");
      return;
    }

    console.log("开始初始化 TUIKit 组件");
    const TUIKit = this.selectComponent("#TUIKit");
    if (TUIKit) {
      try {
        // 设置初始进度为0
        TUIKit.setData(
          {
            percent: 0,
            conversationID: this.data.conversationID,
            userID: this.data.config.userID,
            targetUserID: this.data.targetUserID,
          },
          () => {
            TUIKit.init();
            console.log("TUIKit 组件初始化成功");
          },
        );
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

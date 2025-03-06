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
      SDKAppID: 0, // 将在onLoad中设置真实值
      userID: "",
      userSig: "",
      targetUserID: "",
    },
    isSDKReady: false, // SDK是否就绪
    isLoggedIn: false, // 是否已登录
    conversationID: "", // 会话ID
    customStateObj: {
      conversationType: "C2C",
      isReady: false, // TUIKit组件是否准备好
      initializing: true, // 是否正在初始化
      userInfo: {}, // 用户信息
    },
    percent: 0,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  async onLoad(options) {
    console.log("页面加载开始，参数:", options);

    // 初始化配置信息
    this.setData({
      config: {
        SDKAppID: 1600075596,
        userID: "laywer1", // 当前登录用户（咨询方）
        userSig:
          "eJwtzFELgjAYheH-suuQbfnpEroqLELByCi8G23FRynDxKnRf2*pl*d54XxInpy8VtckItyjZDFuVLpq8I4jv2Rvdc3m9FZPaQwqErGAUhoCrIKp6M5grZ0DAHdp0gbLv4U*41wI5s8v*HDPg03NIUuO2dBIVcSdALOEaz7s7bba3Haq521R4pnHl3RNvj*3zjK6",
        targetUserID: "laywer2", // 目标用户（专家）
      },
    });

    console.log("配置信息初始化完成:", this.data.config);

    // 初始化自定义状态对象
    this.setData({
      "customStateObj.userInfo": {
        userID: this.data.config.userID,
        nick: "咨询顾问",
        avatar: "https://imgapi.cn/api.php?zd=mobile&fl=meizi&gs=images",
      },
    });

    // 初始化SDK并登录
    await this.initSDKAndLogin();
  },

  onShow() {
    // 只在SDK未就绪时检查状态
    if (wx.$TUIKit && !this.data.isSDKReady) {
      console.log("SDK未就绪，等待SDK就绪事件");
      // 不主动检查状态，等待SDK_READY事件
    }
  },

  /**
   * 初始化SDK并登录
   */
  async initSDKAndLogin() {
    try {
      if (!wx.$TUIKit) {
        console.log("创建SDK实例");

        // SDK未初始化，创建SDK实例
        const options = {
          SDKAppID: this.data.config.SDKAppID,
          logLevel: 0, // 日志级别，0为一般，1为详细
          timeout: 120, // 请求超时时间，单位：秒
          oversea: false, // 是否为境外服务，一般为false
          functionConfig: {
            enableProfanityFilter: false, // 禁用敏感词检测功能
            enableMessageReadReceipt: true, // 启用消息已读回执
            enableCloudCustomData: true, // 启用自定义云数据
          },
        };

        // 创建TUIKit实例
        wx.$TUIKit = TencentCloudChat.create(options);
      } else {
        console.log("SDK实例已存在，跳过创建步骤");
      }

      // 无论SDK是否已初始化，都需要注册事件监听器
      this.registerSDKEvents();

      // 检查登录状态
      const loginUserID = await wx.$TUIKit.getLoginUser();
      const isLoggedIn = !!loginUserID;
      console.log("当前登录状态:", isLoggedIn, "登录用户:", loginUserID);

      // 如果已登录，直接设置状态
      if (isLoggedIn) {
        console.log("用户已登录，设置状态");
        this.setData({ isLoggedIn: true });

        // 如果SDK也已就绪，尝试创建会话
        if (this.data.isSDKReady) {
          console.log("SDK已就绪，尝试创建会话");
          this.createConversation();
        }
        return;
      }

      // 未登录，执行登录流程
      console.log("未登录，准备执行登录流程");
      // 使用userSig登录
      await wx.$TUIKit.login({
        userID: this.data.config.userID,
        userSig: this.data.config.userSig,
      });

      console.log("登录成功");
      this.setData({ isLoggedIn: true });

      // 登录成功后，SDK可能已经就绪，检查状态
      if (this.data.isSDKReady) {
        console.log("登录后SDK已就绪，尝试创建会话");
        this.createConversation();
      } else {
        console.log("登录后等待SDK就绪事件...");
      }
    } catch (error) {
      console.error("SDK初始化或登录失败:", error);
      let errorMsg = "登录失败";

      switch (error.code) {
        case 6:
          errorMsg = "频繁登录，请稍后再试";
          break;
        case 70001:
          errorMsg = "无效的UserSig";
          break;
        case 70003:
          errorMsg = "UserSig已过期";
          break;
        case 70009:
          errorMsg = "票据校验失败";
          break;
        case 70013:
          errorMsg = "账号不存在";
          break;
        case 70014:
          errorMsg = "账号被禁用";
          break;
        case 2801:
          errorMsg = "网络超时，请检查网络";
          break;
        case 3000:
          errorMsg = "会话创建失败，请重试";
          break;
        case 2000:
          errorMsg = "会话不存在";
          break;
      }

      wx.showToast({
        title: errorMsg,
        icon: "none",
        duration: 3000,
      });
    }
  },

  /**
   * 注册SDK事件
   */
  registerSDKEvents() {
    if (!wx.$TUIKit) {
      console.error("注册事件失败 - SDK实例不存在");
      return;
    }

    console.log("开始注册SDK事件");

    // 定义事件处理函数
    const onSDKReady = (event) => {
      console.log("收到SDK_READY事件:", event);
      console.log("事件触发前isSDKReady状态:", this.data.isSDKReady);
      this.handleSDKReady(event);
    };

    const onSDKNotReady = (event) => {
      console.log("收到SDK_NOT_READY事件:", event);
      console.log("事件触发前isSDKReady状态:", this.data.isSDKReady);
      this.handleSDKNotReady(event);
    };

    const onKickedOut = (event) => {
      console.log("收到KICKED_OUT事件:", event);
      this.handleKickedOut(event);
    };

    const onError = (event) => {
      console.log("收到ERROR事件:", event);
      this.handleError(event);
    };

    // 保存事件处理函数引用
    this.eventHandlers = {
      onSDKReady,
      onSDKNotReady,
      onKickedOut,
      onError,
    };

    // 尝试先清除可能存在的事件监听器
    try {
      wx.$TUIKit.off(
        TencentCloudChat.EVENT.SDK_READY,
        this.eventHandlers.onSDKReady,
      );
      wx.$TUIKit.off(
        TencentCloudChat.EVENT.SDK_NOT_READY,
        this.eventHandlers.onSDKNotReady,
      );
      wx.$TUIKit.off(
        TencentCloudChat.EVENT.KICKED_OUT,
        this.eventHandlers.onKickedOut,
      );
      wx.$TUIKit.off(TencentCloudChat.EVENT.ERROR, this.eventHandlers.onError);
      console.log("已清除现有事件监听器");
    } catch (error) {
      console.warn("清除事件监听器失败:", error);
    }

    // 重新注册事件监听器
    wx.$TUIKit.on(
      TencentCloudChat.EVENT.SDK_READY,
      this.eventHandlers.onSDKReady,
    );
    wx.$TUIKit.on(
      TencentCloudChat.EVENT.SDK_NOT_READY,
      this.eventHandlers.onSDKNotReady,
    );
    wx.$TUIKit.on(
      TencentCloudChat.EVENT.KICKED_OUT,
      this.eventHandlers.onKickedOut,
    );
    wx.$TUIKit.on(TencentCloudChat.EVENT.ERROR, this.eventHandlers.onError);

    console.log("SDK事件注册完成");

    // 检查SDK是否已经就绪，如果已就绪但未触发事件，手动调用
    if (wx.$TUIKit.isReady()) {
      console.log("SDK已经就绪，但可能未触发SDK_READY事件，手动触发处理");
      this.handleSDKReady();
    }
  },

  /**
   * 处理SDK就绪事件
   */
  handleSDKReady(event) {
    console.log("SDK就绪事件处理开始");

    this.setData({ isSDKReady: true }, () => {
      console.log("SDK就绪状态已更新，开始检查会话条件");

      // 如果已登录，尝试创建会话
      if (this.data.isLoggedIn) {
        console.log("SDK就绪且已登录，尝试创建会话");
        this.createConversation();
      } else {
        console.log("SDK就绪但未登录，等待登录完成");
      }
    });
  },

  /**
   * 处理SDK未就绪事件
   */
  handleSDKNotReady(event) {
    console.log("SDK未就绪事件");
    this.setData({ isSDKReady: false });

    // 显示未就绪提示
    wx.showToast({
      title: "IM服务暂时不可用",
      icon: "none",
      duration: 2000,
    });
  },

  async createConversation() {
    if (!this.data.isLoggedIn || !this.data.isSDKReady) {
      console.log("创建会话失败 - 条件不满足:", {
        isLoggedIn: this.data.isLoggedIn,
        isSDKReady: this.data.isSDKReady,
      });
      return;
    }

    try {
      console.log("开始创建与用户", this.data.config.targetUserID, "的会话");
      const conversationID = `C2C${this.data.config.targetUserID}`;

      console.log("尝试获取会话资料:", conversationID);
      // 获取会话实例
      const {
        data: { conversation },
      } = await wx.$TUIKit.getConversationProfile(conversationID);
      console.log("获取到会话：", conversation);

      // 更新会话ID
      await this.setData({
        conversationID: conversationID,
      });

      console.log("会话ID更新完成 - 当前状态:", {
        isLoggedIn: this.data.isLoggedIn,
        isSDKReady: this.data.isSDKReady,
        conversationID: this.data.conversationID,
      });

      // 更新用户资料
      await wx.$TUIKit.updateMyProfile({
        avatar: "https://imgapi.cn/api.php?zd=mobile&fl=meizi&gs=images",
      });

      // 初始化 TUIKit 组件
      this.initTUIKit();

      return true;
    } catch (error) {
      console.error("创建会话失败：", error);
      if (error.code === 2000) {
        // 会话不存在，创建新会话
        return await this.createNewConversation();
      } else {
        throw error;
      }
    }
  },

  async createNewConversation() {
    try {
      console.log("开始创建新会话...");
      const conversationID = `C2C${this.data.config.targetUserID}`;

      // 发送一条消息以创建会话
      const message = wx.$TUIKit.createTextMessage({
        to: this.data.config.targetUserID,
        conversationType: "C2C",
        payload: {
          text: "您好，我想咨询一些问题",
        },
      });

      const result = await wx.$TUIKit.sendMessage(message);
      console.log("发送消息结果:", result);

      // 更新会话ID
      await this.setData({
        conversationID: conversationID,
      });

      console.log("新会话创建完成:", conversationID);

      // 初始化 TUIKit 组件
      this.initTUIKit();

      return true;
    } catch (error) {
      console.error("创建新会话失败:", error);
      wx.showToast({
        title: "创建会话失败，请重试",
        icon: "none",
        duration: 2000,
      });
      return false;
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
    console.log("页面卸载");

    // 移除事件监听器
    if (wx.$TUIKit && this.eventHandlers) {
      try {
        console.log("移除事件监听器");
        wx.$TUIKit.off(
          TencentCloudChat.EVENT.SDK_READY,
          this.eventHandlers.onSDKReady,
        );
        wx.$TUIKit.off(
          TencentCloudChat.EVENT.SDK_NOT_READY,
          this.eventHandlers.onSDKNotReady,
        );
        wx.$TUIKit.off(
          TencentCloudChat.EVENT.KICKED_OUT,
          this.eventHandlers.onKickedOut,
        );
        wx.$TUIKit.off(
          TencentCloudChat.EVENT.ERROR,
          this.eventHandlers.onError,
        );
        console.log("事件监听器移除完成");
      } catch (error) {
        console.warn("移除事件监听器失败:", error);
      }
    }
  },

  initTUIKit() {
    const TUIKit = this.selectComponent("#TUIKit");
    if (TUIKit) {
      console.log("TUIKit组件已找到，开始初始化");
      TUIKit.init();
      console.log("TUIKit初始化完成");
    } else {
      console.error("找不到TUIKit组件");

      // 延迟尝试再次初始化
      setTimeout(() => {
        const TUIKit = this.selectComponent("#TUIKit");
        if (TUIKit) {
          console.log("延迟后找到TUIKit组件，开始初始化");
          TUIKit.init();
          console.log("TUIKit延迟初始化完成");
        } else {
          console.error("延迟后仍找不到TUIKit组件");
        }
      }, 500);
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

  /**
   * 处理被踢下线事件
   */
  handleKickedOut(event) {
    console.log("被踢下线事件:", event);
    this.setData({
      isSDKReady: false,
      isLoggedIn: false,
    });

    // 显示被踢提示
    wx.showToast({
      title: "您的账号在其他设备登录",
      icon: "none",
      duration: 3000,
    });

    // 延迟返回上一页
    setTimeout(() => {
      wx.navigateBack();
    }, 3000);
  },

  /**
   * 处理错误事件
   */
  handleError(event) {
    console.log("错误事件:", event);

    // 忽略不支持功能的错误
    if (event.code === 60020) {
      console.log("不支持的功能，忽略错误:", event.message);
      return;
    }

    // 处理其他错误
    let errorMsg = "发生错误";
    let needRelogin = false;

    switch (event.code) {
      case 70001:
        errorMsg = "登录已过期，将重新登录";
        needRelogin = true;
        break;
      case 70002:
        errorMsg = "账号在其他地方登录";
        break;
      case 70003:
        errorMsg = "用户签名已过期，将重新登录";
        needRelogin = true;
        break;
      case 70005:
        errorMsg = "网络连接断开";
        break;
      default:
        if (event.code > 2000 && event.code < 3000) {
          errorMsg = "网络错误，请检查网络连接";
        }
    }

    // 显示错误提示
    if (errorMsg) {
      wx.showToast({
        title: errorMsg,
        icon: "none",
        duration: 2000,
      });
    }

    // 如果需要重新登录
    if (needRelogin) {
      setTimeout(() => {
        this.initSDKAndLogin();
      }, 1500);
    }
  },
});

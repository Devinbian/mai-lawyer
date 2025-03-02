const imageUtils = require('../../../utils/image.js');

Page({
  data: {
    expert: null,
    userInfo: null,
    messages: [],
    inputValue: '',
    scrollIntoView: '',
    pageNum: 1,
    pageSize: 20,
    hasMore: true,
    keyboardHeight: 0,
    isKeyboardShow: false
  },
  imgUrls: null,

  onLoad(options) {
    if (options.expert) {
      const expert = JSON.parse(decodeURIComponent(options.expert));
      // 添加在线状态属性，这里应该从后端获取实际的在线状态
      expert.isOnline = true; // 暂时默认在线
      this.setData({ expert });
      this.setImagesByPixelRatio();
      // 模拟一些初始消息
      this.setData({
        messages: [
          {
            id: 1,
            content: `您好，我是${expert.name}律师，请在下方输入您的问题，我需要分析案情为您做针对性解答。`,
            isSelf: false,
            timestamp: new Date().getTime()
          },
          {
            id: 2,
            content: '律师已进入会话',
            isSelf: false,
            isSystem: true,
            timestamp: new Date().getTime()
          }
        ]
      });
    }

    // 获取用户信息
    const userInfo = wx.getStorageSync('userInfo');
    if (!userInfo) {
      // 如果本地没有用户信息，获取用户头像
      wx.getUserProfile({
        desc: '用于显示用户头像',
        success: (res) => {
          const userInfo = res.userInfo;
          wx.setStorageSync('userInfo', userInfo);
          this.setData({ userInfo });
        },
        fail: () => {
          // 如果用户拒绝，使用默认头像
          this.setData({
            userInfo: {
              avatarUrl: '/static/images/default-avatar.png',
              nickName: '用户'
            }
          });
        }
      });
    } else {
      this.setData({ userInfo });
    }
  },

  setImagesByPixelRatio() {
    this.setData({
      imgUrls: imageUtils.getCommonImages('index')
    });
  },

  // 输入框获得焦点
  onInputFocus(e) {
    const height = e.detail.height || 0;
    this.setData({
      keyboardHeight: height,
      isKeyboardShow: true
    }, () => {
      // 延迟执行滚动
      setTimeout(() => {
        const messages = this.data.messages;
        if (messages.length > 0) {
          this.setData({
            scrollIntoView: `msg-${messages[messages.length - 1].id}`
          });
        }
      }, 100);
    });
  },

  // 输入框失去焦点
  onInputBlur() {
    this.setData({
      keyboardHeight: 0,
      isKeyboardShow: false
    }, () => {
      // 键盘收起后也需要调整滚动位置
      setTimeout(() => {
        const messages = this.data.messages;
        if (messages.length > 0) {
          this.setData({
            scrollIntoView: `msg-${messages[messages.length - 1].id}`
          });
        }
      }, 100);
    });
  },

  // 输入框内容变化
  onInput(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  // 发送消息
  sendMessage() {
    const { inputValue, messages } = this.data;
    if (!inputValue.trim()) return;

    // 添加新消息
    const newMessage = {
      id: messages.length + 1,
      content: inputValue,
      isSelf: true,
      timestamp: new Date().getTime()
    };

    this.setData({
      messages: [...messages, newMessage],
      inputValue: '',
      scrollIntoView: `msg-${newMessage.id}`
    });

    // 模拟律师回复
    setTimeout(() => {
      const replyMessage = {
        id: messages.length + 2,
        content: '好的，我已经了解您的问题，请详细描述一下具体情况，我会为您提供专业的建议。',
        isSelf: false,
        timestamp: new Date().getTime()
      };

      this.setData({
        messages: [...this.data.messages, replyMessage],
        scrollIntoView: `msg-${replyMessage.id}`
      });
    }, 1000);
  },

  // 上拉加载更多
  onScrollToUpper() {
    if (!this.data.hasMore) return;
    
    // TODO: 实现加载历史消息的逻辑
    wx.showLoading({
      title: '加载中...'
    });

    setTimeout(() => {
      wx.hideLoading();
      // 模拟加载更多消息
      this.setData({
        hasMore: false
      });
    }, 1000);
  }
}); 
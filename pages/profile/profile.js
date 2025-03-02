const imageUtil = require('../../utils/image.js');
// pages/profile/profile.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isLogin: false,
    userInfo: null,
    imgUrls: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.setImagesByPixelRatio();
    this.getUserInfo();
  },

  // 根据设备像素比选择图片
  setImagesByPixelRatio() {
    this.setData({
      imgUrls: imageUtil.getCommonImages('profile')
    });
  },

  getUserInfo() {
    const app = getApp();
    const userInfo = app.globalData.userInfo || wx.getStorageSync('userInfo');
    const isLogin = !!userInfo;
    this.setData({
      userInfo: userInfo || {},
      isLogin
    });
  },

  // 点击登录/注册
  handleLogin() {
    if (!this.data.isLogin) {
      wx.navigateTo({
        url: '/pages/login/login'
      });
    }
  },

  // 点击订单项
  handleOrderTap(e) {
    if (!this.data.isLogin) {
      this.handleLogin();
      return;
    }
    // 根据点击项跳转到对应订单列表
    // TODO: 实现订单列表页面跳转
  },

  // 点击内容项
  handleContentTap(e) {
    const { type } = e.currentTarget.dataset;
    
    // if (!this.data.isLogin) {
    //   wx.navigateTo({
    //     url: '/pages/login/login'
    //   });
    //   return;
    // }

    switch(type) {
      case 'favorite':
        wx.navigateTo({
          url: '/pages/profile/favorite/favorite'
        });
        break;
      case 'download':
        wx.navigateTo({
          url: '/pages/profile/download/download'
        });
        break;
      case 'history':
        wx.navigateTo({
          url: '/pages/profile/history/history'
        });
        break;
    }
  },

  // 点击功能项
  handleFunctionTap(e) {
    const type = e.currentTarget.dataset.type;
    switch(type) {
      case 'help':
        wx.navigateTo({
          url: '/pages/profile/feedback/feedback'
        });
        break;
      case 'contact':
        wx.makePhoneCall({
          phoneNumber: '021-50280097',
          fail(err) {
            wx.showToast({
              title: '拨号失败',
              icon: 'none'
            });
          }
        });
        break;
      case 'about':
        wx.navigateTo({
          url: '/pages/profile/about/about'
        });
        break;
      case 'account':
        wx.navigateTo({
          url: '/pages/profile/account/account'
        });
        break;
      case 'logout':
        if (this.data.isLogin) {
          this.handleLogout();
        }
        break;
    }
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清除登录信息
          wx.removeStorageSync('userInfo');
          wx.removeStorageSync('token');
          
          // 更新页面状态
          this.setData({
            isLogin: false,
            userInfo: {}
          });
          
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          });
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 每次显示页面时检查登录状态
    const userInfo = wx.getStorageSync('userInfo');
    const token = wx.getStorageSync('token');
    
    this.setData({
      isLogin: !!token,
      userInfo: userInfo || {}
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})
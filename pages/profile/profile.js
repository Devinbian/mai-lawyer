Page({
  data: {
    userInfo: null,
    menuList: [
      {
        title: "我的订单",
        items: [
          { icon: "/assets/images/unpaid.png", text: "待支付", badge: 2 },
          { icon: "/assets/images/paid.png", text: "已支付", badge: 0 },
          { icon: "/assets/images/refund.png", text: "已退款", badge: 1 },
          { icon: "/assets/images/all-order.png", text: "全部", badge: 0 },
        ],
      },
      {
        title: "我的内容",
        items: [
          { icon: "/assets/images/favorite.png", text: "我的收藏", badge: 0 },
          { icon: "/assets/images/download.png", text: "下载记录", badge: 0 },
          { icon: "/assets/images/history.png", text: "咨询历史", badge: 0 },
        ],
      },
    ],
    settingList: [
      { icon: "/assets/images/help.png", text: "帮助反馈" },
      { icon: "/assets/images/contact.png", text: "联系我们" },
      { icon: "/assets/images/about.png", text: "关于我们" },
    ],
  },

  onLoad() {
    const app = getApp();
    if (!app.globalData.isLogin) {
      wx.navigateTo({
        url: "/pages/login/login",
      });
      return;
    }

    this.setData({
      userInfo: app.globalData.userInfo,
    });
  },

  // 编辑个人信息
  handleEditProfile() {
    wx.navigateTo({
      url: "/pages/profile-edit/profile-edit",
    });
  },

  // 处理菜单点击
  handleMenuClick(e) {
    const { text } = e.currentTarget.dataset;
    switch (text) {
      case "待支付":
        wx.navigateTo({ url: "/pages/order/order?type=unpaid" });
        break;
      case "已支付":
        wx.navigateTo({ url: "/pages/order/order?type=paid" });
        break;
      case "已退款":
        wx.navigateTo({ url: "/pages/order/order?type=refund" });
        break;
      case "全部":
        wx.navigateTo({ url: "/pages/order/order?type=all" });
        break;
      case "我的收藏":
        wx.navigateTo({ url: "/pages/favorite/favorite" });
        break;
      case "下载记录":
        wx.navigateTo({ url: "/pages/download/download" });
        break;
      case "咨询历史":
        wx.navigateTo({ url: "/pages/consult-history/consult-history" });
        break;
      default:
        break;
    }
  },

  // 处理设置点击
  handleSettingClick(e) {
    const { text } = e.currentTarget.dataset;
    switch (text) {
      case "帮助反馈":
        wx.navigateTo({ url: "/pages/feedback/feedback" });
        break;
      case "联系我们":
        wx.navigateTo({ url: "/pages/contact/contact" });
        break;
      case "关于我们":
        wx.navigateTo({ url: "/pages/about/about" });
        break;
      default:
        break;
    }
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: "提示",
      content: "确定要退出登录吗？",
      success: (res) => {
        if (res.confirm) {
          const app = getApp();
          app.globalData.isLogin = false;
          app.globalData.token = "";
          app.globalData.userInfo = null;
          wx.removeStorageSync("token");
          wx.navigateTo({
            url: "/pages/login/login",
          });
        }
      },
    });
  },
});

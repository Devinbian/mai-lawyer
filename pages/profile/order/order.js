const imageUtil = require('../../../utils/image.js');
Page({
  data: {
    currentTab: 'all',
    orderList: [],
    mgUrls: null,
  },

  onLoad(options) {
    this.setImagesByPixelRatio();
    // 如果从个人中心跳转时带有状态参数
    if (options.status) {
      this.setData({
        currentTab: options.status
      });
    }
    this.loadOrders();
  },

  setImagesByPixelRatio() {
    this.setData({
      imgUrls: imageUtil.getCommonImages('profile')
    });
  },

  // 切换标签
  switchTab(e) {
    const type = e.currentTarget.dataset.type;
    this.setData({
      currentTab: type
    });
    this.loadOrders();
  },

  // 加载订单列表
  loadOrders() {
    // 模拟订单数据
    const mockOrders = [{
      orderId: '202502000714000300000',
      typeName: '电话咨询',
      type: 'phone',
      status: 'pending',
      statusText: '待支付',
      consultTime: '2025-02-07 14:00:03',
      price: 64,
      lawyer: '雷军'
    }, {
      orderId: '202502000714000300001',
      typeName: '图文咨询',
      type: 'text',
      status: 'paid',
      statusText: '已支付',
      consultTime: '2025-02-07 14:00:03',
      price: 128,
      lawyer: '马云'
    }, {
      orderId: '202502000714000300002',
      typeName: '图文咨询',
      type: 'text',
      status: 'refunded',
      statusText: '已退款',
      consultTime: '2025-02-07 14:00:03',
      price: 64,
      lawyer: '雷军'
    }];

    // 根据当前标签筛选订单
    let filteredOrders = mockOrders;
    if (this.data.currentTab !== 'all') {
      filteredOrders = mockOrders.filter(order => order.status === this.data.currentTab);
    }

    this.setData({
      orderList: filteredOrders
    });
  },

  // 显示更多操作
  showMore(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showActionSheet({
      itemList: ['查看详情', '联系客服'],
      success(res) {
        if (res.tapIndex === 0) {
          // 查看详情
          wx.navigateTo({
            url: `/pages/order/detail/detail?id=${orderId}`
          });
        } else if (res.tapIndex === 1) {
          // 联系客服
          wx.makePhoneCall({
            phoneNumber: '021-50280097'
          });
        }
      }
    });
  },

  // 取消订单
  cancelOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要取消该订单吗？',
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用取消订单接口
          this.loadOrders();
        }
      }
    });
  },

  // 去支付
  payOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    // TODO: 调用支付接口
  },

  // 查看售后详情
  showRefundDetail(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/order/refund/detail?id=${orderId}`
    });
  },

  // 删除订单
  deleteOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: '提示',
      content: '确定要删除该订单吗？',
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用删除订单接口
          this.loadOrders();
        }
      }
    });
  },

  // 申请退款
  applyRefund(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/profile/order/refund/refund?id=${orderId}`
    });
  }
}); 
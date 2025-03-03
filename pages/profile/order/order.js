const imageUtil = require("../../../utils/image.js");
Page({
  data: {
    currentTab: "all",
    orderList: [],
    imgUrls: null,
    activeDropdown: null, // 当前展开的下拉菜单ID
    isRefreshing: false, // 是否正在刷新
    isLoading: false, // 是否正在加载更多
    hasMore: true, // 是否还有更多数据
    pageNum: 1, // 当前页码
    pageSize: 10, // 每页数量
  },

  onLoad(options) {
    wx.showToast({
      title: "加载中...",
      icon: "loading",
      duration: 2000,
    });
    this.setImagesByPixelRatio();
    // 如果从个人中心跳转时带有状态参数
    if (options.status) {
      this.setData({
        currentTab: options.status,
      });
    }
    this.loadOrders();
  },

  onTouchStart() {
    if (this.data.activeDropdown !== null) {
      this.closeDropdown();
    }
  },

  setImagesByPixelRatio() {
    this.setData({
      imgUrls: imageUtil.getCommonImages("profile"),
    });
  },

  // 切换标签
  switchTab(e) {
    const type = e.currentTarget.dataset.type;
    this.setData(
      {
        currentTab: type,
        pageNum: 1,
        hasMore: true,
        orderList: [],
      },
      () => {
        this.loadOrders();
      },
    );
  },

  // 加载订单列表
  loadOrders(isLoadMore = false) {
    if (this.data.isLoading) return;

    this.setData({
      isLoading: true,
    });

    // 模拟订单数据
    const mockOrders = [
      {
        orderId: "202502000714000300000",
        typeName: "电话咨询",
        type: "phone",
        status: "pending",
        statusText: "待支付",
        consultTime: "2025-02-07 14:00:03",
        price: 64,
        lawyer: "雷军",
      },
      {
        orderId: "202502000714000300001",
        typeName: "图文咨询",
        type: "text",
        status: "paid",
        statusText: "已支付",
        consultTime: "2025-02-07 14:00:03",
        price: 128,
        lawyer: "马云",
      },
      {
        orderId: "202502000714000300003",
        typeName: "图文咨询",
        type: "text",
        status: "refunding",
        statusText: "退款中",
        consultTime: "2025-02-07 14:00:03",
        price: 256,
        lawyer: "马化腾",
      },
      {
        orderId: "202502000714000300002",
        typeName: "图文咨询",
        type: "text",
        status: "refunded",
        statusText: "已退款",
        consultTime: "2025-02-07 14:00:03",
        price: 64,
        lawyer: "雷军",
      },
    ];

    // 模拟API请求延迟
    setTimeout(() => {
      // 根据当前标签筛选订单
      let filteredOrders = mockOrders;
      if (this.data.currentTab !== "all") {
        filteredOrders = mockOrders.filter(
          (order) => order.status === this.data.currentTab,
        );
      }

      // 模拟分页
      const startIndex = (this.data.pageNum - 1) * this.data.pageSize;
      const endIndex = startIndex + this.data.pageSize;
      const currentPageOrders = filteredOrders.slice(startIndex, endIndex);

      this.setData(
        {
          orderList: isLoadMore
            ? [...this.data.orderList, ...currentPageOrders]
            : currentPageOrders,
          isLoading: false,
          isRefreshing: false,
          hasMore: currentPageOrders.length === this.data.pageSize,
        },
        () => {
          if (!isLoadMore) {
            wx.hideToast(); // 初始加载完成后隐藏toast
          }
        },
      );
    }, 1000);
  },

  // 下拉刷新
  onRefresh() {
    if (this.data.isLoading) return;

    this.setData({
      isRefreshing: true,
      pageNum: 1,
      hasMore: true,
    });

    this.loadOrders();
  },

  // 加载更多
  onLoadMore() {
    if (this.data.isLoading || !this.data.hasMore) return;

    this.setData({
      pageNum: this.data.pageNum + 1,
    });

    this.loadOrders(true);
  },

  // 切换下拉菜单
  toggleDropdown(e) {
    const orderId = e.currentTarget.dataset.id;
    this.setData({
      activeDropdown: this.data.activeDropdown === orderId ? null : orderId,
    });
  },

  // 关闭下拉菜单
  closeDropdown() {
    this.setData({
      activeDropdown: null,
    });
  },

  // 阻止事件冒泡
  stopPropagation() {
    return;
  },

  // 显示更多操作
  showMore(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showActionSheet({
      itemList: ["删除订单"],
      itemColor: "#F34E4E",
      success: (res) => {
        if (res.tapIndex === 0) {
          this.showDeleteConfirm(orderId);
        }
      },
    });
  },

  // 显示删除确认框
  showDeleteConfirm(e) {
    const orderId = e.currentTarget.dataset.id;
    this.closeDropdown();
    wx.showModal({
      title: "提示",
      content: "确定要删除该订单吗？",
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用删除订单接口
          this.loadOrders();
        }
      },
    });
  },

  // 取消订单
  cancelOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.showModal({
      title: "提示",
      content: "确定要取消该订单吗？",
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用取消订单接口
          wx.navigateTo({
            url: `/pages/profile/order/cancel/cancel?id=${orderId}`,
          });
        }
      },
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
      url: `/pages/profile/order/refund-success/refund-success?id=${orderId}`,
    });
  },

  // 申请退款
  applyRefund(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/profile/order/refund/refund?id=${orderId}`,
    });
  },
});

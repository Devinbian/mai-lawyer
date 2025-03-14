const imageUtil = require("../../../utils/image.js");
const refreshLoadingBehavior = require("../../../behaviors/refresh-loading.js");
const config = require("../../../utils/config.js");

Page({
  behaviors: [refreshLoadingBehavior],

  data: {
    currentTab: "all",
    imgUrls: null,
    activeDropdown: null, // 当前展开的下拉菜单ID
    isRefreshing: false, // 是否正在刷新
    isLoading: false, // 是否正在加载更多
    hasMore: true, // 是否还有更多数据
    list: [], // 订单列表数据
    isInitialLoading: true, // 是否为首次加载
  },

  onLoad(options) {
    console.log("=== onLoad 开始执行 ===");

    // 先设置图片资源
    this.setData({
      imgUrls: imageUtil.getCommonImages(["profile", "default", "noorder"]),
      isInitialLoading: true,
      isLoading: false,
      isRefreshing: false,
      pageNum: 1,
      pageSize: 20,
    });

    console.log("options", options);
    // 如果从个人中心跳转时带有状态参数
    if (options.status) {
      console.log("设置状态:", options.status);
      this.setData({
        currentTab: options.status,
      });
    }

    // 显示加载提示
    wx.showToast({
      title: "加载中...",
      icon: "loading",
      duration: 2000,
    });

    console.log("调用 initList");
    this.initList();
  },

  onTouchStart() {
    if (this.data.activeDropdown !== null) {
      this.closeDropdown();
    }
  },

  // 切换标签
  switchTab(e) {
    const type = e.currentTarget.dataset.type;
    console.log("切换标签:", type);
    if (type === this.data.currentTab) return;

    this.setData(
      {
        currentTab: type,
      },
      () => {
        this.initList();
      },
    );
  },

  // 实现 loadData 方法，这是 behavior 中约定的接口
  async loadData(isLoadMore = false) {
    console.log("=== loadData 开始执行 ===", {
      isLoadMore,
      pageNum: this.data.pageNum,
      pageSize: this.data.pageSize,
    });
    try {
      console.log("开始调用 getOrders");
      const { listArray, totalRows } = await this.getOrders(
        this.data.pageNum,
        this.data.pageSize,
      );
      console.log("getOrders 返回数据:", { listArray, totalRows });

      return new Promise((resolve) => {
        let filteredOrders = listArray;
        if (this.data.currentTab !== "all") {
          console.log("过滤订单，当前标签:", this.data.currentTab);
          filteredOrders = listArray.filter(
            (order) => order.status === this.data.currentTab,
          );
        }
        console.log("过滤后的订单:", filteredOrders);
        const end = this.data.pageNum * this.data.pageSize;
        console.log("分页信息:", { end, totalRows, hasMore: end < totalRows });

        // 更新加载状态
        this.setData({
          isInitialLoading: false,
          list: isLoadMore
            ? [...this.data.list, ...filteredOrders]
            : filteredOrders,
        });

        resolve({
          list: filteredOrders,
          hasMore: end < totalRows,
        });
      });
    } catch (err) {
      console.error("获取订单列表失败，详细错误:", err);
      this.setData({
        isInitialLoading: false,
        list: [],
      });
      return {
        list: [],
        hasMore: false,
      };
    }
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
          this.initList();
        }
      },
    });
  },

  // 取消订单
  cancelOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    const userInfo = wx.getStorageSync("userInfo");
    wx.showModal({
      title: "提示",
      content: "确定要取消该订单吗？",
      success: (res) => {
        if (res.confirm) {
          console.log("点击确定，取消订单", orderId);
          // TODO: 调用取消订单接口
          wx.request({
            url: `${config.baseURL}/api/order/cancel?token=${userInfo.token}`,
            method: "POST",
            header: {
              "Content-Type": "application/json",
            },
            data: {
              orderId: orderId,
            },
            success: (res) => {
              if (res.data.success) {
                console.log(
                  "取消订单成功，并跳转/pages/profile/order/cancel/cancel?id=${orderId}",
                  res,
                );
                wx.navigateTo({
                  url: `/pages/profile/order/cancel/cancel?id=${orderId}`,
                });
              }
            },
            fail: (err) => {
              console.error(
                "取消订单失败/pages/profile/order/cancel/cancel?id=${orderId}:",
                err,
              );
            },
          });
        } else {
          console.log("点击取消，取消订单", orderId);
        }
      },
      fail: (err) => {
        console.error("取消订单失败:", err);
      },
    });
  },

  // 去支付
  payOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/profile/order/pay/pay?id=${orderId}`,
    });
  },

  // 申请退款
  applyRefund(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/profile/order/refund/refund?id=${orderId}`,
    });
  },

  // 查看退款详情
  showRefundDetail(e) {
    const orderId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/profile/order/refund-detail/refund-detail?id=${orderId}`,
    });
  },

  getOrders(pageNum, pageSize) {
    const orderStatusIndex = parseInt(this.findKeyByVal(this.data.currentTab));

    return new Promise((resolve, reject) => {
      const token = wx.getStorageSync("userInfo").token;
      console.log("准备发起请求:", {
        url: `${config.baseURL}/api/order/page`,
        token: token,
        orderStatusIndex,
      });

      wx.request({
        url: `${config.baseURL}/api/order/page`,
        method: "GET",
        data:
          orderStatusIndex === 99
            ? {
                pageNo: pageNum,
                pageSize: pageSize,
                token: token,
              }
            : {
                pageNo: pageNum,
                pageSize: pageSize,
                token: token,
                orderStatus: orderStatusIndex,
              },
        success: (res) => {
          console.log("请求成功，返回数据:", res);
          // 检查返回的数据结构
          if (res.data && res.data.data && Array.isArray(res.data.data.rows)) {
            const rows = res.data.data.rows;
            console.log("解析到的订单数据:", rows);

            if (rows.length === 0) {
              console.log("订单列表为空");
              resolve({
                listArray: [],
                totalRows: 0,
              });
              return;
            }

            const orderList = rows.map((order) => {
              return {
                orderId: order.orderId,
                orderNo: order.orderNo,
                typeName:
                  config.orderType[order.orderType]?.title || "未知类型",
                type: config.orderType[order.orderType]?.icon || "text",
                status: config.orderStatus[order.orderStatus]?.val || "pending",
                statusText:
                  config.orderStatus[order.orderStatus]?.txt || "未知状态",
                consultTime: order.createTime,
                price: order.totalFee,
                lawyer: order.lawyerName,
              };
            });
            console.log("数据处理完成:", {
              orderList,
              totalRows: res.data.data.totalRows || 0,
            });
            resolve({
              listArray: orderList,
              totalRows: res.data.data.totalRows || 0,
            });
          } else {
            console.log("返回数据格式不正确或为空");
            resolve({
              listArray: [],
              totalRows: 0,
            });
          }
        },
        fail: (err) => {
          console.error("请求失败:", err);
          reject(err);
        },
      });
    });
  },

  findKeyByVal(val) {
    const statusMap = config.orderStatus;
    for (const key in statusMap) {
      if (statusMap[key].val === val) {
        return key; // 找到对应的 key
      }
    }
    return null; // 如果没有找到，返回 null
  },
});

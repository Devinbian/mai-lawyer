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
    isConnected: true, // 默认有网络连接
    networkType: "unknown", // 默认网络类型
    tip: {
      // icon: config.tipsIcon[1].txt,
      // text: "专业上线代写服务认证律师",
    }, // 订单消息提示
  },

  onLoad(options) {
    console.log("=== onLoad 开始执行 ===");
    const app = getApp();

    // 先设置图片资源
    this.setData({
      imgUrls: {
        ...imageUtil.getCommonImages(["profile", "default"]),
      },
      // tip: {
      //   icon: config.tipsIcon[4].txt,
      //   text: "这是一条专业上线代写服务认证律师",
      // },
      isInitialLoading: true,
      isLoading: false,
      isRefreshing: false,
      pageNum: 1,
      pageSize: 20,
      isConnected: app.globalData.isConnected,
      networkType: app.globalData.networkType,
    });

    console.log("tip:", this.data.tip, this.data.imgUrls[this.data.tip.icon]);

    console.log("order.js 当前网络状态:", {
      isConnected: app.globalData.isConnected,
      networkType: app.globalData.networkType,
    });

    // 监听网络状态变化
    this.networkStatusCallback = (isConnected, networkType) => {
      console.log("order.js 收到网络状态变化:", { isConnected, networkType });
      this.setData({ isConnected, networkType });

      // 根据网络状态处理页面逻辑
      if (isConnected) {
        console.log("order.js 网络已连接，尝试重新加载数据");
        this.initList();
      } else {
        console.log("order.js 网络已断开，显示提示");
        wx.showToast({
          title: "网络已断开",
          icon: "none",
          duration: 2000,
        });
      }
    };

    console.log("order.js 注册网络状态监听器");
    app.addNetworkStatusListener(this.networkStatusCallback);

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

  onUnload() {
    console.log("order.js 页面卸载，移除网络状态监听器");
    // 移除网络状态监听
    const app = getApp();
    if (this.networkStatusCallback) {
      app.removeNetworkStatusListener(this.networkStatusCallback);
      console.log("order.js 网络状态监听器已移除");
    }
  },

  onShow() {
    console.log("onShow");
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
      }
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
      const { listArray, totalRows } = await this.getOrders(this.data.pageNum, this.data.pageSize);
      console.log("getOrders 返回数据:", { listArray, totalRows });

      return new Promise((resolve) => {
        let filteredOrders = listArray;
        if (this.data.currentTab !== "all") {
          console.log("过滤订单，当前标签:", this.data.currentTab);
          if (this.data.currentTab !== "refunding") {
            //退款中包含：退款审核中、审核失败、退款中、退款失败，此处不需要再过滤了，因为在获取数据源的时候已经过滤过了
            filteredOrders = listArray.filter((order) => order.status === this.data.currentTab);
          }
        }
        console.log("过滤后的订单:", filteredOrders);
        const end = this.data.pageNum * this.data.pageSize;
        console.log("分页信息:", { end, totalRows, hasMore: end < totalRows });

        // 更新加载状态
        this.setData({
          isInitialLoading: false,
          list: isLoadMore ? [...this.data.list, ...filteredOrders] : filteredOrders,
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
    const token = getApp().globalData.userInfo.token;
    this.closeDropdown();
    wx.showModal({
      title: "提示",
      content: "确定要删除该订单吗？",
      success: (res) => {
        if (res.confirm) {
          // TODO: 调用删除订单接口
          wx.request({
            url: `${config.baseURL}/api/order/delete?token=${token}`,
            method: "POST",
            header: {
              "Content-Type": "application/json",
            },
            data: {
              orderId: orderId,
            },
            success: (res) => {
              console.log("删除订单成功", res);
              this.initList();
            },
            fail: (err) => {
              console.error("删除订单失败", err);
            },
          });
        }
      },
    });
  },

  // 取消订单
  cancelOrder(e) {
    const orderId = e.currentTarget.dataset.id;
    const token = getApp().globalData.userInfo.token;
    wx.showModal({
      title: "提示",
      content: "确定要取消该订单吗？",
      success: (res) => {
        if (res.confirm) {
          console.log("点击确定，取消订单", orderId);
          // TODO: 调用取消订单接口
          wx.request({
            url: `${config.baseURL}/api/order/cancel?token=${token}`,
            method: "POST",
            header: {
              "Content-Type": "application/json",
            },
            data: {
              orderId: orderId,
            },
            success: (res) => {
              if (res.data.success) {
                console.log("取消订单成功，并跳转/pages/profile/order/cancel/cancel?id=${orderId}", res);
                wx.navigateTo({
                  url: `/pages/profile/order/cancel/cancel?id=${orderId}`,
                });
              }
            },
            fail: (err) => {
              console.error("取消订单失败/pages/profile/order/cancel/cancel?id=${orderId}:", err);
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
    const item = this.data.list.find((order) => order.orderId === e.currentTarget.dataset.id);
    if (!item) {
      console.error("未找到订单信息");
      return;
    }

    wx.request({
      url: `${config.baseURL}/api/wxpay/prepay`,
      data: {
        orderId: item.orderId,
        token: getApp().globalData.userInfo.token,
      },
      success: (res) => {
        wx.requestPayment({
          timeStamp: res.data.data.timeStamp,
          nonceStr: res.data.data.nonceStr,
          package: res.data.data.packageValue,
          signType: res.data.data.signType,
          paySign: res.data.data.paySign,
          success: (res) => {
            console.log("支付成功", res);

            // 根据订单类型执行不同的后续操作
            if (item.orderType === 1) {
              // 图文咨询，打开聊天
              wx.navigateTo({
                url: `../../../tim-chat/pages/index?targetUserID=${item.orderContent}&title=${encodeURIComponent(item.typeName)}`,
                fail(err) {
                  wx.showToast({
                    title: "打开聊天失败",
                    icon: "none",
                  });
                },
              });
            } else if (item.orderType === 2) {
              // 文档下载，开始下载
              wx.downloadFile({
                url: item.documentUrl,
                success: (res) => {
                  const filePath = res.tempFilePath;
                  wx.openDocument({
                    filePath: filePath,
                    showMenu: true,
                    success: () => {
                      console.log("打开文档成功");
                      wx.showToast({
                        title: "下载成功",
                        icon: "success",
                      });
                    },
                    fail: (err) => {
                      console.log("打开文档失败", err);
                      wx.showToast({
                        title: "打开文档失败",
                        icon: "none",
                      });
                    },
                  });
                },
                fail: (err) => {
                  console.log("下载文档失败", err);
                  wx.showToast({
                    title: "下载文档失败",
                    icon: "none",
                  });
                },
              });
            }
          },
          fail: function (res) {
            console.log("支付失败", res);
            wx.showToast({
              title: "支付失败",
              icon: "none",
            });
          },
        });
      },
      fail: (err) => {
        console.log("支付失败", err);
        wx.showToast({
          title: "支付失败",
          icon: "none",
        });
      },
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
    console.log("showRefundDetail", orderId);
    wx.navigateTo({
      url: `/pages/profile/order/refund-success/refund-success?id=${orderId}`,
    });
  },

  getOrders(pageNum, pageSize) {
    let orderStatusIndex = parseInt(this.findKeyByVal(this.data.currentTab));
    console.log("orderStatusIndex", orderStatusIndex);

    if (orderStatusIndex === 5) {
      //退款中的状态：包括退款审核中、审核失败、退款中、退款失败
      orderStatusIndex = 2;
    }

    return new Promise((resolve, reject) => {
      wx.request({
        url: `${config.baseURL}/api/order/page`,
        data:
          orderStatusIndex === 99
            ? {
                pageNo: pageNum,
                pageSize: pageSize,
                token: getApp().globalData.userInfo.token,
              }
            : {
                pageNo: pageNum,
                pageSize: pageSize,
                token: getApp().globalData.userInfo.token,
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
                typeName: config.orderType[order.orderType]?.title || "未知类型",
                type: config.orderType[order.orderType]?.icon || "text",
                orderType: order.orderType, // 保存原始订单类型
                status: config.orderStatus[order.orderStatus]?.val || "pending",
                statusText: config.orderStatus[order.orderStatus]?.txt || "未知状态",
                consultTime: order.createTime,
                price: order.totalFee,
                orderContent: order.orderContent, // 图文咨询时为律师手机号，文档下载时为文档名称
                documentName: order.documentName || "未知文档",
                documentUrl: order.documentUrl, // 添加文档下载链接
                lawyerName: order.lawyerName, // 添加律师姓名
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

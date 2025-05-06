const imageUtils = require("../../utils/image.js");
const refreshLoadingBehavior = require("../../behaviors/refresh-loading.js");
const config = require("../../utils/config.js");

// pages/experts/experts.js
Page({
  behaviors: [refreshLoadingBehavior],

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: null,
    bottomPadding: 0,
    scrollTop: 0, // 记录滚动位置
    listHeight: "calc(100vh - 280rpx)", // 默认高度
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad() {
    wx.showToast({
      title: "加载中...",
      icon: "loading",
      duration: 2000,
    });
    this.setImagesByPixelRatio();
    this.initList();
    this.calculateListHeight();
  },

  setImagesByPixelRatio() {
    this.setData({
      imgUrls: {
        ...imageUtils.getCommonImages(["default", "profile", "experts"]),
      },
    });
  },

  // 实现 behavior 中定义的 loadData 方法
  async loadData(isLoadMore = false) {
    try {
      const { pageNum, pageSize } = this.data;
      const expertsObj = await this.getExperts(pageNum, pageSize);

      const list = expertsObj.listArray;
      const totalRows = expertsObj.totalRows;
      const end = pageNum * pageSize;
      const hasMore = end < totalRows;

      // 返回处理后的数据
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ list, hasMore });
          // 数据加载完成后，重新计算高度
          wx.nextTick(() => {
            this.calculateListHeight();
          });
        }, 500);
      });
    } catch (error) {
      console.error("获取专家列表失败：", error);
      return new Promise((resolve) => {
        resolve({ list: [], hasMore: false });
      });
    }
  },

  // 监听滚动事件
  onScroll(e) {
    const scrollTop = e.detail.scrollTop;
    this.setData({
      scrollTop,
    });
    // 滚动时也重新计算高度
    this.calculateListHeight();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},

  // 跳转到专家详情页
  navigateToDetail(e) {
    if (!getApp().globalData.userInfo) {
      wx.navigateTo({
        url: "/pages/login/login",
      });
      return;
    }

    const expert = e.currentTarget.dataset.expert;
    const type = e.currentTarget.dataset.type;
    // 将专家信息转换为查询字符串
    const expertInfo = encodeURIComponent(JSON.stringify(expert));
    wx.navigateTo({
      url: `./expert-detail/expert-detail?expert=${expertInfo}&type=${type}`,
      fail(err) {
        wx.showToast({
          title: "打开详情页失败",
          icon: "none",
        });
      },
    });
  },

  // 格式化电话号码
  formatPhoneNumber(phone) {
    if (!phone) return "";
    // 移除所有非数字字符
    const cleaned = phone.replace(/\D/g, "");
    // 如果是11位手机号
    if (cleaned.length === 11) {
      return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
    }
    // 如果是座机号（比如 0571-88888888）
    if (cleaned.length >= 10) {
      const areaCode = cleaned.slice(0, 4);
      const rest = cleaned.slice(4);
      return `${areaCode}-${rest}`;
    }
    // 其他情况直接返回原始号码
    return phone;
  },

  // 电话咨询
  handlePhoneConsult(e) {
    if (!getApp().globalData.userInfo) {
      wx.navigateTo({
        url: "/pages/login/login",
      });
      return;
    }
    const phone = e.currentTarget.dataset.phone;
    // 拨打电话时移除所有非数字字符
    const cleanedPhone = phone.replace(/\D/g, "");
    wx.makePhoneCall({
      phoneNumber: cleanedPhone,
      success: () => {
        console.log("拨打电话成功");
      },
      fail: (err) => {
        console.log("拨打电话失败", err);
      },
    });
  },

  // 在线咨询
  handleOnlineConsult(e) {
    if (!getApp().globalData.userInfo) {
      wx.navigateTo({
        url: "/pages/login/login",
      });
      return;
    }

    const expertId = e.currentTarget.dataset.id;
    const expert = this.data.list.find((item) => item.id === expertId);

    // 调用支付接口
    const token = getApp().globalData.userInfo.token;
    wx.request({
      url: `${config.baseURL}/api/order/add?token=${token}`,
      method: "POST",
      data: {
        lawyerId: expertId,
        type: 1, //图文咨询
      },
      success: (res) => {
        if (res.data.success) {
          wx.request({
            url: `${config.baseURL}/api/wxpay/prepay`,
            data: {
              orderId: res.data.data,
              token: token,
            },
            success: (res) => {
              wx.requestPayment({
                timeStamp: res.data.data.timeStamp,
                nonceStr: res.data.data.nonceStr,
                package: res.data.data.packageValue,
                signType: res.data.data.signType,
                paySign: res.data.data.paySign,
                success: function (res) {
                  console.log("支付成功", res);
                  //支付成功后，跳转聊天
                  wx.navigateTo({
                    url: `../../../tim-chat/pages/index?targetUserID=${expert.phone}&title=${encodeURIComponent(expert.name)}`,
                    fail(err) {
                      wx.showToast({
                        title: "打开聊天失败",
                        icon: "none",
                      });
                    },
                  });
                },
                fail: function (res) {
                  console.log("支付失败", res);
                },
                complete: function (res) {},
              });
            },
            fail: (err) => {
              console.log("支付失败", err);
            },
          });
        } else {
          wx.showToast({
            title: res.data.msg || "创建支付订单失败",
            icon: "none",
          });
        }
      },
      fail: (err) => {
        console.error("请求支付失败：", err);
        wx.showToast({
          title: "创建支付订单失败",
          icon: "none",
        });
      },
    });
  },

  getExperts(pageNum, pageSize) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: config.baseURL + "/api/lawyer/list",
        method: "GET",
        data: {
          pageNo: pageNum,
          pageSize: pageSize,
        },
        dataType: "json",
        success: (res) => {
          if (res.data.success) {
            const formattedList = res.data.data.rows.map((expert) => {
              // 根据type值转换为对应的专家类型标签
              const expertTypeTag = (() => {
                switch (expert.type) {
                  case 0:
                    return "精选专家";
                  case 1:
                    return "资深专家";
                  case 2:
                    return "高级专家";
                  default:
                    return "";
                }
              })();

              // 构建tags数组，包含专家类型和平台保证标记
              const tags = [];
              if (expertTypeTag) {
                tags.push(expertTypeTag);
              }
              if (expert.promised === true) {
                tags.push("平台保证");
              }

              return {
                id: expert.id,
                name: expert.name,
                tags: tags,
                avatar: expert.avatarUrl || this.data.imgUrls.avatar,
                title: expert.title || "律师",
                fields: expert.brief || [],
                consultCount: expert.servedNum || 0,
                years: expert.years || "5年以上",
                phone: expert.phone || "",
                brief: expert.brief || "",
                description: expert.description || "",
                promised: expert.promised || false,
              };
            });
            resolve({
              listArray: formattedList,
              totalRows: res.data.data.totalRows,
            });
          } else {
            reject(new Error(res.data.message || "获取专家列表失败"));
          }
        },
        fail: (err) => {
          reject(err);
        },
      });
    });
  },

  // 计算列表实际可用高度
  calculateListHeight() {
    const query = wx.createSelectorQuery();
    query.select(".fixed-header").boundingClientRect();
    query.select(".exp-title").boundingClientRect();
    query.select(".main-nav").boundingClientRect();

    query.exec((res) => {
      if (res[0] && res[1] && res[2]) {
        const navHeight = res[2].height;
        const titleHeight = res[1].height;
        const safeAreaTop = wx.getSystemInfoSync().safeArea.top;

        // 计算实际需要减去的高度（包括安全区域）
        const totalFixedHeight = navHeight + titleHeight + (safeAreaTop || 0);

        // 转换为rpx（px 转 rpx 需要乘以2）
        const heightInRpx = Math.ceil(totalFixedHeight * 2);

        this.setData({
          listHeight: `calc(100vh - ${heightInRpx}rpx)`,
        });
      }
    });
  },

  // 页面显示时重新计算高度
  onShow() {
    this.calculateListHeight();
  },
});

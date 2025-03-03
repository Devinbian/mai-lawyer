const imageUtils = require("../../utils/image.js");

// pages/experts/experts.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    experts: [],
    allExperts: [], // 存储所有专家数据
    pageSize: 10,
    currentPage: 1,
    isLoading: false,
    hasMore: true,
    isRefreshing: false,
    imgUrls: null,
    bottomPadding: 0,
    canRefresh: true,  // 控制是否可以触发下拉刷新
    scrollTop: 0      // 记录滚动位置
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.showToast({
      title: "加载中...",
      icon: "loading",
      duration: 2000,
    });

    this.setImagesByPixelRatio();
    this.loadInitialData();
  },

  setImagesByPixelRatio() {
    this.setData({
      imgUrls: imageUtils.getCommonImages("experts"),
    });
  },

  // 加载初始数据
  loadInitialData() {
    const mockExperts = this.getMockExperts();

    setTimeout(() => {
      this.setData(
        {
          allExperts: mockExperts,
          experts: mockExperts.slice(0, this.data.pageSize),
          hasMore: mockExperts.length > this.data.pageSize,
          currentPage: 1,
          isLoading: false,
          isRefreshing: false,
        },
        () => {
          wx.hideToast();
        },
      );
    }, 1000);
  },

  // 加载更多数据
  loadMoreData() {
    if (!this.data.hasMore || this.data.isLoading) return;

    this.setData({ isLoading: true });

    setTimeout(() => {
      const { currentPage, pageSize, allExperts } = this.data;
      const nextPage = currentPage + 1;
      const start = (nextPage - 1) * pageSize;
      const end = start + pageSize;

      const newData = [...this.data.experts, ...allExperts.slice(start, end)];

      // 提前计算是否还有更多数据
      const hasMore = end < allExperts.length;

      // 如果已经是最后一页，多显示一些空白
      if (!hasMore) {
        wx.createSelectorQuery()
          .select(".experts-list")
          .boundingClientRect((rect) => {
            if (rect && rect.height < wx.getSystemInfoSync().windowHeight) {
              // 如果内容高度小于屏幕高度，填充一些空白
              this.setData({
                bottomPadding:
                  wx.getSystemInfoSync().windowHeight - rect.height,
              });
            }
          })
          .exec();
      }

      this.setData({
        experts: newData,
        currentPage: nextPage,
        hasMore,
        isLoading: false,
      });
    }, 1000);
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  // 监听滚动事件
  onScroll(e) {
    const scrollTop = e.detail.scrollTop;
    this.setData({
      scrollTop,
      canRefresh: scrollTop <= 0
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    if (!this.data.canRefresh) {
      wx.stopPullDownRefresh();
      return;
    }

    this.setData({
      isRefreshing: true,
      currentPage: 1,
      bottomPadding: 0
    });

    // 模拟刷新延迟
    setTimeout(() => {
      this.loadInitialData();
      this.setData({
        isRefreshing: false
      });
      wx.stopPullDownRefresh();
    }, 1000);
  },

  // 滚动到底部
  onReachBottom() {
    if (this.data.isLoading || !this.data.hasMore) return;
    
    this.setData({
      isLoading: true
    });

    // 模拟加载更多
    setTimeout(() => {
      const newExperts = [...this.data.experts, ...this.getMockExperts()];
      this.setData({
        experts: newExperts,
        isLoading: false,
        hasMore: newExperts.length < 30
      });
    }, 1000);
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},

  // 跳转到专家详情页
  navigateToDetail(e) {
    const expert = e.currentTarget.dataset.expert;
    // 将专家信息转换为查询字符串
    const expertInfo = encodeURIComponent(JSON.stringify(expert));
    wx.navigateTo({
      url: `./expert-detail/expert-detail?expert=${expertInfo}`,
      fail(err) {
        wx.showToast({
          title: "打开详情页失败",
          icon: "none",
        });
      },
    });
  },

  // 电话咨询
  handlePhoneConsult(e) {
    const expertId = e.currentTarget.dataset.id;
    const expert = this.data.experts.find((item) => item.id === expertId);
    if (expert) {
      wx.makePhoneCall({
        phoneNumber: "400-000-0000", // 这里替换为实际的咨询电话
        fail(err) {
          wx.showToast({
            title: "拨打电话失败",
            icon: "none",
          });
        },
      });
    }
  },

  // 在线咨询
  handleOnlineConsult(e) {
    const expertId = e.currentTarget.dataset.id;
    const expert = this.data.experts.find((item) => item.id === expertId);
    if (expert) {
      // 构建专家信息对象
      const expertInfo = {
        id: expert.id,
        name: expert.name,
        avatar: expert.avatar,
        years: expert.years,
        consultCount: expert.consultCount,
        fields: expert.fields,
      };

      wx.navigateTo({
        url:
          "/pages/experts/chat/chat?expert=" +
          encodeURIComponent(JSON.stringify(expertInfo)),
        fail(err) {
          wx.showToast({
            title: "打开聊天失败",
            icon: "none",
          });
        },
      });
    }
  },

  // 获取模拟数据
  getMockExperts() {
    const baseExperts = [
      {
        id: 1,
        name: "张律师",
        avatar: "https://imgapi.cn/api.php?zd=mobile&fl=meizi&gs=images",
        isSenior: true,
        isVerified: true,
        fields: "婚姻家事、劳动纠纷、合同争议",
        years: 15,
        consultCount: 2358,
        isOnline: true,
        tags: ["资深专家", "平台保证"],
      },
      {
        id: 2,
        name: "李律师",
        avatar: "https://imgapi.cn/api.php?zd=mobile&fl=meizi&gs=images",
        isSenior: true,
        isVerified: true,
        fields: "合同纠纷、知识产权、公司法务",
        years: 12,
        consultCount: 1865,
        isOnline: false,
        tags: ["精选专家"],
      },
      {
        id: 3,
        name: "王律师",
        avatar: "https://imgapi.cn/api.php?zd=mobile&fl=meizi&gs=images",
        isSenior: true,
        isVerified: true,
        fields: "刑事辩护、民事诉讼、经济犯罪",
        years: 18,
        consultCount: 3102,
        isOnline: false,
        tags: ["高级专家", "平台保证"],
      },
      {
        id: 4,
        name: "刘律师",
        avatar: "https://imgapi.cn/api.php?zd=mobile&fl=meizi&gs=images",
        isSenior: true,
        isVerified: true,
        fields: "房产纠纷、建筑工程、物业争议",
        years: 10,
        consultCount: 1527,
        isOnline: false,
        tags: ["高级专家", "平台保证"],
      },
      {
        id: 5,
        name: "陈律师",
        avatar: "https://imgapi.cn/api.php?zd=mobile&fl=meizi&gs=images",
        isSenior: false,
        isVerified: true,
        fields: "交通事故、人身损害、医疗纠纷",
        years: 8,
        consultCount: 986,
        isOnline: false,
        tags: ["高级专家", "平台保证"],
      },
      {
        id: 6,
        name: "周律师",
        avatar: "https://imgapi.cn/api.php?zd=mobile&fl=meizi&gs=images",
        isSenior: true,
        isVerified: true,
        fields: "金融证券、投资理财、债权债务",
        years: 16,
        consultCount: 2145,
        isOnline: false,
        tags: ["高级专家", "平台保证"],
      },
      {
        id: 7,
        name: "吴律师",
        avatar: "https://imgapi.cn/api.php?zd=mobile&fl=meizi&gs=images",
        isSenior: false,
        isVerified: true,
        fields: "行政诉讼、行政复议、政府法务",
        years: 9,
        consultCount: 1236,
        isOnline: false,
        tags: ["高级专家", "平台保证"],
      },
      {
        id: 8,
        name: "郑律师",
        avatar: "https://imgapi.cn/api.php?zd=mobile&fl=meizi&gs=images",
        isSenior: true,
        isVerified: true,
        fields: "知识产权、专利商标、著作权",
        years: 14,
        consultCount: 1892,
        isOnline: false,
        tags: ["高级专家", "平台保证"],
      },
      {
        id: 9,
        name: "孙律师",
        avatar: "https://imgapi.cn/api.php?zd=mobile&fl=meizi&gs=images",
        isSenior: false,
        isVerified: true,
        fields: "劳动仲裁、工伤赔偿、社保纠纷",
        years: 7,
        consultCount: 865,
        isOnline: false,
        tags: ["高级专家", "平台保证"],
      },
      {
        id: 10,
        name: "赵律师",
        avatar: "https://imgapi.cn/api.php?zd=mobile&fl=meizi&gs=images",
        isSenior: true,
        isVerified: true,
        fields: "婚姻家事、继承遗产、未成年保护",
        years: 20,
        consultCount: 3526,
        isOnline: false,
        tags: ["高级专家", "平台保证"],
      },
    ];

    // 生成更多模拟数据
    const moreExperts = [];
    for (let i = 0; i < 20; i++) {
      const baseExpert = baseExperts[i % baseExperts.length];
      moreExperts.push({
        ...baseExpert,
        id: baseExperts.length + i + 1,
        name: `${baseExpert.name}${Math.floor(i / baseExperts.length) + 1}`,
        consultCount:
          baseExpert.consultCount + Math.floor(Math.random() * 1000),
        isOnline: Math.random() > 0.7,
      });
    }

    return [...baseExperts, ...moreExperts];
  },
});

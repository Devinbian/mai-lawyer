const imageUtils = require("../../utils/image.js");
const refreshLoadingBehavior = require("../../behaviors/refresh-loading.js");

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
    this.initList();
  },

  setImagesByPixelRatio() {
    this.setData({
      imgUrls: {
        ...imageUtils.getCommonImages(["experts", "expertsDetail", "profile"]),
      },
    });
  },

  // 实现 behavior 中定义的 loadData 方法
  loadData(isLoadMore = false) {
    return new Promise((resolve) => {
      const { pageNum, pageSize } = this.data;
      const mockExperts = this.getMockExperts();
      const start = (pageNum - 1) * pageSize;
      const end = start + pageSize;
      const list = mockExperts.slice(start, end);
      const hasMore = end < mockExperts.length;

      // 如果是最后一页，计算底部填充
      if (!hasMore) {
        wx.createSelectorQuery()
          .select(".experts-list")
          .boundingClientRect((rect) => {
            if (rect && rect.height < wx.getSystemInfoSync().windowHeight) {
              this.setData({
                bottomPadding:
                  wx.getSystemInfoSync().windowHeight - rect.height,
              });
            }
          })
          .exec();
      }

      // 模拟网络延迟
      setTimeout(() => {
        resolve({ list, hasMore });
      }, 500);
    });
  },

  // 监听滚动事件
  onScroll(e) {
    const scrollTop = e.detail.scrollTop;
    this.setData({
      scrollTop,
    });
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
    const expert = this.data.list.find((item) => item.id === expertId);
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
    const expert = this.data.list.find((item) => item.id === expertId);
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
          // "/pages/experts/chat/chat?expert=" +
          // encodeURIComponent(JSON.stringify(expertInfo)),
          '../../tim-chat/pages/index?conversationID=C2Claywer2',
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
        tags: ["资深专家", "刑事辩护"],
        fields: "刑事辩护、经济犯罪、职务犯罪",
        years: 15,
        consultCount: 2000,
      },
      {
        id: 2,
        name: "李律师",
        avatar: "https://imgapi.cn/api.php?zd=mobile&fl=meizi&gs=images",
        tags: ["高级专家", "民事纠纷"],
        fields: "婚姻家事、房产纠纷、合同纠纷",
        years: 12,
        consultCount: 1800,
      },
      {
        id: 3,
        name: "王律师",
        avatar: "https://imgapi.cn/api.php?zd=mobile&fl=meizi&gs=images",
        tags: ["精选专家", "商事诉讼"],
        fields: "公司诉讼、股权纠纷、知识产权",
        years: 10,
        consultCount: 1500,
      },
      {
        id: 4,
        name: "刘律师",
        avatar: "https://imgapi.cn/api.php?zd=mobile&fl=meizi&gs=images",
        tags: ["资深专家", "行政法"],
        fields: "行政诉讼、行政复议、政府法律顾问",
        years: 18,
        consultCount: 2500,
      },
      {
        id: 5,
        name: "陈律师",
        avatar: "https://imgapi.cn/api.php?zd=mobile&fl=meizi&gs=images",
        tags: ["高级专家", "劳动法"],
        fields: "劳动争议、工伤赔偿、劳动合同",
        years: 13,
        consultCount: 1900,
      },
      {
        id: 6,
        name: "杨律师",
        avatar: "https://imgapi.cn/api.php?zd=mobile&fl=meizi&gs=images",
        tags: ["精选专家", "知识产权"],
        fields: "专利诉讼、商标注册、著作权保护",
        years: 11,
        consultCount: 1600,
      },
      {
        id: 7,
        name: "赵律师",
        avatar: "https://imgapi.cn/api.php?zd=mobile&fl=meizi&gs=images",
        tags: ["资深专家", "金融法"],
        fields: "金融诉讼、证券纠纷、保险理赔",
        years: 16,
        consultCount: 2200,
      },
      {
        id: 8,
        name: "周律师",
        avatar: "https://imgapi.cn/api.php?zd=mobile&fl=meizi&gs=images",
        tags: ["高级专家", "房地产"],
        fields: "房地产诉讼、建设工程、物业管理",
        years: 14,
        consultCount: 2000,
      },
      {
        id: 9,
        name: "吴律师",
        avatar: "https://imgapi.cn/api.php?zd=mobile&fl=meizi&gs=images",
        tags: ["精选专家", "医疗纠纷"],
        fields: "医疗事故、医疗纠纷、医疗赔偿",
        years: 12,
        consultCount: 1700,
      },
      {
        id: 10,
        name: "郑律师",
        avatar: "https://imgapi.cn/api.php?zd=mobile&fl=meizi&gs=images",
        tags: ["资深专家", "环境法"],
        fields: "环境诉讼、环保合规、污染治理",
        years: 15,
        consultCount: 1800,
      },
    ];

    // 生成更多模拟数据
    const moreExperts = [];
    for (let i = 11; i <= 30; i++) {
      const expert = {
        id: i,
        name: `${
          ["张", "李", "王", "刘", "陈", "杨", "赵", "周", "吴", "郑"][i % 10]
        }律师${i}`,
        avatar: "https://imgapi.cn/api.php?zd=mobile&fl=meizi&gs=images",
        tags: [
          ["资深专家", "刑事辩护"],
          ["高级专家", "民事纠纷"],
          ["精选专家", "商事诉讼"],
          ["资深专家", "行政法"],
          ["高级专家", "劳动法"],
        ][i % 5],
        fields: [
          "刑事辩护、经济犯罪、职务犯罪",
          "婚姻家事、房产纠纷、合同纠纷",
          "公司诉讼、股权纠纷、知识产权",
          "行政诉讼、行政复议、政府法律顾问",
          "劳动争议、工伤赔偿、劳动合同",
        ][i % 5],
        years: 10 + (i % 10),
        consultCount: 1500 + i * 100,
      };
      moreExperts.push(expert);
    }

    return [...baseExperts, ...moreExperts];
  },
});

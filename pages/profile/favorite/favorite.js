const imageUtil = require("../../../utils/image.js");
const refreshLoadingBehavior = require("../../../behaviors/refresh-loading.js");

Page({
  behaviors: [refreshLoadingBehavior],

  data: {
    imgUrls: null,
  },

  onLoad() {
    console.log("页面加载");
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
      imgUrls: imageUtil.getCommonImages(["profile", "default"]),
    });
  },

  // 实现 loadData 方法，这是 behavior 中约定的接口
  loadData(isLoadMore = false) {
    return new Promise((resolve) => {
      // 模拟接口请求
      setTimeout(() => {
        const allTitles = [
          // 第一页数据
          "房屋买卖合同纠纷案例解析",
          "租赁合同违约责任探讨",
          "建筑工程施工合同法律实务",
          "商品房预售合同权责分析",
          "二手房买卖合同注意事项",
          "物业服务合同争议处理",
          "房屋拆迁补偿协议指南",
          "房产继承纠纷案例分析",
          "房屋抵押贷款合同解读",
          "房屋装修合同范本详解",
          "房屋租赁合同示范文本",
          "商铺租赁合同法律要点",
          "房产交易纠纷处理指南",
          "物业管理合同条款解读",
          "房屋买卖定金协议范本",
          "房屋中介服务合同分析",
          "房屋抵押权设立指南",
          "房产分割协议要点说明",
          "房屋租赁押金纠纷处理",
          "房屋买卖过户流程详解",
          // 第二页数据
          "房屋租赁违约金约定",
          "商品房认购协议解析",
          "房屋买卖税费计算指南",
          "物业费争议处理方案",
          "房屋共有权属认定",
          "房屋租赁续租权探讨",
          "房产抵押贷款流程",
          "房屋买卖定金双倍赔偿",
          "房屋装修质量纠纷",
          "房屋租赁优先购买权",
          "房屋买卖合同示范文本",
          "租赁合同解除条款分析",
          "房产抵押风险防范",
          "物业费调整程序解析",
          "房屋买卖违约责任",
          "房屋租赁合同变更",
          "房产证办理流程指南",
          "房屋租赁纠纷调解",
          "房屋买卖定金纠纷",
          "物业服务质量标准",
          // 第三页数据
          "房屋买卖合同效力",
          "租赁合同续签要点",
          "房产抵押注意事项",
          "物业服务合同终止",
          "房屋买卖价款支付",
          "房屋租赁押金返还",
          "房产证遗失补办",
          "房屋租赁合同解释",
          "房屋买卖过户税费",
          "物业服务范围界定",
          "房屋抵押登记流程",
          "租赁合同履行问题",
          "房产交易资金监管",
          "物业费收取标准",
          "房屋买卖合同效力",
          "房屋租赁期限约定",
          "房产抵押权实现",
          "房屋租赁优先权",
          "房屋买卖定金性质",
          "物业服务考核机制",
        ];

        const startIndex = (this.data.pageNum - 1) * this.data.pageSize;
        const endIndex = startIndex + this.data.pageSize;
        const currentPageTitles = allTitles.slice(startIndex, endIndex);

        const mockData = currentPageTitles.map((title, index) => ({
          id: `favorite_${startIndex + index}`,
          title: title,
          date: new Date(
            Date.now() - index * 24 * 60 * 60 * 1000,
          ).toISOString(),
        }));

        resolve({
          list: mockData,
          hasMore: endIndex < allTitles.length,
        });
      }, 1000);
    });
  },

  // 点击收藏项
  handleItemClick(e) {
    const { id } = e.currentTarget.dataset;
    console.log("点击收藏项：", id);
    wx.navigateTo({
      url: `/pages/document/detail/detail?id=${id}`,
    });
  },
});

const imageUtil = require("../../../utils/image.js");
const refreshLoadingBehavior = require("../../../behaviors/refresh-loading.js");

Page({
  behaviors: [refreshLoadingBehavior],

  data: {
    imgUrls: null,
    downloadStatus: "completed", // completed: 已下载, downloading: 下载中
    currentTab: "all",
  },

  onLoad() {
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
      imgUrls: imageUtil.getCommonImages(["documentGet", "default"]),
    });
  },

  // 切换主分类（已下载/下载中）
  switchMainTab(e) {
    const status = e.currentTarget.dataset.status;
    if (status === this.data.downloadStatus) return;

    this.setData(
      {
        downloadStatus: status,
        currentTab: "all",
      },
      () => {
        this.initList();
      },
    );
  },

  // 切换二级分类
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.currentTab) return;

    this.setData(
      {
        currentTab: tab,
      },
      () => {
        this.initList();
      },
    );
  },

  // 生成随机时间
  generateRandomTime() {
    const now = new Date();
    const randomDays = Math.floor(Math.random() * 30); // 最近30天内
    const randomHours = Math.floor(Math.random() * 24);
    const randomMinutes = Math.floor(Math.random() * 60);

    now.setDate(now.getDate() - randomDays);
    now.setHours(randomHours);
    now.setMinutes(randomMinutes);

    return now.toLocaleDateString("zh-CN").replace(/\//g, "-");
  },

  // 实现 loadData 方法，这是 behavior 中约定的接口
  loadData(isLoadMore = false) {
    return new Promise((resolve) => {
      // 模拟接口请求
      setTimeout(() => {
        const titles = [
          "西安市住房租赁合同示范文本(住房租赁企业版)(西安市2023版)",
          "劳动合同协议书标准模板",
          "房屋买卖合同范本",
          "民事起诉状模板",
          "民事答辩状范本",
          "法律意见书模板",
          "委托代理协议书",
          "财产分割协议书",
        ];

        const mockData = Array(10)
          .fill({})
          .map((_, index) => ({
            id: this.data.list.length + index + 1,
            title: titles[Math.floor(Math.random() * titles.length)],
            date: this.generateRandomTime(),
            type: Math.random() > 0.5 ? "word" : "pdf",
            price: Math.random() > 0.7 ? Math.floor(Math.random() * 20 + 5) : 0,
            status: this.data.downloadStatus,
          }));

        // 按时间排序
        mockData.sort((a, b) => new Date(b.date) - new Date(a.date));

        resolve({
          list: mockData,
          hasMore: mockData.length === 10,
        });
      }, 1000);
    });
  },

  // 点击文档
  handleItemClick(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/documents/document-read/document-read?id=${id}`,
    });
  },
});

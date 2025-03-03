const imageUtil = require("../../../utils/image.js");

Page({
  data: {
    imgUrls: null,
    downloadStatus: "completed", // completed: 已下载, downloading: 下载中
    currentTab: "all",
    downloadList: [],
    pageNum: 1,
    pageSize: 10,
    isLoading: false,
    hasMore: true,
    isRefreshing: false, // 添加下拉刷新状态
  },

  onLoad() {
    wx.showToast({
      title: "加载中...",
      icon: "loading",
      duration: 2000,
    });
    this.setImagesByPixelRatio();
    this.loadDownloadList();
  },

  setImagesByPixelRatio() {
    this.setData({
      imgUrls: imageUtil.getCommonImages("documentGet"),
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
        downloadList: [],
        pageNum: 1,
        hasMore: true,
      },
      () => {
        this.loadDownloadList();
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
        downloadList: [],
        pageNum: 1,
        hasMore: true,
      },
      () => {
        this.loadDownloadList();
      },
    );
  },

  // 下拉刷新
  onRefresh() {
    if (this.data.isLoading) return;

    this.setData({
      isRefreshing: true,
      pageNum: 1,
      hasMore: true,
    });

    this.loadDownloadList();
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

  // 加载下载列表
  loadDownloadList(isLoadMore = false) {
    if (this.data.isLoading) return;

    this.setData({
      isLoading: true,
    });

    // 这里应该调用后端API获取下载列表
    // 模拟API调用
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
          id: this.data.downloadList.length + index + 1,
          title: titles[Math.floor(Math.random() * titles.length)],
          date: this.generateRandomTime(),
          type: Math.random() > 0.5 ? "word" : "pdf",
          price: Math.random() > 0.7 ? Math.floor(Math.random() * 20 + 5) : 0,
          status: this.data.downloadStatus,
        }));

      // 按时间排序
      mockData.sort((a, b) => new Date(b.date) - new Date(a.date));

      this.setData(
        {
          downloadList: isLoadMore
            ? [...this.data.downloadList, ...mockData]
            : mockData,
          isLoading: false,
          isRefreshing: false,
          hasMore: mockData.length === 10,
        },
        () => {
          if (!isLoadMore) {
            wx.hideToast(); // 初始加载完成后隐藏toast
          }
        },
      );
    }, 1000);
  },

  // 加载更多
  loadMore() {
    if (this.data.isLoading || !this.data.hasMore) return;

    this.setData({
      pageNum: this.data.pageNum + 1,
    });

    this.loadDownloadList(true);
  },

  // 点击文档
  handleItemClick(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/documents/document-read/document-read?id=${id}`,
    });
  },
});

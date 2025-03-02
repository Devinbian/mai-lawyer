const imageUtil = require('../../../utils/image.js');

Page({
  data: {
    imgUrls: null,
    downloadStatus: 'completed', // completed: 已下载, downloading: 下载中
    currentTab: 'all',
    downloadList: [],
    pageNum: 1,
    pageSize: 10,
    isLoading: false,
    hasMore: true
  },

  onLoad() {
    this.setImagesByPixelRatio();
    this.loadDownloadList();
  },

  setImagesByPixelRatio() {
    this.setData({
      imgUrls: imageUtil.getCommonImages('documentGet')
    });
  },

  // 切换主分类（已下载/下载中）
  switchMainTab(e) {
    const status = e.currentTarget.dataset.status;
    if (status === this.data.downloadStatus) return;
    
    this.setData({
      downloadStatus: status,
      currentTab: 'all',
      downloadList: [],
      pageNum: 1,
      hasMore: true
    }, () => {
      this.loadDownloadList();
    });
  },

  // 切换二级分类
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.currentTab) return;
    
    this.setData({
      currentTab: tab,
      downloadList: [],
      pageNum: 1,
      hasMore: true
    }, () => {
      this.loadDownloadList();
    });
  },

  // 加载下载列表
  loadDownloadList(isLoadMore = false) {
    if (this.data.isLoading || (!isLoadMore && !this.data.hasMore)) return;

    this.setData({ isLoading: true });
    
    if (!isLoadMore) {
      wx.showLoading({
        title: '加载中',
        mask: true
      });
    }

    // 这里应该调用后端API获取下载列表
    // 模拟API调用
    setTimeout(() => {
      const mockData = Array(5).fill({}).map((_, index) => ({
        id: this.data.downloadList.length + index + 1,
        title: '西安市住房租赁合同示范文本(住房租赁企业版)(西安市2023版)',
        date: '2024-03-01',
        type: Math.random() > 0.5 ? 'word' : 'pdf',
        price: Math.random() > 0.5 ? 0 : 7,
        status: this.data.downloadStatus // 添加状态标识
      }));

      this.setData({
        downloadList: isLoadMore ? [...this.data.downloadList, ...mockData] : mockData,
        isLoading: false,
        hasMore: mockData.length === this.data.pageSize,
        pageNum: isLoadMore ? this.data.pageNum + 1 : 1
      });

      if (!isLoadMore) {
        wx.hideLoading();
      }
    }, 1000);
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadDownloadList();
    wx.stopPullDownRefresh();
  },

  // 加载更多
  loadMore() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.loadDownloadList(true);
    }
  }
}); 
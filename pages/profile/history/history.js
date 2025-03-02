const imageUtil = require('../../../utils/image.js');

Page({
  data: {
    imgUrls: null,
    historyList: [],
    pageNum: 1,
    pageSize: 20,
    isLoading: false,
    hasMore: true
  },

  onLoad() {
    this.setImagesByPixelRatio();
    this.loadHistoryList();
  },

  setImagesByPixelRatio() {
    this.setData({
      imgUrls: {
        empty: imageUtil.getCommonImages('chat')
      }
    });
  },

  // 加载咨询历史列表
  loadHistoryList(isLoadMore = false) {
    if (this.data.isLoading || (!isLoadMore && !this.data.hasMore)) return;

    this.setData({ isLoading: true });
    
    if (!isLoadMore) {
      wx.showLoading({
        title: '加载中',
        mask: true
      });
    }

    // 这里应该调用后端API获取咨询历史列表
    // 模拟API调用
    setTimeout(() => {
      const mockData = Array(5).fill({}).map((_, index) => ({
        id: this.data.historyList.length + index + 1,
        name: '俞丛律师',
        avatar: 'https://imgapi.cn/api.php?zd=mobile&fl=meizi&gs=images', // 需要替换为实际的头像URL
        time: '2024/02/10 10:00:00',
        lastMessage: '需要明确说明一下具体问题，需要提出需要明确说明一下具体问题，需要提出...',
        online: Math.random() > 0.5
      }));

      this.setData({
        historyList: isLoadMore ? [...this.data.historyList, ...mockData] : mockData,
        isLoading: false,
        hasMore: mockData.length === this.data.pageSize,
        pageNum: isLoadMore ? this.data.pageNum + 1 : 1
      });

      if (!isLoadMore) {
        wx.hideLoading();
      }
    }, 1000);
  },

  // 点击咨询记录
  handleItemClick(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/experts/chat/chat?id=${id}`
    });
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadHistoryList();
    wx.stopPullDownRefresh();
  },

  // 加载更多
  loadMore() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.loadHistoryList(true);
    }
  }
}); 
const imageUtil = require("../../../utils/image.js");

Page({
  data: {
    imgUrls: null,
    favoriteList: [],
    pageNum: 1,
    pageSize: 10,
    isLoading: false,
    hasMore: true,
    contentHeight: 0,
    screenHeight: 0,
    statusBarHeight: 0,
    navBarHeight: 0,
  },

  onLoad() {
    // 获取窗口信息
    const windowInfo = wx.getWindowInfo();
    this.setData({
      statusBarHeight: windowInfo.statusBarHeight,
      navBarHeight: windowInfo.navigationBarHeight || 44,
    });

    this.setImagesByPixelRatio();
    this.loadFavoriteList();
    this.initScreenHeight();
  },

  initScreenHeight() {
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      screenHeight: systemInfo.windowHeight - 180, // 减去顶部导航的高度
    });
  },

  onReady() {
    this.calculateContentHeight();
  },

  calculateContentHeight() {
    const query = wx.createSelectorQuery();
    query
      .select(".favorite-list")
      .boundingClientRect((rect) => {
        if (rect) {
          this.setData({
            contentHeight: rect.height,
          });
        }
      })
      .exec();
  },

  setImagesByPixelRatio() {
    this.setData({
      imgUrls: imageUtil.getCommonImages("profile"),
    });
  },

  // 加载收藏列表
  loadFavoriteList(isLoadMore = false) {
    if (this.data.isLoading || (!isLoadMore && !this.data.hasMore)) return;

    this.setData({ isLoading: true });

    if (!isLoadMore) {
      wx.showLoading({
        title: "加载中",
        mask: true,
      });
    }

    // 这里应该调用后端API获取收藏列表
    // 模拟API调用
    setTimeout(() => {
      const mockData = Array(5)
        .fill({})
        .map((_, index) => ({
          id: this.data.favoriteList.length + index + 1,
          title:
            "示例文档示例文档示例文档示例文档示例文档示例文档示例文档示例文档示例文档示例文档示例文档" +
            (this.data.favoriteList.length + index + 1),
          description: "这是一个示例文档描述，用于展示文档的基本信息。",
          date: "2024-03-01",
          type: Math.random() > 0.5 ? "word" : "pdf",
        }));

      this.setData({
        favoriteList: isLoadMore
          ? [...this.data.favoriteList, ...mockData]
          : mockData,
        isLoading: false,
        hasMore: mockData.length === this.data.pageSize,
        pageNum: isLoadMore ? this.data.pageNum + 1 : 1,
      });

      if (!isLoadMore) {
        wx.hideLoading();
      }
    }, 1000);
  },

  // 下拉刷新
  onPullDownRefresh() {
    this.loadFavoriteList();
    wx.stopPullDownRefresh();
  },

  // 加载更多
  loadMore() {
    if (this.data.hasMore && !this.data.isLoading) {
      this.loadFavoriteList(true);
    }
  },

  // 点击文档
  handleItemClick(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/documents/document-read/document-read?id=${id}`,
    });
  },

  // 取消收藏
  handleUnfavorite(e) {
    const { id } = e.currentTarget.dataset;
    wx.showModal({
      title: "提示",
      content: "确定要取消收藏该文档吗？",
      success: (res) => {
        if (res.confirm) {
          // 这里应该调用后端API取消收藏
          // 模拟API调用
          const favoriteList = this.data.favoriteList.filter(
            (item) => item.id !== id,
          );
          this.setData({ favoriteList });
          wx.showToast({
            title: "已取消收藏",
            icon: "success",
          });
        }
      },
    });
  },
});

module.exports = Behavior({
  data: {
    // 列表数据
    list: [],
    // 分页相关
    pageNum: 1,
    pageSize: 20,
    hasMore: true,
    // 加载状态
    isLoading: false,
    isRefreshing: false,
    isInitialLoading: true,
  },

  methods: {
    // 初始化列表数据
    initList() {
      this.setData({
        list: [],
        pageNum: 1,
        hasMore: true,
        isInitialLoading: true,
      });
      this.loadList();
    },

    // 下拉刷新
    onRefresh() {
      if (this.data.isLoading) {
        wx.stopPullDownRefresh();
        return;
      }

      console.log("触发下拉刷新");
      this.setData({
        isRefreshing: true,
        pageNum: 1,
        hasMore: true,
      });

      this.loadList();
    },

    // 加载更多
    loadMore() {
      if (this.data.isLoading || !this.data.hasMore) {
        return;
      }

      console.log("触发加载更多");
      this.setData({
        pageNum: this.data.pageNum + 1,
      });

      this.loadList(true);
    },

    // 加载列表数据
    loadList(isLoadMore = false) {
      if (this.data.isLoading) {
        console.log("正在加载中，跳过本次加载");
        return;
      }

      this.setData({
        isLoading: true,
      });

      // 调用页面提供的加载数据方法
      if (typeof this.loadData === "function") {
        this.loadData(isLoadMore)
          .then((res) => {
            this.handleLoadSuccess(res, isLoadMore);
          })
          .catch((err) => {
            this.handleLoadError(err);
          });
      }
    },

    // 处理加载成功
    handleLoadSuccess(res, isLoadMore) {
      const { list, hasMore } = res;

      this.setData(
        {
          list: isLoadMore ? [...this.data.list, ...list] : list,
          isLoading: false,
          isRefreshing: false,
          hasMore: hasMore,
          isInitialLoading: false,
        },
        () => {
          if (!isLoadMore) {
            wx.hideToast();
          }
          wx.stopPullDownRefresh();
        },
      );
    },

    // 处理加载失败
    handleLoadError(err) {
      console.error("加载失败：", err);
      this.setData({
        isLoading: false,
        isRefreshing: false,
        isInitialLoading: false,
      });
      wx.hideToast();
      wx.stopPullDownRefresh();

      // 显示错误提示
      wx.showToast({
        title: "加载失败，请重试",
        icon: "none",
        duration: 2000,
      });
    },
  },
});

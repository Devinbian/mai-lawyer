const imageUtil = require("../../../utils/image.js");

Page({
  data: {
    imgUrls: null,
    historyList: [],
    pageNum: 1,
    pageSize: 20,
    isLoading: false,
    hasMore: true,
    isRefreshing: false,
  },

  onLoad() {
    wx.showToast({
      title: "加载中...",
      icon: "loading",
      duration: 2000,
    });
    this.setImagesByPixelRatio();
    this.loadHistoryList();
  },

  setImagesByPixelRatio() {
    this.setData({
      imgUrls: imageUtil.getCommonImages("chat"),
    });
  },

  // 下拉刷新
  onRefresh() {
    if (this.data.isLoading) return;

    this.setData({
      isRefreshing: true,
      pageNum: 1,
      hasMore: true,
    });

    this.loadHistoryList();
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

    const date = now.toLocaleDateString("zh-CN").replace(/\//g, "-");
    const time = now.toTimeString().split(" ")[0];
    return `${date} ${time}`;
  },

  // 加载咨询历史列表
  loadHistoryList(isLoadMore = false) {
    if (this.data.isLoading) return;

    this.setData({
      isLoading: true,
    });

    // 这里应该调用后端API获取咨询历史列表
    // 模拟API调用
    setTimeout(() => {
      const lawyerNames = [
        "俞丛律师",
        "张三律师",
        "李四律师",
        "王五律师",
        "赵六律师",
      ];
      const messages = [
        "您好，我想咨询一下房屋买卖合同的问题...",
        "关于交通事故赔偿的问题需要请教一下...",
        "我公司与供应商发生了合同纠纷，想了解一下...",
        "请问离婚财产分割的相关法律规定是...",
        "关于工伤认定的问题想咨询一下...",
        "我想了解一下知识产权保护的相关问题...",
      ];

      const mockData = Array(10)
        .fill({})
        .map((_, index) => ({
          id: this.data.historyList.length + index + 1,
          name: lawyerNames[Math.floor(Math.random() * lawyerNames.length)],
          avatar: "https://imgapi.cn/api.php?zd=mobile&fl=meizi&gs=images",
          time: this.generateRandomTime(),
          lastMessage: messages[Math.floor(Math.random() * messages.length)],
          online: Math.random() > 0.5,
        }));

      // 按时间排序
      mockData.sort((a, b) => new Date(b.time) - new Date(a.time));

      this.setData(
        {
          historyList: isLoadMore
            ? [...this.data.historyList, ...mockData]
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

  // 点击咨询记录
  handleItemClick(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/experts/chat/chat?id=${id}`,
    });
  },

  // 加载更多
  loadMore() {
    if (this.data.isLoading || !this.data.hasMore) return;

    this.setData({
      pageNum: this.data.pageNum + 1,
    });

    this.loadHistoryList(true);
  },
});

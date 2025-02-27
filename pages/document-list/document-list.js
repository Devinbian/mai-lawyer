Page({
  data: {
    title: "",
    keyword: "",
    documents: [
      {
        id: 1,
        title: "劳动合同范本",
        summary: "适用于一般劳动关系的合同模板...",
        docNumber: "HT202401001",
        wordCount: 2500,
        createTime: "2024-01-15",
        price: 0,
      },
      {
        id: 2,
        title: "房屋租赁合同",
        summary: "规范房屋租赁关系的合同文本...",
        docNumber: "HT202401002",
        wordCount: 3200,
        createTime: "2024-01-16",
        price: 29,
      },
      // 可以添加更多文档
    ],
  },

  onLoad(options) {
    const { id, title } = options;
    this.setData({ title });
    // TODO: 根据分类id获取文档列表
    this.getDocuments(id);
  },

  // 搜索
  handleSearch(e) {
    const keyword = e.detail.value;
    this.setData({ keyword });
    // TODO: 实现搜索功能
  },

  // 获取文档列表
  async getDocuments(categoryId) {
    // TODO: 调用接口获取文档列表
  },

  // 下载文档
  handleDownload(e) {
    const { id } = e.currentTarget.dataset;
    // TODO: 实现下载功能
    wx.showToast({
      title: "开始下载...",
      icon: "none",
    });
  },

  // 预览文档
  handlePreview(e) {
    const { id } = e.currentTarget.dataset;
    // TODO: 实现预览功能
    wx.showToast({
      title: "功能开发中",
      icon: "none",
    });
  },
});

Page({
  data: {
    documents: [
      {
        id: 1,
        title: '劳动合同模板',
        description: '标准劳动合同文本',
        date: '2024-03-20',
        type: '合同文书'
      }
      // 可以添加更多文档
    ]
  },
  onLoad(options) {
    // 可以根据options.type加载不同类型的文档
    const { type } = options;
    if (type) {
      wx.setNavigationBarTitle({
        title: type
      });
    }
  }
}) 
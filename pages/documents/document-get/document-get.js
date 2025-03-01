Page({
  data: {
    document: null,
    selectedService: false,
    totalPrice: 0,
    servicePrice: 30 // 专家服务价格
  },

  onLoad(options) {
    if (options.id && options.document) {
      try {
        const document = JSON.parse(decodeURIComponent(options.document));
        // 确保document.type有值，默认为word
        document.type = document.type || 'word';
        
        this.setData({
          document,
          totalPrice: document.price || 0
        });
      } catch (error) {
        console.error('解析文档数据失败:', error);
        wx.showToast({
          title: '加载文档失败',
          icon: 'none'
        });
      }
    }
  },

  // 切换专家服务
  toggleService() {
    const selectedService = !this.data.selectedService;
    const documentPrice = this.data.document?.price || 0;
    const totalPrice = selectedService ? 
      documentPrice + this.data.servicePrice : 
      documentPrice;

    this.setData({
      selectedService,
      totalPrice
    });
  },

  // 查看服务详情
  showServiceDetail() {
    wx.showModal({
      title: '专家核稿服务说明',
      content: '由专业律师团队为您审核文件内容，确保合同条款完整、合规，避免潜在风险，保障您的合法权益。',
      showCancel: false,
      confirmText: '我知道了'
    });
  },

  // 确认支付
  onPayTap() {
    const { totalPrice, selectedService, document } = this.data;
    
    wx.showLoading({
      title: '正在支付...',
    });

    // TODO: 调用支付接口
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '支付成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          // 支付成功后返回文档阅读页
          setTimeout(() => {
            wx.navigateBack();
          }, 2000);
        }
      });
    }, 1500);
  }
}); 
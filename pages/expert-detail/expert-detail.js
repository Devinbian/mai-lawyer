Page({
  data: {
    expert: {
      id: 1,
      name: '张律师',
      title: '资深律师',
      avatar: '/static/images/expert-1.png',
      tags: ['经验丰富', '响应快速', '专业可靠'],
      introduction: '从业20年，专注于劳动法、合同法等领域...',
      fields: [
        '劳动争议',
        '合同纠纷',
        '知识产权',
        '公司法务'
      ]
    }
  },

  onLoad(options) {
    const { id } = options;
    if (id) {
      // TODO: 根据ID获取专家详情
      console.log('专家ID:', id);
    }
  },

  handleConsult() {
    // 处理咨询按钮点击
    wx.showModal({
      title: '提示',
      content: '是否立即咨询该专家？',
      success(res) {
        if (res.confirm) {
          // TODO: 跳转到咨询页面或创建咨询会话
        }
      }
    });
  }
}) 
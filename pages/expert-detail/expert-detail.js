Page({
  data: {
    expert: null,
    services: [
      {
        icon: "/assets/images/service1.png",
        name: "图文咨询",
        price: "99元/次",
      },
      {
        icon: "/assets/images/service2.png",
        name: "电话咨询",
        price: "199元/30分钟",
      },
      {
        icon: "/assets/images/service3.png",
        name: "见面咨询",
        price: "500元/小时",
      },
      {
        icon: "/assets/images/service4.png",
        name: "代制诉状",
        price: "1000元起",
      },
      {
        icon: "/assets/images/service5.png",
        name: "律师函",
        price: "800元起",
      },
    ],
    isFollowed: false,
  },

  onLoad(options) {
    const { id } = options;
    // TODO: 根据id获取专家详情
    this.getExpertDetail(id);
  },

  // 获取专家详情
  async getExpertDetail(id) {
    // TODO: 调用接口获取专家详情
    const expert = {
      id: id,
      avatar: "/assets/images/expert1.png",
      name: "张律师",
      title: "金牌律师",
      followCount: 2356,
      serviceCount: 1890,
      years: 15,
      tags: ["婚姻家事", "劳动纠纷", "合同纠纷"],
      introduction: "从业15年，专注于婚姻家事、劳动纠纷等领域...",
    };
    this.setData({ expert });
  },

  // 关注/取消关注
  handleFollow() {
    // TODO: 实现关注/取消关注接口调用
    this.setData({
      isFollowed: !this.data.isFollowed,
    });
  },

  // 选择服务
  selectService(e) {
    const { index } = e.currentTarget.dataset;
    const service = this.data.services[index];
    // TODO: 实现服务选择逻辑
    wx.showToast({
      title: `已选择${service.name}`,
      icon: "none",
    });
  },
});

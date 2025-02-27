Page({
  data: {
    experts: [
      {
        id: 1,
        avatar: "/static/images/expert1.png",
        name: "张律师",
        tags: ["金牌律师", "民商专家"],
        specialties: "婚姻家事、劳动纠纷、合同纠纷",
        years: 15,
        consultCount: 2380,
        rating: 4.9,
      },
      {
        id: 2,
        avatar: "/static/images/expert2.png",
        name: "李律师",
        tags: ["资深律师", "刑事专家"],
        specialties: "刑事辩护、经济犯罪、职务犯罪",
        years: 12,
        consultCount: 1860,
        rating: 4.8,
      },
      // 可以添加更多专家数据
    ],
  },

  // 跳转到专家详情
  goToExpertDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/expert-detail/expert-detail?id=${id}`,
    });
  },

  // 电话咨询
  handlePhoneConsult(e) {
    const { phone } = e.currentTarget.dataset;
    wx.makePhoneCall({
      phoneNumber: phone || "400-000-0000",
    });
  },

  // 在线咨询
  handleOnlineConsult(e) {
    const { id } = e.currentTarget.dataset;
    // TODO: 实现在线咨询逻辑
    wx.showToast({
      title: "功能开发中",
      icon: "none",
    });
  },
});

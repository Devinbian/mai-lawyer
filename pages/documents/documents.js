Page({
  data: {
    categories: [
      {
        id: 1,
        title: "合同协议",
        desc: "各类合同范本",
        icon: "/assets/images/contract.png",
        count: 128,
      },
      {
        id: 2,
        title: "起诉状",
        desc: "诉讼文书模板",
        icon: "/assets/images/lawsuit.png",
        count: 86,
      },
      {
        id: 3,
        title: "答辩状",
        desc: "答辩文书模板",
        icon: "/assets/images/defense.png",
        count: 64,
      },
      {
        id: 4,
        title: "法律意见",
        desc: "专业法律分析",
        icon: "/assets/images/legal-opinion.png",
        count: 92,
      },
      {
        id: 5,
        title: "申请文书",
        desc: "各类申请文件",
        icon: "/assets/images/application.png",
        count: 75,
      },
      {
        id: 6,
        title: "通用文书",
        desc: "常用法律文书",
        icon: "/assets/images/general.png",
        count: 156,
      },
    ],
  },

  // 跳转到文书列表
  goToDocList(e) {
    const { id, title } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/document-list/document-list?id=${id}&title=${title}`,
    });
  },
});

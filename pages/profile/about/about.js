const imageUtils = require("../../../utils/image.js");

Page({
  data: {
    imgUrls: null,
    needScroll: false,
    version: "1.0.0",
    platform: "",
    SDKVersion: "",
  },

  onLoad() {
    // 获取应用信息
    const appInfo = wx.getAppBaseInfo();
    this.setData({
      version: appInfo.version || "1.0.0",
      platform: appInfo.platform,
      SDKVersion: appInfo.SDKVersion,
    });

    this.setImagesByPixelRatio();
  },

  onReady() {
    // this.checkNeedScroll()
  },

  setImagesByPixelRatio() {
    this.setData({ imgUrls: imageUtils.getCommonImages("default") });
  },

  checkNeedScroll() {
    const query = wx.createSelectorQuery();
    query.select(".about-content").boundingClientRect();
    query.exec((res) => {
      if (res[0]) {
        const contentHeight = res[0].height;
        const systemInfo = wx.getSystemInfoSync();
        const windowHeight = systemInfo.windowHeight;
        const needScroll = contentHeight > windowHeight - 180; // 180rpx是顶部padding
        this.setData({ needScroll });
      }
    });
  },
});

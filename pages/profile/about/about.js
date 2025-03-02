const imageUtils = require('../../../utils/image.js');

Page({
  data: {
    imgUrls: null,
    needScroll: false
  },

  onLoad() {
    this.setImagesByPixelRatio()
  },

  onReady() {
    // this.checkNeedScroll()
  },

  setImagesByPixelRatio() {

    this.setData({ imgUrls: imageUtils.getCommonImages('default') })
  },

  checkNeedScroll() {
    const query = wx.createSelectorQuery()
    query.select('.about-content').boundingClientRect()
    query.exec(res => {
      if (res[0]) {
        const contentHeight = res[0].height
        const systemInfo = wx.getSystemInfoSync()
        const windowHeight = systemInfo.windowHeight
        const needScroll = contentHeight > windowHeight - 180 // 180rpx是顶部padding
        this.setData({ needScroll })
      }
    })
  }
}) 
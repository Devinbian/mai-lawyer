const imageUtil = require('../../../utils/image.js');

Page({
  data: {
    imgUrls: null
  },

  onLoad() {
    this.setImagesByPixelRatio();
  },

  setImagesByPixelRatio() {
    this.setData({
      imgUrls: imageUtil.getCommonImages('default')
    });
  }
}); 
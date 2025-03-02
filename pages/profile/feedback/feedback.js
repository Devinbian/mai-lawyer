const imageUtil = require('../../../utils/image.js');
Page({
  data: {
    currentTab: 'suggest',
    content: '',
    contentLength: 0,
    uploadImages: [],
    contact: '',
    canSubmit: false,
    imgUrls: null
  },

  onLoad() {
    this.setImagesByPixelRatio();
  },

  // 切换反馈类型
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.currentTab) return;
    
    this.setData({
      currentTab: tab
    });
  },

  // 输入反馈内容
  handleContentInput(e) {
    const content = e.detail.value;
    this.setData({
      content,
      contentLength: content.length
    });
    this.checkCanSubmit();
  },

  // 输入联系方式
  handleContactInput(e) {
    this.setData({
      contact: e.detail.value
    });
    this.checkCanSubmit();
  },

  // 选择图片
  chooseImage() {
    const count = 3 - this.data.uploadImages.length;
    wx.chooseImage({
      count,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        this.setData({
          uploadImages: [...this.data.uploadImages, ...res.tempFilePaths]
        });
      }
    });
  },

  // 预览图片
  previewImage(e) {
    const index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: this.data.uploadImages[index],
      urls: this.data.uploadImages
    });
  },

  // 删除图片
  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const uploadImages = this.data.uploadImages.filter((_, i) => i !== index);
    this.setData({ uploadImages });
  },

  // 检查是否可以提交
  checkCanSubmit() {
    const { content, contact } = this.data;
    const canSubmit = content.trim().length > 0 && contact.trim().length > 0;
    this.setData({ canSubmit });
  },

  // 提交反馈
  handleSubmit() {
    if (!this.data.canSubmit) return;

    wx.showLoading({
      title: '提交中',
      mask: true
    });

    // 这里应该调用后端API提交反馈
    // 模拟API调用
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '提交成功',
        icon: 'success',
        duration: 2000,
        success: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 2000);
        }
      });
    }, 1500);
  },

  setImagesByPixelRatio() {
    this.setData({
      imgUrls: imageUtil.getCommonImages('profile')
    });
  }
}); 
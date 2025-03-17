const imageUtil = require("../../../utils/image.js");
const config = require("../../../utils/config.js");
Page({
  data: {
    currentTab: "suggest",
    content: "",
    contentLength: 0,
    uploadImages: [],
    contact: "",
    canSubmit: false,
    imgUrls: null,
  },

  onLoad() {
    this.setImagesByPixelRatio();
  },

  // 切换反馈类型
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.currentTab) return;

    this.setData({
      currentTab: tab,
    });
  },

  // 输入反馈内容
  handleContentInput(e) {
    const content = e.detail.value;
    this.setData({
      content,
      contentLength: content.length,
    });
    this.checkCanSubmit();
  },

  // 输入联系方式
  handleContactInput(e) {
    this.setData({
      contact: e.detail.value,
    });
    this.checkCanSubmit();
  },

  // 选择图片
  chooseImage() {
    const count = 3 - this.data.uploadImages.length;
    wx.chooseImage({
      count,
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: (res) => {
        this.setData({
          uploadImages: [...this.data.uploadImages, ...res.tempFilePaths],
        });
      },
    });
  },

  // 预览图片
  previewImage(e) {
    const index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: this.data.uploadImages[index],
      urls: this.data.uploadImages,
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

  uploadFile(options) {
    return new Promise((resolve, reject) => {
      wx.uploadFile({
        ...options,
        success: (res) => resolve(res),
        fail: (err) => reject(err),
      });
    });
  },

  // 提交反馈
  async handleSubmit() {
    if (!this.data.canSubmit) return;

    wx.showLoading({
      title: "提交中",
      mask: true,
    });

    try {
      // 先上传图片（如果有的话）
      const uploadedImages = [];
      if (this.data.uploadImages.length > 0) {
        for (const imagePath of this.data.uploadImages) {
          const res = await this.uploadFile({
            filePath: imagePath,
            name: "file",
            url: config.baseURL + "/api/file/upload?secretFlag=N",
          });
          uploadedImages.push(JSON.parse(res.data).data.fileObjectName);
        }
      }

      // 提交反馈信息
      const feedbackData = {
        type: this.data.currentTab == "suggest" ? 0 : this.data.currentTab == "bug" ? 1 : 2,
        content: this.data.content.trim(),
        contact: this.data.contact.trim(),
        voucher: uploadedImages.join(";"),
      };

      wx.request({
        url: config.baseURL + "/api/feedback/add?token=" + wx.getStorageSync("userInfo").token,
        method: "POST",
        data: feedbackData,
        success: (res) => {
          if (res.data.success) {
            wx.hideLoading();
            wx.showToast({
              title: "提交成功",
              icon: "success",
              duration: 2000,
            });
            // 延迟返回上一页
            setTimeout(() => {
              wx.navigateBack();
            }, 1000);
          }
        },
        error: (error) => {
          wx.hideLoading();
          wx.showToast({
            title: "提交失败，请重试",
            icon: "error",
            duration: 2000,
          });
        },
      });
    } catch (error) {
      console.error("提交反馈失败:", error);
      wx.hideLoading();
      wx.showToast({
        title: "提交失败，请重试",
        icon: "error",
        duration: 2000,
      });
    }
  },

  setImagesByPixelRatio() {
    this.setData({
      imgUrls: imageUtil.getCommonImages(["profile", "default"]),
    });
  },
});

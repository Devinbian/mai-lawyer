const imageUtil = require("../../../../utils/image.js");

Page({
  data: {
    imgUrls: null,
    orderInfo: null,
    refundReason: "",
    uploadImages: [],
    canSubmit: false,
  },

  onLoad(options) {
    this.setImagesByPixelRatio();
    if (options.id) {
      this.loadOrderInfo(options.id);
    }
  },

  setImagesByPixelRatio() {
    this.setData({
      imgUrls: imageUtil.getCommonImages(["profile", "default"]),
    });
  },

  loadOrderInfo(orderId) {
    模拟加载订单信息;
    const mockOrderInfo = {
      typeName: "图文咨询服务",
      lawyerAvatar: "https://imgapi.cn/api.php?zd=mobile&fl=meizi&gs=images",
      lawyerName: "俞律师",
      lawyerTitle: "上海（黄浦律师事务所）主任",
      orderId: orderId,
      orderTime: "2025-02-07 14:00:03",
      price: 64,
    };

    this.setData({
      orderInfo: mockOrderInfo,
    });
  },

  handleInput(e) {
    const value = e.detail.value;
    this.setData({
      refundReason: value,
      canSubmit: value.length > 0 || this.data.uploadImages.length > 0,
    });
  },

  chooseImage() {
    wx.chooseMedia({
      count: 3 - this.data.uploadImages.length,
      mediaType: ["image"],
      sourceType: ["album", "camera"],
      success: (res) => {
        const tempFiles = res.tempFiles;
        const newImages = tempFiles.map((file) => file.tempFilePath);

        this.setData({
          uploadImages: [...this.data.uploadImages, ...newImages],
          canSubmit: this.data.refundReason.length > 0 || newImages.length > 0,
        });
      },
    });
  },

  deleteImage(e) {
    const index = e.currentTarget.dataset.index;
    const uploadImages = this.data.uploadImages;
    uploadImages.splice(index, 1);

    this.setData({
      uploadImages,
      canSubmit: this.data.refundReason.length > 0 || uploadImages.length > 0,
    });
  },

  submitRefund() {
    if (!this.data.canSubmit) {
      return;
    }

    if (!this.data.refundReason && !this.data.uploadImages.length) {
      wx.showToast({
        title: "请填写退款说明或上传凭证",
        icon: "none",
      });
      return;
    }

    wx.showLoading({
      title: "提交中...",
    });

    // 模拟提交
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: "提交成功",
        icon: "success",
        duration: 2000,
        success: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 2000);
        },
      });
    }, 1500);
  },
});

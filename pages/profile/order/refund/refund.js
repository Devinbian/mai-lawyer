const imageUtil = require("../../../../utils/image.js");
const config = require("../../../../utils/config.js");

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
    const userInfo = wx.getStorageSync("userInfo");

    console.log("options", options);

    if (options.id) {
      wx.request({
        url: `${config.baseURL}/api/order/detail`,
        method: "GET",
        data: {
          orderId: options.id,
          token: userInfo.token,
        },
        success: (res) => {
          console.log("/api/order/detail", res.data.data);
          if (res.data.success) {
            this.setData({
              orderInfo: {
                typeName:
                  res.data.data.orderType === 1 ? "图文咨询服务" : "下载文档",
                lawyerAvatar:
                  res.data.data.orderType === 1
                    ? res.data.data.lawyerAvatar
                    : this.data.imgUrls[
                        config.fileExt[res.data.data.documentFileExtension]
                      ],
                lawyerName:
                  res.data.data.orderType === 1
                    ? res.data.data.lawyerName
                    : res.data.data.documentTitle,
                lawyerTitle: res.data.data.lawyerTitle,
                orderNo: res.data.data.orderNo,
                orderId: options.id,
                orderTime: res.data.data.createTime,
                price: res.data.data.totalFee,
                orderType: res.data.data.orderType,
              },
            });
          }
        },
      });
    }
  },

  setImagesByPixelRatio() {
    this.setData({
      imgUrls: imageUtil.getCommonImages(["profile", "default"]),
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

  async submitRefund() {
    const userInfo = wx.getStorageSync("userInfo");
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

    console.log("this.data.uploadImages", this.data.uploadImages);

    const uploadedImages = [];
    // 先上传图片（如果有的话）
    if (this.data.uploadImages.length > 0) {
      console.log(
        "this.data.uploadImages.length",
        this.data.uploadImages.length,
      );
      for (const imagePath of this.data.uploadImages) {
        console.log("imagePath", imagePath);
        const res = await this.uploadFile({
          filePath: imagePath,
          name: "file",
          url: config.baseURL + "/api/file/upload?secretFlag=N",
        });
        uploadedImages.push(JSON.parse(res.data).data.fileObjectName);
      }
      console.log("uploadedImages", uploadedImages);
    }

    wx.request({
      url: `${config.baseURL}/api/order/refund-request?token=${userInfo.token}`,
      method: "POST",
      header: {
        "Content-Type": "application/json",
      },
      data: {
        orderId: this.data.orderInfo.orderId,
        refundReason: this.data.refundReason,
        refundVoucher: uploadedImages.join(";"),
      },
      success: (res) => {
        console.log("/api/order/refund-request", res.data);
        wx.navigateBack({
          delta: 1,
          success: () => {},
        });
      },
    });
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
});

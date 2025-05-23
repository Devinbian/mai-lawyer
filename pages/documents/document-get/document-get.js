const imageUtil = require("../../../utils/image.js");
const util = require("../../../utils/util.js");
const config = require("../../../utils/config.js");

Page({
  data: {
    document: null,
    selectedService: false,
    totalPrice: 0,
    servicePrice: 30, // 专家服务价格
    imgUrls: null,
    downloadProgress: 0, // 添加下载进度状态
    isCollected: false,
    docType: config.docType, //法律文书类型
    fileExtIcon: "", //文件类型图标
    payFlag: false, //是否已经支付
  },
  onLoad(options) {
    if (options.id && options.document) {
      try {
        const document = JSON.parse(decodeURIComponent(options.document));
        console.log("document", document);
        wx.request({
          url: `${config.baseURL}/api/document/detail`,
          data: {
            id: document.id,
            token: getApp().globalData.userInfo.token,
          },
          success: (res) => {
            console.log("收藏状态", res);
            if (res.data.success) {
              this.setData({
                payFlag: res.data.data.payFlag,
                isCollected: res.data.data.collect,
              });
              document.collect = res.data.data.collect;
            }
            this.setData({
              document,
              totalPrice: document.price || 0,
              imgUrls: imageUtil.getCommonImages(["default", "documentGet"]),
              fileExtIcon: config.fileExt[document.ext],
            });
          },
          fail: (err) => {
            console.log("收藏状态失败", err);
          },
        });
      } catch (error) {
        console.error("解析文档数据失败:", error);
      }
    }
  },

  onHide() {},

  // 切换专家服务
  toggleService() {
    const selectedService = !this.data.selectedService;
    const documentPrice = this.data.document?.price || 0;
    const totalPrice = selectedService ? documentPrice + this.data.servicePrice : documentPrice;

    this.setData({
      selectedService,
      totalPrice,
    });
  },

  // 查看服务详情
  showServiceDetail() {
    wx.showModal({
      title: "专家核稿服务说明",
      content: "由专业律师团队为您审核文件内容，确保合同条款完整、合规，避免潜在风险，保障您的合法权益。",
      showCancel: false,
      confirmText: "我知道了",
    });
  },

  // 确认支付
  onPayTap() {
    const { totalPrice } = this.data;

    if (totalPrice > 0) {
      //需要放在支付成功的回调里面
      this.addOrder(this.data.document);
    } else {
      wx.showLoading({
        title: "准备下载...",
        mask: true,
        duration: 200,
      });

      this.addDownloadRecord(this.data.document);
    }
  },

  // 打开文档
  onDocInfoTap() {
    console.log("onDocInfoTap", this.data.document);
    wx.downloadFile({
      url: this.data.document.url,
      success: (res) => {
        const filePath = res.tempFilePath;
        console.log("document.ext", this.data.document.ext);
        console.log("document.price", this.data.document.price, this.data.document.price > 0);
        let showMenu = false;
        if (this.data.document.price === 0) {
          showMenu = true;
        } else if (this.data.document.price > 0) {
          showMenu = false;
        }
        wx.openDocument({
          filePath: filePath,
          fileType: this.data.document.ext,
          showMenu: showMenu,
          success: () => {
            console.log("打开文档成功");
          },
          fail: (err) => {
            console.log("打开文档失败", err);
          },
        });
      },
    });
  },

  // 切换收藏状态
  toggleCollect() {
    const { isCollected, document } = this.data;
    const token = getApp().globalData.userInfo.token;
    // 保存收藏状态
    this.setData({ isCollected: !isCollected });
    console.log("isCollected", this.data.isCollected);
    if (this.data.isCollected) {
      wx.request({
        url: `${config.baseURL}/api/document/collect`,
        data: {
          id: document.id,
          token: token,
        },
        success: (res) => {
          console.log("收藏成功", res);
        },
        fail: (err) => {
          console.log("收藏失败", err);
        },
      });
    } else {
      wx.request({
        url: `${config.baseURL}/api/document/uncollect`,
        data: {
          id: document.id,
          token: token,
        },
        success: (res) => {
          console.log("取消收藏成功", res);
        },
        fail: (err) => {
          console.log("取消收藏失败", err);
        },
      });
    }
  },

  //添加下载记录
  addDownloadRecord(document) {
    console.log("添加下载记录", document);
    const token = getApp().globalData.userInfo.token;
    // 添加下载记录
    wx.request({
      url: `${config.baseURL}/api/document-download-history/add`,
      data: {
        documentId: document.id,
        token: token,
      },
      success: (res) => {
        console.log("添加下载记录成功", res);
      },
      fail: (err) => {
        console.log("添加下载记录失败", err);
      },
    });

    // 获取或初始化下载中的文件列表
    let downloadingFiles = wx.getStorageSync("downloadingFiles") || {};

    const downloadTask = wx.downloadFile({
      url: document.url,
      success: (res) => {
        console.log("document", document);
        // 从下载中列表移除
        delete downloadingFiles[document.title]; // 使用正确的key
        wx.setStorageSync("downloadingFiles", downloadingFiles);
      },
      fail: (res) => {
        console.error("download fail", res);
        // 下载失败从下载中列表移除
        delete downloadingFiles[document.title]; // 使用正确的key
        wx.setStorageSync("downloadingFiles", downloadingFiles);
      },
    });

    // 添加到下载中列表
    downloadingFiles[document.title] = {
      fileName: document.title,
      progress: 0,
      startTime: new Date().getTime(), // 使用时间戳
      saveTime: new Date().getTime(), // 使用时间戳
      status: "downloading",
      docType: this.data.docType[document.type], // 添加文书类型
      fileType: document.ext || "word", // 添加文件类型
    };
    wx.setStorageSync("downloadingFiles", downloadingFiles);

    downloadTask.onProgressUpdate((res) => {
      if (res.progress < 100) {
        // 更新下载进度
        this.setData({
          downloadProgress: res.progress,
        });

        // 更新下载中文件的进度
        downloadingFiles = wx.getStorageSync("downloadingFiles") || {}; // 重新获取最新的状态
        if (downloadingFiles[document.title]) {
          downloadingFiles[document.title].progress = res.progress;
          wx.setStorageSync("downloadingFiles", downloadingFiles);
        }

        wx.showLoading({
          title: `下载进度：${res.progress}%`,
          mask: true,
        });
        console.log("下载进度", res.progress);
      } else {
        wx.hideLoading();
        // 下载完成时，确保从下载中列表移除
        downloadingFiles = wx.getStorageSync("downloadingFiles") || {};
        delete downloadingFiles[document.title];
        wx.setStorageSync("downloadingFiles", downloadingFiles);

        wx.showToast({
          title: "下载完成",
          icon: "success",
        });
      }
    });
  },

  addOrder(document) {
    const that = this;
    const token = getApp().globalData.userInfo.token;
    console.log("添加订单", document);
    //先创建订单
    wx.request({
      url: `${config.baseURL}/api/order/add?token=${token}`,
      method: "POST",
      header: {
        "Content-Type": "application/json",
      },
      data: {
        documentId: document.id,
        type: 2, //文档订单类型
      },
      success: (res) => {
        if (res.data.success) {
          //调用后台封装的微信下单接口
          wx.request({
            url: `${config.baseURL}/api/wxpay/prepay`,
            data: {
              orderId: res.data.data,
              token: token,
            },
            success: (res) => {
              wx.requestPayment({
                timeStamp: res.data.data.timeStamp,
                nonceStr: res.data.data.nonceStr,
                package: res.data.data.packageValue,
                signType: res.data.data.signType,
                paySign: res.data.data.paySign,
                success: function (res) {
                  console.log("支付成功", res);
                  //支付成功后，添加下载记录
                  that.addDownloadRecord(document);

                  // 支付成功后跳转到下载记录页面
                  wx.redirectTo({
                    url: "/pages/profile/download/download",
                  });
                },
                fail: function (res) {
                  console.log("支付失败", res);
                },
                complete: function (res) {},
              });
            },
            fail: (err) => {
              console.log("支付失败", err);
            },
          });
        }

        console.log("添加订单成功", res);
      },
      fail: (err) => {
        console.log("添加订单失败", err);
      },
    });
  },
});

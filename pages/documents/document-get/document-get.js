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
    userInfo: null,
    docType: config.docType, //法律文书类型
    fileExtIcon: "", //文件类型图标
  },

  onLoad(options) {
    if (options.id && options.document) {
      try {
        const document = JSON.parse(decodeURIComponent(options.document));
        console.log("document", document);
        wx.request({
          url: `${config.baseURL}/api/document/detail`,
          method: "GET",
          data: {
            id: document.id,
            token: wx.getStorageSync("userInfo").token,
          },
          success: (res) => {
            console.log("收藏状态", res);
            if (res.data.success) {
              this.setData({
                isCollected: res.data.data.collect,
              });
              document.collect = res.data.data.collect;
            }
            this.setData({
              document,
              totalPrice: document.price || 0,
              userInfo: wx.getStorageSync("userInfo"),
              imgUrls: imageUtil.getCommonImages(["documentGet", "default"]),
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
    const totalPrice = selectedService
      ? documentPrice + this.data.servicePrice
      : documentPrice;

    this.setData({
      selectedService,
      totalPrice,
    });
  },

  // 查看服务详情
  showServiceDetail() {
    wx.showModal({
      title: "专家核稿服务说明",
      content:
        "由专业律师团队为您审核文件内容，确保合同条款完整、合规，避免潜在风险，保障您的合法权益。",
      showCancel: false,
      confirmText: "我知道了",
    });
  },

  // 确认支付
  onPayTap() {
    const { totalPrice } = this.data;

    if (totalPrice > 0) {
      wx.requestPayment({
        timeStamp: "1414561699",
        nonceStr: "5K8264ILTKCH16CQ2502SI8ZNMTM67VS",
        package: "prepay_id=wx201410272009395522657a690389285100",
        signType: "RSA",
        paySign:
          "oR9d8PuhnIc+YZ8cBHFCwfgpaK9gd7vaRvkYD7rthRAZ/X+QBhcCYL21N7cHCTUxbQ+EAt6Uy+lwSN22f5YZvI45MLko8Pfso0jm46v5hqcVwrk6uddkGuT+Cdvu4WBqDzaDjnNa5UK3GfE1Wfl2gHxIIY5lLdUgWFts17D4WuolLLkiFZV+JSHMvH7eaLdT9N5GBovBwu5yYKUR7skR8Fu+LozcSqQixnlEZUfyE55feLOQTUYzLmR9pNtPbPsu6WVhbNHMS3Ss2+AehHvz+n64GDmXxbX++IOBvm2olHu3PsOUGRwhudhVf7UcGcunXt8cqNjKNqZLhLw4jq/xDg==",
        success: function (res) {},
        fail: function (res) {
          console.log("支付失败", res);
        },
        complete: function (res) {},
      });
      //需要放在支付成功的回调里面
      this.addDownloadRecord(this.data.document, this.data.userInfo);
    } else {
      wx.showLoading({
        title: "准备下载...",
        mask: true,
        duration: 200,
      });

      this.addDownloadRecord(this.data.document, this.data.userInfo);
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
        console.log(
          "document.price",
          this.data.document.price,
          this.data.document.price > 0,
        );
        let showMenu = false;
        if (this.data.document.price === 0) {
          showMenu = true;
        } else if (this.data.document.price > 0) {
          showMenu = true;
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
    const { isCollected, document, userInfo } = this.data;
    // 保存收藏状态
    this.setData({ isCollected: !isCollected });
    console.log("isCollected", this.data.isCollected);
    if (this.data.isCollected) {
      wx.request({
        url: `${config.baseURL}/api/document/collect`,
        method: "GET",
        data: {
          id: document.id,
          token: this.data.userInfo.token,
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
        method: "GET",
        data: {
          id: document.id,
          token: userInfo.token,
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
  addDownloadRecord(document, userInfo) {
    // 添加下载记录
    wx.request({
      url: `${config.baseURL}/api/document-download-history/add`,
      method: "GET",
      data: {
        documentId: document.id,
        token: userInfo.token,
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
});

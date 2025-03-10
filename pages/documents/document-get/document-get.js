const imageUtil = require("../../../utils/image.js");
const util = require("../../../utils/util.js");

Page({
  data: {
    document: null,
    selectedService: false,
    totalPrice: 0,
    servicePrice: 30, // 专家服务价格
    imgUrls: null,
    downloadProgress: 0, // 添加下载进度状态
  },

  onLoad(options) {
    if (options.id && options.document) {
      try {
        const document = JSON.parse(decodeURIComponent(options.document));
        // 确保document.type有值，默认为word
        document.type = document.type || "word";

        this.setData({
          document,
          totalPrice: document.price || 0,
        });
      } catch (error) {
        console.error("解析文档数据失败:", error);
        wx.showToast({
          title: "加载文档失败",
          icon: "none",
        });
      }
    }
    this.setImagesByPixelRatio();
  },

  setImagesByPixelRatio() {
    this.setData({
      imgUrls: imageUtil.getCommonImages(["documentGet", "default"]),
    });
  },

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
    const { totalPrice, selectedService, document } = this.data;

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

      wx.showLoading({
        title: "正在支付...",
      });

      // TODO: 调用支付接口
      setTimeout(() => {
        wx.hideLoading();
        wx.showToast({
          title: "支付成功",
          icon: "success",
          duration: 2000,
          success: () => {
            // 支付成功后返回文档阅读页
            setTimeout(() => {
              wx.navigateBack();
            }, 2000);
          },
        });
      }, 1500);
    } else {
      wx.showLoading({
        title: "准备下载...",
        mask: true,
        duration: 200,
      });

      // 获取或初始化下载中的文件列表
      let downloadingFiles = wx.getStorageSync('downloadingFiles') || {};
      
      const downloadTask = wx.downloadFile({
        url: "https://ccwwapi.datatellit.com/file/pic/VegeSense_API_V3.8.docx",
        success: (res) => {
          const tempFilePath = res.tempFilePath;
          const originalUrl = "https://ccwwapi.datatellit.com/file/pic/VegeSense_API_V3.8.docx";
          const originalFileName = originalUrl.split("/").pop();
          console.log("originalFileName", originalFileName);
          const prefixedFileName = "DOCS_" + originalFileName;
          console.log("prefixedFileName", prefixedFileName);

          // 从下载中列表移除
          delete downloadingFiles[this.data.document.title];  // 使用正确的key
          wx.setStorageSync('downloadingFiles', downloadingFiles);

          // 保存文件
          wx.saveFile({
            tempFilePath: tempFilePath,
            success: (res) => {
              console.log("saveFile success", res.savedFilePath);
              
              // 保存到已下载文件列表
              const savedFiles = wx.getStorageSync("savedFilesMap") || {};
              savedFiles[res.savedFilePath] = {
                originalName: originalFileName,
                saveTime: new Date().getTime(),
                status: 'completed',
                docType: this.data.document.docType || 'general' // 保存文书类型
              };
              wx.setStorageSync("savedFilesMap", savedFiles);

              console.log("savedFilesMap", savedFiles);

              wx.showToast({
                title: "文件已保存",
                icon: "success",
              });
            },
            fail: (res) => {
              console.error("saveFile fail", res);
              // 保存失败也要从下载中列表移除
              delete downloadingFiles[this.data.document.title];  // 使用正确的key
              wx.setStorageSync('downloadingFiles', downloadingFiles);
            }
          });
        },
        fail: (res) => {
          console.error("download fail", res);
          // 下载失败从下载中列表移除
          delete downloadingFiles[this.data.document.title];  // 使用正确的key
          wx.setStorageSync('downloadingFiles', downloadingFiles);
        }
      });

      // 添加到下载中列表
      downloadingFiles[this.data.document.title] = {
        fileName: this.data.document.title,
        progress: 0,
        startTime: new Date().getTime(),  // 使用时间戳
        saveTime: new Date().getTime(),   // 使用时间戳
        status: 'downloading',
        docType: this.data.document.docType || 'general', // 添加文书类型
        fileType: this.data.document.type || 'word', // 添加文件类型
      };
      wx.setStorageSync('downloadingFiles', downloadingFiles);

      downloadTask.onProgressUpdate((res) => {
        if (res.progress < 100) {
          // 更新下载进度
          this.setData({
            downloadProgress: res.progress
          });
          
          // 更新下载中文件的进度
          downloadingFiles = wx.getStorageSync('downloadingFiles') || {};  // 重新获取最新的状态
          if (downloadingFiles[this.data.document.title]) {
            downloadingFiles[this.data.document.title].progress = res.progress;
            wx.setStorageSync('downloadingFiles', downloadingFiles);
          }

          wx.showLoading({
            title: `下载进度：${res.progress}%`,
            mask: true,
          });
          console.log("下载进度", res.progress);
        } else {
          wx.hideLoading();
          // 下载完成时，确保从下载中列表移除
          downloadingFiles = wx.getStorageSync('downloadingFiles') || {};
          delete downloadingFiles[this.data.document.title];
          wx.setStorageSync('downloadingFiles', downloadingFiles);
          
          wx.showToast({
            title: "下载完成",
            icon: "success",
          });
        }
      });
    }
  },
});

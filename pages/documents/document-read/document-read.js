const imageUtil = require("../../../utils/image.js");
const config = require("../../../utils/config.js");

Page({
  data: {
    isCollected: false,
    documentId: "",
    document: null,
    imgUrls: null,
    userInfo: null,
    fileUrl: "",
    loading: true,
  },

  onLoad(options) {
    this.setData({
      userInfo: wx.getStorageSync("userInfo"),
    });

    if (options.id && options.document) {
      try {
        const document = JSON.parse(decodeURIComponent(options.document));
        console.log("document", document);
        this.setData({
          documentId: options.id,
          document,
          isCollected: this.checkIsCollected(options.id),
          fileUrl: document.url,
        });
        // 加载文档内容
        this.loadDocumentInfo(options.id);
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

  // 加载文档信息
  loadDocumentInfo(id) {
    wx.showLoading({
      title: "加载中...",
    });

    return new Promise((resolve, reject) => {
      wx.request({
        url: config.baseURL + "/api/document/detail",
        method: "GET",
        data: {
          id: id,
          token: this.data.userInfo.token,
        },
        dataType: "json",
        success: (res) => {
          if (res.data.success) {
            const fileUrl = this.getDocumentViewerUrl(res.data.data.url, res.data.data.fileType);
            this.setData({
              fileUrl,
              loading: false,
            });

            const doc = {
              id: this.data.document.id,
              price: this.data.document.price,
              url: res.data.data.url,
              collect: res.data.data.collect,
            };
            resolve({ doc });
          } else {
            reject(new Error(res.data.message || "获取文档失败"));
          }
        },
        fail: (err) => {
          reject(err);
        },
        complete: () => {
          wx.hideLoading();
        },
      });
    });
  },

  // 检查是否已收藏
  checkIsCollected(docId) {
    const collectedDocs = wx.getStorageSync("collectedDocuments") || [];
    return collectedDocs.some((doc) => doc.id === docId);
  },

  // 切换收藏状态
  toggleCollect() {
    const { document, isCollected } = this.data;
    if (!document) return;

    let collectedDocs = wx.getStorageSync("collectedDocuments") || [];

    if (isCollected) {
      // 取消收藏
      collectedDocs = collectedDocs.filter((doc) => doc.id !== document.id);
      wx.showToast({
        title: "已取消收藏",
        icon: "success",
      });
    } else {
      // 添加收藏
      collectedDocs.push({
        id: document.id,
        title: document.title,
        docType: document.docType || "general",
        type: document.type || "word",
        collectTime: new Date().getTime(),
      });
      wx.showToast({
        title: "收藏成功",
        icon: "success",
      });
    }

    // 保存收藏状态
    wx.setStorageSync("collectedDocuments", collectedDocs);
    this.setData({ isCollected: !isCollected });
  },

  // 获取文档
  downloadDocument() {
    const { documentId, document } = this.data;
    const documentInfo = encodeURIComponent(
      JSON.stringify({
        ...document,
        type: document.type || "word",
      })
    );

    wx.navigateTo({
      url: `/pages/documents/document-get/document-get?id=${documentId}&document=${documentInfo}`,
      fail(err) {
        wx.showToast({
          title: "页面跳转失败",
          icon: "none",
        });
      },
    });
  },

  setImagesByPixelRatio() {
    this.setData({
      imgUrls: imageUtil.getCommonImages(["documentRead", "default"]),
    });
  },

  // 获取文档预览URL
  getDocumentViewerUrl(fileUrl, fileType) {
    const encodedUrl = encodeURIComponent(fileUrl);

    // 根据文件类型选择不同的预览方式
    switch (fileType.toLowerCase()) {
      case "pdf":
        return `${config.baseURL}/pdf-viewer/web/viewer.html?file=${encodedUrl}`;
      case "doc":
      case "docx":
      case "xls":
      case "xlsx":
      case "ppt":
      case "pptx":
        return `${config.baseURL}/office-viewer?url=${encodedUrl}&type=${fileType}`;
      default:
        return fileUrl;
    }
  },

  // 处理webview消息
  handleWebViewMessage(e) {
    console.log("收到webview消息：", e.detail);
  },

  onUnload() {
    // 页面卸载时的清理工作
  },
});

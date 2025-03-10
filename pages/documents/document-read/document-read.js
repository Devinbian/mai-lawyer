const imageUtil = require("../../../utils/image.js");

Page({
  data: {
    isCollected: false,
    documentId: "",
    documentInfo: null,
    document: null,
    imgUrls: null,
  },

  onLoad(options) {
    if (options.id && options.document) {
      try {
        const document = JSON.parse(decodeURIComponent(options.document));
        this.setData({
          documentId: options.id,
          document,
          isCollected: this.checkIsCollected(options.id)
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
    // TODO: 这里应该从服务器获取文档信息
    // 目前使用模拟数据
    const documentInfo = {
      id: id,
      title: this.data.document.title,
      content: [
        "1.签订本权属证书或说明文件。房屋属于共有的，应提供共有产权人同意出租的证明。转租房屋的，应提供产权人或原出租人同意转租的证明。",
        "2.出租人应当就合同重大事项承租人尽到提示义务。承租人应当审慎签订本合同，在签订本合同前，要仔细阅读合同条款，特别是审阅其中具有选择性、补充性、修改性的内容，注意防范在任的市场风险和交易风险。",
        "3.合同租赁期限不得超过20年，超过20年的，超过部分无效。",
        "4.合同重大事项承租人尽到提示义务。承租人应当审慎签订本合同，在签订本合同前，要仔细阅读合同条款，特别是审阅其中具有选择性、补充性、修改性的内容，注意防范在任的市场风险和交易风险。",
      ],
      catalog: [
        "说明",
        "专业术语解释",
        "第一章 合同当事人",
        "第二章 房屋基本状况",
        "第三章 房屋租赁期限、租金及支付",
        "第四章 租赁双方其他权利义务",
      ],
    };

    this.setData({
      documentInfo,
    });
  },

  // 检查是否已收藏
  checkIsCollected(docId) {
    const collectedDocs = wx.getStorageSync('collectedDocuments') || [];
    return collectedDocs.some(doc => doc.id === docId);
  },

  // 切换收藏状态
  toggleCollect() {
    const { document, isCollected } = this.data;
    if (!document) return;

    let collectedDocs = wx.getStorageSync('collectedDocuments') || [];
    
    if (isCollected) {
      // 取消收藏
      collectedDocs = collectedDocs.filter(doc => doc.id !== document.id);
      wx.showToast({
        title: '已取消收藏',
        icon: 'success'
      });
    } else {
      // 添加收藏
      collectedDocs.push({
        id: document.id,
        title: document.title,
        docType: document.docType || 'general',
        type: document.type || 'word',
        collectTime: new Date().getTime()
      });
      wx.showToast({
        title: '收藏成功',
        icon: 'success'
      });
    }

    // 保存收藏状态
    wx.setStorageSync('collectedDocuments', collectedDocs);
    this.setData({ isCollected: !isCollected });
  },

  // 获取文档
  downloadDocument() {
    const { documentId, document } = this.data;
    // 将文档信息转换为查询字符串
    const documentInfo = encodeURIComponent(
      JSON.stringify({
        ...document,
        type: document.type || "word", // 如果没有type字段，默认为word类型
      }),
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

  // 点击目录项
  onCatalogTap(e) {
    const index = e.currentTarget.dataset.index;
    // TODO: 跳转到对应章节
    wx.showToast({
      title: `跳转到: ${this.data.documentInfo.catalog[index]}`,
      icon: "none",
    });
  },

  setImagesByPixelRatio() {
    this.setData({
      imgUrls: imageUtil.getCommonImages(["documentRead", "default"]),
    });
  },
});

const imageUtil = require("../../../utils/image.js");
const refreshLoadingBehavior = require("../../../behaviors/refresh-loading.js");
const util = require("../../../utils/util.js");

Page({
  behaviors: [refreshLoadingBehavior],

  data: {
    imgUrls: null,
    list: [],
    pageNum: 1,
    hasMore: true,
    isLoading: false,
    isInitialLoading: true,
    isRefreshing: false,
  },

  onLoad() {
    this.setImagesByPixelRatio();
    this.initList();
  },

  setImagesByPixelRatio() {
    this.setData({
      imgUrls: imageUtil.getCommonImages(["documentGet", "default"]),
    });
  },

  // 实现 loadData 方法，这是 behavior 中约定的接口
  loadData(isLoadMore = false) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const collectedDocs = wx.getStorageSync("collectedDocuments") || [];

      // 按收藏时间倒序排序
      collectedDocs.sort((a, b) => b.collectTime - a.collectTime);

      const pageSize = 10;
      let currentPageNum = isLoadMore ? this.data.pageNum || 1 : 1;

      if (isLoadMore) {
        currentPageNum += 1;
      }

      const start = 0;
      const end = currentPageNum * pageSize;
      const pageData = collectedDocs.slice(start, end).map((doc, index) => ({
        id: doc.id,
        title: doc.title,
        date: util.formatTime(new Date(doc.collectTime)),
        timestamp: doc.collectTime,
        type: doc.type,
        docType: doc.docType,
      }));

      this.setData({
        pageNum: currentPageNum,
        isInitialLoading: false,
      });

      const totalCount = collectedDocs.length;
      const remaining = totalCount - end;
      const hasMoreData = remaining > 5;

      setTimeout(() => {
        resolve({
          list: pageData,
          hasMore: hasMoreData,
        });
      }, Math.max(0, 1000 - (Date.now() - startTime)));
    });
  },

  // 点击文档
  handleItemClick(e) {
    const { id } = e.currentTarget.dataset;
    const collectedDocs = wx.getStorageSync("collectedDocuments") || [];
    const doc = collectedDocs.find((d) => d.id === id);

    if (doc) {
      wx.navigateTo({
        url: `/pages/documents/document-read/document-read?id=${id}&document=${encodeURIComponent(JSON.stringify(doc))}`,
      });
    }
  },
});

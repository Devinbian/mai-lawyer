const imageUtil = require("../../../utils/image.js");
const refreshLoadingBehavior = require("../../../behaviors/refresh-loading.js");
const config = require("../../../utils/config.js");

Page({
  behaviors: [refreshLoadingBehavior],

  data: {
    searchKeyword: "",
    imgUrls: null,
    scrollTop: 0,
    canRefresh: true,
    documents: [],
    filteredDocuments: [],
    pageSize: 10,
    currentPage: 1,
    isLoading: false,
    hasMore: true,
    isRefreshing: false,
    docType: "",
  },

  onLoad(options) {
    this.setData({
      docType: options.docType || "",
    });

    wx.showToast({
      title: "加载中...",
      icon: "loading",
      duration: 2000,
    });

    this.setImagesByPixelRatio();
    this.initList();
  },

  setImagesByPixelRatio() {
    this.setData({
      imgUrls: imageUtil.getCommonImages(["documentList", "default"]),
    });
  },

  // 监听滚动事件
  onScroll(e) {
    const scrollTop = e.detail.scrollTop;
    this.setData({
      scrollTop,
      canRefresh: scrollTop <= 0,
    });
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value,
    });
  },

  // 搜索确认
  onSearch() {
    this.initList();
  },

  // 点击文档
  onDocumentTap(e) {
    const { id } = e.currentTarget.dataset;
    const document = this.data.list.find((doc) => doc.id === id);
    if (document) {
      const documentInfo = encodeURIComponent(JSON.stringify(document));
      wx.navigateTo({
        url: `/pages/documents/document-read/document-read?id=${id}&document=${documentInfo}`,
        fail(err) {
          wx.showToast({
            title: "打开文档失败",
            icon: "none",
          });
        },
      });
    }
  },

  // 实现 loadData 方法，这是 behavior 中约定的接口
  async loadData(isLoadMore = false) {
    // 使用已有的文档数据，此处的this.data是behavior中的data
    const { searchKeyword, pageNum, pageSize } = this.data;

    // 根据搜索关键词筛选文档
    const doclistObj = await this.getDocuments(
      pageNum,
      pageSize,
      this.data.docType,
    );
    const list = doclistObj.listArray;
    const totalRows = doclistObj.totalRows;
    const end = pageNum * pageSize;
    const hasMore = end < totalRows;

    let filteredDocuments = list;
    if (searchKeyword) {
      const keyword = searchKeyword.toLowerCase();
      filteredDocuments = documents.filter(
        (doc) =>
          doc.title.toLowerCase().includes(keyword) ||
          doc.description.toLowerCase().includes(keyword),
      );
    }

    return new Promise((resolve) => {
      resolve({
        list: filteredDocuments,
        hasMore,
      });
    });
  },

  getDocuments(pageNum, pageSize, docType) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: config.baseURL + "/api/document/list",
        method: "GET",
        data: {
          pageNo: pageNum,
          pageSize: pageSize,
          title: docType,
        },
        dataType: "json",
        success: (res) => {
          if (res.data.success) {
            const docList = res.data.data.rows.map((doc) => {
              return {
                id: doc.id,
                title: doc.title,
                description: doc.brief,
                number: doc.number,
                words: doc.wordCount,
                date: doc.createTime,
                price: doc.price,
                url: doc.url,
                ext: doc.fileExtension,
              };
            });
            resolve({
              listArray: docList,
              totalRows: res.data.data.totalRows,
            });
          } else {
            reject(new Error(res.data.message || "获取文档列表失败"));
          }
        },
        fail: (err) => {
          reject(err);
        },
      });
    });
  },
});

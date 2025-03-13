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
    listHeight: "calc(100vh - 280rpx)", // 默认高度
  },

  onLoad(options) {
    console.log("options", options);
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
    this.calculateListHeight();
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
    // 滚动时重新计算高度
    this.calculateListHeight();
  },

  // 计算列表实际可用高度
  calculateListHeight() {
    const query = wx.createSelectorQuery();
    query.select(".search-box").boundingClientRect();
    query.select("bg-titlecenter-nav").boundingClientRect();

    query.exec((res) => {
      if (res[0] && res[1]) {
        const searchBoxHeight = res[0].height;
        const navHeight = res[1].height;
        const safeAreaTop = wx.getSystemInfoSync().safeArea.top;

        // 计算实际需要减去的高度（包括安全区域）
        const totalFixedHeight =
          searchBoxHeight + navHeight + (safeAreaTop || 0);

        // 转换为rpx（px 转 rpx 需要乘以2）
        const heightInRpx = Math.ceil(totalFixedHeight * 2);

        this.setData({
          listHeight: `calc(100vh - ${heightInRpx}rpx)`,
        });
      }
    });
  },

  // 页面显示时重新计算高度
  onShow() {
    this.calculateListHeight();
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
    document.type = this.data.docType;
    if (document) {
      wx.navigateTo({
        url: `/pages/documents/document-get/document-get?id=${id}&document=${encodeURIComponent(
          JSON.stringify(document),
        )}`,
        fail(err) {
          wx.showToast({
            title: "打开文档失败",
            icon: "none",
          });
        },
      });
    }
  },

  // 实现 loadData 方法
  async loadData(isLoadMore = false) {
    try {
      const { pageNum, pageSize, docType } = this.data;
      const doclistObj = await this.getDocuments(
        pageNum,
        pageSize,
        docType,
        this.data.searchKeyword,
      );

      const list = doclistObj.listArray;
      const totalRows = doclistObj.totalRows;
      const end = pageNum * pageSize;
      const hasMore = end < totalRows;

      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({ list, hasMore });
          // 数据加载完成后，重新计算高度
          wx.nextTick(() => {
            this.calculateListHeight();
          });
        }, 500);
      });
    } catch (error) {
      console.error("获取文档列表失败：", error);
      wx.showToast({
        title: "获取文档列表失败",
        icon: "none",
        duration: 2000,
      });
      return new Promise((resolve) => {
        resolve({ list: [], hasMore: false });
      });
    }
  },

  getDocuments(pageNum, pageSize, docType, docTitle) {
    return new Promise((resolve, reject) => {
      wx.request({
        url: config.baseURL + "/api/document/list",
        method: "GET",
        data: {
          pageNo: pageNum,
          pageSize: pageSize,
          title: docTitle,
          type: docType,
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

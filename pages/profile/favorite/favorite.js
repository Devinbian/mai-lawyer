const imageUtil = require("../../../utils/image.js");
const refreshLoadingBehavior = require("../../../behaviors/refresh-loading.js");
const util = require("../../../utils/util.js");
const config = require("../../../utils/config.js");

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
    console.log("onLoad");
    // 获取用户信息
    const userInfo = getApp().globalData.userInfo;
    if (!userInfo) {
      wx.redirectTo({
        url: "/pages/login/login",
      });
      return;
    }

    this.setImagesByPixelRatio();
    this.initList();
  },

  setImagesByPixelRatio() {
    this.setData({
      imgUrls: imageUtil.getCommonImages(["documentGet", "default"]),
    });
  },

  // 实现 loadData 方法，这是 behavior 中约定的接口
  async loadData(isLoadMore = false) {
    const { pageNum, pageSize } = this.data;
    const fileList = [];

    return new Promise((resolve, reject) => {
      console.log("/api/document/collectList", "请求后台");
      try {
        wx.request({
          url: `${config.baseURL}/api/document/collectList`,
          method: "GET",
          data: {
            token: getApp().globalData.userInfo.token,
            pageNo: pageNum,
            pageSize: pageSize,
          },
          success: (res) => {
            console.log("接口返回数据：", res);
            // 检查响应数据结构
            if (!res || typeof res !== "object") {
              throw new Error("无效的响应数据");
            }

            if (res.data.success) {
              const data = res.data.data || {};
              const rows = Array.isArray(data.rows) ? data.rows : [];
              const totalRows = data.totalRows || 0;

              rows.forEach((doc, index) => {
                if (!doc) return;

                const item = {
                  id: doc.id || index + 1,
                  title: doc.title || "未命名文档",
                  url: doc.url || "",
                  ext: doc.fileExtension || "",
                };

                fileList.push(item);
              });

              console.log("res", res);

              // 按收藏时间倒序排序
              fileList.sort((a, b) => b.collectTime - a.collectTime);

              const end = pageNum * pageSize;
              const hasMoreData = totalRows > end;

              resolve({
                list: fileList,
                hasMore: hasMoreData,
              });
            }
          },
          fail: (err) => {
            console.error("请求失败：", err);
            reject(new Error("网络请求失败"));
          },
        });
      } catch (err) {
        console.error("获取下载记录失败：", error);
        return {
          list: [],
          hasMore: false,
        };
      }
    });
  },

  // 点击文档
  handleItemClick(e) {
    const { id, url, ext } = e.currentTarget.dataset;
    const document = this.data.list.find((doc) => doc.id === id);
    // 跳转到文档详情页面
    wx.navigateTo({
      url: `/pages/documents/document-get/document-get?id=${id}&document=${encodeURIComponent(JSON.stringify(document))}`,
    });
  },
});

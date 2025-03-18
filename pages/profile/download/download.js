const imageUtil = require("../../../utils/image.js");
const refreshLoadingBehavior = require("../../../behaviors/refresh-loading.js");
const util = require("../../../utils/util.js");
const config = require("../../../utils/config.js");

Page({
  behaviors: [refreshLoadingBehavior],

  data: {
    imgUrls: null,
    downloadStatus: "completed", // completed: 已下载, downloading: 下载中
    currentTab: "all", // all: 全部, contract: 合同协议, complaint: 起诉状, defense: 答辩状, legal_opinion: 法律意见, application: 申请文书, general: 通用文书
    userInfo: null,
  },

  onLoad() {
    wx.showToast({
      title: "加载中...",
      icon: "loading",
      duration: 2000,
    });

    // 获取用户信息
    const userInfo = wx.getStorageSync("userInfo");
    if (!userInfo) {
      wx.redirectTo({
        url: "/pages/login/login",
      });
      return;
    }

    this.setData({
      userInfo: userInfo,
      imgUrls: imageUtil.getCommonImages(["documentGet", "default"]),
    });

    this.initList();
  },

  // 切换主分类（已下载/下载中）
  switchMainTab(e) {
    const status = e.currentTarget.dataset.status;
    if (status === this.data.downloadStatus) return;

    this.setData(
      {
        downloadStatus: status,
        currentTab: "all",
      },
      () => {
        this.initList();
      }
    );
  },

  // 切换二级分类
  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    if (tab === this.data.currentTab) return;

    this.setData(
      {
        currentTab: tab,
      },
      () => {
        this.initList();
      }
    );
  },

  // 生成随机时间
  generateRandomTime() {
    const now = new Date();
    const randomDays = Math.floor(Math.random() * 30); // 最近30天内
    const randomHours = Math.floor(Math.random() * 24);
    const randomMinutes = Math.floor(Math.random() * 60);

    now.setDate(now.getDate() - randomDays);
    now.setHours(randomHours);
    now.setMinutes(randomMinutes);

    return now.toLocaleDateString("zh-CN").replace(/\//g, "-");
  },

  // 实现 loadData 方法
  async loadData(isLoadMore = false) {
    try {
      const startTime = Date.now();
      const fileList = [];
      const { pageNum, pageSize } = this.data;

      // 如果是"下载中"状态，获取下载中的文件列表
      if (this.data.downloadStatus === "downloading") {
        const downloadingFiles = wx.getStorageSync("downloadingFiles") || {};

        Object.entries(downloadingFiles).forEach(([key, file], index) => {
          // 获取文书类型
          let docType = file.docType || "general"; // 如果没有指定类型，默认为通用文书

          // 获取文件类型（用于显示图标）
          const fileExt = file.fileName.split(".").pop().toLowerCase();
          let fileType = "other";
          if (["doc", "docx"].includes(fileExt)) {
            fileType = "word";
          } else if (["pdf"].includes(fileExt)) {
            fileType = "pdf";
          } else if (["xls", "xlsx"].includes(fileExt)) {
            fileType = "excel";
          } else if (["ppt", "pptx"].includes(fileExt)) {
            fileType = "ppt";
          }

          // 根据二级分类过滤（使用文书类型过滤）
          if (this.data.currentTab !== "all" && docType !== this.data.currentTab) {
            return;
          }

          console.log("file.startTime", file.startTime);

          fileList.push({
            id: index + 1,
            title: file.fileName,
            date: util.formatTime(new Date(file.startTime)),
            timestamp: file.startTime, // 添加时间戳用于排序
            type: fileType, // 文件类型（用于显示图标）
            docType: docType, // 文书类型（用于分类）
            price: 0,
            status: "downloading",
            progress: file.progress || 0,
            size: "计算中...",
          });
        });

        // 按时间戳排序
        fileList.sort((a, b) => b.timestamp - a.timestamp);

        const pageSize = 10;
        let currentPageNum = isLoadMore ? this.data.pageNum || 1 : 1;

        if (isLoadMore) {
          currentPageNum += 1;
        }

        const start = 0;
        const end = currentPageNum * pageSize;
        const pageData = fileList.slice(start, end);

        this.setData({ pageNum: currentPageNum });

        const totalCount = fileList.length;
        const remaining = totalCount - end;
        const hasMoreData = remaining > 5;

        setTimeout(() => {
          return {
            list: pageData,
            hasMore: hasMoreData,
          };
        }, Math.max(0, 1000 - (Date.now() - startTime)));
        return {
          list: [],
          hasMore: false,
        };
      } else {
        const type = ["contract", "complaint", "defense", "legal_opinion", "application", "general"].indexOf(this.data.currentTab);

        return new Promise((resolve, reject) => {
          console.log("/api/document-download-history/page", "请求后台");

          wx.request({
            url: `${config.baseURL}/api/document-download-history/page`,
            method: "GET",
            data:
              type === -1
                ? {
                    pageNo: pageNum,
                    pageSize: pageSize,
                    token: this.data.userInfo.token,
                  }
                : {
                    pageNo: pageNum,
                    pageSize: pageSize,
                    type: type,
                    token: this.data.userInfo.token,
                  },
            success: (res) => {
              try {
                console.log("接口返回数据：", res);
                // 检查响应数据结构
                if (!res || typeof res !== "object") {
                  throw new Error("无效的响应数据");
                }

                // 获取实际的响应数据
                const response = res.data || res;

                if (response.success) {
                  // 获取数据列表
                  const data = response.data || {};
                  const rows = Array.isArray(data.rows) ? data.rows : [];
                  const totalRows = data.totalRows || 0;

                  rows.forEach((doc, index) => {
                    if (!doc) return;

                    // 获取文件类型（用于显示图标）
                    const fileExt = (doc.fileExtension || "").toLowerCase();
                    let fileType = "other";

                    if (["doc", "docx"].includes(fileExt)) {
                      fileType = "word";
                    } else if (["pdf"].includes(fileExt)) {
                      fileType = "pdf";
                    } else if (["xls", "xlsx"].includes(fileExt)) {
                      fileType = "excel";
                    } else if (["ppt", "pptx"].includes(fileExt)) {
                      fileType = "ppt";
                    }

                    const item = {
                      id: doc.id || index + 1,
                      title: doc.title || "未命名文档",
                      date: doc.createTime ? util.formatTime(new Date(doc.createTime)) : "未知时间",
                      timestamp: doc.createTime ? new Date(doc.createTime).getTime() : Date.now(),
                      type: fileType,
                      docType: this.data.currentTab || "all",
                      price: Number(doc.price || 0),
                      status: doc.status || "completed",
                      url: doc.url || "",
                      ext: doc.fileExtension || "",
                      size: doc.size ? `${(Number(doc.size) / 1024).toFixed(2)}KB` : "未知大小",
                    };

                    fileList.push(item);
                  });

                  // 按时间戳排序
                  fileList.sort((a, b) => b.timestamp - a.timestamp);

                  const end = pageNum * pageSize;
                  const hasMoreData = totalRows > end;

                  resolve({
                    list: fileList,
                    hasMore: hasMoreData,
                  });
                } else {
                  throw new Error(response.message || "获取数据失败");
                }
              } catch (error) {
                console.error("数据处理错误：", error, error.stack);
                reject(error);
              }
            },
            fail: (err) => {
              console.error("请求失败：", err);
              reject(new Error("网络请求失败"));
            },
          });
        });
      }
    } catch (error) {
      console.error("获取下载记录失败：", error);
      return {
        list: [],
        hasMore: false,
      };
    }
  },

  // 点击文档
  handleItemClick(e) {
    // 获取文件路径，在列表项的dataset中存有url
    const docUrl = e.currentTarget.dataset.url;
    if (!docUrl) return;
    // 获取文件类型
    const fileExt = e.currentTarget.dataset.ext;

    wx.downloadFile({
      url: docUrl,
      success: (res) => {
        const filePath = res.tempFilePath;
        wx.openDocument({
          filePath: filePath,
          fileType: fileExt,
          success: () => {
            console.log("打开文档成功");
          },
          fail: (err) => {
            console.log("打开文档失败", err);
          },
        });
      },
      fail: (err) => {
        console.log("下载文档失败", err);
      },
    });
  },
});

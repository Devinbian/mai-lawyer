const imageUtil = require("../../../utils/image.js");
const refreshLoadingBehavior = require("../../../behaviors/refresh-loading.js");
const util = require("../../../utils/util.js");

Page({
  behaviors: [refreshLoadingBehavior],

  data: {
    imgUrls: null,
    downloadStatus: "completed", // completed: 已下载, downloading: 下载中
    currentTab: "all", // all: 全部, contract: 合同协议, complaint: 起诉状, defense: 答辩状, legal_opinion: 法律意见, application: 申请文书, general: 通用文书
  },

  onLoad() {
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
      imgUrls: imageUtil.getCommonImages(["documentGet", "default"]),
    });
  },

  // 切换主分类（已下载/下载中）
  switchMainTab(e) {
    // 重置下载记录,临时使用
    // this.resetDownloadHistory();

    const status = e.currentTarget.dataset.status;
    if (status === this.data.downloadStatus) return;

    this.setData(
      {
        downloadStatus: status,
        currentTab: "all",
      },
      () => {
        this.initList();
      },
    );
  },

  resetDownloadHistory() {
    wx.showModal({
      title: "确认重置",
      content: "这将清除所有下载记录，但不会删除实际文件。确定继续吗？",
      success: (res) => {
        if (res.confirm) {
          wx.setStorageSync("savedFilesMap", {});
          wx.showToast({
            title: "记录已重置",
            icon: "success",
          });
          // 重新加载数据
          this.loadData();
        }
      },
    });
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
      },
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

  // 实现 loadData 方法，这是 behavior 中约定的接口
  loadData(isLoadMore = false) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const fileList = [];

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
            timestamp: file.startTime,  // 添加时间戳用于排序
            type: fileType,        // 文件类型（用于显示图标）
            docType: docType,      // 文书类型（用于分类）
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
          resolve({
            list: pageData,
            hasMore: hasMoreData,
          });
        }, Math.max(0, 1000 - (Date.now() - startTime)));
        return;
      }

      // 已下载文件列表的处理
      wx.getSavedFileList({
        success: (res) => {
          console.log("当前文件系统中实际文件数量:", res.fileList.length);
          const savedFilesMap = wx.getStorageSync("savedFilesMap") || {};
          console.log("映射表中的记录数:", Object.keys(savedFilesMap).length);

          const validFiles = res.fileList.filter(
            (file) => savedFilesMap[file.filePath] !== undefined
          );

          console.log("有效文件数量:", validFiles.length);

          const newSavedFilesMap = {};
          validFiles.forEach((file) => {
            newSavedFilesMap[file.filePath] = savedFilesMap[file.filePath];
          });

          wx.setStorageSync("savedFilesMap", newSavedFilesMap);
          console.log("更新后的映射记录数:", Object.keys(newSavedFilesMap).length);

          res.fileList.forEach((file, index) => {
            const filePath = file.filePath;
            const fileInfo = savedFilesMap[filePath];

            if (fileInfo) {
              const displayName = fileInfo.originalName;
              
              // 获取文书类型
              const docType = fileInfo.docType || "general";

              // 获取文件类型（用于显示图标）
              const fileExt = displayName.split(".").pop().toLowerCase();
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

              console.log("file.saveTime", file.saveTime);

              fileList.push({
                id: index + 1,
                title: displayName,
                date: util.formatTime(new Date(fileInfo.saveTime)),
                timestamp: fileInfo.saveTime,  // 添加时间戳用于排序
                type: fileType,        // 文件类型（用于显示图标）
                docType: docType,      // 文书类型（用于分类）
                price: 0,
                status: "completed",
                filePath: filePath,
                size: (file.size / 1024).toFixed(2) + "KB",
              });
            }
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
            resolve({
              list: pageData,
              hasMore: hasMoreData,
            });
          }, Math.max(0, 1000 - (Date.now() - startTime)));
        },
        fail: (err) => {
          console.error("获取保存文件列表失败", err);
          setTimeout(() => {
            resolve({
              list: [],
              hasMore: false,
            });
          }, Math.max(0, 1000 - (Date.now() - startTime)));
        },
      });
    });
  },

  // 点击文档
  handleItemClick(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/documents/document-read/document-read?id=${id}`,
    });
  },

  openSavedFile(e) {
    // 获取文件路径，假设在列表项的dataset中存有filePath
    const filePath = e.currentTarget.dataset.filepath;
    if (!filePath) return;

    // 获取文件类型
    const fileType = e.currentTarget.dataset.type;
    let docType = "pdf"; // 默认类型

    // 根据UI展示的文件类型确定wx.openDocument需要的fileType
    switch (fileType) {
      case "word":
        docType = "docx";
        break;
      case "excel":
        docType = "xlsx";
        break;
      case "ppt":
        docType = "pptx";
        break;
      case "pdf":
        docType = "pdf";
        break;
      default:
        // 尝试从文件路径中获取扩展名
        const ext = filePath.split(".").pop().toLowerCase();
        if (ext) docType = ext;
    }

    // 打开文档
    wx.openDocument({
      filePath: filePath,
      fileType: docType,
      showMenu: true,
      success: () => {
        console.log("文档打开成功");
      },
      fail: (err) => {
        console.error("文档打开失败", err);
        wx.showToast({
          title: "无法打开此文件",
          icon: "none",
        });
      },
    });
  },
});

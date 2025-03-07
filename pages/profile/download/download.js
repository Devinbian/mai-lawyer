const imageUtil = require("../../../utils/image.js");
const refreshLoadingBehavior = require("../../../behaviors/refresh-loading.js");

Page({
  behaviors: [refreshLoadingBehavior],

  data: {
    imgUrls: null,
    downloadStatus: "completed", // completed: 已下载, downloading: 下载中
    currentTab: "all",
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
    this.resetDownloadHistory();

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

      // 获取微信文件系统中保存的文件
      wx.getSavedFileList({
        success: (res) => {
          // // 删除用户文件
          // const fsm = wx.getFileSystemManager();
          // fsm.removeSavedFile({
          //   filePath: userFilePath,
          //   success() {
          //     console.log("文件删除成功");
          //   },
          //   fail(err) {
          //     console.error("文件删除失败", err);
          //   },
          // });
          console.log("当前文件系统中实际文件数量:", res.fileList.length);
          // 获取映射关系
          const savedFilesMap = wx.getStorageSync("savedFilesMap") || {};
          console.log("映射表中的记录数:", Object.keys(savedFilesMap).length);

          // 筛选只存在于文件系统中的文件
          const validFiles = res.fileList.filter(
            (file) => savedFilesMap[file.filePath] !== undefined,
          );

          console.log("有效文件数量:", validFiles.length);

          // 清理不存在的文件记录
          const newSavedFilesMap = {};
          validFiles.forEach((file) => {
            newSavedFilesMap[file.filePath] = savedFilesMap[file.filePath];
          });

          // 更新存储的映射
          wx.setStorageSync("savedFilesMap", newSavedFilesMap);
          console.log(
            "更新后的映射记录数:",
            Object.keys(newSavedFilesMap).length,
          );

          const fileList = [];
          // const savedFilesMap = wx.getStorageSync("savedFilesMap") || {};
          console.log("savedFilesMap", savedFilesMap);

          res.fileList.forEach((file, index) => {
            // 从文件路径解析文件名
            const filePath = file.filePath;
            const fileInfo = savedFilesMap[filePath];

            if (fileInfo) {
              // 使用原始文件名
              const displayName = fileInfo.originalName;
              // 从文件名解析文件类型
              const fileExt = displayName.split(".").pop().toLowerCase();
              let fileType = "other";

              // 确定文件类型
              if (["doc", "docx"].includes(fileExt)) {
                fileType = "word";
              } else if (["pdf"].includes(fileExt)) {
                fileType = "pdf";
              } else if (["xls", "xlsx"].includes(fileExt)) {
                fileType = "excel";
              } else if (["ppt", "pptx"].includes(fileExt)) {
                fileType = "ppt";
              }

              const fileDate = new Date(file.createTime)
                .toLocaleString("zh-CN", {
                  year: "numeric",
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                })
                .replace(/\//g, "-");

              // 返回与原mock数据相同结构的对象，使用固定索引避免依赖list长度
              fileList.push({
                id: index + 1, // 直接使用索引+1作为ID，避免依赖this.data.list
                title: displayName, // 使用处理后的文件名作为标题
                date: fileDate,
                type: fileType,
                price: 0,
                status: "downloaded",
                filePath: filePath,
                size: (file.size / 1024).toFixed(2) + "KB",
              });
            }
          });

          // 按时间排序
          fileList.sort((a, b) => new Date(b.date) - new Date(a.date));

          // 重置分页处理
          const pageSize = 10;
          let currentPageNum = isLoadMore ? this.data.pageNum || 1 : 1;

          if (isLoadMore) {
            currentPageNum += 1;
          }

          const start = 0;
          const end = currentPageNum * pageSize;
          const pageData = fileList.slice(start, end);

          // 保存当前页码
          this.setData({ pageNum: currentPageNum });

          console.log(`返回${pageData.length}条数据，总共${fileList.length}条`);

          const totalCount = fileList.length;
          const remaining = totalCount - end;
          const hasMoreData = remaining > 5; // 只有剩余数据超过5条时才继续加载

          console.log(
            `数据情况: 总数据=${totalCount}, 当前页结束位置=${end}, 剩余=${remaining}, 是否有更多=${hasMoreData}`,
          );

          // 确保至少显示刷新提示 1 秒钟
          const elapsedTime = Date.now() - startTime;
          const remainingTime = Math.max(0, 1000 - elapsedTime);

          setTimeout(() => {
            resolve({
              list: pageData,
              hasMore: hasMoreData, // 提前停止加载更多的标志
            });
          }, remainingTime);
        },
        fail: (err) => {
          console.error("获取保存文件列表失败", err);
          // 获取失败时返回空列表
          const startTime = Date.now();

          // 同样确保延迟
          const elapsedTime = Date.now() - startTime;
          const remainingTime = Math.max(0, 1000 - elapsedTime);

          setTimeout(() => {
            resolve({
              list: [],
              hasMore: false,
            });
          }, remainingTime);
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

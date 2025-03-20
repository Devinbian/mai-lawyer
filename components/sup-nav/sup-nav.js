Component({
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    styleIsolation: "isolated",
  },
  properties: {
    title: {
      type: String,
      value: "迈小律",
    },
  },
  data: {
    statusBarHeight: 0,
    navBarHeight: 44,
  },
  lifetimes: {
    created() {},
    attached() {
      const systemInfo = wx.getSystemInfoSync();

      this.setData({
        statusBarHeight: systemInfo.statusBarHeight,
      });

      // 触发事件通知页面设置内容距离顶部的距离
      this.triggerEvent("navheight", {
        height: systemInfo.statusBarHeight + this.data.navBarHeight,
      });
    },
  },
  pageLifetimes: {
    show() {},
  },
  methods: {
    // 添加一个测试方法
    test() {
      console.log("test method called");
    },
    // 处理返回按钮点击
    handleBack() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        wx.navigateBack({
          delta: 1,
        });
      } else {
        wx.switchTab({
          url: "/pages/index/index",
        });
      }
    },
    // 处理首页按钮点击
    handleHome() {
      const currentPages = getCurrentPages();
      const currentPage = currentPages[currentPages.length - 1];

      // 如果当前已经在首页，不做任何操作
      if (currentPage.route === "pages/index/index") {
        return;
      }

      // 跳转到首页tab
      wx.switchTab({
        url: "/pages/index/index",
      });
    },
  },
});

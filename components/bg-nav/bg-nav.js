Component({
  options: {
    multipleSlots: true, // 在组件定义时的选项中启用多slot支持
    styleIsolation: "isolated",
  },
  properties: {
    title: {
      type: String,
      value: "麦小律",
    },
  },
  data: {
    statusBarHeight: 20,
    navBarHeight: 44,
  },
  lifetimes: {
    created() {
      wx.showToast({
        title: "导航组件created",
        icon: "none",
      });
      console.warn("导航组件created - 测试日志");
    },
    attached() {
      wx.showToast({
        title: "导航组件attached",
        icon: "none",
      });
      console.warn("导航组件attached - 测试日志");

      const systemInfo = wx.getSystemInfoSync();
      console.warn("系统信息:", systemInfo);

      this.setData({
        statusBarHeight: systemInfo.statusBarHeight || 20,
      });

      // 触发事件通知页面设置内容距离顶部的距离
      this.triggerEvent("navheight", {
        height: systemInfo.statusBarHeight + this.data.navBarHeight,
      });

      wx.showToast({
        title: `状态栏高度:${wx.getSystemInfoSync().statusBarHeight}`,
        icon: "none",
        duration: 2000,
      });
    },
  },
  pageLifetimes: {
    show() {
      console.log("页面显示");
    },
  },
  methods: {
    // 添加一个测试方法
    test() {
      console.log("test method called");
    },
  },
});

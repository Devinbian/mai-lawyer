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
    showBack: {
      type: Boolean,
      value: true,
    },
  },
  data: {
    statusBarHeight: 0,
    navBarHeight: 0,
  },
  lifetimes: {
    created() {},
    attached() {
      const windowInfo = wx.getWindowInfo();

      this.setData({
        statusBarHeight: windowInfo.statusBarHeight,
        navBarHeight: windowInfo.navigationBarHeight || 44,
      });

      // 触发事件通知页面设置内容距离顶部的距离
      this.triggerEvent("navheight", {
        height: windowInfo.statusBarHeight + this.data.navBarHeight,
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
    goBack() {
      wx.navigateBack({
        delta: 1,
      });
    },
  },
});

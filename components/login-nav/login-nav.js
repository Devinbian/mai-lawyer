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
    statusBarHeight: 20,
    navBarHeight: 44,
  },
  lifetimes: {
    created() {},
    attached() {
      const systemInfo = wx.getSystemInfoSync();

      this.setData({
        statusBarHeight: systemInfo.statusBarHeight || 20,
      });

      // 触发事件通知页面设置内容距离顶部的距离
      this.triggerEvent("navheight", {
        height: systemInfo.statusBarHeight + this.data.navBarHeight,
      });
    },
  },
  pageLifetimes: {
    show() {
      // console.log('页面显示');
    },
  },
  methods: {
    // 添加一个测试方法
    test() {
      console.log("test method called");
    },
  },
});

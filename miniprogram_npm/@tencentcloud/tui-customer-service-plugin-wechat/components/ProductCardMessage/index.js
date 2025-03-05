// chatCsWx/TUIKit/components/TUIChat/components/MessageElements/ProductCardMessage/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    payload: {
      type: Object,
      value: {},
      observer(newVal) {
        this.setData({
          payload: newVal,
          showWebView: false,
        });
      },
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    payload: {},
    showWebView: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    jumpProductCard() {
      this.triggerEvent('clickProductCard', {
        url: this.data.payload.content.url,
      });
    },
  },
});

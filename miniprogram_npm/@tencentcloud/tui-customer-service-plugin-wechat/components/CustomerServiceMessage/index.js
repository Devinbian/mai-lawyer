Component({
  /**
     * 组件的属性列表
     */
  properties: {
    message: {
      type: Object,
      value: {},
      observer(newVal) {
        this.setData({
          data: newVal,
          payload: JSON.parse(newVal.payload.data),
        });
      },
    },
  },

  /**
     * 组件的初始数据
     */
  data: {
    data: {},
    payload: {},
  },

  /**
     * 组件的方法列表
     */
  methods: {
    sendTextMessage(e) {
      this.triggerEvent('sendTextMessage', {
        text: e.detail.text,
      });
    },
    clickProductCard(e) {
      this.triggerEvent('clickProductCard', {
        url: e.detail.url,
      });
    },
  },
});

// TUIKit/components/TUIChat/components/MessageElements/FormSaveMessage/index.js
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
        });
      },
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    payload: {},
    inputText: '',
    hasReply: false,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    contentItemClick(e) {
      if (this.data.hasReply) {
        return;
      }
      // this.setData({
      //   hasReply: true
      // })
      this.triggerEvent('sendTextMessage', {
        text: e.currentTarget.dataset.item.content,
      });
    },
    async submitInput() {
      if (this.data.inputText === '') {
        wx.showToast({
          title: '不可以发送空消息',
          icon: 'none',
          duration: 1000,
          mask: true,
        });
        return;
      }
      if (this.data.hasReply) {
        return;
      }
      this.setData({
        hasReply: true,
      });
      this.triggerEvent('sendTextMessage', {
        text: this.data.inputText,
      });
    },
    bindKeyInput(e) {
      this.setData({
        inputText: e.detail.value,
      });
    },
  },
});

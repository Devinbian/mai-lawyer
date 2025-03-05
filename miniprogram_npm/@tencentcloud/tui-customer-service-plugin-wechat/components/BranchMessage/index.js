// TUIKit/components/TUIChat/components/MessageElements/BranchMessage/index.js
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
    hasReplay: false,
  },

  /**
     * 组件的方法列表
     */
  methods: {
    async branchItemClick(e) {
      console.log('branchItemClick');
      this.triggerEvent('sendTextMessage', {
        text: e.currentTarget.dataset.item.content,
      });
    },
  },
});

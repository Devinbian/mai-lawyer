import { RATING_TEMPLATE_TYPE } from '../../utils/constant';
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
          data: JSON.parse(newVal.payload.data),
        });
      },
    },
  },

  /**
     * 组件的初始数据
     */
  data: {
    data: {},
    ratingTemplate: {},
    ratingType: '',
  },

  /**
     * 组件的方法列表
     */
  methods: {
    sendRatingMessage(e) {
      this.triggerEvent('sendRatingMessage', {
        content: e.detail.content,
      });
    },
  },
  lifetimes: {
    attached() {
      console.log(this.data.data.menuContent);
      this.setData({
        ratingTemplate: this.data.data.menuContent,
        ratingType: this.data.data.menuContent.type === RATING_TEMPLATE_TYPE.STAR ? 'star' : 'number',
      });
      console.log(this.data);
    },
    detached() {
      // 在组件实例被从页面节点树移除时执行
    },
  },
});

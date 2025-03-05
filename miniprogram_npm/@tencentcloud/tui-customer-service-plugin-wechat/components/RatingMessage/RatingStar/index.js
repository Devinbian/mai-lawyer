// TUIKit/components/TUIChat/components/MessageElements/RatingMessage/RatingStar/index.js

import {
  CUSTOM_MESSAGE_SRC,
} from '../../../utils/constant';
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    ratingTemplate: {
      type: Object,
      value: {},
      observer(newVal) {
        let hasReply = false;
        let hasExpire = false;
        let value = -1;

        try {
          if (newVal.selected !== undefined) {
            for (let i = 0; i < newVal.menu.length; i++) {
              if (
                newVal.menu[i].id === newVal.selected.id
              ) {
                hasReply = true;
                value = i;
              }
            }
          }
          const timestamp = Math.floor(new Date().getTime() / 1000);
          if (timestamp > newVal.expireTime) {
            hasExpire = true;
          }
        } catch (e) {
          console.log(e);
        }


        this.setData({
          ratingTemplate: newVal,
          sessionId: newVal.sessionId,
          numberList: newVal.menu.map((item, index) => index),
          desc: newVal.menu.map((item, index) => item.content),
          value,
          hasReply,
          hasExpire,
        });
      },
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    ratingTemplate: {},
    conversation: {},
    value: -1,
    desc: [],
    numberList: [],
    hasReply: false,
    hasExpire: false,
    sessionId: '',
  },

  /**
   * 组件的方法列表
   */
  methods: {
    setValue(e) {
      if (this.data.hasReply) {
        return;
      }
      this.setData({
        value: e.currentTarget.dataset.index,
      });
    },
    async submitRatingStar() {
      if (this.data.value < 0) {
        return;
      }
      this.setData({
        hasReply: true,
      });
      const content = {
        src: CUSTOM_MESSAGE_SRC.MENU_SELECTED,
        menuSelected: {
          id: this.data.ratingTemplate.menu[this.data.value].id,
          content: this.data.ratingTemplate.menu[this.data.value].content,
          sessionId: this.data.sessionId,
        },
        customerServicePlugin: 0,
      };
      this.triggerEvent('sendRatingMessage', {
        content,
      });
    },
  },
});

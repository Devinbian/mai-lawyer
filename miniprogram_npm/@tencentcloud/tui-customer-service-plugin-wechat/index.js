// TUI-CustomerService/TUIKit/components/TUICustomerServicePluginWechat/index.js
import TUICore, { TUIConstants } from '@tencentcloud/tui-core';

Component({

  /**
   * 组件的属性列表
   */
  properties: {
    message: {
      type: Object,
      value: {},
      observer(newVal) {
        if (!newVal) return;
        this.setData({
          message: newVal,
        });
      },
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    message: {},
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 在线客服组件触发发送文本消息函数
    sendTextMessage(e) {
      const payload = {
        text: e.detail.text,
      };
      TUICore.callService({
        serviceName: TUIConstants.TUIChat.SERVICE.NAME,
        method: TUIConstants.TUIChat.SERVICE.METHOD.SEND_TEXT_MESSAGE,
        params: { payload },
      });
    },
    // 在线客服组件触发点击卡片消息函数
    clickProductCard(e) {
      console.log(e.detail.url);
    },
    // 在线客服组件触发发送评价自定义消息函数
    sendRatingMessage(e) {
      const payload = {
        data: JSON.stringify(e.detail.content),
      };
      TUICore.callService({
        serviceName: TUIConstants.TUIChat.SERVICE.NAME,
        method: TUIConstants.TUIChat.SERVICE.METHOD.SEND_CUSTOM_MESSAGE,
        params: { payload },
      });
    },
  },
});

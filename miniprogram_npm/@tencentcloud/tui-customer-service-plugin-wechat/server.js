import TUICore, { TUIConstants } from '@tencentcloud/tui-core';
import {
  isCustomerServiceMessage,
  isMessageInvisible,
  isMessageRating,
} from './utils/index';

export default class TUICustomerServer {
  static instance;
  customerServiceAccounts;
  constructor() {
    console.log('TUICustomerServer.init ok');
    TUICore.registerService(TUIConstants.TUICustomerServicePlugin.SERVICE.NAME, this);
    TUICore.registerExtension(TUIConstants.TUIContact.EXTENSION.CONTACT_LIST.EXT_ID, this);
    this.customerServiceAccounts = ['@im_agent#online_shopping_mall', '@im_agent#online_doctor'];
  }

  static getInstance() {
    if (!TUICustomerServer.instance) {
      TUICustomerServer.instance = new TUICustomerServer();
    }
    return TUICustomerServer.instance;
  }

  // 设置 客服号
  setCustomerServiceAccounts(accounts) {
    this.customerServiceAccounts = accounts;
  }

  // 获取 客服号
  getCustomerServiceAccounts() {
    return this.customerServiceAccounts;
  }

  // 判断当前会话是不是客服会话
  isCustomerConversation(conversationID) {
    if (conversationID) {
      const userID = conversationID.slice(3) || '';
      return this.customerServiceAccounts.indexOf(userID) > -1;
    }
    return false;
  }

  // 判断当前消息是不是客服消息
  isCustomerServicePluginMessage(message) {
    if (!message || !this.isCustomerConversation(message.conversationID)) {
      return false;
    }
    return isCustomerServiceMessage(message) || isMessageRating(message) || isMessageInvisible(message);
  }

  onGetExtension(extensionID, params) {
    if (extensionID === TUIConstants.TUIContact.EXTENSION.CONTACT_LIST.EXT_ID) {
      return [
        {
          weight: 0,
          icon: '',
          text: '客服号',
          data: {
            name: 'customer',
            accountList: this.customerServiceAccounts,
          },
        },
      ];
    }
  }

  onCall(method, params, callback) {
    const payload = {
      data: JSON.stringify({ src: '7' }),
    };
    switch (method) {
      case TUIConstants.TUICustomerServicePlugin.SERVICE.METHOD.ACTIVE_CONVERSATION:
        if (this.isCustomerConversation(params.conversationID)) {
          TUICore.callService({
            serviceName: TUIConstants.TUIChat.SERVICE.NAME,
            method: TUIConstants.TUIChat.SERVICE.METHOD.SET_CHAT_TYPE,
            params: { chatType: 'customerService' },
          });
          TUICore.callService({
            serviceName: TUIConstants.TUIChat.SERVICE.NAME,
            method: TUIConstants.TUIChat.SERVICE.METHOD.SEND_CUSTOM_MESSAGE,
            params: { payload },
          });
        }
        break;
    }
  }
}

import { CUSTOM_MESSAGE_SRC, TYPES } from "./constant";

// Determine if it is a JSON string
export function isJSON(str) {
    // eslint-disable-next-line no-useless-escape
  if (typeof str === "string") {
    try {
      const data = JSON.parse(str);
      if (data) {
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
  return false;
}

// Determine if it is a JSON string
export function JSONToObject(str) {
  if (!isJSON(str)) {
      return str;
  }
  return JSON.parse(str);
}



export function isCustomerServiceMessage(message) {
  const customerServicePayload = JSONToObject(message?.payload?.data)
  if (customerServicePayload?.customerServicePlugin == 0) {
      return true
  }
  return false;
}

export const isMessageInvisible = (message) => {
  const customerServicePayload = JSONToObject(message?.payload?.data)
  const robotCommandArray = ["feedback", "updateBotStatus"];
  const whiteList = [
      CUSTOM_MESSAGE_SRC.MENU,
      CUSTOM_MESSAGE_SRC.BRANCH,
      CUSTOM_MESSAGE_SRC.FROM_INPUT,
      CUSTOM_MESSAGE_SRC.PRODUCT_CARD,
  ]
  const isCustomerMessage = message?.type === TYPES.MSG_CUSTOM;
  const isExistWhiteList = whiteList.includes(customerServicePayload?.src);
  const isRobot = customerServicePayload?.src === CUSTOM_MESSAGE_SRC.ROBOT && robotCommandArray.indexOf(customerServicePayload?.content?.command) !== -1;
  return isCustomerMessage && (!isExistWhiteList || isRobot);
};

export const isMessageRating = (message) => {
    const customerServicePayload = JSONToObject(message?.payload?.data)
    if (
        (message?.type === TYPES.MSG_CUSTOM && customerServicePayload?.customerServicePlugin == 0 &&
            customerServicePayload.src === CUSTOM_MESSAGE_SRC.MENU)
    ) {
        return true;
    }
    return false;
};

export const isRenderMessage = (message) => {
    if (!message.isRevoked) {
        if (message?.type !== TYPES.MSG_CUSTOM) {
            return true
        }
        if (message?.type === TYPES.MSG_CUSTOM && isCustomerServiceMessage(message) && !isMessageInvisible(message)) {
            return true
        }
        if (message?.type === TYPES.MSG_CUSTOM && isCustomerServiceMessage(message) && isMessageInvisible(message)) {
            return false
        }
        if (message?.type === TYPES.MSG_CUSTOM && !isCustomerServiceMessage(message)) {
            return true
        }
    } else {
        return false;
    }
    return false;
}
/**
 * 根据设备像素比获取对应分辨率的图片路径
 * @param {string} basePath - 图片的基础路径（不包含@2x后缀）
 * @returns {string} - 返回适配当前设备的图片路径
 */
function getImageByPixelRatio(basePath) {
  const pixelRatio = wx.getWindowInfo().pixelRatio;
  const suffix = pixelRatio >= 2 ? "@2x" : "";
  return `${basePath}${suffix}.png`;
}

/**
 * 获取通用图片资源对象
 * @param {string} types - 图片类型，如 'profile', 'home' 等，支持多个类型
 * @returns {Object} - 返回该类型下所有图片的路径对象
 */
function getCommonImages(types) {
  const baseImagePath = "http://218.78.129.237:9000/mxl/images";

  const imageConfigs = {
    tabBar: {
      home: getImageByPixelRatio(`${baseImagePath}/home`),
      homeActive: getImageByPixelRatio(`${baseImagePath}/home-active`),
      expert: getImageByPixelRatio(`${baseImagePath}/expert`),
      expertActive: getImageByPixelRatio(`${baseImagePath}/expert-active`),
      doc: getImageByPixelRatio(`${baseImagePath}/doc`),
      docActive: getImageByPixelRatio(`${baseImagePath}/doc-active`),
      profile: getImageByPixelRatio(`${baseImagePath}/profile`),
      profileActive: getImageByPixelRatio(`${baseImagePath}/profile-active`),
    },
    profile: {
      avatar: getImageByPixelRatio(`${baseImagePath}/profile/default-avatar`),
      arrow: getImageByPixelRatio(`${baseImagePath}/profile/arrow-right`),
      banner: getImageByPixelRatio(`${baseImagePath}/profile/banner`),
      service: getImageByPixelRatio(`${baseImagePath}/profile/service`),
      help: getImageByPixelRatio(`${baseImagePath}/profile/help`),
      contact: getImageByPixelRatio(`${baseImagePath}/profile/contact`),
      about: getImageByPixelRatio(`${baseImagePath}/profile/about`),
      logout: getImageByPixelRatio(`${baseImagePath}/profile/logout`),
      favorite: getImageByPixelRatio(`${baseImagePath}/profile/favorite`),
      download: getImageByPixelRatio(`${baseImagePath}/profile/download`),
      history: getImageByPixelRatio(`${baseImagePath}/profile/history`),
      waitpay: getImageByPixelRatio(`${baseImagePath}/profile/wait-pay`),
      paid: getImageByPixelRatio(`${baseImagePath}/profile/paid`),
      refund: getImageByPixelRatio(`${baseImagePath}/profile/refund`),
      all: getImageByPixelRatio(`${baseImagePath}/profile/all`),
      plus: getImageByPixelRatio(`${baseImagePath}/experts/add`),
      orderphone: getImageByPixelRatio(`${baseImagePath}/profile/order-phone`),
      ordertext: getImageByPixelRatio(`${baseImagePath}/profile/order-text`),
      refundbanner: getImageByPixelRatio(
        `${baseImagePath}/profile/refund-banner`,
      ),
      ordercancelbanner: getImageByPixelRatio(
        `${baseImagePath}/profile/ordercancel-banner`,
      ),
      msgbanner: getImageByPixelRatio(`${baseImagePath}/profile/msgbanner`),
      support: getImageByPixelRatio(`${baseImagePath}/profile/support`),
      shield: getImageByPixelRatio(`${baseImagePath}/profile/shield`),
      ordercanceltitle: getImageByPixelRatio(
        `${baseImagePath}/profile/ordercanceltitle`,
      ),
    },
    index: {
      containerBg: getImageByPixelRatio(`${baseImagePath}/index/container-bg`),
      bannerTitle: getImageByPixelRatio(`${baseImagePath}/index/banner-title`),
      chatContentBg: getImageByPixelRatio(
        `${baseImagePath}/index/chat-content-bg`,
      ),
    },
    experts: {
      titleName: getImageByPixelRatio(`${baseImagePath}/experts/title-name`),
      titleBg: getImageByPixelRatio(`${baseImagePath}/experts/title-bg`),
      expertBg: getImageByPixelRatio(`${baseImagePath}/experts/expert-bg`),
      btnBg: getImageByPixelRatio(`${baseImagePath}/experts/msg-bg`),
      btnIcon: getImageByPixelRatio(`${baseImagePath}/experts/msg`),
    },
    expertsDetail: {
      expertBg: getImageByPixelRatio(`${baseImagePath}/experts/expert-bg`),
      chat: getImageByPixelRatio(`${baseImagePath}/experts/chat`),
      phone: getImageByPixelRatio(`${baseImagePath}/experts/phone`),
      meeting: getImageByPixelRatio(`${baseImagePath}/experts/meeting`),
      case: getImageByPixelRatio(`${baseImagePath}/experts/case`),
      document: getImageByPixelRatio(`${baseImagePath}/experts/document`),
    },
    documents: {
      titleName: getImageByPixelRatio(`${baseImagePath}/documents/title-name`),
      contract: getImageByPixelRatio(`${baseImagePath}/documents/contract`),
      lawsuit: getImageByPixelRatio(`${baseImagePath}/documents/lawsuit`),
      defense: getImageByPixelRatio(`${baseImagePath}/documents/defense`),
      legalOpinion: getImageByPixelRatio(
        `${baseImagePath}/documents/legal-opinion`,
      ),
      application: getImageByPixelRatio(
        `${baseImagePath}/documents/application`,
      ),
      general: getImageByPixelRatio(`${baseImagePath}/documents/general`),
    },
    documentList: {
      search: getImageByPixelRatio(`${baseImagePath}/documents/search`),
      time: getImageByPixelRatio(`${baseImagePath}/documents/time`),
    },
    documentGet: {
      arrow: getImageByPixelRatio(`${baseImagePath}/documents/arrow`),
      service: getImageByPixelRatio(`${baseImagePath}/documents/service`),

      ring: getImageByPixelRatio(`${baseImagePath}/profile/ring`),
    },
    default: {
      logo: getImageByPixelRatio(`${baseImagePath}/login/logo`),
      offline: getImageByPixelRatio(`${baseImagePath}/offline`),
      noorder: getImageByPixelRatio(`${baseImagePath}/noorder`),
      sendIcon: getImageByPixelRatio(`${baseImagePath}/index/send`),
      titleBg: getImageByPixelRatio(`${baseImagePath}/documents/title-bg`),
      empty: getImageByPixelRatio(`${baseImagePath}/nodata`),
      case: getImageByPixelRatio(`${baseImagePath}/experts/case`),
      document: getImageByPixelRatio(`${baseImagePath}/experts/document`),
      collectActive: getImageByPixelRatio(
        `${baseImagePath}/documents/collectActive`,
      ),
      collect: getImageByPixelRatio(`${baseImagePath}/documents/collect`),
      word: getImageByPixelRatio(`${baseImagePath}/documents/word`),
      pdf: getImageByPixelRatio(`${baseImagePath}/documents/pdf`),
      excel: getImageByPixelRatio(`${baseImagePath}/documents/excel`),
      successNotice: getImageByPixelRatio(
        `${baseImagePath}/profile/success-notice`,
      ),
      errorNotice: getImageByPixelRatio(
        `${baseImagePath}/profile/error-notice`,
      ),
      couponNotice: getImageByPixelRatio(
        `${baseImagePath}/profile/coupon-notice`,
      ),
      defaultNotice: getImageByPixelRatio(
        `${baseImagePath}/profile/default-notice`,
      ),
      alertNotice: getImageByPixelRatio(
        `${baseImagePath}/profile/alert-notice`,
      ),
      alertInfo: getImageByPixelRatio(`${baseImagePath}/profile/alert-info`),
      successInfo: getImageByPixelRatio(
        `${baseImagePath}/profile/success-info`,
      ),
    },
  };

  // 支持单个字符串或数组形式的参数
  const typeArray = Array.isArray(types) ? types : [types];

  // 合并多个类型的数据
  return typeArray.reduce((result, type) => {
    if (imageConfigs[type]) {
      return { ...result, ...imageConfigs[type] };
    }
    return result;
  }, {});
}

module.exports = {
  getImageByPixelRatio: getImageByPixelRatio,
  getCommonImages: getCommonImages,
};

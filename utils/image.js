/**
 * 根据设备像素比获取对应分辨率的图片路径
 * @param {string} basePath - 图片的基础路径（不包含@2x后缀）
 * @returns {string} - 返回适配当前设备的图片路径
 */
function getImageByPixelRatio(basePath) {
  const pixelRatio = wx.getSystemInfoSync().pixelRatio;
  const suffix = pixelRatio >= 2 ? '@2x' : '';
  return `${basePath}${suffix}.png`;
}

/**
 * 获取通用图片资源对象
 * @param {string} type - 图片类型，如 'profile', 'home' 等
 * @returns {Object} - 返回该类型下所有图片的路径对象
 */
function getCommonImages(type) {
  const baseImagePath = '/static/images';
  
  const imageConfigs = {
    profile: {
      avatar: getImageByPixelRatio(`${baseImagePath}/profile/default-avatar`),
      arrow: getImageByPixelRatio(`${baseImagePath}/profile/arrow-right`),
      banner: getImageByPixelRatio(`${baseImagePath}/profile/banner`),
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
      all: getImageByPixelRatio(`${baseImagePath}/profile/all`)
    },
    // 可以在这里添加其他类型的图片配置
  };

  return imageConfigs[type] || {};
}

module.exports = {
  getImageByPixelRatio: getImageByPixelRatio,
  getCommonImages: getCommonImages
}; 
const config = require("./config.js")
const request = (options) => {
  const app = getApp();
  return new Promise((resolve, reject) => {
    wx.request({
      url: config.baseURL + options.url + "?token=" + app.globalData.token,
      method: options.method || "GET",
      data: options.data || {},
      header: {
        "Content-Type": "application/json",
      },
      success: (res) => {
        resolve(res);
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
};

export default request;
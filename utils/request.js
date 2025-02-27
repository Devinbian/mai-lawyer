const BASE_URL = "https://api.example.com"; // 替换为实际的API地址

const request = (options) => {
  const app = getApp();

  return new Promise((resolve, reject) => {
    wx.request({
      url: BASE_URL + options.url,
      method: options.method || "GET",
      data: options.data,
      header: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${app.globalData.token}`,
      },
      success: (res) => {
        if (res.statusCode === 401) {
          // token过期，跳转登录页
          wx.navigateTo({
            url: "/pages/login/login",
          });
          reject(new Error("未登录或登录已过期"));
        } else if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(new Error(res.data.message || "请求失败"));
        }
      },
      fail: (err) => {
        reject(err);
      },
    });
  });
};

export default request;

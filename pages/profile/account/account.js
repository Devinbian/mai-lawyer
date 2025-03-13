const imageUtils = require("../../../utils/image.js");
const config = require("../../../utils/config.js");
Page({
  data: {
    userInfo: null,
    navHeight: 0,
    imgUrls: null,
    showPhoneButton: false,
    base64: null,
  },

  onLoad() {
    this.getUserInfo();
    // 根据设备像素比选择合适的图片
    this.setImagesByPixelRatio();
  },

  // 根据设备像素比选择图片
  setImagesByPixelRatio() {
    this.setData({
      imgUrls: imageUtils.getCommonImages(["profile", "default"]),
    });
  },

  onNavHeight(e) {
    this.setData({
      navHeight: e.detail.height,
    });
  },

  // 获取用户信息
  getUserInfo() {
    const userInfo = wx.getStorageSync("userInfo");
    this.setData({
      userInfo: userInfo || {},
    });
  },

  // 选择头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail;

    // 将头像 URL 转换为 base64
    wx.getFileSystemManager().readFile({
      filePath: avatarUrl,
      encoding: "base64",
      success: (res) => {
        // 更新本地数据，包括头像URL和base64
        this.setData({
          "userInfo.avatar": avatarUrl,
          base64: res.data,
        });

        // 更新到服务器
        this.updateUserInfo({
          avatar: avatarUrl,
          base64: res.data,
        });
      },
      fail: (error) => {
        console.error("头像转base64失败:", error);
        wx.showToast({
          title: "头像更新失败",
          icon: "error",
        });
      },
    });
  },

  // 修改姓名
  changeNickname() {
    wx.showModal({
      title: "修改姓名",
      editable: true,
      placeholderText: "请输入姓名",
      success: (res) => {
        if (res.confirm && res.content) {
          // 更新本地数据
          this.setData({
            "userInfo.name": res.content,
          });

          // 更新到服务器
          this.updateUserInfo({
            name: res.content,
          });
        }
      },
    });
  },

  // 修改性别
  changeGender() {
    wx.showActionSheet({
      itemList: ["男", "女"],
      success: (res) => {
        const gender = res.tapIndex === 0 ? 1 : 0; // 1-男，0-女
        this.setData({
          "userInfo.gender": gender,
        });

        // 更新到服务器
        this.updateUserInfo({
          gender: gender,
        });
      },
    });
  },

  // 生日选择改变
  onBirthdayChange(e) {
    const birthday = e.detail.value;

    // 更新本地数据
    this.setData({
      "userInfo.birthday": birthday,
    });

    // 更新到服务器
    this.updateUserInfo({
      birthday: birthday,
    });
  },

  // 处理手机号绑定点击
  handlePhoneBinding() {
    // 如果已经绑定了手机号，先确认是否重新绑定
    if (this.data.userInfo.phone) {
      wx.showModal({
        title: "提示",
        content: "重新绑定将清除当前已经绑定的手机号，是否确认操作？",
        success: (res) => {
          if (res.confirm) {
            this.setData({
              showPhoneButton: true,
            });
          }
        },
      });
    } else {
      // 未绑定手机号，直接显示获取手机号按钮
      this.setData({
        showPhoneButton: true,
      });
    }
  },

  // 获取手机号
  onGetPhoneNumber(e) {
    const { code } = e.detail;
    if (!code) {
      wx.showToast({
        title: "获取手机号失败",
        icon: "error",
      });
      return;
    }

    // 隐藏获取手机号按钮
    this.setData({
      showPhoneButton: false,
    });

    // 处理手机号绑定
    this.processPhoneBinding(code);
  },

  // 处理手机号绑定
  processPhoneBinding(code) {
    // TODO: 调用后端接口解密手机号
    // 这里模拟更新手机号
    this.setData({
      "userInfo.phone": "138****8888", // 实际应该使用后端解密后的手机号
    });

    // 更新本地存储
    const userInfo = wx.getStorageSync("userInfo") || {};
    userInfo.phone = this.data.userInfo.phone;
    wx.setStorageSync("userInfo", userInfo);

    wx.showToast({
      title: "手机号绑定成功",
      icon: "success",
    });
  },

  // 绑定邮箱
  bindEmail() {
    wx.showModal({
      title: "绑定邮箱",
      editable: true,
      placeholderText: "请输入邮箱",
      success: (res) => {
        if (res.confirm && res.content) {
          // TODO: 验证邮箱格式
          // TODO: 发送验证邮件
          // TODO: 验证并绑定邮箱
          this.setData({
            "userInfo.email": res.content,
          });
          wx.showToast({
            title: "邮箱绑定成功",
            icon: "success",
          });
        }
      },
    });
  },

  // 退出登录
  handleLogout() {
    wx.showModal({
      title: "提示",
      content: "确定要退出登录吗？",
      success: (res) => {
        if (res.confirm) {
          // 清除登录信息
          wx.removeStorageSync("userInfo");
          wx.removeStorageSync("token");

          const app = getApp();
          app.globalData.userInfo = null;
          app.globalData.isLogin = false;

          // 返回到个人中心页面
          wx.navigateBack({
            success: () => {
              // 通知个人中心页面刷新
              const pages = getCurrentPages();
              const profilePage = pages[pages.length - 2];
              if (profilePage) {
                profilePage.onShow();
              }
            },
          });
        }
      },
    });
  },

  // 选择性别
  selectGender(e) {
    const gender = parseInt(e.currentTarget.dataset.gender);
    // 如果点击的是当前选中的性别，不做任何操作
    if (this.data.userInfo.gender === gender) {
      return;
    }

    // 更新本地数据
    this.setData({
      "userInfo.gender": gender,
    });

    // 更新到服务器
    this.updateUserInfo({
      gender: gender,
    });
  },

  // 获取手机号
  onGetPhoneNumber(e) {
    const { code, errMsg } = e.detail;

    // 隐藏获取手机号按钮
    this.setData({
      showPhoneButton: false,
    });

    // 用户取消授权或失败
    if (errMsg.includes("deny") || errMsg.includes("fail") || !code) {
      wx.showToast({
        title: "获取手机号失败",
        icon: "error",
      });
      return;
    }

    // 处理手机号绑定
    this.processPhoneBinding(code);
  },
  // 更新用户信息到服务器
  updateUserInfo(data) {
    const userInfo = wx.getStorageSync("userInfo") || {};
    const token = userInfo.token;

    if (!token) {
      wx.showToast({
        title: "登录信息已过期",
        icon: "error",
      });
      return;
    }

    wx.request({
      url: config.baseURL + `/api/user/update?token=${token}`,
      method: "POST",
      header: {
        "content-type": "application/json",
      },
      data: {
        avatar: data.avatar || this.data.userInfo.avatar,
        name: data.name || this.data.userInfo.name,
        gender: data.gender !== undefined ? data.gender : this.data.userInfo.gender,
        birthday: data.birthday || this.data.userInfo.birthday,
        base64: data.base64 || this.data.base64,
      },
      success: (res) => {
        if (res.data.success) {
          // 更新成功，更新本地存储
          const userInfo = wx.getStorageSync("userInfo") || {};
          Object.assign(userInfo, data);
          wx.setStorageSync("userInfo", userInfo);

          wx.showToast({
            title: "更新成功",
            icon: "success",
          });
        } else {
          wx.showToast({
            title: res.data.msg || "更新失败",
            icon: "error",
          });
        }
      },
      fail: (error) => {
        console.error("更新用户信息失败:", error);
        wx.showToast({
          title: "网络错误",
          icon: "error",
        });
      },
    });
  },

  // 选择性别
  selectGender(e) {
    const gender = parseInt(e.currentTarget.dataset.gender);
    // 如果点击的是当前选中的性别，不做任何操作
    if (this.data.userInfo.gender === gender) {
      return;
    }

    // 更新本地数据
    this.setData({
      "userInfo.gender": gender,
    });

    // 更新到服务器
    this.updateUserInfo({
      gender: gender,
    });
  },

  // 获取手机号
  onGetPhoneNumber(e) {
    const { code, errMsg } = e.detail;

    // 隐藏获取手机号按钮
    this.setData({
      showPhoneButton: false,
    });

    // 用户取消授权或失败
    if (errMsg.includes("deny") || errMsg.includes("fail") || !code) {
      wx.showToast({
        title: "获取手机号失败",
        icon: "error",
      });
      return;
    }

    // 处理手机号绑定
    this.processPhoneBinding(code);
  },
});

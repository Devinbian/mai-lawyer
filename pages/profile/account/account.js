const imageUtils = require("../../../utils/image.js");
const config = require("../../../utils/config.js");
Page({
  data: {
    userInfo: null,
    navHeight: 0,
    imgUrls: null,
    showPhoneButton: false,
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
    const userInfo = getApp().globalData.userInfo;
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
        });

        // 更新到服务器
        this.updateUserInfo({
          avatar: "data:image/png;base64," + res.data,
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

  data: {
    userInfo: null,
    navHeight: 0,
    imgUrls: null,
    showPhoneButton: false,
    showNicknameModal: false,
    tempNickname: "", // 临时存储输入的昵称
  },

  // 修改姓名
  changeNickname() {
    this.setData({
      showNicknameModal: true,
    });
  },

  // 关闭昵称修改弹框
  closeNicknameModal() {
    this.setData({
      showNicknameModal: false,
      tempNickname: "",
    });
  },

  // 处理昵称输入完成
  onNicknameInput(e) {
    this.setData({
      tempNickname: e.detail.value,
    });
  },

  // 确认昵称修改
  confirmNickname() {
    const nickname = this.data.tempNickname;
    if (nickname) {
      // 更新本地数据
      this.setData({
        "userInfo.name": nickname,
        showNicknameModal: false,
      });

      // 更新到服务器
      this.updateUserInfo({
        name: nickname,
      });
    } else {
      wx.showToast({
        title: "请输入姓名",
        icon: "none",
      });
    }
  },

  // 防止穿透
  preventTouchMove() {
    return;
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

  // 处理手机号绑定
  processPhoneBinding(code) {
    wx.request({
      url: config.baseURL + "/api/auth/getphone",
      data: {
        code: code,
      },
      success: (res) => {
        if (res.data.success) {
          const phone = res.data.data;
          // 更新本地数据
          this.setData({
            "userInfo.phone": phone,
          });
          this.updateUserInfo({
            phone: phone,
          });
          wx.showToast({
            title: "手机号绑定成功",
            icon: "success",
          });
        } else {
          wx.showToast({
            title: res.data.message || "绑定失败",
            icon: "error",
          });
        }
      },
      fail: (err) => {
        console.error("手机号绑定失败:", err);
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

  // 更新用户信息到服务器
  updateUserInfo(data) {
    const userInfo = getApp().globalData.userInfo || {};
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
        avatar: data.avatar,
        name: data.name,
        gender: data.gender,
        birthday: data.birthday,
      },
      success: (res) => {
        if (res.data.success) {
          // 更新成功，更新本地存储
          Object.assign(userInfo, res.data.data);
          wx.setStorageSync("userInfo", userInfo);
          getApp().globalData.userInfo = userInfo;
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

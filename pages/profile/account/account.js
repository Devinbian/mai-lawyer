const imageUtils = require("../../../utils/image.js");

Page({
  data: {
    userInfo: null,
    navHeight: 0,
    imgUrls: null,
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
    const app = getApp();
    const userInfo = app.globalData.userInfo || wx.getStorageSync("userInfo");
    this.setData({
      userInfo: userInfo || {},
    });
  },

  // 修改头像
  changeAvatar() {
    wx.chooseImage({
      count: 1,
      sizeType: ["compressed"],
      sourceType: ["album", "camera"],
      success: (res) => {
        const tempFilePath = res.tempFilePaths[0];
        // TODO: 上传头像到服务器
        wx.showToast({
          title: "头像更新成功",
          icon: "success",
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
          // TODO: 更新姓名到服务器
          this.setData({
            "userInfo.nickName": res.content,
          });
          wx.showToast({
            title: "姓名修改成功",
            icon: "success",
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
        const gender = res.tapIndex + 1; // 1-男，2-女
        // TODO: 更新性别到服务器
        this.setData({
          "userInfo.gender": gender,
        });
        wx.showToast({
          title: "性别修改成功",
          icon: "success",
        });
      },
    });
  },

  // 修改生日
  changeBirthday() {
    wx.showModal({
      title: "修改生日",
      editable: true,
      placeholderText: "YYYY-MM-DD",
      success: (res) => {
        if (res.confirm && res.content) {
          // TODO: 验证日期格式
          // TODO: 更新生日到服务器
          this.setData({
            "userInfo.birthday": res.content,
          });
          wx.showToast({
            title: "生日修改成功",
            icon: "success",
          });
        }
      },
    });
  },

  // 绑定手机号
  bindPhone() {
    wx.showModal({
      title: "绑定手机号",
      editable: true,
      placeholderText: "请输入手机号",
      success: (res) => {
        if (res.confirm && res.content) {
          // TODO: 验证手机号格式
          // TODO: 发送验证码
          // TODO: 验证并绑定手机号
          this.setData({
            "userInfo.phoneNumber": res.content,
          });
          wx.showToast({
            title: "手机号绑定成功",
            icon: "success",
          });
        }
      },
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
    // TODO: 更新性别到服务器
    this.setData({
      "userInfo.gender": gender,
    });
    wx.showToast({
      title: "性别修改成功",
      icon: "success",
    });
  },
});

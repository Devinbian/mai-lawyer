const imageUtils = require("../../../utils/image.js");
const config = require("../../../utils/config.js");

Page({
  data: {
    expert: null,
    isTagsExpanded: false,
    isIntroExpanded: false,
    isExpanded: false,
    isFollowed: false,
  },
  imgUrls: null,
  onLoad(options) {
    this.setImagesByPixelRatio();
    if (options.expert) {
      try {
        const expertInfo = JSON.parse(decodeURIComponent(options.expert));
        console.log("初始化专家信息", expertInfo);
        wx.request({
          url: config.baseURL + "/api/lawyer/detail",
          data: {
            id: expertInfo.id,
            token: getApp().globalData.userInfo.token,
          },
          success: (res) => {
            console.log("律师信息,从后台获取", res);
            const lawyerInfo = {
              id: res.data.data.id,
              name: res.data.data.name,
              phone: res.data.data.phone,
              title: res.data.data.title,
              avatar: res.data.data.avatarUrl,
              years: res.data.data.years,
              consultCount: res.data.data.servedNum,
              brief: res.data.data.brief,
              introduction: res.data.data.description,
              tags: res.data.data.type,
              isFollowed: res.data.data.follow,
              fans: res.data.data.followCount,
              promised: res.data.data.promised,
              consultationFee: res.data.data.consultationFee,
            };
            console.log("律师信息,从后台获取", lawyerInfo);

            // 处理擅长领域数组
            let fieldArray = [];
            if (typeof res.data.data.brief === "string" && res.data.data.brief) {
              fieldArray = res.data.data.brief.split("、").filter((field) => field.trim());
            } else if (Array.isArray(res.data.data.brief)) {
              fieldArray = res.data.data.brief;
            }

            this.setData({
              expert: {
                ...lawyerInfo,
                fieldArray: fieldArray,
                tags: ["资深专家", "平台保证"],
                introduction: lawyerInfo.introduction,
              },
              isExpanded: false,
              isFollowed: lawyerInfo.isFollowed,
            });
            console.log("this.data.expert", this.data.expert);
            console.log("处理后的擅长领域:", fieldArray);
          },
        });
      } catch (error) {
        console.error("解析专家信息失败:", error);
        wx.showToast({
          title: "加载专家信息失败",
          icon: "none",
        });
      }
    }
  },

  setImagesByPixelRatio() {
    this.setData({
      imgUrls: imageUtils.getCommonImages(["expertsDetail", "default"]),
    });
  },

  // 切换标签展开/收起状态
  toggleTags() {
    this.setData({
      isTagsExpanded: !this.data.isTagsExpanded,
    });
  },

  // 切换简介展开/收起状态
  toggleIntro() {
    this.setData({
      isIntroExpanded: !this.data.isIntroExpanded,
    });
  },

  // 处理关注/取消关注
  handleFollow() {
    if (!getApp().globalData.userInfo) {
      console.log("用户未登录");
      wx.navigateTo({
        url: "/pages/login/login",
      });
      return;
    }

    const newIsFollowed = !this.data.isFollowed;
    const currentFans = parseInt(this.data.expert.fans) || 0;
    const currentIsFollowed = this.data.isFollowed;

    this.setData({
      isFollowed: newIsFollowed,
      "expert.fans": newIsFollowed ? currentFans + 1 : currentFans - 1,
    });
    this.data.expert.follow = newIsFollowed;

    // 发送关注/取消关注请求
    wx.request({
      url: config.baseURL + (newIsFollowed ? "/api/lawyer/follow" : "/api/lawyer/unfollow"),
      data: {
        id: this.data.expert.id,
        token: getApp().globalData.userInfo.token,
      },
      success: (res) => {
        if (res.data.success) {
          wx.showToast({
            title: newIsFollowed ? "关注成功" : "已取消关注",
            icon: "success",
          });
        } else {
          // 如果请求失败，恢复原状态
          this.setData({
            isFollowed: currentIsFollowed,
            "expert.fans": currentFans,
          });
          wx.showToast({
            title: res.data.message || (newIsFollowed ? "关注失败" : "取消关注失败"),
            icon: "error",
          });
        }
      },
      fail: (err) => {
        console.log(newIsFollowed ? "关注失败：" : "取消关注失败：", err);
        // 网络请求失败，恢复原状态
        this.setData({
          isFollowed: currentIsFollowed,
          "expert.fans": currentFans,
        });
        wx.showToast({
          title: "网络错误",
          icon: "error",
        });
      },
    });
  },

  // 图文咨询
  handleTextConsult() {
    if (!getApp().globalData.userInfo) {
      wx.navigateTo({
        url: "/pages/login/login",
      });
      return;
    }

    // 调用支付接口
    const token = getApp().globalData.userInfo.token;
    wx.request({
      url: `${config.baseURL}/api/order/add?token=${token}`,
      method: "POST",
      data: {
        lawyerId: this.data.expert.id,
        type: 1, //图文咨询
      },
      success: (res) => {
        if (res.data.success) {
          wx.request({
            url: `${config.baseURL}/api/wxpay/prepay`,
            data: {
              orderId: res.data.data,
              token: token,
            },
            success: (res) => {
              wx.requestPayment({
                timeStamp: res.data.data.timeStamp,
                nonceStr: res.data.data.nonceStr,
                package: res.data.data.packageValue,
                signType: res.data.data.signType,
                paySign: res.data.data.paySign,
                success: function (res) {
                  console.log("支付成功", res);
                  //支付成功后，跳转聊天
                  wx.navigateTo({
                    url: `../../../tim-chat/pages/index?targetUserID=${this.data.expert.phone}&title=${encodeURIComponent(this.data.expert.name)}`,
                    fail(err) {
                      wx.showToast({
                        title: "打开聊天失败",
                        icon: "none",
                      });
                    },
                  });
                },
                fail: function (res) {
                  console.log("支付失败", res);
                },
                complete: function (res) {},
              });
            },
            fail: (err) => {
              console.log("支付失败", err);
            },
          });
        } else {
          wx.showToast({
            title: res.data.msg || "创建支付订单失败",
            icon: "none",
          });
        }
      },
      fail: (err) => {
        console.error("请求支付失败：", err);
        wx.showToast({
          title: "创建支付订单失败",
          icon: "none",
        });
      },
    });
  },

  handlePhoneConsult(e) {
    if (!getApp().globalData.userInfo) {
      wx.navigateTo({
        url: "/pages/login/login",
      });
      return;
    }
    const phone = e.currentTarget.dataset.phone;
    // 拨打电话时移除所有非数字字符
    const cleanedPhone = phone.replace(/\D/g, "");
    wx.makePhoneCall({
      phoneNumber: cleanedPhone,
      success: () => {
        console.log("拨打电话成功");
      },
      fail: (err) => {
        console.log("拨打电话失败", err);
      },
    });
  },

  // 处理展开/收起
  toggleExpand() {
    this.setData({
      isExpanded: !this.data.isExpanded,
    });
  },
});

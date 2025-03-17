const imageUtils = require("../../../utils/image.js");
const config = require("../../../utils/config.js");

Page({
  data: {
    expert: null,
    isTagsExpanded: false,
    isIntroExpanded: false,
    isExpanded: false,
    isFollowed: false,
    userInfo: null,
  },
  imgUrls: null,
  onLoad(options) {
    this.setImagesByPixelRatio();
    if (options.expert) {
      try {
        const expertInfo = JSON.parse(decodeURIComponent(options.expert));
        console.log("初始化专家信息", expertInfo);
        const userInfo = wx.getStorageSync("userInfo");
        this.setData({
          userInfo: userInfo,
        });

        wx.request({
          url: config.baseURL + "/api/lawyer/detail",
          method: "GET",
          dataType: "json",
          data: {
            id: expertInfo.id,
            token: userInfo.token,
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
    this.setData({
      isFollowed: !this.data.isFollowed,
    });
    this.data.expert.follow = this.data.isFollowed;
    if (!this.data.userInfo) {
      console.log("用户未登录");
      wx.navigateTo({
        url: "/pages/login/login",
      });
      return;
    }
    if (this.data.isFollowed) {
      wx.request({
        url: config.baseURL + "/api/lawyer/follow",
        method: "GET",
        dataType: "json",
        data: {
          id: this.data.expert.id, // 律师ID
          token: this.data.userInfo.token, // 用户token
        },
        success: (res) => {
          console.log("关注成功：", res);
        },
        fail: (err) => {
          console.log("关注失败：", err);
        },
      });
    } else {
      wx.request({
        url: config.baseURL + "/api/lawyer/unfollow",
        method: "GET",
        dataType: "json",
        data: {
          id: this.data.expert.id, // 律师ID
          token: this.data.userInfo.token, // 用户token
        },
        success: (res) => {
          console.log("取消关注成功：", res);
        },
        fail: (err) => {
          console.log("取消关注失败：", err);
        },
      });
    }
  },

  // 图文咨询
  handleTextConsult() {
    console.log("this.data.expert.phone:", this.data.expert.phone);
    if (this.data.userInfo) {
      wx.navigateTo({
        url: `../../../tim-chat/pages/index?targetUserID=${this.data.expert.phone}&title=${encodeURIComponent(this.data.expert.name)}`,
        fail(err) {
          wx.showToast({
            title: "打开聊天失败",
            icon: "none",
          });
        },
      });
    } else {
      wx.navigateTo({
        url: "/pages/login/login",
      });
    }
  },

  // 处理展开/收起
  toggleExpand() {
    this.setData({
      isExpanded: !this.data.isExpanded,
    });
  },
});

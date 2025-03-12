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
        const userInfo = wx.getStorageSync("userinfo");
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
            const lawyerInfo = {
              id: res.data.data.id,
              name: res.data.data.name,
              title: res.data.data.title,
              avatar: res.data.data.avatarUrl,
              years: res.data.data.years,
              consultCount: res.data.data.servedNum,
              brief: res.data.data.brief,
              introduction: res.data.data.description,
              tags: res.data.data.type,
              isFollowed: res.data.data.isFollowed,
              fans: res.data.data.followCount,
              promised: res.data.data.promised,
              consultationFee: res.data.data.consultationFee,
            };

            // 处理擅长领域数组
            let fieldArray = [];
            if (
              typeof res.data.data.brief === "string" &&
              res.data.data.brief
            ) {
              fieldArray = res.data.data.brief
                .split("、")
                .filter((field) => field.trim());
            } else if (Array.isArray(res.data.data.brief)) {
              fieldArray = res.data.data.brief;
            }

            this.setData({
              expert: {
                ...lawyerInfo,
                fieldArray: fieldArray,
                tags: ["资深专家", "平台保证"],
                introduction: `${lawyerInfo.name}，从业${lawyerInfo.years}年，专注于${lawyerInfo.brief}等领域。累计服务咨询人数${lawyerInfo.consultCount}人，具有丰富的实践经验，${lawyerInfo.introduction}`,
              },
              isExpanded: false,
              isFollowed: lawyerInfo.isFollowed,
            });

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

    const userInfo = wx.getStorageSync("userinfo");
    console.log("专家信息：", this.data.expert);
    console.log("this.data.expert.id：", this.data.expert.id);
    console.log("userInfo.token：", userInfo.token);

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
    if (this.data.userInfo) {
      wx.navigateTo({
        url: `../../../tim-chat/pages/index?conversationID=C2C${
          this.data.expert.phone
        }&source=experts-live-chat&title=${encodeURIComponent(
          this.data.expert.name,
        )}`,
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
